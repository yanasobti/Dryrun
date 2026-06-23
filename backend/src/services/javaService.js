const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const jdbParser = require('./jdbParser');
const aiTeacherService = require('./aiTeacherService');

const cleanJdbPrompt = (str) => {
  return str.replace(/(?:\r?\n)?(?:[a-zA-Z0-9_$#-]*\[\d+\](?:\s*>)?|>\s*)\s*$/, '').trim();
};

const getCollectionType = (val) => {
  if (!val) return 'Map';
  const valStr = String(val);
  if (valStr.includes('HashMap')) return 'HashMap';
  if (valStr.includes('HashSet')) return 'HashSet';
  if (valStr.includes('ArrayList')) return 'ArrayList';
  if (valStr.includes('TreeMap')) return 'TreeMap';
  if (valStr.includes('TreeSet')) return 'TreeSet';
  if (valStr.includes('LinkedList')) return 'LinkedList';
  const match = valStr.match(/instance of ([\w\.\$]+)/);
  if (match) {
    const parts = match[1].split('.');
    return parts[parts.length - 1];
  }
  return 'Map';
};


exports.runJavaCode = (code) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '..', 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, 'Main.java');
    fs.writeFileSync(filePath, code);

    // Compile Java Code with debug info (-g)
    exec(
      `cd "${tempDir}" && javac -g Main.java`,
      (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          return resolve({
            success: false,
            output: "",
            error: "Compilation Error\n\n" + (compileStderr || compileError.message)
          });
        }

        // Run Java Code
        exec(
          `cd "${tempDir}" && java Main`,
          (runError, runStdout, runStderr) => {
            if (runError) {
              return resolve({
                success: false,
                output: "",
                error: "Runtime Error\n\n" + (runStderr || runError.message)
              });
            }

            return resolve({
              success: true,
              output: runStdout,
              error: null
            });
          }
        );
      }
    );
  });
};

exports.traceJavaCode = (code, pattern) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, 'Main.java');
    fs.writeFileSync(filePath, code);
    fs.writeFileSync(path.join(tempDir, 'jdb_trace.log'), '');

    // Ensure it's compiled with -g
    exec(
      `cd "${tempDir}" && javac -g Main.java`,
      (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          return resolve({ error: "Compilation Error: " + (compileStderr || compileError.message) });
        }

        const { spawn } = require('child_process');
        const jdb = spawn('jdb', ['Main'], { cwd: tempDir });
        
        let frames = [];
        let output = '';
        let rawStdoutLineBuffer = '';
        let appStdoutBuffer = '';
        let accumulatedStdout = '';
        let currentFrame = null;
        let state = 'init'; 
        let steps = 0;
        const maxSteps = 300; // prevent infinite loops
        
        let dumpQueue = [];
        let visitedRefs = {};
        let currentDumpInfo = null;

        const send = (cmd) => {
            fs.appendFileSync(path.join(tempDir, 'jdb_trace.log'), `[SEND] ${cmd}\n`);
            jdb.stdin.write(cmd + '\n');
        };
        
        jdb.stdout.on('data', (data) => {
            const str = data.toString();
            fs.appendFileSync(path.join(tempDir, 'jdb_trace.log'), `[RECV] ${str}\n`);
            output += str;
            
            rawStdoutLineBuffer += str;
            let lastNewlineIdx = rawStdoutLineBuffer.lastIndexOf('\n');
            if (lastNewlineIdx !== -1) {
                const completeLines = rawStdoutLineBuffer.substring(0, lastNewlineIdx);
                rawStdoutLineBuffer = rawStdoutLineBuffer.substring(lastNewlineIdx + 1);
                
                if (state === 'wait_for_step') {
                    const extracted = jdbParser.extractAppStdout(completeLines);
                    if (extracted) {
                        appStdoutBuffer += extracted;
                    }
                }
            }
            
            if (jdbParser.isPrompt(output)) {
                if (output.includes('application exited') || output.includes('The application exited')) {
                    finishTracing();
                    return;
                }

                if (state === 'init' && output.includes('Initializing jdb')) {
                    output = '';
                    send('exclude java.*,javax.*,sun.*,com.sun.*,jdk.*,Node,ListNode');

                    send('stop in Main.main');
                    send('run');
                    state = 'wait_for_break';
                    return;
                }

                if (state === 'wait_for_break') {
                    if (output.includes('Breakpoint hit:')) {
                        const lineMatch = output.match(/line=(-?\d+)/);
                        if (lineMatch) {
                            currentFrame = { line: parseInt(lineMatch[1]), variables: {}, stack: [] };
                            output = '';
                            state = 'wait_for_where';
                            send('trace method exits');
                            send('where');
                            return;
                        }
                    }
                    return; // keep waiting
                }

                if (state === 'wait_for_step') {
                    if (output.includes('Step completed:') || output.includes('Breakpoint hit:') || output.includes('Method exited:')) {
                        const lineMatch = output.match(/line=(-?\d+)/);
                        if (lineMatch) {
                            currentFrame = { line: parseInt(lineMatch[1]), variables: {}, stack: [] };
                            
                            const returnInfo = jdbParser.parseMethodExit(output);
                            if (returnInfo) {
                                currentFrame.returnValue = returnInfo.returnValue;
                                currentFrame.isExit = returnInfo.isExit;
                            }

                            output = '';
                            state = 'wait_for_where';
                            send('where');
                            return;
                        }
                    } else if (output.includes('Exception occurred:') || output.includes('uncaught java.lang.Throwable')) {
                        output = '';
                        send('step');
                        return;
                    }
                    return;
                }

                if (state === 'wait_for_where') {
                    const stack = jdbParser.parseStack(output);
                    if (currentFrame) {
                        currentFrame.stack = stack;
                    }
                    output = '';
                    state = 'wait_for_locals';
                    send('locals');
                    return;
                }

                if (state === 'wait_for_locals') {
                    const { variables, args } = jdbParser.parseLocals(output);

                    if (currentFrame && currentFrame.stack && currentFrame.stack.length > 0) {
                        const stack = currentFrame.stack;
                        const prevFrame = frames[frames.length - 1];
                        for (let j = 0; j < stack.length; j++) {
                            if (j === stack.length - 1) {
                                stack[j].variables = variables;
                                stack[j].args = args;
                            } else if (prevFrame && prevFrame.stack && prevFrame.stack[j] && prevFrame.stack[j].methodName === stack[j].methodName) {
                                stack[j].variables = { ...prevFrame.stack[j].variables };
                                stack[j].args = [ ...prevFrame.stack[j].args ];
                            }
                        }
                        currentFrame.variables = variables;
                        currentFrame.arrays = {};
                        currentFrame.objects = {};
                        
                        // Save the accumulated application print outputs for this step
                        accumulatedStdout += appStdoutBuffer;
                        currentFrame.consoleOutput = accumulatedStdout;
                        appStdoutBuffer = ''; // clear buffer for the next step
                        
                        // Identify structural variables for JDB dump evaluation
                        dumpQueue = [];
                        visitedRefs = {};
                        
                        const keys = Object.keys(variables);
                        for (const key of keys) {
                            if (key === 'args') continue;
                            const val = variables[key];
                            if (typeof val === 'string') {
                                if (val.match(/instance of [\w\.\$]+(?:\[\d*\]){2,}/)) {
                                    dumpQueue.push({
                                        command: `dump ${key}`,
                                        expression: key,
                                        type: 'matrix_outer',
                                        varName: key
                                    });
                                } else if (val.match(/instance of ([\w\.\$]+\[\d*\])\s*\(id=([a-fA-F0-9]+)\)/)) {
                                    const arrayMatch = val.match(/instance of ([\w\.\$]+\[\d*\])\s*\(id=([a-fA-F0-9]+)\)/);
                                    const className = arrayMatch[1];
                                    const refId = arrayMatch[2];
                                    visitedRefs[refId] = true;
                                    dumpQueue.push({
                                        command: `dump ${key}`,
                                        expression: key,
                                        type: 'array',
                                        varName: key,
                                        className: className,
                                        refId: refId
                                    });
                                } else if (val.includes('HashMap') || val.includes('HashSet') || val.includes('ArrayList') || val.includes('Stack') || val.includes('Deque') || val.includes('ArrayDeque') || val.match(/instance of java\.util\.(?:HashMap|HashSet|ArrayList|TreeMap|TreeSet|LinkedList|Stack|Deque|ArrayDeque)/)) {
                                    dumpQueue.push({
                                        command: `print ${key}`,
                                        expression: key,
                                        type: 'hashmap',
                                        varName: key
                                    });
                                } else {
                                    const objMatch = val.match(/instance of ([\w\.\$]+)\s*\(id=([a-fA-F0-9]+)\)/);
                                    if (objMatch) {
                                        const className = objMatch[1];
                                        const refId = objMatch[2];
                                        
                                        visitedRefs[refId] = true;
                                        dumpQueue.push({
                                            command: `dump ${key}`,
                                            expression: key,
                                            type: 'object',
                                            varName: key,
                                            className: className,
                                            refId: refId,
                                            depth: 1
                                        });
                                    }
                                }
                            }
                        }
                        
                        if (dumpQueue.length > 0) {
                            output = '';
                            state = 'wait_for_dump';
                            currentDumpInfo = dumpQueue.shift();
                            send(currentDumpInfo.command);
                            return;
                        }
                        
                        frames.push(currentFrame);
                        currentFrame = null;
                    }

                    steps++;
                    if (steps > maxSteps) {
                        jdb.kill();
                        finishTracing();
                        return;
                    }

                    output = '';
                    state = 'wait_for_step';
                    send('step');
                    return;
                }

                if (state === 'wait_for_dump') {
                    const cleanOutput = cleanJdbPrompt(output);
                    if (currentDumpInfo.type === 'matrix_outer') {
                        const arrVals = jdbParser.parseArrayDump(cleanOutput);
                        if (arrVals && arrVals.length > 0) {
                            const len = arrVals.length;
                            currentFrame.tempMatrices = currentFrame.tempMatrices || {};
                            currentFrame.tempMatrices[currentDumpInfo.varName] = {
                                rows: new Array(len),
                                pending: len
                            };
                            for (let i = 0; i < len; i++) {
                                dumpQueue.unshift({
                                    command: `dump ${currentDumpInfo.expression}[${i}]`,
                                    expression: `${currentDumpInfo.expression}[${i}]`,
                                    type: 'matrix_row',
                                    varName: currentDumpInfo.varName,
                                    rowIndex: i
                                });
                            }
                        }
                    } else if (currentDumpInfo.type === 'matrix_row') {
                        const rowVals = jdbParser.parseArrayDump(cleanOutput);
                        const mState = currentFrame.tempMatrices ? currentFrame.tempMatrices[currentDumpInfo.varName] : null;
                        if (mState) {
                            mState.rows[currentDumpInfo.rowIndex] = rowVals || [];
                            mState.pending--;
                            if (mState.pending === 0) {
                                currentFrame.arrays[currentDumpInfo.varName] = mState.rows;
                                delete currentFrame.tempMatrices[currentDumpInfo.varName];
                            }
                        }
                    } else if (currentDumpInfo.type === 'array') {
                        const arrVals = jdbParser.parseArrayDump(cleanOutput);
                        if (arrVals) {
                            currentFrame.arrays[currentDumpInfo.varName] = arrVals;
                            if (currentDumpInfo.refId) {
                                const arrObj = {
                                    refId: currentDumpInfo.refId,
                                    className: currentDumpInfo.className || 'Array',
                                    length: arrVals.length
                                };
                                arrVals.forEach((val, idx) => {
                            arrObj[idx] = val;
                                    arrObj[`[${idx}]`] = val;
                                    arrObj[String(idx)] = val;

                                    if (typeof val === 'string') {
                                        const match = val.match(/instance of ([\w\.\$\[\]\d]+)\s*\(id=([a-fA-F0-9]+)\)/);
                                        if (match) {
                                            const childClass = match[1];
                                            const childRefId = match[2];
                                            if (!visitedRefs[childRefId]) {
                                                visitedRefs[childRefId] = true;
                                                dumpQueue.push({
                                                    command: `dump ${currentDumpInfo.expression}[${idx}]`,
                                                    expression: `${currentDumpInfo.expression}[${idx}]`,
                                                    type: 'object',
                                                    varName: currentDumpInfo.varName,
                                                    className: childClass,
                                                    refId: childRefId,
                                                    depth: 1
                                                });
                                            }
                                        }
                                    }
                                });
                                currentFrame.objects[currentDumpInfo.refId] = arrObj;
                            }
                        }
                    } else if (currentDumpInfo.type === 'array_element') {
                        const cleanOutput = cleanJdbPrompt(output);
                        let parsedVal = null;
                        if (cleanOutput.includes('null')) {
                            parsedVal = null;
                        } else if (cleanOutput.includes('instance of')) {
                            const match = cleanOutput.match(/instance of ([\w\.\$\[\]\d]+)\s*\(id=([a-fA-F0-9]+)\)/);
                            if (match) {
                                const childClass = match[1];
                                const childRefId = match[2];
                                parsedVal = `instance of ${childClass}(id=${childRefId})`;
                                
                                const depthLimit = (currentDumpInfo.expression.includes('next') || currentDumpInfo.expression.includes('nextRef')) ? 10 : 5;
                                if (!visitedRefs[childRefId] && currentDumpInfo.depth < depthLimit) {
                                    visitedRefs[childRefId] = true;
                                    dumpQueue.push({
                                        command: `dump ${currentDumpInfo.expression}`,
                                        expression: `${currentDumpInfo.expression}`,
                                        type: 'object',
                                        varName: currentDumpInfo.varName,
                                        className: childClass,
                                        refId: childRefId,
                                        depth: currentDumpInfo.depth + 1
                                    });
                                }
                            }
                        } else {
                            const eqIdx = cleanOutput.indexOf('=');
                            if (eqIdx !== -1) {
                                const vStr = cleanOutput.substring(eqIdx + 1).trim();
                                parsedVal = isNaN(vStr) ? vStr : Number(vStr);
                            }
                        }
                        
                        const arrObj = currentFrame.objects[currentDumpInfo.parentRefId];
                        if (arrObj) {
                            arrObj[currentDumpInfo.index] = parsedVal;
                            arrObj[`[${currentDumpInfo.index}]`] = parsedVal;
                            arrObj[String(currentDumpInfo.index)] = parsedVal;
                        }
                    } else if (currentDumpInfo.type === 'hashmap') {
                        const eqIdx = cleanOutput.indexOf('=');
                        if (eqIdx !== -1) {
                            let mapRepresentation = cleanOutput.substring(eqIdx + 1).trim();
                            if (mapRepresentation.startsWith('"') && mapRepresentation.endsWith('"')) {
                                mapRepresentation = mapRepresentation.substring(1, mapRepresentation.length - 1).trim();
                            }
                            const originalVal = currentFrame.variables[currentDumpInfo.varName] || '';
                            const collType = getCollectionType(originalVal);
                            const finalRep = `${collType} ${mapRepresentation}`;
                            if (currentFrame) {
                                currentFrame.variables[currentDumpInfo.varName] = finalRep;
                            }
                        }
                    } else if (currentDumpInfo.type === 'object') {
                        const fields = jdbParser.parseObjectDump(cleanOutput);
                        if (fields) {
                            const node = {
                                refId: currentDumpInfo.refId,
                                className: currentDumpInfo.className,
                                expression: currentDumpInfo.expression,
                                val: fields.val !== undefined ? fields.val : null
                            };
                            
                            Object.keys(fields).forEach(fKey => {
                                const fVal = fields[fKey];
                                if (fVal === null) {
                                    node[fKey] = null;
                                } else if (typeof fVal === 'string' && fVal.includes('instance of') && fVal.includes('id=')) {
                                     const match = fVal.match(/instance of ([\w\.\$\[\]\d]+)\s*\(id=([a-fA-F0-9]+)\)/);
                                    if (match) {
                                        const childClass = match[1];
                                        const childRefId = match[2];
                                        node[fKey] = childRefId;
                                        
                                        const isListField = (fKey === 'next');
                                        const isTreeField = (fKey === 'left' || fKey === 'right');
                                        const depthLimit = isListField ? 10 : (isTreeField ? 4 : 5);
                                        
                                        if (!visitedRefs[childRefId] && currentDumpInfo.depth < depthLimit) {
                                            visitedRefs[childRefId] = true;
                                            
                                            const arrayMatch = childClass.match(/([\w\.\$]+)\[(\d+)\]/);
                                            if (arrayMatch) {
                                                const baseClass = arrayMatch[1];
                                                const len = parseInt(arrayMatch[2]);
                                                
                                                const arrObj = {
                                                    refId: childRefId,
                                                    className: childClass,
                                                    length: len
                                                };
                                                currentFrame.objects[childRefId] = arrObj;
                                                
                                                for (let idx = 0; idx < len; idx++) {
                                                    dumpQueue.push({
                                                        command: `dump ${currentDumpInfo.expression}.${fKey}[${idx}]`,
                                                        expression: `${currentDumpInfo.expression}.${fKey}[${idx}]`,
                                                        type: 'array_element',
                                                        varName: currentDumpInfo.varName,
                                                        parentRefId: childRefId,
                                                        index: idx,
                                                        depth: currentDumpInfo.depth + 1
                                                    });
                                                }
                                            } else {
                                                dumpQueue.push({
                                                    command: `dump ${currentDumpInfo.expression}.${fKey}`,
                                                    expression: `${currentDumpInfo.expression}.${fKey}`,
                                                    type: 'object',
                                                    varName: currentDumpInfo.varName,
                                                    className: childClass,
                                                    refId: childRefId,
                                                    depth: currentDumpInfo.depth + 1
                                                });
                                            }
                                        }
                                    } else {
                                        node[fKey] = fVal;
                                    }
                                } else {
                                    node[fKey] = fVal;
                                }
                            });
                            
                            currentFrame.objects[currentDumpInfo.refId] = node;
                        }
                    }
                    
                    if (dumpQueue.length > 0) {
                        output = '';
                        currentDumpInfo = dumpQueue.shift();
                        send(currentDumpInfo.command);
                        return;
                    }
                    
                    if (currentFrame) {
                        frames.push(currentFrame);
                        currentFrame = null;
                    }
                    
                    steps++;
                    if (steps > maxSteps) {
                        jdb.kill();
                        finishTracing();
                        return;
                    }
                    
                    output = '';
                    state = 'wait_for_step';
                    send('step');
                    return;
                }
            }
        });
        
        jdb.on('close', () => finishTracing());

        let finished = false;
        function finishTracing() {
            if (finished) return;
            finished = true;
            
            if (frames.length > 0) {
                if (rawStdoutLineBuffer) {
                    const extracted = jdbParser.extractAppStdout(rawStdoutLineBuffer);
                    if (extracted) {
                        appStdoutBuffer += extracted;
                    }
                    rawStdoutLineBuffer = '';
                }
                if (appStdoutBuffer) {
                    accumulatedStdout += appStdoutBuffer;
                    frames[frames.length - 1].consoleOutput = accumulatedStdout;
                    appStdoutBuffer = '';
                }
            }
            
            const codeLines = code.split('\n');
             
             const processed = frames
               .map(f => ({ ...f, adjustedLine: f.line - 4 }))
               .filter(f => f.adjustedLine >= 1 && f.adjustedLine <= codeLines.length)
               .filter(f => {
                 if (f.stack && f.stack.length > 0) {
                   const topFrame = f.stack[f.stack.length - 1];
                   const isMainClass = topFrame.className === 'Main';
                   const isInitMethod = topFrame.methodName === '<init>';
                   return !isMainClass && !isInitMethod;
                 }
                 return true;
               })
               .map((f, i, arr) => {
                const codeSnippet = codeLines[f.line - 1] ? codeLines[f.line - 1].trim() : "";
                const prevStep = i > 0 ? arr[i - 1] : null;
                const explanation = aiTeacherService.generateExplanation(codeLines, f, prevStep, i, pattern);
                
                return {
                    line: f.adjustedLine,
                    code: codeSnippet,
                    variables: f.variables,
                    arrays: f.arrays || {},
                    objects: f.objects || {},
                    stack: f.stack,
                    explanation,
                    returnValue: f.returnValue,
                    isExit: f.isExit,
                    consoleOutput: f.consoleOutput
                };
              });

            for (let i = 0; i < processed.length; i++) {
                const step = processed[i];
                const depth = step.stack.length;
                if (depth > 0) {
                    const activeFrame = step.stack[depth - 1];
                    step.before = { ...activeFrame.variables };
                    
                    let afterVars = null;
                    for (let j = i + 1; j < processed.length; j++) {
                        if (processed[j].stack.length <= depth) {
                            if (processed[j].stack.length === depth) {
                                afterVars = { ...processed[j].stack[depth - 1].variables };
                            } else {
                                afterVars = { ...processed[j - 1].stack[depth - 1].variables };
                            }
                            break;
                        }
                    }
                    if (!afterVars) {
                        const lastStep = processed[processed.length - 1];
                        if (lastStep && lastStep.stack && lastStep.stack[depth - 1]) {
                            afterVars = { ...lastStep.stack[depth - 1].variables };
                        } else {
                            afterVars = { ...activeFrame.variables };
                        }
                    }
                    step.after = afterVars;
                } else {
                    step.before = {};
                    step.after = {};
                }
            }
            
            resolve(processed);
        }
      }
    );
  });
};
