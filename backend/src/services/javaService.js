const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

exports.traceJavaCode = (code) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, 'Main.java');
    fs.writeFileSync(filePath, code);

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
        let currentFrame = null;
        let state = 'init'; 
        let steps = 0;
        const maxSteps = 300; // prevent infinite loops

        const send = (cmd) => jdb.stdin.write(cmd + '\n');
        
        jdb.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;
            
            if (output.endsWith('> ') || output.match(/\[\d+\] $/)) {
                if (output.includes('application exited') || output.includes('The application exited')) {
                    finishTracing();
                    return;
                }

                if (state === 'init' && output.includes('Initializing jdb')) {
                    output = '';
                    send('exclude java.*,javax.*,sun.*,com.sun.*,jdk.*');
                    send('stop in Main.main');
                    send('run');
                    state = 'wait_for_break';
                    return;
                }

                if (state === 'wait_for_break') {
                    if (output.includes('Breakpoint hit:')) {
                        const lineMatch = output.match(/line=(\d+)/);
                        if (lineMatch) {
                            currentFrame = { line: parseInt(lineMatch[1]), variables: {} };
                            output = '';
                            state = 'wait_for_locals';
                            send('locals');
                            return;
                        }
                    }
                    return; // keep waiting
                }

                if (state === 'wait_for_step') {
                    if (output.includes('Step completed:') || output.includes('Breakpoint hit:')) {
                        const lineMatch = output.match(/line=(\d+)/);
                        if (lineMatch) {
                            currentFrame = { line: parseInt(lineMatch[1]), variables: {} };
                            output = '';
                            state = 'wait_for_locals';
                            send('locals');
                            return;
                        }
                    } else if (output.includes('Exception occurred:') || output.includes('uncaught java.lang.Throwable')) {
                        // keep stepping or it will exit
                        output = '';
                        send('step');
                        return;
                    }
                    return;
                }

                if (state === 'wait_for_locals') {
                    if (output.includes('Local variables:') || output.includes('Method arguments:')) {
                        const locals = {};
                        const lines = output.split('\n');
                        let inLocals = false;
                        for (let line of lines) {
                            if (line.includes('Local variables:') || line.includes('Method arguments:')) {
                                inLocals = true;
                                continue;
                            }
                            if (inLocals && line.includes('=')) {
                                const parts = line.split('=');
                                const k = parts[0].trim();
                                const v = parts.slice(1).join('=').trim();
                                if (k !== 'args') {
                                    locals[k] = isNaN(v) ? v : Number(v);
                                }
                            }
                        }
                        if (currentFrame) {
                            currentFrame.variables = locals;
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
                    return;
                }
            }
        });
        
        jdb.on('close', () => finishTracing());

        let finished = false;
        function finishTracing() {
            if (finished) return;
            finished = true;
            
            // Post process frames to add code and explanations
            const codeLines = code.split('\n');
            let lastVars = {};
            
            const processed = frames
              .map(f => ({ ...f, adjustedLine: f.line - 4 }))
              .filter(f => f.adjustedLine >= 1 && f.adjustedLine <= codeLines.length)
              .map((f, i) => {
                const codeSnippet = codeLines[f.line - 1] ? codeLines[f.line - 1].trim() : "";
                let explanation = "Executing line " + f.adjustedLine;
                
                // Diff variables
                const currentVars = f.variables;
                const changed = [];
                for (const [k, v] of Object.entries(currentVars)) {
                    if (lastVars[k] === undefined) {
                        changed.push(`initialized \`${k}\` to **${v}**`);
                    } else if (lastVars[k] !== v) {
                        changed.push(`updated \`${k}\` to **${v}**`);
                    }
                }

                // Advanced AI Teacher Heuristics
                if (codeSnippet.includes('System.out.println')) {
                    const match = codeSnippet.match(/println\((.*?)\)/);
                    const val = match ? match[1] : '';
                    explanation = `We are printing the value of \`${val}\` to the console. Look at the Console Output below to see it appear! 🖨️`;
                } else if (codeSnippet.match(/(\w+)\s*=\s*\+\+(\w+)/)) {
                    const match = codeSnippet.match(/(\w+)\s*=\s*\+\+(\w+)/);
                    explanation = `Ah, the tricky **pre-increment** operator (\`++${match[2]}\`)! This means we increase \`${match[2]}\` by 1 *first*, and then assign that new value to \`${match[1]}\`. Notice how both changed at the same time! 🧠`;
                } else if (codeSnippet.match(/(\w+)\s*=\s*(\w+)\+\+/)) {
                    const match = codeSnippet.match(/(\w+)\s*=\s*(\w+)\+\+/);
                    explanation = `Watch closely! This is the **post-increment** operator (\`${match[2]}++\`). It assigns the *current* value of \`${match[2]}\` to \`${match[1]}\` first, and *then* secretly increases \`${match[2]}\` by 1. That's why \`${match[1]}\` gets the old value! 👀`;
                } else if (codeSnippet.match(/int\s+(\w+)\s*=\s*([^;]+);/)) {
                    const match = codeSnippet.match(/int\s+(\w+)\s*=\s*([^;]+);/);
                    if (match[2].includes('+') || match[2].includes('-') || match[2].includes('*')) {
                        explanation = `We are evaluating the math expression \`${match[2]}\` and storing the result in a new integer variable called \`${match[1]}\`. 🧮`;
                    } else {
                        explanation = `We are creating a new integer variable named \`${match[1]}\` and initializing its value to \`${match[2]}\`. Think of it like creating a small storage box in memory! 📦`;
                    }
                } else if (changed.length > 0) {
                    explanation = `Boom! We just ${changed.join(' and ')}. 💥`;
                } else if (codeSnippet.includes('for (')) {
                    explanation = `We are at the top of a \`for\` loop! We'll repeat the block of code inside as long as the condition remains true. 🔄`;
                } else if (codeSnippet.includes('while (')) {
                    explanation = `We are checking a \`while\` loop condition. If it's true, we'll dive back inside! 🎡`;
                } else if (codeSnippet.includes('if (')) {
                    explanation = `Decision time! We are evaluating the \`if\` condition to see which path the code should take. 🔀`;
                } else if (codeSnippet.includes('return')) {
                    explanation = `We are hitting a \`return\` statement! This means we are sending a value back and exiting the current method. 🚀`;
                } else if (i === 0) {
                    explanation = `Welcome to DryRun! 👋 We just stepped into the \`main\` method, which is the starting point of every Java program. Let's trace this step-by-step!`;
                } else if (codeSnippet === '}') {
                    explanation = `We reached the end of the block. Cleaning up scope! 🧹`;
                }

                lastVars = { ...currentVars };
                
                return {
                    line: f.adjustedLine,
                    code: codeSnippet,
                    variables: currentVars,
                    explanation
                };
            });
            
            resolve(processed);
        }
      }
    );
  });
};
