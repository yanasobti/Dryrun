import React from 'react';

/**
 * GlassCubeWidget
 * Renders a 3D glass cube with gradient fills and specular highlights
 */
export const GlassCubeWidget: React.FC = () => {
  return (
    <svg className="w-18 h-18 filter drop-shadow-2xl" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Cube faces */}
      <polygon points="50,15 85,32 50,50 15,32" fill="url(#cubeTop)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.75" />
      <polygon points="15,32 50,50 50,85 15,67" fill="url(#cubeLeft)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" />
      <polygon points="50,50 85,32 85,67 50,85" fill="url(#cubeRight)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" />
      
      {/* Center profile segment */}
      <line x1="50" y1="50" x2="50" y2="85" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </svg>
  );
};

/**
 * GlassTorusWidget
 * Renders a 3D glass torus with radial gradient
 */
export const GlassTorusWidget: React.FC = () => {
  return (
    <svg className="w-20 h-20 filter drop-shadow-xl" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="torusGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="45%" stopColor="#e0e7ff" stopOpacity="0.35" />
          <stop offset="85%" stopColor="#c7d2fe" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <path 
        d="M 50,10 A 40,40 0 1,0 50,90 A 40,40 0 1,0 50,10 Z M 50,30 A 20,20 0 1,1 50,70 A 20,20 0 1,1 50,30 Z" 
        fill="url(#torusGrad)" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1" 
      />
      {/* Specular highlighting arc */}
      <path 
        d="M 22,33 A 30,30 0 0,1 78,33" 
        fill="none" 
        stroke="rgba(255,255,255,0.7)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * GlassSphereWidget
 * Renders a 3D glass sphere with radial gradient and specular highlight
 */
export const GlassSphereWidget: React.FC = () => {
  return (
    <svg className="w-18 h-18 filter drop-shadow-2xl" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#eef2ff" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#ddd6fe" stopOpacity="0.2" />
          <stop offset="98%" stopColor="#c084fc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#sphereGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.75" />
      <ellipse cx="38" cy="30" rx="9" ry="4.5" fill="#ffffff" opacity="0.55" transform="rotate(-28, 38, 30)" />
    </svg>
  );
};

/**
 * VectorSwirlWidget
 * Renders flowing vector swirl paths with gradient opacity
 */
export const VectorSwirlWidget: React.FC<{ color?: string }> = ({ color = "#818cf8" }) => {
  return (
    <svg className="w-[600px] h-[300px] select-none pointer-events-none" viewBox="0 0 600 300" fill="none">
      <defs>
        <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path 
        d="M-50,120 C150,20 300,240 450,130 C520,70 600,160 680,180" 
        stroke="url(#swirlGrad)" 
        strokeWidth="1.5" 
      />
      <path 
        d="M-20,150 C160,50 270,220 420,150 C500,100 560,190 650,160" 
        stroke="url(#swirlGrad)" 
        strokeWidth="1" 
        opacity="0.8"
      />
      <path 
        d="M-80,90 C120,-10 330,270 480,110 C530,50 630,130 710,200" 
        stroke="url(#swirlGrad)" 
        strokeWidth="0.75" 
        opacity="0.6"
      />
    </svg>
  );
};
