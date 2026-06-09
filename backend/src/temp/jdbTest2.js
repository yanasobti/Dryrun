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
            output += data.toString();
            
            if (output.endsWith('> ') || output.match(/\[\d+\] $/)) {
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
                    } 
                    
                    if (output.includes('run ' + className)) {
                        if (!output.includes('Breakpoint hit:')) {
                            // Wait for breakpoint
                            return;
                        }
                    }

                    // Otherwise just step
                    output = '';
                    send('step');
                    return;
                }

                if (state === 'locals') {
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
        });
        
        jdb.on('close', () => resolve(frames));
    });
}

traceCode('Test').then(frames => console.log(JSON.stringify(frames, null, 2))).catch(console.error);
