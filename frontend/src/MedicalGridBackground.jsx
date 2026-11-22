import React from 'react'

export default function MedicalGridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 1. Base Radiant Electric-Blue Vignette Gradient with smooth bottom fade */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% 36%, #FFFFFF 12%, #E4F2FE 40%, #B2DCFD 65%, #4B9EF7 85%, #0066FF 100%)',
          opacity: 0.92,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.18) 80%, transparent 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.18) 80%, transparent 90%, transparent 100%)'
        }}
      />

      {/* 2. Soft Ambient Radial Glows (Electric Blue & Cyan bloom) - Positioned so they dissolve completely before the bottom edge */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-gradient-to-br from-[#0066FF]/35 via-[#008CFF]/25 to-transparent rounded-full blur-[90px] electric-ambient-glow-1" />
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#00D4FF]/30 via-[#008CFF]/28 to-transparent rounded-full blur-[90px] electric-ambient-glow-2" />
      <div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[720px] sm:w-[920px] h-[200px] rounded-full blur-[65px] electric-ambient-glow-3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(0, 140, 255, 0.32) 0%, rgba(0, 212, 255, 0.16) 45%, transparent 75%)'
        }}
      />

      {/* 3. Wall Background Grid Overlay (Micro-grid & Electric Lines) with smooth bottom dissolve */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.5) 68%, transparent 84%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.5) 68%, transparent 84%, transparent 100%)'
        }}
      >
        <div className="absolute inset-0 electric-micro-grid opacity-75" />
        <div className="absolute inset-0 electric-medical-grid opacity-85" />
      </div>

      {/* 4. Sweeping Curved Luminous Neon Light Waves (Curved and smoothly dissolved before bottom) */}
      <div 
        className="absolute inset-x-0 bottom-0 h-64 sm:h-72 overflow-hidden pointer-events-none z-0"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.12) 75%, transparent 86%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.12) 75%, transparent 86%, transparent 100%)'
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="swooshGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0" />
              <stop offset="25%" stopColor="#0066FF" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#00D4FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="swooshGradRight" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0" />
              <stop offset="25%" stopColor="#0066FF" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#00D4FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left sweeping volumetric light swoosh */}
          <g className="animate-swoosh-left">
            <path
              d="M-40 260 C 180 230, 360 165, 560 205 C 440 245, 220 265, -40 260 Z"
              fill="url(#swooshGradLeft)"
              filter="url(#neonBlur)"
            />
            <path
              d="M-30 250 C 190 220, 370 155, 580 200"
              stroke="#00D4FF"
              strokeWidth="2.5"
              strokeOpacity="0.85"
            />
          </g>

          {/* Right sweeping volumetric light swoosh */}
          <g className="animate-swoosh-right">
            <path
              d="M 1480 260 C 1260 220, 1080 155, 880 200 C 1000 240, 1220 265, 1480 260 Z"
              fill="url(#swooshGradRight)"
              filter="url(#neonBlur)"
            />
            <path
              d="M 1470 250 C 1250 210, 1070 145, 860 195"
              stroke="#00D4FF"
              strokeWidth="2.5"
              strokeOpacity="0.85"
            />
          </g>
        </svg>
      </div>

      {/* 5. 3D Perspective Grid Plane Across the Bottom (Dissolves into transparent space before reaching bottom edge) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-72 sm:h-80 overflow-hidden perspective-grid-container pointer-events-none opacity-90"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 70%, transparent 84%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 70%, transparent 84%, transparent 100%)'
        }}
      >
        <div className="w-full h-full perspective-grid-plane" />
      </div>

      {/* Diffused Horizon Ambient Glow (No hard horizontal lines) */}
      <div 
        className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[750px] h-[70px] pointer-events-none opacity-60 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.45) 0%, rgba(0, 140, 255, 0.2) 50%, transparent 75%)'
        }}
      />

      {/* 6. Neural Constellation Network & Glowing Circuit Pulses */}
      <svg
        className="absolute inset-0 w-full h-full opacity-95 pointer-events-none"
        viewBox="0 0 1440 680"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.4) 80%, transparent 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.4) 80%, transparent 90%, transparent 100%)'
        }}
      >
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="pulseCyanH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0" />
            <stop offset="30%" stopColor="#008CFF" stopOpacity="1" />
            <stop offset="70%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="pulseCyanV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
            <stop offset="30%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#008CFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* --- Left Flank Constellation Connections --- */}
        <line x1="80" y1="110" x2="180" y2="170" stroke="#00D4FF" strokeOpacity="0.4" strokeWidth="1.25" />
        <line x1="80" y1="110" x2="60" y2="300" stroke="#008CFF" strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="60" y1="300" x2="180" y2="350" stroke="#00D4FF" strokeOpacity="0.4" strokeWidth="1.25" />
        <line x1="60" y1="300" x2="80" y2="490" stroke="#008CFF" strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="80" y1="490" x2="220" y2="520" stroke="#00D4FF" strokeOpacity="0.45" strokeWidth="1.25" />
        
        {/* Left Circuit Tracks with Fast Traveling Pulses */}
        <path d="M 60 300 H 340" stroke="url(#pulseCyanH)" strokeWidth="2.5" className="electric-beam-h1" />
        <path d="M 180 120 V 400" stroke="url(#pulseCyanV)" strokeWidth="2.5" className="electric-beam-v1" />

        {/* --- Right Flank Constellation Connections --- */}
        <line x1="1360" y1="110" x2="1260" y2="170" stroke="#00D4FF" strokeOpacity="0.4" strokeWidth="1.25" />
        <line x1="1360" y1="110" x2="1380" y2="300" stroke="#008CFF" strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="1380" y1="300" x2="1260" y2="350" stroke="#00D4FF" strokeOpacity="0.4" strokeWidth="1.25" />
        <line x1="1380" y1="300" x2="1360" y2="490" stroke="#008CFF" strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="1360" y1="490" x2="1220" y2="520" stroke="#00D4FF" strokeOpacity="0.45" strokeWidth="1.25" />

        {/* Right Circuit Tracks with Fast Traveling Pulses */}
        <path d="M 1100 300 H 1380" stroke="url(#pulseCyanH)" strokeWidth="2.5" className="electric-beam-h2" />
        <path d="M 1260 120 V 440" stroke="url(#pulseCyanV)" strokeWidth="2.5" className="electric-beam-v2" />

        {/* Constellation Nodes on Left */}
        <circle cx="180" cy="170" r="4.5" fill="#00D4FF" className="electric-node-pulse" />
        <circle cx="180" cy="350" r="5" fill="#FFFFFF" className="electric-node-pulse-fast" />
        <circle cx="220" cy="520" r="4.5" fill="#00D4FF" className="electric-node-pulse-slow" />
        <circle cx="280" cy="240" r="3.5" fill="#008CFF" className="electric-node-pulse" />

        {/* Constellation Nodes on Right */}
        <circle cx="1260" cy="170" r="4.5" fill="#00D4FF" className="electric-node-pulse" />
        <circle cx="1260" cy="350" r="5" fill="#FFFFFF" className="electric-node-pulse-fast" />
        <circle cx="1220" cy="520" r="4.5" fill="#00D4FF" className="electric-node-pulse-slow" />
        <circle cx="1160" cy="240" r="3.5" fill="#008CFF" className="electric-node-pulse" />

        {/* --- Starburst Twinkle Flares at Perspective Grid Intersections (Matches Image ✦) --- */}
        {/* Star Flare 1 */}
        <g transform="translate(480, 540)" className="animate-star-flare-1">
          <path d="M0 -12 Q0 0 12 0 Q0 0 0 12 Q0 0 -12 0 Q0 0 0 -12 Z" fill="#FFFFFF" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="2.5" fill="#00D4FF" />
        </g>

        {/* Star Flare 2 */}
        <g transform="translate(960, 540)" className="animate-star-flare-2">
          <path d="M0 -14 Q0 0 14 0 Q0 0 0 14 Q0 0 -14 0 Q0 0 0 -14 Z" fill="#FFFFFF" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="3" fill="#00D4FF" />
        </g>

        {/* Star Flare 3 */}
        <g transform="translate(720, 580)" className="animate-star-flare-3">
          <path d="M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z" fill="#FFFFFF" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
        </g>

        {/* Star Flare 4 */}
        <g transform="translate(240, 600)" className="animate-star-flare-4">
          <path d="M0 -11 Q0 0 11 0 Q0 0 0 11 Q0 0 -11 0 Q0 0 0 -11 Z" fill="#FFFFFF" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="2.5" fill="#00D4FF" />
        </g>

        {/* Star Flare 5 */}
        <g transform="translate(1200, 600)" className="animate-star-flare-1">
          <path d="M0 -11 Q0 0 11 0 Q0 0 0 11 Q0 0 -11 0 Q0 0 0 -11 Z" fill="#FFFFFF" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="2.5" fill="#00D4FF" />
        </g>
      </svg>

      {/* 7. Floating Glowing Particles & Digital Nanobots */}
      <div className="absolute top-[20%] left-[16%] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#00D4FF] animate-particle-1" />
      <div className="absolute top-[38%] right-[18%] w-3 h-3 rounded-full bg-[#00D4FF] shadow-[0_0_14px_#00D4FF] animate-particle-2" />
      <div className="absolute top-[68%] left-[28%] w-2 h-2 rounded-full bg-[#008CFF] shadow-[0_0_8px_#008CFF] animate-particle-3" />
      <div className="absolute top-[58%] right-[24%] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#00D4FF] animate-particle-1" />

      {/* 8. Six Glowing Translucent Circular Medical Badges (Matches Image Layout & Styling Exactly) */}
      
      {/* --- LEFT FLANK BADGES --- */}

      {/* Badge 1: Medicine Capsule (Top-Left) */}
      <div className="absolute top-[12%] left-[2%] sm:left-[3%] lg:left-[4%] pointer-events-none animate-float-badge-1 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Pill Capsule */}
            <path d="M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7z" />
            <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Badge 2: Medical Cross (Mid-Left) */}
      <div className="absolute top-[40%] left-[1.5%] sm:left-[2.5%] lg:left-[3.5%] pointer-events-none animate-float-badge-2 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="currentColor">
            {/* Medical Cross */}
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
          </svg>
        </div>
      </div>

      {/* Badge 3: Heartbeat ECG Heart (Bottom-Left) */}
      <div className="absolute top-[68%] left-[2%] sm:left-[3%] lg:left-[4%] pointer-events-none animate-float-badge-3 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Heart with Pulse */}
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" stroke="#FFFFFF" strokeWidth="1.8" />
            <path d="M7 13h2.5l1.5 -3l2 6l1.5 -3h2.5" stroke="#00D4FF" strokeWidth="2.2" />
          </svg>
        </div>
      </div>

      {/* --- RIGHT FLANK BADGES --- */}

      {/* Badge 4: DNA Double Helix (Top-Right) */}
      <div className="absolute top-[12%] right-[2%] sm:right-[3%] lg:right-[4%] pointer-events-none animate-float-badge-4 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* DNA Helix */}
            <path d="M2 15c6.667-6 13.333 0 20-6" stroke="#00D4FF" strokeWidth="2.2" />
            <path d="M2 9c6.667 6 13.333 0 20 6" stroke="#FFFFFF" strokeWidth="2.2" />
            <line x1="8" y1="11" x2="8" y2="13" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="12" y1="11" x2="12" y2="13" stroke="#00D4FF" strokeWidth="2" />
            <line x1="16" y1="11" x2="16" y2="13" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Badge 5: Laboratory Flask (Mid-Right) */}
      <div className="absolute top-[40%] right-[1.5%] sm:right-[2.5%] lg:right-[3.5%] pointer-events-none animate-float-badge-5 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Chemistry Flask */}
            <path d="M10 2v7.5L4.5 19a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9.5V2" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="8.5" y1="2" x2="15.5" y2="2" stroke="#00D4FF" strokeWidth="2.2" />
            <path d="M7 16h10" stroke="#00D4FF" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      </div>

      {/* Badge 6: Healthcare Shield with Cross (Bottom-Right) */}
      <div className="absolute top-[68%] right-[2%] sm:right-[3%] lg:right-[4%] pointer-events-none animate-float-badge-6 select-none">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-md border border-[#00D4FF]/70 shadow-[0_0_24px_rgba(0,212,255,0.45)] flex items-center justify-center glowing-medical-badge">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_6px_#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Shield with Inner Cross */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFFFFF" strokeWidth="2" fill="rgba(0, 212, 255, 0.15)" />
            <path d="M12 8v8m-4-4h8" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
