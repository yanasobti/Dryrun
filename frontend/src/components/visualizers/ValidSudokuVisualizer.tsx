import React, { useMemo } from 'react';

interface ValidSudokuVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
  visualizerState: any;
}

export const ValidSudokuVisualizer: React.FC<ValidSudokuVisualizerProps> = ({
  frames,
  currentFrameIndex,
  visualizerState
}) => {
  const activeFrame = frames[currentFrameIndex] || {};
  const variables = activeFrame.variables || {};

  // Extract loop indices and number
  const iVal = variables['i'] !== undefined ? parseInt(String(variables['i']), 10) : -1;
  const jVal = variables['j'] !== undefined ? parseInt(String(variables['j']), 10) : -1;
  const numberVal = variables['number'] ? String(variables['number']).replace(/['"]/g, '') : null;

  // Extract the board matrix
  const board: string[][] = useMemo(() => {
    const matrix = visualizerState.matrices.find((m: any) => m.name === 'board');
    if (matrix && Array.isArray(matrix.grid)) {
      return matrix.grid.map((row: any) => 
        row.map((cell: any) => String(cell).replace(/['"]/g, ''))
      );
    }
    const firstFrame = frames[0] || {};
    const firstArrays = firstFrame.arrays || {};
    const inputBoard = firstArrays['board'];
    if (Array.isArray(inputBoard)) {
      return inputBoard.map((row: any) => 
        row.map((cell: any) => String(cell).replace(/['"]/g, ''))
      );
    }
    return Array(9).fill(null).map(() => Array(9).fill('.'));
  }, [visualizerState, frames]);

  // Find duplicate/clash
  const clashInfo = useMemo(() => {
    if (iVal === -1 || jVal === -1 || !numberVal || numberVal === '.') return null;

    // Check row
    for (let col = 0; col < 9; col++) {
      if (col !== jVal && board[iVal]?.[col] === numberVal) {
        return { type: 'row', r: iVal, c: col, msg: `Duplicate '${numberVal}' in Row ${iVal}` };
      }
    }

    // Check column
    for (let row = 0; row < 9; row++) {
      if (row !== iVal && board[row]?.[jVal] === numberVal) {
        return { type: 'column', r: row, c: jVal, msg: `Duplicate '${numberVal}' in Col ${jVal}` };
      }
    }

    // Check box
    const boxRowStart = Math.floor(iVal / 3) * 3;
    const boxColStart = Math.floor(jVal / 3) * 3;
    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
      for (let c = boxColStart; c < boxColStart + 3; c++) {
        if ((r !== iVal || c !== jVal) && board[r]?.[c] === numberVal) {
          return { 
            type: 'box', 
            r, 
            c, 
            msg: `Duplicate '${numberVal}' in Box (${Math.floor(iVal / 3) + 1}, ${Math.floor(jVal / 3) + 1})` 
          };
        }
      }
    }

    return null;
  }, [board, iVal, jVal, numberVal]);

  const seenSet = useMemo(() => {
    const sets = visualizerState.hashSets || [];
    const mainSet = sets.find((s: any) => s.name === 'seen') || sets[0];
    if (mainSet && Array.isArray(mainSet.values)) {
      return new Set<string>(mainSet.values.map((v: any) => String(v).replace(/['"]/g, '')));
    }
    return new Set<string>();
  }, [visualizerState]);

  // Game/Progress Dashboard
  const progress = useMemo(() => {
    const totalFilled = board.flat().filter(c => c !== '.').length;
    let checkedCount = 0;
    
    if (iVal !== -1 && jVal !== -1) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (r < iVal || (r === iVal && c <= jVal)) {
            if (board[r]?.[c] !== '.') {
              checkedCount++;
            }
          }
        }
      }
    }

    const hasClash = !!clashInfo;
    const conflicts = hasClash ? 1 : 0;
    const validCount = Math.max(0, checkedCount - conflicts);

    return {
      checked: checkedCount,
      total: totalFilled,
      valid: validCount,
      conflicts
    };
  }, [board, iVal, jVal, clashInfo]);

  // Checklist Statuses
  const rowCheckStatus = useMemo(() => {
    if (iVal === -1 || jVal === -1 || !numberVal || numberVal === '.') return 'idle';
    if (clashInfo?.type === 'row') return 'clash';
    if (seenSet.has(`${numberVal} in row ${iVal}`)) return 'passed';
    return 'checking';
  }, [iVal, jVal, numberVal, seenSet, clashInfo]);

  const colCheckStatus = useMemo(() => {
    if (iVal === -1 || jVal === -1 || !numberVal || numberVal === '.') return 'idle';
    if (clashInfo?.type === 'column') return 'clash';
    if (seenSet.has(`${numberVal} in col ${jVal}`)) return 'passed';
    return 'checking';
  }, [iVal, jVal, numberVal, seenSet, clashInfo]);

  const boxCheckStatus = useMemo(() => {
    if (iVal === -1 || jVal === -1 || !numberVal || numberVal === '.') return 'idle';
    if (clashInfo?.type === 'box') return 'clash';
    const boxId = `${Math.floor(iVal / 3)}-${Math.floor(jVal / 3)}`;
    if (seenSet.has(`${numberVal} in block ${boxId}`)) return 'passed';
    return 'checking';
  }, [iVal, jVal, numberVal, seenSet, clashInfo]);

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-5 shadow-sm select-none text-slate-700">
      
      {/* Header */}
      <div className="w-full flex flex-col pb-3 mb-4 border-b border-slate-100">
        <span className="text-[10px] font-black tracking-widest text-purple-650 uppercase font-mono">
          Interactive Sudoku Teacher
        </span>
        <h2 className="text-base font-bold text-slate-800">
          Valid Sudoku Constraint Verification
        </h2>
      </div>

      {/* Main Workstation Layout */}
      <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center">
        
        {/* Left Panel: Large Brighter Hero Board */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 border border-slate-150">
          <div className="grid grid-cols-9 gap-0.5 bg-slate-400 p-1.5 rounded-xl border border-slate-300 shadow-md relative w-full max-w-[340px] aspect-square">
            {board.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                const isCurrent = rIdx === iVal && cIdx === jVal;
                const isClash = clashInfo && clashInfo.r === rIdx && clashInfo.c === cIdx;
                const isEmpty = cell === '.';

                // Identify highlighted contexts
                const inCurrentRow = rIdx === iVal;
                const inCurrentCol = cIdx === jVal;
                const inCurrentBox = iVal !== -1 && jVal !== -1 && 
                  Math.floor(rIdx / 3) === Math.floor(iVal / 3) && 
                  Math.floor(cIdx / 3) === Math.floor(jVal / 3);

                // Styling logic matching design system (light mode)
                let cellClass = 'bg-white text-slate-800 border-slate-150';
                
                if (isEmpty) {
                  cellClass = 'bg-slate-50 text-slate-350 border-slate-100';
                }

                // Apply context highlights
                if (inCurrentRow && !isCurrent && !isClash) {
                  cellClass = 'bg-blue-50/70 text-blue-800 border-blue-100';
                } else if (inCurrentCol && !isCurrent && !isClash) {
                  cellClass = 'bg-emerald-50/70 text-emerald-800 border-emerald-100';
                } else if (inCurrentBox && !isCurrent && !isClash) {
                  cellClass = 'bg-amber-50/70 text-amber-800 border-amber-100';
                }

                // Active targets
                if (isCurrent) {
                  cellClass = clashInfo 
                    ? 'bg-red-500 text-white border-red-600 ring-4 ring-red-300 font-black z-10 scale-105 shadow-sm'
                    : 'bg-purple-600 text-white border-purple-700 ring-4 ring-purple-300 font-black z-10 scale-105 shadow-sm';
                } else if (isClash) {
                  cellClass = 'bg-red-500 text-white border-red-600 ring-4 ring-red-300 font-black z-10 scale-105 animate-pulse shadow-sm';
                }

                // 3x3 Block boundaries
                const borderRight = (cIdx === 2 || cIdx === 5) ? 'mr-0.5 border-r border-r-slate-400' : '';
                const borderBottom = (rIdx === 2 || rIdx === 5) ? 'mb-0.5 border-b border-b-slate-400' : '';

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold font-mono rounded-md transition-all duration-200 border ${cellClass} ${borderRight} ${borderBottom}`}
                  >
                    {isEmpty ? '•' : cell}
                  </div>
                );
              })
            )}
          </div>

          {/* Legends */}
          <div className="flex flex-wrap justify-center gap-3.5 mt-4 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-purple-600 inline-block" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-blue-50 border border-blue-200 inline-block" />
              <span>Row Check</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-50 border border-emerald-200 inline-block" />
              <span>Col Check</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-50 border border-amber-200 inline-block" />
              <span>Box Check</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500 inline-block" />
              <span>Conflict</span>
            </div>
          </div>
        </div>

        {/* Right Panel: ONE Unified Information Panel */}
        <div className="w-full md:w-[240px] flex flex-col justify-start bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-xs gap-4 font-sans text-xs">
          
          {/* Current Cell Section */}
          <div className="flex flex-col gap-1 bg-white border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              Current Cell
            </span>
            {iVal !== -1 && jVal !== -1 && numberVal && numberVal !== '.' ? (
              <div className="flex justify-between items-center">
                <span className="text-slate-800 font-bold">Cell: ({iVal}, {jVal})</span>
                <span className="bg-purple-100 text-purple-700 font-black px-2 py-0.5 rounded font-mono">
                  Val: {numberVal}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No cell active</span>
            )}
          </div>

          {/* Verification Checks Checklist */}
          {iVal !== -1 && jVal !== -1 && numberVal && numberVal !== '.' ? (
            <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                Verifying Check list
              </span>
              
              {/* Row constraint */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-655 font-medium">Row {iVal}</span>
                {rowCheckStatus === 'passed' && <span className="text-emerald-600 font-bold font-mono">✓ Clear</span>}
                {rowCheckStatus === 'clash' && <span className="text-red-500 font-bold font-mono">❌ Conflict</span>}
                {rowCheckStatus === 'checking' && <span className="text-amber-500 font-bold font-mono animate-pulse">⏳ Verify</span>}
              </div>

              {/* Col constraint */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-655 font-medium">Column {jVal}</span>
                {colCheckStatus === 'passed' && <span className="text-emerald-600 font-bold font-mono">✓ Clear</span>}
                {colCheckStatus === 'clash' && <span className="text-red-500 font-bold font-mono">❌ Conflict</span>}
                {colCheckStatus === 'checking' && <span className="text-amber-500 font-bold font-mono animate-pulse">⏳ Verify</span>}
                {colCheckStatus === 'idle' && <span className="text-slate-400 font-mono">⏳ Pending</span>}
              </div>

              {/* Box constraint */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-655 font-medium">Box ({Math.floor(iVal / 3) + 1}, {Math.floor(jVal / 3) + 1})</span>
                {boxCheckStatus === 'passed' && <span className="text-emerald-600 font-bold font-mono">✓ Clear</span>}
                {boxCheckStatus === 'clash' && <span className="text-red-500 font-bold font-mono">❌ Conflict</span>}
                {boxCheckStatus === 'checking' && <span className="text-amber-500 font-bold font-mono animate-pulse">⏳ Verify</span>}
                {boxCheckStatus === 'idle' && <span className="text-slate-400 font-mono">⏳ Pending</span>}
              </div>
            </div>
          ) : null}

          {/* Progress Dashboard */}
          <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              Verification Progress
            </span>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Cells Checked:</span>
              <span className="text-slate-800 font-bold font-mono">{progress.checked} / {progress.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Valid Cells:</span>
              <span className="text-emerald-600 font-bold font-mono">{progress.valid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Conflicts:</span>
              <span className={`font-mono font-bold ${progress.conflicts > 0 ? "text-red-500" : "text-slate-600"}`}>
                {progress.conflicts}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
