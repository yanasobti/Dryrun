import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroParallax } from '../components/ui/hero-parallax';

const parallaxFeatures = [
  { title: "Visualize Recursion", description: "Watch functions call themselves in a beautifully animated stack.", color: "bg-indigo-50 text-indigo-600", icon: "↬" },
  { title: "Track Variables Live", description: "See every variable update precisely at the moment it changes.", color: "bg-emerald-50 text-emerald-600", icon: "{}" },
  { title: "Call Stack UI", description: "Never get lost in nested functions. See exactly where you are.", color: "bg-fuchsia-50 text-fuchsia-600", icon: "☰" },
  { title: "AI Explanations", description: "Don't understand a line? Let our AI explain it in plain English.", color: "bg-amber-50 text-amber-600", icon: "✦" },
  { title: "Step Controls", description: "Play, pause, rewind, and fast-forward through your code execution.", color: "bg-blue-50 text-blue-600", icon: "⏯" },
  { title: "Algorithm Breakdown", description: "Master complex algorithms with visual step-by-step guidance.", color: "bg-rose-50 text-rose-600", icon: "▤" },
  { title: "Data Structures", description: "See arrays, trees, and graphs mutate in real-time.", color: "bg-purple-50 text-purple-600", icon: "⑆" },
  { title: "Line-by-line Trace", description: "Follow the execution pointer across loops and conditionals.", color: "bg-cyan-50 text-cyan-600", icon: "→" },
  { title: "Share Snippets", description: "Save your visual execution and share the link with anyone.", color: "bg-lime-50 text-lime-600", icon: "↗" },
  { title: "No Installation", description: "Run complex setups directly in your browser instantly.", color: "bg-orange-50 text-orange-600", icon: "⚡" },
  { title: "Export Logs", description: "Download the complete state history of your execution.", color: "bg-teal-50 text-teal-600", icon: "↓" },
  { title: "Multi-Language", description: "Support for JavaScript, Java, Python, and C++ out of the box.", color: "bg-sky-50 text-sky-600", icon: "A" },
  { title: "Error Catching", description: "Visualize exceptions and exactly how the stack unwinds.", color: "bg-red-50 text-red-600", icon: "⚠" },
  { title: "Memory Layout", description: "See pointers, references, and heap allocations simplified.", color: "bg-violet-50 text-violet-600", icon: "▦" },
  { title: "Custom Themes", description: "Code in style with beautiful, editor-inspired color palettes.", color: "bg-pink-50 text-pink-600", icon: "◎" }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl font-mono text-indigo-600">{"{/}"}</span> DryRun
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Docs</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#" className="hover:text-slate-900 transition-colors">About</a>
        </nav>
        <button 
          onClick={() => navigate('/workspace')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-indigo-200 flex items-center gap-2"
        >
          Go to Workspace <span className="text-lg leading-none">→</span>
        </button>
      </header>

      {/* Hero Parallax Full-Width Section as the Main Hero */}
      <div className="w-full">
        <HeroParallax features={parallaxFeatures} />
      </div>

      <main className="pt-10 pb-20 px-8 md:px-16 max-w-7xl mx-auto overflow-hidden">

        {/* How It Works Section */}
        <div className="text-center mb-32">
           <h3 className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-3">How DryRun Works</h3>
           <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-16">Visualize. Understand. Master.</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 -z-10"></div>
               {[
                 { n: 1, title: 'Write or Paste Code', desc: 'Write your code in any supported language.', colorClasses: 'bg-indigo-50 text-indigo-500', icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
                 { n: 2, title: 'Run & Visualize', desc: 'Watch your code execute step-by-step.', colorClasses: 'bg-blue-50 text-blue-500', icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                 { n: 3, title: 'Get AI Explanations', desc: "Understand what's happening with AI-powered insights.", colorClasses: 'bg-fuchsia-50 text-fuchsia-500', icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                 { n: 4, title: 'Master Concepts', desc: 'Learn deeply and build real confidence.', colorClasses: 'bg-emerald-50 text-emerald-500', icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
               ].map(step => (
                  <div key={step.n} className="flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative z-10 hover:shadow-md transition-shadow">
                     <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-md">{step.n}</div>
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${step.colorClasses}`}>
                        {step.icon}
                     </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed px-2">{step.desc}</p>
                 </div>
              ))}
           </div>
         </div>

         {/* Animation Mockup (How code is visualized) */}
         <div className="relative w-full max-w-5xl mx-auto min-w-0 mt-32 mb-32">
            <div className="text-center mb-16">
               <h3 className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-3">Live Execution</h3>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">See Code Come To Life</h2>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-[40px] transform rotate-2 scale-105 opacity-50"></div>
            <div className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 md:p-10 z-10 w-full flex flex-col gap-8">
              
               {/* Graphic Header */}
               <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold border border-orange-100">
                     <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                     Java ▾
                  </div>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500">Step 4 of 6</span>
                    <div className="flex gap-1">
                       <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer">‹</div>
                       <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer bg-slate-50 shadow-sm">›</div>
                    </div>
                 </div>
              </div>
              
              {/* Code & Visuals */}
              <div className="flex flex-col md:flex-row gap-8">
                 {/* Code Editor Mock */}
                 <div className="flex-[1.2] font-mono text-[14px] leading-9 text-slate-600 relative overflow-hidden pb-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                    <div className="absolute left-0 top-[108px] h-[36px] w-full bg-indigo-100/50 -z-10 rounded-r-lg border-l-4 border-indigo-500"></div>
                    <div className="flex"><span className="w-8 text-slate-300 select-none">1</span><span className="text-purple-600 font-bold">let</span>&nbsp;<span className="ml-2 text-blue-500">sum</span>&nbsp;=&nbsp;0;</div>
                    <div className="flex mt-2"><span className="w-8 text-slate-300 select-none">2</span><span className="text-purple-600 font-bold">for</span>&nbsp;(let i = 1; i &lt;= 3; i++) {"{"}</div>
                    <div className="flex items-center mt-2"><span className="w-8 text-indigo-500 font-bold select-none text-xs">→ 3</span><span className="ml-4 font-bold text-indigo-700 whitespace-nowrap">sum += i;</span></div>
                    <div className="flex mt-2"><span className="w-8 text-slate-300 select-none">4</span>{"}"}</div>
                    <div className="flex mt-4"><span className="w-8 text-slate-300 select-none">5</span><span className="text-slate-700 font-bold">console</span>.<span className="text-blue-500">log</span>(sum);</div>
                 </div>
                 
                 {/* AI Info & Math visual */}
                 <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100 shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          <div className="font-mono text-[14px] font-bold text-slate-800">sum += i;</div>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">Adding the current loop counter <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-slate-200">i</code> (3) to our running total <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-slate-200">sum</code> (3).</p>
                    </div>
                    
                    <div className="flex-1 border border-slate-100 rounded-xl flex items-center justify-center p-6 bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                       <div className="flex flex-col items-center">
                          <div className="flex items-center gap-6">
                             <div className="text-center bg-white border border-slate-200 rounded-xl p-3 w-[72px] shadow-sm transform -rotate-2">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">sum</div>
                                <div className="text-3xl font-black text-slate-800">3</div>
                             </div>
                             <div className="text-2xl text-slate-300 font-bold">+</div>
                             <div className="text-center bg-white border border-slate-200 rounded-xl p-3 w-[72px] shadow-sm transform rotate-2">
                                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">i</div>
                                <div className="text-3xl font-black text-emerald-600">3</div>
                             </div>
                          </div>
                          <div className="text-slate-300 my-4 text-2xl animate-bounce">↓</div>
                          <div className="text-5xl font-black text-indigo-600 drop-shadow-sm">6</div>
                       </div>
                    </div>
                 </div>
              </div>
              
               {/* Timeline Mock */}
               <div className="flex items-center gap-6 mt-4 pt-6 border-t border-slate-100 overflow-x-auto pb-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer">
                     <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                 <div className="flex-1 flex justify-between relative px-2 min-w-[500px]">
                    <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-100 -z-10"></div>
                    <div className="absolute top-4 left-6 w-[60%] h-[3px] bg-indigo-500 -z-10 rounded-full"></div>
                    {[
                      { step: 1, label: 'Initialize' },
                      { step: 2, label: 'i = 1' },
                      { step: 3, label: 'sum = 1' },
                      { step: 4, label: 'sum = 3', active: true },
                      { step: 5, label: 'sum = 6' },
                      { step: 6, label: 'Output' },
                    ].map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-3 z-10 bg-white px-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${s.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-125' : (s.step < 4 ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-white border-2 border-slate-200 text-slate-400')}`}>{s.step}</div>
                         <div className={`text-xs font-bold ${s.active ? 'text-indigo-600' : 'text-slate-400'}`}>{s.label}</div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
         </div>
      </main>


      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 px-8 md:px-16 mt-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800">
               <span className="text-2xl font-mono text-indigo-600">{"{/}"}</span> DryRun
            </div>
            
            <nav className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-semibold text-slate-500">
               <a href="#" className="hover:text-slate-800">Features</a>
               <a href="#" className="hover:text-slate-800">How It Works</a>
               <a href="#" className="hover:text-slate-800">Docs</a>
               <a href="#" className="hover:text-slate-800">Pricing</a>
               <a href="#" className="hover:text-slate-800">About</a>
            </nav>
         </div>
      </footer>
    </div>
  );
};
