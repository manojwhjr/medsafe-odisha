import React, { useEffect, useRef } from 'react'

export default function DashboardBackground() {
  const cursorGlowRef = useRef(null)

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      let rafId = null
      const handleMouseMove = (e) => {
        if (!cursorGlowRef.current) return
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          if (cursorGlowRef.current) {
            cursorGlowRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`
            cursorGlowRef.current.style.opacity = '1'
          }
        })
      }

      const handleMouseLeave = () => {
        if (cursorGlowRef.current) {
          cursorGlowRef.current.style.opacity = '0'
        }
      }

      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        if (rafId) cancelAnimationFrame(rafId)
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 0. Subtle Mouse-Following Blue Radial Glow on Desktop */}
      <div 
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none transition-opacity duration-500 opacity-0 -z-10 hidden md:block"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 102, 255, 0.09) 0%, rgba(0, 212, 255, 0.04) 45%, transparent 70%)',
          willChange: 'transform'
        }}
      />

      {/* 1. Base Soft Icy-Blue Gradient (#F8FBFF → #EFF6FF) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #F1F7FE 45%, #EFF6FF 100%)'
        }}
      />

      {/* 2. Top Subtle Blue Ambient Glow Near the Top of the Dashboard */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] bg-gradient-to-b from-[#0066FF]/12 via-[#008CFF]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-8 w-[450px] h-[260px] bg-gradient-to-br from-[#00D4FF]/10 via-[#0066FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-8 w-[450px] h-[260px] bg-gradient-to-bl from-[#008CFF]/10 via-[#00D4FF]/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 3. Soft Blue Radial Glows Behind the Dashboard Cards */}
      <div className="absolute top-[22%] left-[12%] -translate-x-1/2 w-[550px] h-[400px] bg-gradient-to-tr from-[#0066FF]/8 via-[#008CFF]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[30%] right-[8%] w-[600px] h-[450px] bg-gradient-to-bl from-[#00D4FF]/9 via-[#008CFF]/7 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[58%] left-[18%] w-[650px] h-[450px] bg-gradient-to-tr from-[#0066FF]/7 via-[#00D4FF]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-[14%] w-[550px] h-[380px] bg-gradient-to-tl from-[#008CFF]/8 via-[#00D4FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 4. Very Subtle Electric-Blue Grid using #0066FF at 5-8% opacity */}
      <div className="absolute inset-0 dashboard-medical-grid" />

      {/* 5. Glowing Cyan Interconnected Nodes at Grid Intersections with Very Slow, Gentle Pulsing */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="dashGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Constellation Guideline Segments connecting key intersections */}
        <line x1="96" y1="144" x2="192" y2="240" stroke="#00D4FF" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="192" y1="240" x2="96" y2="384" stroke="#0066FF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="1344" y1="144" x2="1248" y2="240" stroke="#00D4FF" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="1248" y1="240" x2="1344" y2="384" stroke="#0066FF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="96" y1="672" x2="192" y2="768" stroke="#00D4FF" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="1344" y1="672" x2="1248" y2="768" stroke="#008CFF" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="4 4" />

        {/* Small Glowing Cyan Nodes at Grid Coordinates (48px spacing intersections) */}
        {/* Top-Left Nodes */}
        <g className="dashboard-node-pulse">
          <circle cx="96" cy="144" r="3.5" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="96" cy="144" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse-delayed-1">
          <circle cx="192" cy="240" r="3.5" fill="#008CFF" filter="url(#dashGlow)" />
          <circle cx="192" cy="240" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse-delayed-2">
          <circle cx="96" cy="384" r="3" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="96" cy="384" r="1" fill="#FFFFFF" />
        </g>

        {/* Top-Right Nodes */}
        <g className="dashboard-node-pulse-delayed-1">
          <circle cx="1344" cy="144" r="3.5" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="1344" cy="144" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse">
          <circle cx="1248" cy="240" r="3.5" fill="#008CFF" filter="url(#dashGlow)" />
          <circle cx="1248" cy="240" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse-delayed-3">
          <circle cx="1344" cy="384" r="3" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="1344" cy="384" r="1" fill="#FFFFFF" />
        </g>

        {/* Mid-Flank Nodes */}
        <g className="dashboard-node-pulse-delayed-2">
          <circle cx="96" cy="672" r="3.5" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="96" cy="672" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse-delayed-3">
          <circle cx="192" cy="768" r="3" fill="#008CFF" filter="url(#dashGlow)" />
        </g>
        <g className="dashboard-node-pulse">
          <circle cx="1344" cy="672" r="3.5" fill="#00D4FF" filter="url(#dashGlow)" />
          <circle cx="1344" cy="672" r="1.5" fill="#FFFFFF" />
        </g>
        <g className="dashboard-node-pulse-delayed-1">
          <circle cx="1248" cy="768" r="3" fill="#008CFF" filter="url(#dashGlow)" />
        </g>

        {/* Lower Canvas Intersections */}
        <g className="dashboard-node-pulse-delayed-2">
          <circle cx="144" cy="1056" r="3" fill="#00D4FF" filter="url(#dashGlow)" />
        </g>
        <g className="dashboard-node-pulse-delayed-3">
          <circle cx="1296" cy="1056" r="3" fill="#00D4FF" filter="url(#dashGlow)" />
        </g>
      </svg>
    </div>
  )
}
