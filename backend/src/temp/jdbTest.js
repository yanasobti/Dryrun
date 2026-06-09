const { spawn } = require('child_process');

function traceCode(className) {
    return new Promise((resolve, reject) => {
        const jdb = spawn('jdb', [className]);
        let frames = [];
        let output = '';
        let currentFrame = null;
        let state = 'init'; 

        const send = (cmd) => jdb.stdin.write(cmd + '\n');
        
        jdb.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;
            
            // Wait for prompt
            // "main[1] " or "> "
            if (str.includes('> ') || str.match(/\[\d+\] $/)) {
                if (output.includes('application exited')) {
                    resolve(frames);
                    return;
                }

                if (state === 'init' && output.includes('Initializing jdb')) {
                    output = '';
                    send('stop in ' + className + '.main');
                    send('run');
                    state = 'running';
                    return;
                }

                if (state === 'running') {
                    if (output.includes('Step completed:') || output.includes('Breakpoint hit:')) {
                        const lineMatch = output.match(/line=(\d+)/);
                        if (lineMatch) {
                            currentFrame = { line: parseInt(lineMatch[1]), variables: {} };
                            output = '';
                            state = 'locals';
                            send('locals');
                            return;
                        }
                    } else if (output.includes('run ' + className) || output.includes('VM Started:')) {
                        // Just started running, wait for Breakpoint hit. 
                        // Wait, if it outputs "VM Started:" and then prompt "> ", but breakpoint hit is coming?
                        // Let's just step to be safe, or do nothing.
                        if (!output.includes('Breakpoint hit:')) {
                            // do nothing, wait for more data
                            return;
                        }
                    } else {
                        // Some other prompt, just step
                        output = '';
                        send('step');
                        return;
                    }
                }

                if (state === 'locals') {
                    if (output.includes('Method arguments:') || output.includes('Local variables:')) {
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
                        output = '';
                        state = 'running';
                        send('step');
                        return;
                    }
                }
            }
        });
        
        jdb.on('close', () => resolve(frames));
    });
}

traceCode('Test').then(frames => console.log(JSON.stringify(frames, null, 2))).catch(console.error);
