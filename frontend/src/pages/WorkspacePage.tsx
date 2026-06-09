import './WorkspacePage.css';
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Editor from '@monaco-editor/react';



export const WorkspacePage = () => {

  const [consoleOutput, setConsoleOutput] = useState("Hello DryRun");
  const [isError, setIsError] = useState(false);
  const [code, setCode] = useState(
`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello DryRun");
    }
}`
  );

  const [frames, setFrames] = useState<any[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current && frames.length > 0) {
      const line = frames[currentFrame]?.line;
      if (line) {
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          [
            {
              range: new monacoRef.current.Range(line, 1, line, 1),
              options: {
                isWholeLine: true,
                className: 'highlightLine'
              }
            }
          ]
        );
      }
    }
  }, [currentFrame, frames]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, frames]);

  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    if (!frames.length) return;
    const fullText = frames[currentFrame]?.explanation || "";
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [currentFrame, frames]);

  const handleVisualize = async () => {
    try {
      setConsoleOutput("Running...");
      setIsError(false);
      
      const codePayload = `import java.util.*;\nimport java.io.*;\nimport java.math.*;\n\n${code}`;

      const runRes = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codePayload })
      });

      const data = await runRes.json();
      if (data.success) {
        setConsoleOutput(data.output);
        setIsError(false);
      } else {
        setConsoleOutput(data.error || "An error occurred.");
        setIsError(true);
      }

      const vizRes = await fetch("http://localhost:8000/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codePayload })
      });

      const vizData = await vizRes.json();
      if (Array.isArray(vizData)) {
        setFrames(vizData);
        setCurrentFrame(0);
      }
    } catch (err) {
      setConsoleOutput("Failed to connect to backend.");
      setIsError(true);
    }
  };



  return (
    <div className="root">
      {/* ── HEADER ── */}
      <header className="header">
        <div className="headerLeft">
          <span className="logo"><span className="logoBrace">{"{/}"}</span> DryRun</span>
          <nav className="nav">
            {["Workspace", "Templates", "Docs"].map((n, i) => (
              <span key={n} className={`navItem ${i === 0 ? 'navActive' : ''}`}>{n}</span>
            ))}
          </nav>
        </div>
        <div className="headerRight">
          <button className="ghostBtn">↑ Share</button>
          <button className="ghostBtn">⤴ Export</button>
          <div className="avatar">Y</div>
        </div>
      </header>

      <div className="body">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <button className="newBtn">＋ New Visualization</button>
          <section className="sideSection">
            <p className="sideLabel">RECENT PROJECTS</p>
            <p className="sideEmpty">No projects yet</p>
          </section>
          <section className="sideSection">
            <p className="sideLabel">TEMPLATES</p>
            <p className="sideEmpty">Browse examples</p>
          </section>
        </aside>

        {/* ── MAIN ── */}
        <main className="main" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflow: "hidden", padding: 16 }}>
          
          <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
            {/* LEFT COLUMN: Editor + Timeline + Console */}
            <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              
              {/* Editor */}
              <div className="card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <div className="cardHeader">
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 6, color: "#c2410c", fontSize: 13, fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                      Java
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="resetBtn">↺ Reset</button>
                    <button className="vizBtn" onClick={handleVisualize}>▶ Visualize</button>
                  </div>
                </div>
                <div className="editorBody" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                  <div style={{ padding: "16px 16px 4px 44px", fontFamily: 'monospace', fontSize: 14, color: '#94a3b8', userSelect: "none", lineHeight: 1.5 }}>
                    <div><span style={{color:"#c678dd"}}>import</span> java.util.*;</div>
                    <div><span style={{color:"#c678dd"}}>import</span> java.io.*;</div>
                    <div><span style={{color:"#c678dd"}}>import</span> java.math.*;</div>
                  </div>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      height="100%"
                      defaultLanguage="java"
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      onMount={handleEditorDidMount}
                      theme="light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 16 },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: { vertical: 'hidden' },
                        overviewRulerBorder: false
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              {frames.length > 0 && (
                <div className="card" style={{ flexShrink: 0, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <button onClick={() => setCurrentFrame(p => Math.max(0, p - 1))} className="iconBtn" style={{ padding: "8px", fontSize: 18 }}>⏮</button>
                      <button onClick={() => setIsPlaying(!isPlaying)} className="iconBtn" style={{ color: "#6366f1", fontSize: 24, padding: "8px" }}>
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => setCurrentFrame(p => Math.min(frames.length - 1, p + 1))} className="iconBtn" style={{ padding: "8px", fontSize: 18 }}>⏭</button>
                    </div>
                    <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
                    <span style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>
                      Step {currentFrame + 1} of {frames.length}
                    </span>
                  </div>
                </div>
              )}

              {/* CONSOLE OUTPUT */}
              <div className="card" style={{ height: 160, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                <div className="panelHead" style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "12px 16px", justifyContent: "flex-start", gap: 16, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Console Output</span>
                </div>
                <div style={{ background: "#fff", flex: 1, overflowY: "auto", padding: 16 }}>
                  <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 14, color: isError ? "#ef4444" : "#334155", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {consoleOutput || "Waiting for execution..."}
                  </pre>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Teacher + Visualization */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 400 }}>
              
              {/* AI Teacher */}
              <div className="card" style={{ height: 160, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                <div className="panelHead" style={{ flexShrink: 0 }}>
                  <span className="panelTitle">AI Teacher</span>
                  <span className="betaBadge">Beta</span>
                </div>
                <div className="teacherBody" style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div style={{ textAlign: "center", color: "#64748b", fontStyle: frames.length > 0 ? "normal" : "italic", fontSize: 14, padding: "20px 30px", lineHeight: 1.6 }}>
                    {frames.length > 0 ? displayedText : "AI Teacher is waiting for execution..."}
                    {frames.length > 0 && displayedText.length < (frames[currentFrame]?.explanation?.length || 0) && (
                      <span style={{ borderRight: "2px solid #6366f1", marginLeft: 2, animation: "blink 1s infinite" }}></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory State Visualization */}
              <div className="card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <div className="panelHead" style={{ flexShrink: 0 }}>
                  <span className="panelTitle">Memory State</span>
                  <button className="iconBtn" title="Fullscreen">⛶</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 24, background: "#f8fafc", overflowY: "auto" }}>
                  {frames.length > 0 ? (
                    <>
                      <div style={{ alignSelf: "center", marginBottom: 32, padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginRight: 12 }}>Current Line</span>
                        <code style={{ fontFamily: "monospace", color: "#6366f1", fontWeight: 600 }}>{frames[currentFrame]?.code}</code>
                      </div>
                      
                      <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Before</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {Object.keys(currentFrame > 0 ? frames[currentFrame - 1]?.variables || {} : {}).length > 0 ? (
                              Object.entries(currentFrame > 0 ? frames[currentFrame - 1]?.variables || {} : {}).map(([key, value]) => (
                                <div key={key} style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontWeight: 600, color: "#475569", fontSize: 16 }}>{key}</span>
                                  <span style={{ color: "#94a3b8" }}>=</span>
                                  <span style={{ fontFamily: "monospace", color: "#334155", fontSize: 16 }}>{String(value)}</span>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 13, marginTop: 12 }}>No variables</div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ width: 1, background: "#e2e8f0" }} />
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>After</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {Object.keys(frames[currentFrame]?.variables || {}).length > 0 ? (
                              Object.entries(frames[currentFrame]?.variables || {}).map(([key, value]) => (
                                <motion.div 
                                  key={`${key}-${value}`} 
                                  initial={{ scale: 0.8, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }} 
                                  style={{ padding: "8px 16px", background: "#ede9fe", border: "1px solid #c7d2fe", borderRadius: 8, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 4px rgba(99,102,241,0.1)" }}
                                >
                                  <span style={{ fontWeight: 600, color: "#4f46e5", fontSize: 16 }}>{key}</span>
                                  <span style={{ color: "#818cf8" }}>=</span>
                                  <span style={{ fontFamily: "monospace", color: "#4338ca", fontWeight: 700, fontSize: 18 }}>{String(value)}</span>
                                </motion.div>
                              ))
                            ) : (
                              <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 13, marginTop: 12 }}>No variables</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontStyle: "italic" }}>
                      Visualization features will appear here after execution.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── STYLES ── */
