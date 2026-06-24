import type { MethodInfo, Param } from '../types';

export const cleanJdbIds = (vizData: any[]): any[] => {
  const idMap: Record<string, string> = {};
  let nextSeqId = 1;

  const getCleanId = (rawId: string): string => {
    if (!idMap[rawId]) {
      idMap[rawId] = `${nextSeqId++}`;
    }
    return idMap[rawId];
  };

  const cleanString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str.replace(/id=([a-fA-F0-9]+)/g, (_match, rawId) => {
      return `id=${getCleanId(rawId)}`;
    });
  };

  const cleanVariables = (vars: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (typeof v === 'string') {
        cleaned[k] = cleanString(v);
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned;
  };

  return vizData.map(frame => {
    const cleanedFrame = { ...frame };
    
    if (cleanedFrame.variables) {
      cleanedFrame.variables = cleanVariables(cleanedFrame.variables);
    }

    if (cleanedFrame.stack) {
      cleanedFrame.stack = cleanedFrame.stack.map((sf: any) => {
        const cleanedSf = { ...sf };
        if (cleanedSf.variables) {
          cleanedSf.variables = cleanVariables(cleanedSf.variables);
        }
        if (cleanedSf.args) {
          cleanedSf.args = cleanedSf.args.map((arg: any) => ({
            ...arg,
            value: typeof arg.value === 'string' ? cleanString(arg.value) : arg.value
          }));
        }
        return cleanedSf;
      });
    }

    const cleanFieldVal = (val: any): any => {
      if (typeof val !== 'string') return val;
      if (val.includes('id=')) {
        return cleanString(val);
      }
      if (/^[a-fA-F0-9]{3,}$/.test(val) && !/^\d+$/.test(val)) {
        return getCleanId(val);
      }
      return val;
    };

    if (cleanedFrame.objects) {
      const cleanedObjects: Record<string, any> = {};
      for (const [rawId, obj] of Object.entries(cleanedFrame.objects)) {
        const cleanId = getCleanId(rawId);
        const cleanedObj = { ...(obj as any) };
        cleanedObj.refId = cleanId;
        
        for (const [fKey, fVal] of Object.entries(cleanedObj)) {
          if (fKey !== 'refId' && fKey !== 'className') {
            if (['next', 'random', 'left', 'right', 'parent', 'queue'].includes(fKey) && typeof fVal === 'string') {
              cleanedObj[fKey] = getCleanId(fVal);
            } else {
              cleanedObj[fKey] = cleanFieldVal(fVal);
            }
          }
        }
        cleanedObjects[cleanId] = cleanedObj;
      }
      cleanedFrame.objects = cleanedObjects;
    }

    if (cleanedFrame.arrays) {
      const cleanedArrays: Record<string, any[]> = {};
      for (const [k, v] of Object.entries(cleanedFrame.arrays)) {
        if (Array.isArray(v)) {
          cleanedArrays[k] = v.map(item => {
            if (typeof item === 'string') {
              return cleanString(item);
            }
            return item;
          });
        } else {
          cleanedArrays[k] = v as any;
        }
      }
      cleanedFrame.arrays = cleanedArrays;
    }

    if (cleanedFrame.explanation) {
      cleanedFrame.explanation = {
        action: cleanString(cleanedFrame.explanation.action || ""),
        explanation: cleanString(cleanedFrame.explanation.explanation || ""),
        why: cleanString(cleanedFrame.explanation.why || "")
      };
    }

    return cleanedFrame;
  });
};

export const parseMethods = (javaCode: string): MethodInfo[] => {
  const cleanCode = javaCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  const methodRegex = /(?:public\s+|private\s+|protected\s+|static\s+)*([\w<>\[\]]+)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;
  const methods: MethodInfo[] = [];
  
  let match;
  while ((match = methodRegex.exec(cleanCode)) !== null) {
    const returnType = match[1];
    const methodName = match[2];
    const paramsText = match[3].trim();
    
    const keywords = ['if', 'while', 'for', 'switch', 'catch', 'synchronized', 'return', 'public', 'private', 'protected', 'static', 'class', 'new'];
    if (keywords.includes(methodName) || keywords.includes(returnType)) {
      continue;
    }
    
    if (methodName === 'main') {
      continue;
    }

    const fullSignature = match[0];
    const isStatic = /\bstatic\b/.test(fullSignature);

    const params: Param[] = [];
    if (paramsText) {
      paramsText.split(',').forEach(p => {
        const parts = p.trim().split(/\s+/);
        if (parts.length >= 2) {
          const type = parts.slice(0, -1).join(' ');
          const name = parts[parts.length - 1];
          params.push({ type, name });
        }
      });
    }

    methods.push({
      name: methodName,
      returnType,
      params,
      isStatic
    });
  }

  const classMatches = Array.from(cleanCode.matchAll(/\bclass\s+([a-zA-Z_]\w*)/g)).map(m => m[1]);
  const mainClassName = classMatches.find(c => c === 'Solution') || 
                        classMatches.find(c => c !== 'ListNode' && c !== 'TreeNode' && c !== 'Node') || 
                        classMatches[0] || 
                        'Solution';

  return methods.filter(m => {
    const enclosing = getEnclosingClassForMethod(javaCode, m.name);
    return enclosing === mainClassName;
  });
};

export const generateBSTConstruction = (values: (number | null)[], nodeClassName: string): string => {
  if (values.length === 0 || values[0] === null || isNaN(values[0])) return "";
  let code = "";
  
  // Create all non-null nodes first
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val !== null && !isNaN(val)) {
      code += `        ${nodeClassName} n${i} = new ${nodeClassName}(${val});\n`;
    }
  }
  
  // Link nodes using queue-based level order simulation
  const queue: string[] = ["n0"];
  let valIdx = 1;
  while (queue.length > 0 && valIdx < values.length) {
    const currVar = queue.shift()!;
    
    // Left child
    if (valIdx < values.length) {
      const leftVal = values[valIdx];
      if (leftVal !== null && !isNaN(leftVal)) {
        code += `        ${currVar}.left = n${valIdx};\n`;
        queue.push(`n${valIdx}`);
      }
      valIdx++;
    }
    
    // Right child
    if (valIdx < values.length) {
      const rightVal = values[valIdx];
      if (rightVal !== null && !isNaN(rightVal)) {
        code += `        ${currVar}.right = n${valIdx};\n`;
        queue.push(`n${valIdx}`);
      }
      valIdx++;
    }
  }
  
  code += `        ${nodeClassName} root = n0;\n`;
  return code;
};

export const generateListConstruction = (values: number[], nodeClassName: string, pos: number = -1, headVarName: string = "head"): string => {
  if (values.length === 0) return "";
  let code = "";
  for (let i = 0; i < values.length; i++) {
    code += `        ${nodeClassName} ${headVarName}_n${i} = new ${nodeClassName}(${values[i]});\n`;
  }
  code += `        ${nodeClassName} ${headVarName} = ${headVarName}_n0;\n`;
  for (let i = 0; i < values.length - 1; i++) {
    code += `        ${headVarName}_n${i}.next = ${headVarName}_n${i + 1};\n`;
  }
  if (pos >= 0 && pos < values.length) {
    code += `        ${headVarName}_n${values.length - 1}.next = ${headVarName}_n${pos};\n`;
  }
  return code;
};

export const cleanValRep = (val: any): string => {
  if (val === undefined || val === null) return "";
  let str = String(val);
  const match = str.match(/instance of ([\w\.\$\[\]]+)\s*\(id=([a-fA-F0-9]+)\)/);
  if (match) {
    const fullClassName = match[1];
    const id = match[2];
    const lastDot = fullClassName.lastIndexOf('.');
    const className = lastDot !== -1 ? fullClassName.substring(lastDot + 1) : fullClassName;
    return `${className} (#${id})`;
  }
  return str;
};

export const getEnclosingClassForMethod = (javaCode: string, methodName: string): string | null => {
  const cleanCode = javaCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  const classRegex = /\bclass\s+([a-zA-Z_]\w*)/g;
  let match;
  const classes: { name: string; startIndex: number; bodyStart: number }[] = [];

  while ((match = classRegex.exec(cleanCode)) !== null) {
    const className = match[1];
    const startIndex = match.index;
    const braceIndex = cleanCode.indexOf('{', startIndex + match[0].length);
    if (braceIndex !== -1) {
      classes.push({
        name: className,
        startIndex,
        bodyStart: braceIndex + 1
      });
    }
  }

  if (classes.length === 0) return null;

  for (let i = classes.length - 1; i >= 0; i--) {
    const cls = classes[i];
    let braceCount = 1;
    let index = cls.bodyStart;
    
    while (index < cleanCode.length && braceCount > 0) {
      const char = cleanCode[index];
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
      index++;
    }
    
    const bodyEnd = index;
    const classBody = cleanCode.substring(cls.bodyStart, bodyEnd);
    const methodDeclRegex = new RegExp(`\\b${methodName}\\s*\\(`);
    if (methodDeclRegex.test(classBody)) {
      return cls.name;
    }
  }

  const publicClassMatch = javaCode.match(/\bpublic\s+class\s+([a-zA-Z_]\w*)/);
  if (publicClassMatch) {
    return publicClassMatch[1];
  }
  return classes[0].name;
};
