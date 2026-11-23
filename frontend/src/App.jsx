import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { mockPatients, niramayaFormulary } from './mockData'
import MedicalGridBackground from './MedicalGridBackground'
import DashboardBackground from './DashboardBackground'
import MedSafeChatbot from './MedSafeChatbot'
import FeedbackModal from './FeedbackModal'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

function AnimatedCounter({ end, duration = 1200, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.max(1, Math.floor(end / (duration / 20)))
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 20)
    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function App() {
  const [currentView, setCurrentView] = useState('home') // 'home' | 'analysis' | 'about'
  const [activeNavSection, setActiveNavSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('p1')
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('reconciliation')
  const [searchFormulary, setSearchFormulary] = useState('')
  const [auditNotification, setAuditNotification] = useState(null)
  const [navMenuOpen, setNavMenuOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const wasChatbotOpenRef = useRef(false)
  const [menuCoords, setMenuCoords] = useState({ top: 76, right: 24 })
  const navMenuBtnRef = useRef(null)
  const navDropdownRef = useRef(null)

  const updateMenuPosition = () => {
    if (navMenuBtnRef.current) {
      const rect = navMenuBtnRef.current.getBoundingClientRect()
      setMenuCoords({
        top: Math.round(rect.bottom + 8),
        right: Math.max(16, Math.round(window.innerWidth - rect.right)),
      })
    }
  }

  const handleToggleNavMenu = () => {
    setNavMenuOpen((prev) => {
      const willOpen = !prev
      if (willOpen) {
        if (isChatbotOpen) {
          wasChatbotOpenRef.current = true
          setIsChatbotOpen(false)
        }
        updateMenuPosition()
      } else {
        if (wasChatbotOpenRef.current) {
          setIsChatbotOpen(true)
          wasChatbotOpenRef.current = false
        }
      }
      return willOpen
    })
  }

  const closeNavMenu = (restore = true) => {
    setNavMenuOpen(false)
    if (restore && wasChatbotOpenRef.current) {
      setIsChatbotOpen(true)
      wasChatbotOpenRef.current = false
    }
  }

  const progressBarRef = useRef(null)
  const homeContainerRef = useRef(null)
  const dashboardContainerRef = useRef(null)
  const hasDashboardAnimatedRef = useRef(false)
  const [ctaMousePos, setCtaMousePos] = useState({ x: -1000, y: -1000, isHovered: false })

  // Medication state per patient
  const [patientsData, setPatientsData] = useState(() => {
    const initial = {}
    mockPatients.forEach((p) => {
      initial[p.id] = { ...p, medications: [...p.medications] }
    })
    return initial
  })

  // Quick add drug form
  const [newDrugName, setNewDrugName] = useState('')
  const [newDrugDose, setNewDrugDose] = useState('')
  const [newDrugFreq, setNewDrugFreq] = useState('Once daily')
  const [newDrugCategory, setNewDrugCategory] = useState('Cardiovascular')

  const currentPatient = patientsData[selectedPatientId] || mockPatients[0]
  const medCount = currentPatient.medications.length

  const handleAddMedication = (e) => {
    e.preventDefault()
    if (!newDrugName.trim()) return

    const newMed = {
      id: `custom-${Date.now()}`,
      name: newDrugName.trim(),
      dose: newDrugDose.trim() || 'Standard Dose',
      freq: newDrugFreq,
      category: newDrugCategory,
      niramayaStock: 'In Stock (PHC/CHC)',
      riskLevel: 'low',
    }

    setPatientsData((prev) => ({
      ...prev,
      [selectedPatientId]: {
        ...prev[selectedPatientId],
        medications: [newMed, ...prev[selectedPatientId].medications],
      },
    }))

    setNewDrugName('')
    setNewDrugDose('')
    showToast(`Added ${newMed.name} to patient regimen`)
  }

  const handleRemoveMedication = (medId, medName) => {
    setPatientsData((prev) => ({
      ...prev,
      [selectedPatientId]: {
        ...prev[selectedPatientId],
        medications: prev[selectedPatientId].medications.filter((m) => m.id !== medId),
      },
    }))
    showToast(`Deprescribed / Removed ${medName}`)
  }

  const showToast = (msg) => {
    setAuditNotification(msg)
    setTimeout(() => {
      setAuditNotification(null)
    }, 3500)
  }

  const polyStatus = useMemo(() => {
    if (medCount >= 8) {
      return {
        label: 'Hyper-Polypharmacy (≥8 Drugs)',
        badge: 'High Critical Risk',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-50 border-rose-200',
        dotColor: 'bg-rose-500',
      }
    }
    if (medCount >= 5) {
      return {
        label: 'Polypharmacy (≥5 Drugs)',
        badge: 'Elevated Risk',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        dotColor: 'bg-amber-500',
      }
    }
    if (medCount >= 3) {
      return {
        label: 'Moderate Regimen (3-4 Drugs)',
        badge: 'Moderate Monitoring',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        dotColor: 'bg-blue-500',
      }
    }
    return {
      label: 'Low Regimen (<3 Drugs)',
      badge: 'Standard Risk',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
      dotColor: 'bg-teal-500',
    }
  }, [medCount])

  const filteredFormulary = useMemo(() => {
    if (!searchFormulary.trim()) return niramayaFormulary
    const q = searchFormulary.toLowerCase()
    return niramayaFormulary.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    )
  }, [searchFormulary])

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    if (currentView !== 'home') {
      setCurrentView('home')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 80
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  // Scroll Progress Bar Update
  useEffect(() => {
    const handleScrollProgress = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0 && progressBarRef.current) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll))
        progressBarRef.current.style.transform = `scaleX(${progress})`
      }
    }

    window.addEventListener('scroll', handleScrollProgress, { passive: true })
    handleScrollProgress()
    return () => window.removeEventListener('scroll', handleScrollProgress)
  }, [currentView])

  // Keep navbar dropdown aligned with trigger on scroll/resize
  useEffect(() => {
    if (!navMenuOpen) return
    const handleReposition = () => updateMenuPosition()
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, { passive: true })
    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition)
    }
  }, [navMenuOpen])

  // Navbar Three-Dot Menu, Help Modal & Feedback Modal Click-Outside / Escape Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (feedbackModalOpen) {
          setFeedbackModalOpen(false)
        } else if (helpModalOpen) {
          setHelpModalOpen(false)
        } else if (navMenuOpen) {
          closeNavMenu(true)
        }
      }
    }

    const handleClickOutside = (e) => {
      const clickedBtn = navMenuBtnRef.current && navMenuBtnRef.current.contains(e.target)
      const clickedDropdown = navDropdownRef.current && navDropdownRef.current.contains(e.target)
      if (navMenuOpen && !clickedBtn && !clickedDropdown) {
        closeNavMenu(true)
      }
    }

    if (navMenuOpen || helpModalOpen || feedbackModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [navMenuOpen, helpModalOpen, feedbackModalOpen])

  // GSAP ScrollTrigger Animations for Homepage
  useEffect(() => {
    if (currentView !== 'home') return

    const mm = gsap.matchMedia()

    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Initial Hero Section Entrance Animation
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        
        heroTl
          .fromTo('.hero-badge', 
            { opacity: 0, y: 25 }, 
            { opacity: 1, y: 0, duration: 0.6 }
          )
          .fromTo('.hero-heading', 
            { opacity: 0, y: 35 }, 
            { opacity: 1, y: 0, duration: 0.8 }, 
            "-=0.35"
          )
          .fromTo('.hero-desc', 
            { opacity: 0, y: 28 }, 
            { opacity: 1, y: 0, duration: 0.7 }, 
            "-=0.45"
          )
          .fromTo('.hero-buttons', 
            { opacity: 0, y: 25 }, 
            { opacity: 1, y: 0, duration: 0.6 }, 
            "-=0.35"
          )
          .fromTo('.hero-metrics', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6 }, 
            "-=0.3"
          )
          .fromTo('.hero-preview-card', 
            { opacity: 0, x: 45, scale: 0.96 }, 
            { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, 
            "-=0.6"
          )

        // 2. Parallax background movement on scroll
        gsap.to('.hero-parallax-grid', {
          y: 75,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        })

        gsap.to('.hero-parallax-waves', {
          y: -45,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          }
        })

        gsap.to('.hero-parallax-nodes', {
          y: 50,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.9,
          }
        })

        gsap.to('.hero-parallax-badge-left', {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          }
        })

        gsap.to('.hero-parallax-badge-right', {
          y: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.3,
          }
        })

        // 3. Features Section Scroll Reveal & Staggered Cards
        gsap.fromTo('.features-header',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#features-section',
              start: 'top 82%',
              toggleActions: 'play none none none',
            }
          }
        )

        gsap.fromTo('.feature-card',
          { opacity: 0, y: 45, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.feature-card-grid',
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
            clearProps: 'transform'
          }
        )

        // 4. How It Works Section Scroll Reveal & Staggered Cards
        gsap.fromTo('.how-it-works-header',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#how-it-works',
              start: 'top 82%',
              toggleActions: 'play none none none',
            }
          }
        )

        gsap.fromTo('.how-it-works-card',
          { opacity: 0, y: 45, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.how-it-works-grid',
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
            clearProps: 'transform'
          }
        )

        gsap.fromTo('.how-it-works-cta',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.how-it-works-cta',
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            clearProps: 'transform'
          }
        )

        // 5. About Section Scroll Reveal
        gsap.fromTo('.about-text',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#about',
              start: 'top 82%',
              toggleActions: 'play none none none',
            }
          }
        )

        gsap.fromTo('.about-card',
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#about',
              start: 'top 82%',
              toggleActions: 'play none none none',
            }
          }
        )

        // 6. Dynamic Active Section Tracking in Navigation Bar
        const sections = [
          { id: 'hero-section', name: 'home' },
          { id: 'how-it-works', name: 'how-it-works' },
          { id: 'about', name: 'about' },
        ]

        sections.forEach(({ id, name }) => {
          ScrollTrigger.create({
            trigger: `#${id}`,
            start: 'top 45%',
            end: 'bottom 45%',
            onEnter: () => setActiveNavSection(name),
            onEnterBack: () => setActiveNavSection(name),
          })
        })
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([
          '.hero-badge', '.hero-heading', '.hero-desc', '.hero-buttons', 
          '.hero-metrics', '.hero-preview-card', '.features-header', 
          '.feature-card', '.how-it-works-header', '.how-it-works-card', 
          '.how-it-works-cta', '.about-text', '.about-card'
        ], {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          clearProps: 'all'
        })
      })
    }, homeContainerRef)

    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [currentView])

  // GSAP Entrance Animations for Medication Analysis Dashboard
  useEffect(() => {
    if (currentView !== 'analysis') {
      hasDashboardAnimatedRef.current = false
      return
    }

    if (hasDashboardAnimatedRef.current) return

    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ 
          defaults: { ease: 'power2.out' },
          onComplete: () => {
            hasDashboardAnimatedRef.current = true
          }
        })

        tl.fromTo('.dash-header-bar',
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5 }
        )
        .fromTo('.dash-patient-selector',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo('.dashboard-summary-card',
          { opacity: 0, y: 25, scale: 0.98 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            stagger: 0.1, 
            clearProps: 'transform' 
          },
          "-=0.2"
        )
        .fromTo('.dash-tab-nav',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        )
        .fromTo('.dash-content-area',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, clearProps: 'transform' },
          "-=0.2"
        )
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(['.dash-header-bar', '.dash-patient-selector', '.dashboard-summary-card', '.dash-tab-nav', '.dash-content-area'], {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: 'all'
        })
        hasDashboardAnimatedRef.current = true
      })
    }, dashboardContainerRef)

    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [currentView])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {auditNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-sm animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
          <span>{auditNotification}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Electric-Blue Scroll Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-200/50 overflow-hidden pointer-events-none z-50">
          <div
            ref={progressBarRef}
            className="h-full w-full bg-gradient-to-r from-[#0066FF] via-[#008CFF] to-[#00D4FF] origin-left shadow-[0_0_8px_#00D4FF]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setCurrentView('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                +
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    MedSafe<span className="text-teal-600 font-extrabold">AI</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                    Odisha
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  AI-Powered Medication Safety & Polypharmacy Defense
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => {
                  if (currentView !== 'home') {
                    setCurrentView('home')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentView === 'home' && activeNavSection === 'home'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentView('analysis')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentView === 'analysis'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                }`}
              >
                Medication Analysis
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentView === 'home' && activeNavSection === 'how-it-works'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentView === 'home' && activeNavSection === 'about'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                }`}
              >
                About
              </button>
            </nav>

            {/* Desktop Actions & Navbar Three-Dot Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 relative">
              {/* Desktop CTA Button */}
              <button
                onClick={() => {
                  setCurrentView('analysis')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-98 transition duration-150"
              >
                {currentView === 'analysis' ? 'Sign In' : 'Get Started'}
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {/* Three-Dot (⋮) Menu Button */}
              <button
                ref={navMenuBtnRef}
                onClick={handleToggleNavMenu}
                aria-label="Navigation options menu"
                aria-expanded={navMenuOpen}
                aria-haspopup="true"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  navMenuOpen
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm shadow-blue-500/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </button>

              {/* Mobile Hamburger Toggle */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
                  aria-label="Toggle Navigation Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
            <button
              onClick={() => {
                if (currentView !== 'home') {
                  setCurrentView('home')
                }
                setMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === 'home' && activeNavSection === 'home'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentView('analysis')
                setMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === 'analysis'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              Medication Analysis
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === 'home' && activeNavSection === 'how-it-works'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === 'home' && activeNavSection === 'about'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              About
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setFeedbackModalOpen(true)
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center space-x-2"
            >
              <span>💬</span>
              <span>Feedback</span>
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCurrentView('analysis')
                  setMobileMenuOpen(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-center text-white bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                {currentView === 'analysis' ? 'Sign In' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {currentView === 'home' ? (
        <div ref={homeContainerRef} className="flex-1 flex flex-col bg-[#EFF6FF]">
          {/* Hero Section */}
          <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-[#DBEAFE] via-[#E8F2FE] to-[#EFF6FF] pt-12 pb-20 md:pt-20 md:pb-28">
            {/* Animated Futuristic Medical Grid Background */}
            <MedicalGridBackground />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Hero Text Column */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="hero-badge inline-flex items-center space-x-2 bg-blue-50/90 border border-blue-200/90 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    <span>Next-Gen Healthcare AI for Clinical Safety</span>
                  </div>

                  <h1 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                    Smarter Medication <br className="hidden sm:inline" />
                    <span className="animated-gradient-text font-black">
                      Safety with AI
                    </span>
                  </h1>

                  <p className="hero-desc text-base sm:text-lg text-[#0F172A] font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    MedSafe AI protects multimorbid and elderly patients against dangerous drug-drug interactions,
                    prescribing cascades, and unnecessary polypharmacy. Integrated with the Government of Odisha Niramaya
                    Essential Formulary and clinical STOPP/START guidelines.
                  </p>

                  {/* Hero Action Buttons */}
                  <div className="hero-buttons pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <button
                      onClick={() => {
                        setCurrentView('analysis')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="group btn-electric-glow w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-600/30 active:scale-98 transition duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Get Started</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>

                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="group w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-base text-slate-700 bg-white/90 hover:bg-white border border-slate-300 shadow-xs hover:border-blue-400 hover:text-blue-700 transition duration-200 flex items-center justify-center space-x-1"
                    >
                      <span>How It Works</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">↓</span>
                    </button>
                  </div>

                  {/* Trust Metrics with Animated Counting & Verified Labels */}
                  <div className="hero-metrics pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                    <div>
                      <div className="text-2xl font-extrabold text-blue-700">
                        <AnimatedCounter end={10000} suffix="+" />
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">DDI Cross-Checks</div>
                      <div className="text-[10px] text-teal-700 font-medium">Verified Core Rules</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-teal-600">
                        <AnimatedCounter end={86} suffix="%" />
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">Niramaya Formulary</div>
                      <div className="text-[10px] text-teal-700 font-medium">Formulary Alignment</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-slate-800">&lt;200ms</div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">Audit Response</div>
                      <div className="text-[10px] text-slate-500 font-medium">Demo Target Benchmark</div>
                    </div>
                  </div>
                </div>

                {/* Right Hero Interactive Card Preview */}
                <div className="lg:col-span-5 relative hero-preview-card">
                  <div className="floating-hero-card">
                    {/* Subtle Electric-Blue Ambient Glow behind the medication interaction card */}
                    <div className="absolute -inset-3 bg-gradient-to-tr from-[#0066FF]/25 via-[#008CFF]/28 to-[#00D4FF]/22 rounded-3xl blur-2xl pointer-events-none -z-10" />

                    <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-500/10 border border-slate-200 card-glow-pulse relative overflow-hidden">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                          </span>
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Live Interaction Monitor
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          Critical Hazard Flagged
                        </span>
                      </div>

                      {/* Sample Case Summary in Hero */}
                      <div className="my-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">Patient Case #8841 (68y)</span>
                          <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-bold">
                            SCB Medical College
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          7 active medications • CKD Stage 3 • Hypertension • Osteoarthritis
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-blue-200/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            Simulated Demonstration Case
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">De-identified Record</span>
                        </div>
                      </div>

                      {/* Detected Hazard Box */}
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 space-y-2">
                        <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>"Triple Whammy" Acute Renal Alert</span>
                        </div>
                        <p className="text-xs text-rose-900/90 leading-relaxed">
                          Telmisartan (ARB) + Furosemide (Diuretic) + Diclofenac (NSAID) impairs renal hemodynamics, risking acute kidney failure.
                        </p>
                        <div className="text-[11px] font-bold text-teal-700 bg-white/80 p-2 rounded-xl border border-teal-200">
                          💡 AI Action: Discontinue Diclofenac. Substitute with Paracetamol 500mg.
                        </div>
                      </div>

                      {/* Demonstration Disclaimer Note */}
                      <p className="mt-3 text-[10px] text-slate-400 text-center italic">
                        * Clinical scenarios, dosages, and recommendations are simulated demonstration data for testing.
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Ready to test other patient profiles?</span>
                        <button
                          onClick={() => {
                            setCurrentView('analysis')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center space-x-1"
                        >
                          <span>Launch Full Audit</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Seamless Blue-to-Light-Blue Gradient Transition Overlay at Bottom of Hero */}
            <div 
              className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(239, 246, 255, 0.25) 30%, rgba(239, 246, 255, 0.75) 65%, #EFF6FF 100%)'
              }}
            />
          </section>

          {/* Feature Cards Section */}
          <section id="features-section" className="relative py-24 overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#E1F0FE] to-[#EFF6FF]">
            {/* Seamless Gradient Blend at Top of Feature Cards Section */}
            <div 
              className="absolute inset-x-0 top-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, #EFF6FF 0%, rgba(239, 246, 255, 0.75) 35%, rgba(239, 246, 255, 0.25) 70%, transparent 100%)'
              }}
            />

            {/* Seamless Gradient Blend at Bottom of Feature Cards Section */}
            <div 
              className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(239, 246, 255, 0.25) 30%, rgba(239, 246, 255, 0.75) 65%, #EFF6FF 100%)'
              }}
            />

            {/* Ambient Electric Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[450px] bg-gradient-to-tr from-[#0066FF]/20 via-[#008CFF]/22 to-transparent rounded-full blur-3xl pointer-events-none electric-ambient-glow-1" />
            <div className="absolute top-1/3 right-10 w-[550px] h-[450px] bg-gradient-to-bl from-[#00D4FF]/22 via-[#008CFF]/18 to-transparent rounded-full blur-3xl pointer-events-none electric-ambient-glow-2" />
            
            {/* Electric Grid Pattern Overlay with Smooth Top & Bottom Fade */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 72%, rgba(0,0,0,0.3) 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 72%, rgba(0,0,0,0.3) 88%, transparent 100%)'
              }}
            >
              <div className="absolute inset-0 electric-medical-grid opacity-75" />
              <div className="absolute inset-0 electric-micro-grid opacity-50" />
            </div>

            {/* Circuit Line with Animated Energy Pulse Crossing Section */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" preserveAspectRatio="none" viewBox="0 0 1440 600">
              <line x1="0" y1="280" x2="1440" y2="280" stroke="#00D4FF" strokeOpacity="0.3" strokeWidth="1.25" strokeDasharray="6 6" />
              <path d="M 0 280 H 1440" stroke="url(#pulseCyanH)" strokeWidth="2.5" className="electric-beam-h1" />
              
              {/* Intersection cross markers */}
              {[160, 440, 720, 1000, 1280].map((x, i) => (
                <g key={i} className="electric-cross">
                  <line x1={x - 5} y1={280} x2={x + 5} y2={280} />
                  <line x1={x} y1={275} x2={x} y2={285} />
                  <circle cx={x} cy={280} r="3" fill="#00D4FF" className="electric-node-pulse" />
                </g>
              ))}
            </svg>

            {/* Floating Shimmer Particles */}
            <div className="absolute top-[25%] left-[10%] w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] animate-particle-1" />
            <div className="absolute top-[60%] right-[12%] w-2.5 h-2.5 rounded-full bg-[#008CFF] shadow-[0_0_10px_#008CFF] animate-particle-2" />
            <div className="absolute top-[80%] left-[25%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#00D4FF] animate-particle-3" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="features-header text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-xs font-bold tracking-wider uppercase text-teal-700 bg-teal-50/90 border border-teal-200/90 px-3.5 py-1 rounded-full shadow-2xs">
                  Clinical Capabilities
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Comprehensive Precision Medication Defense
                </h2>
                <p className="text-[#0F172A] font-medium text-sm sm:text-base">
                  Designed specifically for multi-doctor prescriptions, chronic elderly patients, and primary health clinics.
                </p>
              </div>

              {/* 3 Core Feature Cards */}
              <div className="feature-card-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature Card 1: Drug Interaction Checking */}
                <div className="feature-card group rounded-3xl bg-white/95 backdrop-blur-md border border-blue-200/90 p-8 hover:bg-white hover:border-[#00D4FF] hover:shadow-2xl hover:shadow-[#008CFF]/25 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:shadow-[0_0_20px_#00D4FF] group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Drug Interaction Checking
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Instant multi-drug cross-referencing detecting severe, moderate, and synergistic interactions across active therapies,
                      including anticoagulants, NSAIDs, antihypertensives, and diuretics.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs font-bold text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore interaction detection</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Feature Card 2: Medication Information & Niramaya Formulary */}
                <div className="feature-card group rounded-3xl bg-white/95 backdrop-blur-md border border-blue-200/90 p-8 hover:bg-white hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/25 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:shadow-[0_0_20px_#14B8A6] group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Medication Information & Formulary
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Clear drug indications, standard geriatric doses, and direct alignment with the Government of Odisha Niramaya
                      Essential Drug List for zero out-of-pocket patient costs at PHC, CHC, and District Hospitals.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs font-bold text-teal-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Verify Niramaya formulary stock</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Feature Card 3: AI-Powered Clinical Analysis */}
                <div className="feature-card group rounded-3xl bg-white/95 backdrop-blur-md border border-blue-200/90 p-8 hover:bg-white hover:border-[#00D4FF] hover:shadow-2xl hover:shadow-[#008CFF]/25 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:shadow-[0_0_20px_#00D4FF] group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      AI-Powered Clinical Analysis
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Intelligent synthesis grounded in AGS Beers Criteria, STOPP/START geriatric rules, and renal adjustment protocols
                      to suggest safe deprescribing and effective therapeutic alternatives.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs font-bold text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect AI clinical rules</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="relative py-24 overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#E4F1FE] to-[#EFF6FF] scroll-mt-20">
            {/* Seamless Gradient Blend at Top of How It Works Section */}
            <div 
              className="absolute inset-x-0 top-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, #EFF6FF 0%, rgba(239, 246, 255, 0.75) 35%, rgba(239, 246, 255, 0.25) 70%, transparent 100%)'
              }}
            />

            {/* Seamless Gradient Blend at Bottom of How It Works Section */}
            <div 
              className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(239, 246, 255, 0.25) 30%, rgba(239, 246, 255, 0.75) 65%, #EFF6FF 100%)'
              }}
            />

            {/* Ambient Electric Glows & Subtle Grid with Smooth Top & Bottom Fade */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[380px] bg-gradient-to-tr from-[#0066FF]/15 via-[#008CFF]/15 to-transparent rounded-full blur-3xl pointer-events-none electric-ambient-glow-2" />
            
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 72%, rgba(0,0,0,0.3) 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 72%, rgba(0,0,0,0.3) 88%, transparent 100%)'
              }}
            >
              <div className="absolute inset-0 electric-medical-grid opacity-60" />
              <div className="absolute inset-0 electric-micro-grid opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="how-it-works-header text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full shadow-2xs">
                  Workflow Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  How MedSafe AI Works
                </h2>
                <p className="text-[#0F172A] font-medium text-sm sm:text-base">
                  Three simple steps from prescription entry to clinical safety validation.
                </p>
              </div>

              <div className="how-it-works-grid grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Step 1 */}
                <div className="how-it-works-card bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-blue-200/90 hover:border-[#00D4FF] shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-[#008CFF]/15 hover:-translate-y-1.5 transition-all duration-300 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-blue-200">01</span>
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                      📥
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">1. Prescription Intake</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Enter or scan existing medications prescribed across various doctors, clinics, or self-administered OTC remedies.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
                    Supports handwritten, electronic, or formulary codes.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="how-it-works-card bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-blue-200/90 hover:border-teal-400 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-teal-500/15 hover:-translate-y-1.5 transition-all duration-300 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-teal-200">02</span>
                    <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200">
                      ⚡
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">2. Real-Time AI Safety Scan</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    The engine checks for severe drug-drug interactions, duplicate therapeutic classes, and patient renal/geriatric contraindications.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-teal-700 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/60">
                    Evaluated under WHO, Beers, and STOPP criteria.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="how-it-works-card bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-blue-200/90 hover:border-[#00D4FF] shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-[#008CFF]/15 hover:-translate-y-1.5 transition-all duration-300 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-blue-200">03</span>
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                      🛡️
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">3. Actionable Clinical Report</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Receive a clear deprescribing proposal with safer alternative medications available under the Odisha Niramaya Scheme.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
                    Ready for doctor review or patient counseling printout.
                  </div>
                </div>
              </div>

              {/* Central CTA Banner */}
              <div className="how-it-works-cta mt-14">
                <div 
                  className="group cta-interactive-card p-8 sm:p-12 text-white relative rounded-3xl"
                  onMouseMove={(e) => {
                    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    setCtaMousePos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      isHovered: true,
                    })
                  }}
                  onMouseLeave={() => {
                    setCtaMousePos((prev) => ({ ...prev, isHovered: false }))
                  }}
                >
                  {/* Subtle Mouse-Following Radial Glow (Behind content, z-0) */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden transition-opacity duration-300 z-0 select-none"
                    style={{ opacity: ctaMousePos.isHovered ? 1 : 0 }}
                    aria-hidden="true"
                  >
                    <div
                      className="absolute w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl pointer-events-none"
                      style={{
                        left: `${ctaMousePos.x}px`,
                        top: `${ctaMousePos.y}px`,
                        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.32) 0%, rgba(0, 102, 255, 0.2) 48%, transparent 72%)',
                      }}
                    />
                  </div>

                  {/* Animated Glowing Border Light Sweep */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl z-10 overflow-hidden" 
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="99.6%"
                      height="99%"
                      rx="24"
                      ry="24"
                      fill="none"
                      stroke="url(#ctaBorderBeam)"
                      strokeWidth="2.5"
                      pathLength="100"
                      className="cta-border-beam"
                    />
                    <defs>
                      <linearGradient id="ctaBorderBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="50%" stopColor="#0066FF" />
                        <stop offset="100%" stopColor="#00D4FF" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Card Content & Action Button (z-20) */}
                  <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Ready to audit a multi-drug prescription?
                      </h3>
                      <p className="text-blue-100 text-sm mt-1 max-w-xl">
                        Try our interactive live analysis demo with pre-loaded patient cases from Cuttack, Puri, and Berhampur.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('analysis')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="cta-launch-btn shrink-0 px-8 py-3.5 rounded-xl bg-white text-blue-800 font-bold text-sm shadow-md active:scale-98 transition flex items-center justify-center space-x-2 group/btn border border-white/80"
                    >
                      <span>Launch Analysis Tool</span>
                      <svg 
                        className="w-4 h-4 text-blue-700 transition-transform duration-250 ease-out group-hover/btn:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="relative py-24 overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#E2F0FE] to-[#DBEAFE] scroll-mt-20">
            {/* Seamless Gradient Blend at Top of About Section */}
            <div 
              className="absolute inset-x-0 top-0 h-44 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, #EFF6FF 0%, rgba(239, 246, 255, 0.75) 35%, rgba(239, 246, 255, 0.25) 70%, transparent 100%)'
              }}
            />

            {/* Ambient Electric Glows & Subtle Grid with Smooth Top Fade */}
            <div className="absolute top-1/4 right-1/4 w-[550px] h-[400px] bg-gradient-to-bl from-[#00D4FF]/20 via-[#008CFF]/15 to-transparent rounded-full blur-3xl pointer-events-none electric-ambient-glow-1" />
            
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 100%)'
              }}
            >
              <div className="absolute inset-0 electric-medical-grid opacity-60" />
              <div className="absolute inset-0 electric-micro-grid opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="about-text space-y-5">
                  <span className="text-xs font-bold tracking-wider uppercase text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                    About MedSafe AI
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Dedicated to Reducing Polypharmacy Risks Across Odisha
                  </h2>
                  <p className="text-[#0F172A] font-medium text-sm sm:text-base leading-relaxed">
                    In rural and urban healthcare systems alike, patients seeing multiple healthcare providers frequently
                    accumulate 5 to 10+ concurrent medications. Without centralized reconciliation, accidental drug interactions,
                    acute renal injury, and adverse falls are leading causes of emergency hospitalization.
                  </p>
                  <p className="text-[#0F172A] font-medium text-sm sm:text-base leading-relaxed">
                    MedSafe AI bridges this critical gap by empowering frontline doctors, pharmacists, and health workers with
                    real-time intelligence, seamless Niramaya formulary matching, and automated deprescribing assistance.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">🏥 Community Health Centres (CHC)</span>
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">🩺 Primary Health Centres (PHC)</span>
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">💊 Free Medicine Supply (Niramaya)</span>
                  </div>
                </div>

                <div className="about-card bg-gradient-to-br from-blue-50 via-teal-50/50 to-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">System Impact Goals</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Prevent Inadvertent Adverse Drug Events (ADEs)</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Eliminate toxic combinations before the prescription reaches the dispensing counter.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Support Deprescribing in Geriatric Multimorbidity</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Taper unnecessary medications to improve quality of life and compliance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Maximize Regional Formulary Compliance</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Guide physicians toward in-stock state-sponsored medicines to minimize patient financial distress.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Medication Analysis Section (Interactive Workspace) */
        <div ref={dashboardContainerRef} className="relative flex-1 min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-[#F8FBFF] via-[#F1F7FE] to-[#EFF6FF]">
          {/* Futuristic Electric-Blue Clinical Dashboard Background */}
          <DashboardBackground />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
          {/* Breadcrumb / Return to Home */}
          <div className="dash-header-bar flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentView('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="group inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-slate-300 hover:border-blue-400 px-3.5 py-1.5 rounded-xl shadow-2xs hover:shadow-sm hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-98 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform duration-200 inline-block">←</span>
              <span>Back to Homepage</span>
            </button>
            <div className="text-xs text-[#334155] font-medium">
              Interactive Clinical Workspace • <span className="text-teal-700 font-bold">Client-Side Engine</span>
            </div>
          </div>

          {/* Patient Selector Strip */}
          <div className="dash-patient-selector bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#334155]">
                Active Clinical Case:
              </label>
              <div className="flex flex-wrap gap-2">
                {mockPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                      selectedPatientId === p.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-500'
                        : 'bg-slate-100 text-[#0F172A] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 shadow-2xs hover:shadow-sm font-bold'
                    }`}
                  >
                    {p.name} ({p.age}y)
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#334155] font-medium flex items-center space-x-2">
              <span className="font-bold text-[#0F172A]">UHID:</span>
              <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 text-[#0F172A] font-extrabold">
                {currentPatient.uhid}
              </span>
              <span>•</span>
              <span className="text-[#334155] font-semibold">{currentPatient.location}</span>
            </div>
          </div>

          {/* Quick Metrics Bar (Summary Cards with 4-6px elevation & electric-blue border glow) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className={`dashboard-summary-card rounded-2xl p-5 border ${polyStatus.bgColor} shadow-2xs flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-500/15 hover:border-[#0066FF] transition-all duration-300 ease-out cursor-default`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Total Medications</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white text-[#0F172A] border border-slate-300">
                  {medCount} Active
                </span>
              </div>
              <div className="mt-3">
                <div className={`text-xl font-black ${polyStatus.textColor}`}>
                  {polyStatus.label}
                </div>
                <div className="text-xs text-[#334155] font-medium mt-1 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${polyStatus.dotColor}`}></span>
                  <span>{polyStatus.badge}</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="dashboard-summary-card rounded-2xl p-5 border border-slate-200 bg-white shadow-2xs flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-500/15 hover:border-[#0066FF] transition-all duration-300 ease-out cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Clinical Alerts</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                  {currentPatient.alerts.length} Warnings
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-black text-rose-700">
                  {currentPatient.alerts.filter((a) => a.severity === 'critical').length} Critical Hazards
                </div>
                <div className="text-xs text-[#334155] font-medium mt-1">
                  Nephrotoxicity & bleeding risk flags
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="dashboard-summary-card rounded-2xl p-5 border border-slate-200 bg-white shadow-2xs flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-500/15 hover:border-[#0066FF] transition-all duration-300 ease-out cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Niramaya Formulary</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300">
                  Govt. Scheme
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-black text-teal-800">86% Free Stock Match</div>
                <div className="text-xs text-[#334155] font-medium mt-1">Zero out-of-pocket patient cost</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="dashboard-summary-card rounded-2xl p-5 border border-slate-200 bg-white shadow-2xs flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-500/15 hover:border-[#0066FF] transition-all duration-300 ease-out cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Hospital Center</span>
                <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  Odisha
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-extrabold text-[#0F172A] truncate">
                  {currentPatient.healthCenter}
                </div>
                <div className="text-xs text-[#334155] font-medium mt-1 truncate">
                  {currentPatient.diagnoses.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis View Tabs */}
          <div className="dash-tab-nav border-b border-slate-300 flex space-x-2 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveAnalysisTab('reconciliation')}
              className={`pb-3.5 px-3 text-sm transition-colors duration-150 border-b-2 focus:outline-none -mb-px flex items-center space-x-1.5 ${
                activeAnalysisTab === 'reconciliation'
                  ? 'border-blue-600 text-blue-700 font-extrabold'
                  : 'border-transparent text-[#334155] hover:text-[#0F172A] hover:border-slate-400 font-semibold'
              }`}
            >
              <span>📋 Prescription & Drug Interactions ({medCount})</span>
            </button>
            <button
              onClick={() => setActiveAnalysisTab('ai-summary')}
              className={`pb-3.5 px-3 text-sm transition-colors duration-150 border-b-2 focus:outline-none -mb-px flex items-center space-x-1.5 ${
                activeAnalysisTab === 'ai-summary'
                  ? 'border-blue-600 text-blue-700 font-extrabold'
                  : 'border-transparent text-[#334155] hover:text-[#0F172A] hover:border-slate-400 font-semibold'
              }`}
            >
              <span>🤖 AI Deprescribing Recommendations</span>
            </button>
            <button
              onClick={() => setActiveAnalysisTab('niramaya')}
              className={`pb-3.5 px-3 text-sm transition-colors duration-150 border-b-2 focus:outline-none -mb-px flex items-center space-x-1.5 ${
                activeAnalysisTab === 'niramaya'
                  ? 'border-blue-600 text-blue-700 font-extrabold'
                  : 'border-transparent text-[#334155] hover:text-[#0F172A] hover:border-slate-400 font-semibold'
              }`}
            >
              <span>🏥 Niramaya Essential Drug Formulary</span>
            </button>
          </div>

          {/* Tab Content Wrapper */}
          <div className="dash-content-area space-y-6">
          {/* Tab 1: Reconciliation & Interactions */}
          {activeAnalysisTab === 'reconciliation' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Medications */}
              <div className="lg:col-span-2 space-y-4">
                {/* Add Drug Bar */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                  <h3 className="text-sm font-extrabold text-[#0F172A] mb-1">Add Drug to Regimen</h3>
                  <p className="text-xs text-[#334155] font-medium mb-4">
                    Simulate co-prescribing an additional medicine to evaluate real-time interaction risks
                  </p>
                  <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      placeholder="Drug name (e.g. Ciprofloxacin)"
                      value={newDrugName}
                      onChange={(e) => setNewDrugName(e.target.value)}
                      className="sm:col-span-2 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 500mg)"
                      value={newDrugDose}
                      onChange={(e) => setNewDrugDose(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="group bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-98 border border-blue-500 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-1"
                    >
                      <span className="group-hover:rotate-90 transition-transform duration-200 inline-block text-sm leading-none">+</span>
                      <span>Add Drug</span>
                    </button>
                  </form>
                </div>

                {/* Drug Cards List */}
                <div className="space-y-2.5">
                  {currentPatient.medications.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white border border-slate-200/90 border-l-4 border-l-transparent hover:border-l-[#0066FF] hover:border-blue-200 hover:bg-[#F3F8FE] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 ease-out"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
                            med.riskLevel === 'high'
                              ? 'bg-rose-500'
                              : med.riskLevel === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-teal-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-[#0F172A]">{med.name}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0F172A] border border-slate-300">
                              {med.dose}
                            </span>
                          </div>
                          <div className="text-xs text-[#334155] font-medium mt-1 flex flex-wrap items-center gap-2">
                            <span className="font-medium text-[#334155]">{med.freq}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-[#0F172A] font-semibold">{med.category}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-teal-800 text-[11px] font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-300">
                              {med.niramayaStock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMedication(med.id, med.name)}
                        className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 hover:border-rose-400 hover:shadow-sm hover:shadow-rose-500/20 hover:scale-[1.02] active:scale-98 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 self-end sm:self-auto"
                      >
                        Deprescribe
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Detected Interactions */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center space-x-1.5">
                      <span>⚠️ Detected Clinical Hazards</span>
                    </h3>
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300">
                      {currentPatient.alerts.length} Flagged
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentPatient.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all duration-300 ease-out hover:-translate-y-1 shadow-2xs hover:shadow-md ${
                          alert.severity === 'critical'
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950 hover:border-rose-400 hover:shadow-rose-500/15 hover:bg-rose-50'
                            : alert.severity === 'high'
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950 hover:border-amber-400 hover:shadow-amber-500/15 hover:bg-amber-50'
                            : 'bg-blue-50/90 border-blue-300 text-blue-950 hover:border-blue-400 hover:shadow-blue-500/15 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-extrabold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-white shadow-2xs ${
                            alert.severity === 'critical' ? 'text-rose-700 border border-rose-300' :
                            alert.severity === 'high' ? 'text-amber-700 border border-amber-300' :
                            'text-blue-700 border border-blue-300'
                          }`}>
                            {alert.severity} Risk
                          </span>
                        </div>
                        <div className="font-extrabold text-[#0F172A] text-sm mt-1">{alert.title}</div>
                        <p className="text-[#334155] font-medium text-xs leading-relaxed">{alert.description}</p>
                        <div className="pt-2 text-xs font-bold text-teal-900 bg-white p-2.5 rounded-xl border border-teal-300 shadow-2xs">
                          💡 Action: {alert.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI Clinical Synthesis */}
          {activeAnalysisTab === 'ai-summary' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-lg font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">AI Clinical Deprescribing Synthesis</h3>
                  <p className="text-xs text-[#334155] font-medium">
                    Calculated using STOPP/START, Beers Criteria & Odisha Formulary Guidelines
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-sm text-[#0F172A] leading-relaxed font-medium">
                {currentPatient.aiSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 transition-all duration-300 ease-out">
                  <span className="text-xs font-extrabold uppercase text-blue-800">Priority 1</span>
                  <h4 className="text-sm font-bold text-[#334155]">Eliminate Nephrotoxics</h4>
                  <p className="text-xs text-[#334155] font-medium leading-relaxed">
                    Deprescribe oral NSAIDs immediately in patients with eGFR &lt; 60 or on concurrent ACEi/ARBs.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:-translate-y-1 hover:shadow-md hover:border-teal-300 transition-all duration-300 ease-out">
                  <span className="text-xs font-extrabold uppercase text-teal-800">Priority 2</span>
                  <h4 className="text-sm font-bold text-[#334155]">Renal Dose Adjustment</h4>
                  <p className="text-xs text-[#334155] font-medium leading-relaxed">
                    Adjust metformin or statin dosages down to avoid drug accumulation and lactic acidosis risks.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 transition-all duration-300 ease-out">
                  <span className="text-xs font-extrabold uppercase text-blue-800">Priority 3</span>
                  <h4 className="text-sm font-bold text-[#334155]">Niramaya Generic Switch</h4>
                  <p className="text-xs text-[#334155] font-medium leading-relaxed">
                    Replace branded retail formulations with verified free state supplies available at CHCs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Odisha Niramaya Formulary */}
          {activeAnalysisTab === 'niramaya' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Odisha Niramaya Essential Drug Formulary</h3>
                  <p className="text-xs text-[#334155] font-medium">
                    Government of Odisha Free Medicine Distribution Coverage
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Filter drug by name or category..."
                  value={searchFormulary}
                  onChange={(e) => setSearchFormulary(e.target.value)}
                  className="bg-slate-50 border border-slate-300 hover:border-blue-400 rounded-xl px-4 py-2 text-xs text-[#0F172A] placeholder-slate-500 font-medium w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[#334155] uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
                    <tr>
                      <th className="px-4 py-3">Formulary Code</th>
                      <th className="px-4 py-3">Medicine Name</th>
                      <th className="px-4 py-3">Therapeutic Class</th>
                      <th className="px-4 py-3">Hospital Tier</th>
                      <th className="px-4 py-3">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFormulary.map((item) => (
                      <tr key={item.code} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.code}</td>
                        <td className="px-4 py-3 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="px-4 py-3 font-medium text-[#334155]">{item.category}</td>
                        <td className="px-4 py-3 font-medium text-[#334155]">{item.tier}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.status === 'Available'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
          </div>
        </div>
      )}

      {/* Professional Healthcare Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: About */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                  +
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  MedSafe<span className="text-teal-400">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Intelligent clinical decision support designed to protect patients from adverse drug events,
                unnecessary polypharmacy, and high out-of-pocket costs across Odisha's health ecosystem.
              </p>
              <div className="pt-2 text-xs text-teal-400 font-semibold">
                Government of Odisha Healthcare Hackathon Initiative
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('home')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-white transition"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('analysis')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-white transition"
                  >
                    Medication Analysis
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition">
                    About the Platform
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Clinical Standards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Clinical Guidelines</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>AGS Beers Criteria 2023</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>STOPP/START Version 3</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>Odisha Niramaya Formulary</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>WHO Medication Safety</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 MedSafe AI • Built for Odisha Healthcare Hackathon • All rights reserved.</p>
            <p className="text-slate-500 text-[11px]">
              Disclaimer: Clinical decision support tool for healthcare professionals and research.
            </p>
          </div>
        </div>
      </footer>

      {/* Help & Support Information Modal Panel */}
      {helpModalOpen && (
        <div
          role="dialog"
          aria-label="MedSafe AI Help and Support"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-dropdown-appear space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  💡
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">MedSafe AI • Help & Support</h3>
                  <p className="text-xs text-[#334155] font-medium">Quick Guidance & Clinical Support</p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                aria-label="Close Help Panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content items */}
            <div className="space-y-3.5 text-xs">
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-blue-900 flex items-center space-x-1.5">
                  <span>📋</span>
                  <span>How to Audit a Prescription</span>
                </h4>
                <p className="text-[#334155] font-medium leading-relaxed">
                  Navigate to <strong>Medication Analysis</strong>. Select an active clinical case to view their active drug regimen, real-time polypharmacy score, and automated STOPP/START hazard cross-checks.
                </p>
              </div>

              <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-teal-900 flex items-center space-x-1.5">
                  <span>🏥</span>
                  <span>Odisha Niramaya Formulary Matching</span>
                </h4>
                <p className="text-[#334155] font-medium leading-relaxed">
                  Each medication card displays its Niramaya stock status. The <strong>Formulary Tab</strong> allows doctors to verify 570+ free government-supplied generic medicines across PHCs and CHCs.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-[#0F172A] flex items-center space-x-1.5">
                  <span>🤖</span>
                  <span>AI Assistant & Decision Support</span>
                </h4>
                <p className="text-[#334155] font-medium leading-relaxed">
                  Click the floating chatbot in the bottom-right corner anytime to ask educational questions regarding drug contraindications, geriatric rules, or deprescribing steps.
                </p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 text-[11px]">
                Odisha Healthcare Hackathon Initiative
              </span>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar Dropdown Menu Portal (Fixed Layering z-index 300) */}
      {navMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={navDropdownRef}
          role="menu"
          aria-label="Navbar options menu"
          style={{
            position: 'fixed',
            top: `${menuCoords.top}px`,
            right: `${menuCoords.right}px`,
            zIndex: 300,
          }}
          className="w-64 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl shadow-blue-950/20 border border-slate-200/90 py-2 animate-dropdown-appear pointer-events-auto"
        >
          <div className="px-4 py-2 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Navigation & Tools</p>
          </div>

          {/* 1. Home */}
          <button
            onClick={() => {
              closeNavMenu(false)
              if (currentView !== 'home') {
                setCurrentView('home')
              }
              setActiveNavSection('home')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            role="menuitem"
            className={`w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 transition-colors ${
              currentView === 'home' && activeNavSection === 'home'
                ? 'bg-blue-50/90 text-blue-700 font-bold border-l-2 border-blue-600'
                : 'text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700'
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            <span>Home</span>
          </button>

          {/* 2. Medication Analysis */}
          <button
            onClick={() => {
              closeNavMenu(false)
              setCurrentView('analysis')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            role="menuitem"
            className={`w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 transition-colors ${
              currentView === 'analysis'
                ? 'bg-blue-50/90 text-blue-700 font-bold border-l-2 border-blue-600'
                : 'text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700'
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <span>Medication Analysis</span>
          </button>

          {/* 3. How It Works */}
          <button
            onClick={() => {
              closeNavMenu(false)
              scrollToSection('how-it-works')
            }}
            role="menuitem"
            className={`w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 transition-colors ${
              currentView === 'home' && activeNavSection === 'how-it-works'
                ? 'bg-blue-50/90 text-blue-700 font-bold border-l-2 border-blue-600'
                : 'text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700'
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span>How It Works</span>
          </button>

          {/* 4. About MedSafe AI */}
          <button
            onClick={() => {
              closeNavMenu(false)
              scrollToSection('about')
            }}
            role="menuitem"
            className={`w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 transition-colors ${
              currentView === 'home' && activeNavSection === 'about'
                ? 'bg-blue-50/90 text-blue-700 font-bold border-l-2 border-blue-600'
                : 'text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700'
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span>About MedSafe AI</span>
          </button>

          <div className="my-1.5 border-t border-slate-100" />

          {/* 5. Help & Support */}
          <button
            onClick={() => {
              closeNavMenu(false)
              setHelpModalOpen(true)
            }}
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span>Help & Support</span>
          </button>

          {/* 6. Feedback */}
          <button
            onClick={() => {
              closeNavMenu(false)
              setFeedbackModalOpen(true)
            }}
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-xs flex items-center space-x-3 text-[#0F172A] font-semibold hover:bg-blue-50/60 hover:text-blue-700 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </span>
            <span>Feedback</span>
          </button>
        </div>,
        document.body
      )}

      {/* Feedback Modal Dialog */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      {/* Floating MedSafe AI Assistant Widget */}
      <MedSafeChatbot
        isOpen={isChatbotOpen}
        onToggleOpen={(open) => {
          setIsChatbotOpen(open)
          if (!open) {
            wasChatbotOpenRef.current = false
          }
        }}
      />
    </div>
  )
}
