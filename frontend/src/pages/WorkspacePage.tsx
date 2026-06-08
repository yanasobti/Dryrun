import React, { useState } from "react";
import Editor from '@monaco-editor/react';

const STEPS = [
  { step: 1, label: "Initialize",       sub: "sum = 0, i = 1" },
  { step: 2, label: "1st Iteration",    sub: "sum = 1, i = 1" },
  { step: 3, label: "2nd Iteration",    sub: "sum = 3, i = 2" },
  { step: 4, label: "3rd Iteration",    sub: "sum = 6, i = 3" },
  { step: 5, label: "4th Iteration",    sub: "sum = 10, i = 4" },
  { step: 6, label: "5th Iteration",    sub: "sum = 15, i = 5" },
  { step: 7, label: "Completed",        sub: "Execution Ended" },
];

const VARS = [
  { name: "sum", value: 7,  type: "int", color: "#6366f1" },
  { name: "i",   value: 4,  type: "int", color: "#f43f5e" },
];

export const WorkspacePage = () => {
  const [activeStep, setActiveStep] = useState(5);
  const [code] = useState(
`public class Main {
  public static void main(String[] args) {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
      sum += i;
    }
    System.out.println("Sum = " + sum);
  }
}`
  );

  const progressPct = ((activeStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={s.root}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}><span style={s.logoBrace}>{"{/}"}</span> DryRun</span>
          <nav style={s.nav}>
            {["Workspace", "Templates", "Docs"].map((n, i) => (
              <span key={n} style={{ ...s.navItem, ...(i === 0 ? s.navActive : {}) }}>{n}</span>
            ))}
          </nav>
        </div>
        <div style={s.headerRight}>
          <button style={s.ghostBtn}>↑ Share</button>
          <button style={s.ghostBtn}>⤴ Export</button>
          <div style={s.avatar}>Y</div>
        </div>
      </header>

      <div style={s.body}>
        {/* ── SIDEBAR ── */}
        <aside style={s.sidebar}>
          <button style={s.newBtn}>＋ New Visualization</button>
          <section style={s.sideSection}>
            <p style={s.sideLabel}>RECENT PROJECTS</p>
            <p style={s.sideEmpty}>No projects yet</p>
          </section>
          <section style={s.sideSection}>
            <p style={s.sideLabel}>TEMPLATES</p>
            <p style={s.sideEmpty}>Browse examples</p>
          </section>
          <div style={s.proCard}>
            <p style={s.proTitle}>Unlock <span style={{ color: "#6366f1" }}>DryRun Pro</span></p>
            <p style={s.proSub}>Unlimited projects, exports & more.</p>
            <button style={s.proBtn}>Upgrade Now</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={s.main}>
          {/* TOP ROW */}
          <div style={s.topRow}>
            {/* Editor */}
            <div style={{ ...s.card, flex: 1, minWidth: 0 }}>
              <div style={s.cardHeader}>
                <div style={{ display: "flex", gap: 8 }}>
                  <select style={s.select}><option>☕ Java</option><option>Python</option><option>JavaScript</option></select>
                  <select style={s.select}><option>Example Programs</option></select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.resetBtn}>↺ Reset</button>
                  <button style={s.vizBtn}>▶ Visualize</button>
                </div>
              </div>
              <div style={s.editorBody}>
                <Editor
                  height="100%"
                  defaultLanguage="java"
                  value={code}
                  theme="light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 16 }
                  }}
                />
              </div>
            </div>

            {/* Right column */}
            <div style={s.rightCol}>
              {/* AI Teacher */}
              <div style={{ ...s.card, flex: 1, overflow: "auto", minHeight: 0 }}>
                <div style={s.panelHead}>
                  <span style={s.panelTitle}>🧪 AI Teacher</span>
                  <span style={s.betaBadge}>Beta</span>
                </div>
                <div style={s.teacherBody}>
                  <div>
                    <p style={s.miniLabel}>CURRENT LINE</p>
                    <code style={s.codeChip}>sum += i;</code>
                  </div>
                  <div>
                    <p style={s.miniLabel}>EXPLANATION</p>
                    <p style={s.explainText}>
                      The current value of <code style={s.inline}>i</code> is added to{" "}
                      <code style={s.inline}>sum</code> and stored back in <code style={s.inline}>sum</code>.
                    </p>
                    <div style={s.beforeAfter}>
                      <div style={s.baRow}>
                        <span style={s.baLabel}>Before</span>
                        <code style={s.baMono}>sum = 3, i = 4</code>
                      </div>
                      <div style={{ ...s.baRow, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                        <span style={s.baLabel}>After</span>
                        <code style={{ ...s.baMono, color: "#6366f1", fontWeight: 700 }}>sum = 7, i = 4</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div style={{ ...s.card, flexShrink: 0 }}>
                <div style={s.panelHead}>
                  <span style={s.panelTitle}>🗄 Variables</span>
                </div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Name", "Value", "Type"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {VARS.map(v => (
                      <tr key={v.name}>
                        <td style={s.td}><code style={s.varName}>{v.name}</code></td>
                        <td style={s.td}>
                          <span style={{ ...s.valBadge, background: v.color + "14", color: v.color }}>{v.value}</span>
                        </td>
                        <td style={{ ...s.td, color: "#94a3b8", fontSize: 12 }}>{v.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* VISUALIZATION */}
          <div style={s.card}>
            <div style={s.panelHead}>
              <span style={s.panelTitle}>🖥 Visualization</span>
              <button style={s.iconBtn} title="Fullscreen">⛶</button>
            </div>
            <div style={s.vizRow}>
              {VARS.map(v => (
                <div key={v.name} style={{ ...s.vizBox, borderColor: v.color + "33" }}>
                  <span style={{ ...s.vizVarName, color: v.color }}>{v.name}</span>
                  <span style={{ ...s.vizValue, color: v.color }}>{v.value}</span>
                  <span style={s.vizType}>{VARS.find(x => x.name === v.name)?.type}</span>
                </div>
              ))}
              <div style={s.console}>
                <div style={s.consoleBar}>
                  <span style={s.consoleBarText}>Console Output</span>
                </div>
                <div style={s.consoleBody}>
                  <code style={s.consoleOutput}>Sum = 15</code>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div style={s.card}>
            <div style={{ ...s.panelHead, marginBottom: 24 }}>
              <span style={s.panelTitle}>⏱ Execution Timeline</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button style={s.navBtn} onClick={() => setActiveStep(v => Math.max(1, v - 1))}>‹ Previous</button>
                <div style={s.track}>
                  <div style={{ ...s.trackFill, width: progressPct + "%" }} />
                  <div style={{ ...s.trackThumb, left: progressPct + "%" }} />
                </div>
                <button style={s.navBtn} onClick={() => setActiveStep(v => Math.min(STEPS.length, v + 1))}>Next ›</button>
              </div>
            </div>

            <div style={s.stepsRow}>
              <div style={s.stepLine} />
              {STEPS.map(item => {
                const done = item.step < activeStep;
                const cur  = item.step === activeStep;
                return (
                  <div key={item.step} style={s.stepItem} onClick={() => setActiveStep(item.step)}>
                    <div style={{
                      ...s.stepDot,
                      background:   cur  ? "#6366f1" : done ? "#e0e7ff" : "#f8fafc",
                      borderColor:  cur || done ? "#6366f1" : "#e2e8f0",
                      color:        cur  ? "#fff"    : done ? "#6366f1" : "#94a3b8",
                      transform:    cur  ? "scale(1.15)" : "scale(1)",
                      boxShadow:    cur  ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
                    }}>
                      {item.step}
                    </div>
                    <p style={{ ...s.stepLabel, color: cur ? "#6366f1" : "#475569" }}>{item.label}</p>
                    <p style={s.stepSub}>{item.sub}</p>
                  </div>
                );
              })}
            </div>
            <p style={s.hint}>Click any step or use Previous / Next to navigate</p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── STYLES ── */
const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
    background: "#f8fafc", color: "#1e293b",
    fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden",
  },

  // header
  header: {
    height: 56, background: "#fff", borderBottom: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", flexShrink: 0, zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 40, height: "100%" },
  logo: { fontSize: 18, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.5px" },
  logoBrace: { color: "#6366f1", fontFamily: "monospace", marginRight: 4 },
  nav: { display: "flex", gap: 28, height: "100%", alignItems: "center" },
  navItem: { fontSize: 14, fontWeight: 500, color: "#94a3b8", cursor: "pointer", height: "100%", display: "flex", alignItems: "center", borderBottom: "2px solid transparent", paddingTop: 2 },
  navActive: { color: "#6366f1", borderBottomColor: "#6366f1" },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  ghostBtn: { background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#64748b", cursor: "pointer", fontWeight: 500 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, marginLeft: 8 },

  // body
  body: { display: "flex", flex: 1, overflow: "hidden" },

  // sidebar
  sidebar: {
    width: 220, background: "#fff", borderRight: "1px solid #e2e8f0",
    display: "flex", flexDirection: "column", padding: 16, flexShrink: 0, overflowY: "auto",
  },
  newBtn: {
    background: "#6366f1", color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 0", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 24,
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  sideSection: { marginBottom: 24 },
  sideLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 },
  sideEmpty: { fontSize: 12, color: "#cbd5e1", fontStyle: "italic" },
  proCard: { marginTop: "auto", background: "linear-gradient(135deg,#f5f3ff,#fdf4ff)", border: "1px solid #e9d5ff", borderRadius: 12, padding: 16, textAlign: "center" },
  proTitle: { fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 },
  proSub: { fontSize: 11, color: "#94a3b8", marginBottom: 12 },
  proBtn: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#6366f1", cursor: "pointer", width: "100%" },

  // main
  main: { flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: 20, overflowY: "auto" },
  topRow: { display: "flex", gap: 16, height: 340, flexShrink: 0 },

  // card
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  cardHeader: { height: 52, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, background: "#fff" },
  editorBody: { flex: 1, overflow: "hidden", background: "#fff", minHeight: 0 },

  // editor controls
  select: { height: 34, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 8, padding: "0 10px", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", outline: "none" },
  resetBtn: { height: 34, padding: "0 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" },
  vizBtn: { height: 34, padding: "0 18px", border: "none", borderRadius: 8, background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.35)" },

  // right col
  rightCol: { width: 300, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 0", flexShrink: 0 },
  panelTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b" },
  betaBadge: { fontSize: 10, fontWeight: 700, background: "#ede9fe", color: "#6366f1", padding: "3px 8px", borderRadius: 20, letterSpacing: "0.05em" },
  iconBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: 0 },
  teacherBody: { padding: "12px 18px 16px", display: "flex", flexDirection: "column", gap: 14, flex: 1, overflowY: "auto" },
  miniLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 },
  codeChip: { display: "inline-block", background: "#ede9fe", color: "#4f46e5", borderRadius: 6, padding: "5px 10px", fontSize: 13, fontWeight: 600, fontFamily: "monospace" },
  explainText: { fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 },
  inline: { background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "1px 5px", fontSize: 12, fontFamily: "monospace" },
  beforeAfter: { background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9", padding: 12, marginTop: 8 },
  baRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 },
  baLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 600 },
  baMono: { fontFamily: "monospace", fontSize: 12, color: "#475569" },

  // variables table
  table: { width: "100%", borderCollapse: "collapse", padding: "0 18px 16px", margin: "12px 0 0" },
  th: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 18px 10px", textAlign: "left", borderBottom: "1px solid #f1f5f9" },
  td: { padding: "10px 18px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f8fafc" },
  varName: { fontFamily: "monospace", fontWeight: 600, color: "#334155" },
  valBadge: { display: "inline-block", borderRadius: 6, padding: "3px 10px", fontFamily: "monospace", fontWeight: 700, fontSize: 14 },

  // visualization
  vizRow: { display: "flex", alignItems: "center", gap: 20, padding: "20px 24px 24px", justifyContent: "center" },
  vizBox: { width: 160, height: 120, border: "1.5px solid", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "14px 12px", background: "#fff", boxSizing: "border-box" },
  vizVarName: { fontSize: 12, fontWeight: 700, alignSelf: "flex-start" },
  vizValue: { fontSize: 52, fontWeight: 300, lineHeight: 1, letterSpacing: "-2px" },
  vizType: { fontSize: 10, color: "#cbd5e1", fontFamily: "monospace", alignSelf: "flex-end" },
  console: { width: 280, height: 120, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", marginLeft: 12 },
  consoleBar: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "8px 14px", flexShrink: 0 },
  consoleBarText: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  consoleBody: { flex: 1, padding: 14, background: "#fff" },
  consoleOutput: { fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: "#10b981" },

  // timeline
  track: { width: 200, height: 6, background: "#f1f5f9", borderRadius: 99, position: "relative", overflow: "visible" },
  trackFill: { height: "100%", background: "#6366f1", borderRadius: 99, position: "absolute", left: 0, top: 0, transition: "width 0.3s" },
  trackThumb: { width: 18, height: 18, background: "#6366f1", border: "3px solid #fff", borderRadius: "50%", position: "absolute", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)", transition: "left 0.3s" },
  navBtn: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" },

  stepsRow: { display: "flex", justifyContent: "space-between", padding: "0 8px", position: "relative", marginTop: 4 },
  stepLine: { position: "absolute", left: 32, right: 32, top: 18, height: 2, background: "#f1f5f9", zIndex: 0 },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, cursor: "pointer", position: "relative", zIndex: 1 },
  stepDot: { width: 36, height: 36, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 10, transition: "all 0.25s", flexShrink: 0 },
  stepLabel: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 3, lineHeight: 1.3 },
  stepSub: { fontSize: 10, color: "#94a3b8", fontFamily: "monospace", textAlign: "center" },
  hint: { textAlign: "center", fontSize: 12, color: "#cbd5e1", marginTop: 16, marginBottom: 4 },
};
