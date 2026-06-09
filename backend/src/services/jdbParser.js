const promptRegex = /(?:>|\[\d+\])\s*$/;

exports.promptRegex = promptRegex;

exports.isPrompt = (output) => {
  return promptRegex.test(output) || output.endsWith('> ') || output.match(/\[\d+\] $/);
};

exports.parseStack = (output) => {
  const stack = [];
  const lines = output.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*\[(\d+)\]\s+([\w\.\$<>]+)\.([\w$<>]+)\s*\(([^:]+):(\d+)\)/);
    if (match) {
      const depth = parseInt(match[1]);
      const className = match[2];
      const methodName = match[3];
      const fileName = match[4];
      const rawLine = parseInt(match[5]);
      stack.push({
        depth,
        className,
        methodName,
        fileName,
        line: rawLine,
        adjustedLine: rawLine - 4,
        variables: {},
        args: []
      });
    }
  }
  stack.reverse(); // Bottom of stack at index 0
  return stack;
};

exports.parseLocals = (output) => {
  const variables = {};
  const args = [];
  const lines = output.split('\n');
  let section = null;

  for (let line of lines) {
    line = line.trim();
    if (line.includes('Method arguments:')) {
      section = 'args';
      continue;
    }
    if (line.includes('Local variables:')) {
      section = 'locals';
      continue;
    }
    if (section && line.includes('=')) {
      const parts = line.split('=');
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim();
      if (k !== 'args') {
        const parsedVal = isNaN(v) ? v : Number(v);
        if (section === 'args') {
          args.push({ name: k, value: parsedVal });
          variables[k] = parsedVal;
        } else {
          variables[k] = parsedVal;
        }
      }
    }
  }
  return { variables, args };
};

exports.parseMethodExit = (output) => {
  const returnMatch = output.match(/Method exited: return value = ([^,]+)/);
  if (returnMatch) {
    return {
      returnValue: returnMatch[1].trim(),
      isExit: true
    };
  }
  return null;
};

exports.extractAppStdout = (chunk) => {
  const lines = chunk.split('\n');
  let appStdout = '';
  
  for (const line of lines) {
    const cleanedLine = line.replace(/^(?:[\w\-]*\[\d+\]\s*>|[\w\-]*\[\d+\]|>)\s*/, '');
    const l = cleanedLine.trim();
    if (!l) continue;
    
    // Check if JDB internal line
    const isJdb = l.startsWith('>') || 
                  l.endsWith('>') || 
                  l.includes('Initializing jdb') || 
                  l.includes('Breakpoint hit:') || 
                  l.includes('Step completed:') || 
                  l.includes('Method exited:') || 
                  l.includes('Local variables:') || 
                  l.includes('Method arguments:') || 
                  l.match(/^\[\d+\]/) || 
                  l.match(/^main\[\d+\]/) || 
                  l.includes('The application exited') || 
                  l.includes('application exited') || 
                  l.match(/^\s*\[\d+\]\s+[\w\.\$<>]+/) ||
                  l.includes('Set ') ||
                  l.includes('set ') ||
                  l.includes('Command ') ||
                  l.includes('is set.') ||
                  l.includes('thread=') ||
                  l.includes('bci=') ||
                  l.includes('= instance of') ||
                  l.match(/^\s*\d+\s+/) ||
                  l.startsWith('args =');
                  
    if (!isJdb) {
      appStdout += cleanedLine + '\n';
    }
  }
  return appStdout;
};
