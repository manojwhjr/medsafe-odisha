import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const SUGGESTED_PROMPTS = [
  'What is polypharmacy?',
  'How does MedSafe AI detect drug interactions?',
  'What is the Odisha Niramaya scheme?',
  'What are STOPP/START and Beers criteria?',
  'Why is the "Triple Whammy" combination dangerous?',
]

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'bot',
  text:
    '👋 Welcome to the MedSafe AI Assistant demo! I provide educational clinical information on polypharmacy defense, drug-drug interaction detection, and the Government of Odisha Niramaya Formulary.\n\n' +
    '⚠️ Note: This is an interactive frontend demo for clinical decision support exploration. It does not provide personalized medical diagnosis or prescription advice.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

// Predefined educational responses for the frontend demonstration
function getEducationalResponse(input) {
  const query = input.toLowerCase().trim()

  // 1. Check for personal medical / dosage / diagnosis queries
  if (
    query.includes('my dose') ||
    query.includes('should i take') ||
    query.includes('can i take') ||
    query.includes('my prescription') ||
    query.includes('diagnose') ||
    query.includes('prescribe me') ||
    query.includes('my doctor said') ||
    query.includes('stop taking') ||
    query.includes('side effect in me')
  ) {
    return (
      '⚠️ Clinical Safety Advisory:\n\n' +
      'MedSafe AI Assistant is an educational decision-support demonstration and cannot evaluate personal patient symptoms, change dosages, or prescribe medications. ' +
      'Please consult a qualified medical practitioner, clinical pharmacologist, or visit your nearest Community Health Centre (CHC) or Primary Health Centre (PHC) for clinical assessment.'
    )
  }

  // 2. Triple Whammy query
  if (query.includes('triple whammy') || (query.includes('nsaid') && query.includes('diuretic'))) {
    return (
      '🔬 The "Triple Whammy" Renal Crisis:\n\n' +
      'This refers to the concurrent use of an ACE inhibitor or ARB (e.g., Telmisartan) + a Diuretic (e.g., Furosemide) + an NSAID (e.g., Diclofenac or Ibuprofen).\n\n' +
      '• NSAIDs constrict renal afferent arterioles (reducing glomerular blood flow).\n' +
      '• ACEi/ARBs dilate renal efferent arterioles (dropping intraglomerular filtration pressure).\n' +
      '• Diuretics induce hypovolemia.\n\n' +
      'Combined, this creates an acute drop in glomerular filtration rate (eGFR), drastically accelerating the risk of Acute Kidney Injury (AKI) in elderly patients. In MedSafe AI, our clinical engine flags this as a Critical Hazard.'
    )
  }

  // 3. Polypharmacy query
  if (query.includes('polypharmacy') || query.includes('what is polypharmacy')) {
    return (
      '💊 Understanding Polypharmacy:\n\n' +
      'Polypharmacy is clinically defined as the routine concurrent use of 5 or more medications by a single patient. When 8 to 10+ medications are co-prescribed (often across multiple specialty doctors without reconciliation), it is termed Hyperpolypharmacy.\n\n' +
      'Key clinical risks in elderly multimorbid patients include:\n' +
      '• Exponential risk of Adverse Drug Events (ADEs)\n' +
      '• Prescribing cascades (treating a drug side-effect with another drug)\n' +
      '• Drug-induced falls, cognitive impairment, and renal impairment\n' +
      '• Financial strain due to unnecessary retail brand expenditures.'
    )
  }

  // 4. Drug interactions query
  if (
    query.includes('interaction') ||
    query.includes('detect') ||
    query.includes('cross-reference') ||
    query.includes('cross check')
  ) {
    return (
      '⚡ Multi-Drug Interaction Detection:\n\n' +
      'MedSafe AI continuously cross-references active drug regimens against evidence-based pharmacological databases to identify:\n\n' +
      '1. Severe Pharmacodynamic Interactions (e.g., Dual anticoagulants / antiplatelets increasing fatal hemorrhage risk).\n' +
      '2. Pharmacokinetic Alterations (e.g., CYP3A4 inhibition or induction altering plasma drug concentrations).\n' +
      '3. Synergistic Organ Toxicity (e.g., Nephrotoxic combinations reducing renal clearance).\n\n' +
      'Every interaction is graded into Critical, High, or Moderate severity with explicit deprescribing and substitution alternatives.'
    )
  }

  // 5. Niramaya scheme query
  if (
    query.includes('niramaya') ||
    query.includes('odisha') ||
    query.includes('free medicine') ||
    query.includes('formulary') ||
    query.includes('scheme')
  ) {
    return (
      '🏥 Government of Odisha Niramaya Scheme:\n\n' +
      'Niramaya is the flagship Free Medicine Distribution Scheme initiated by the Government of Odisha, ensuring that 570+ essential drugs are supplied completely free of charge to citizens across Sub-Centres, PHCs, CHCs, and District Headquarter Hospitals (DHHs).\n\n' +
      'MedSafe AI directly integrates the official Niramaya Essential Drug Formulary to:\n' +
      '• Automatically substitute expensive retail branded drugs with equivalent verified free generics.\n' +
      '• Check real-time stock availability across hospital tiers.\n' +
      '• Reduce out-of-pocket healthcare expenditures to zero for vulnerable patients.'
    )
  }

  // 6. STOPP/START & Beers criteria query
  if (
    query.includes('stopp') ||
    query.includes('start') ||
    query.includes('beers') ||
    query.includes('guidelines') ||
    query.includes('geriatric')
  ) {
    return (
      '📋 Clinical Geriatric Guidelines:\n\n' +
      'MedSafe AI utilizes gold-standard international geriatric pharmacotherapy frameworks:\n\n' +
      '• AGS Beers Criteria®: Flags Potentially Inappropriate Medications (PIMs) in older adults (e.g., long-acting benzodiazepines, anticholinergics, first-generation sulfonylureas).\n' +
      '• STOPP/START (Version 3): "Screening Tool of Older Persons\' Prescriptions" (STOPP) to detect overtreatment and contraindications, and "Screening Tool to Alert to Right Treatment" (START) to catch evidence-based prescribing omissions.'
    )
  }

  // 7. About MedSafe AI query
  if (
    query.includes('about') ||
    query.includes('what is medsafe') ||
    query.includes('what is this') ||
    query.includes('who are you') ||
    query.includes('how does it work')
  ) {
    return (
      '🛡️ About MedSafe AI:\n\n' +
      'MedSafe AI is an intelligent clinical decision support system developed for the Odisha Healthcare Hackathon. ' +
      'It empowers frontline medical officers, pharmacists, and CHC physicians to audit multi-drug prescriptions in <200ms, ' +
      'prevent harmful drug interactions, identify prescribing cascades, and switch patients to free Government of Odisha Niramaya medicines.'
    )
  }

  // 8. General fallback response
  return (
    'Thank you for your question! As an educational demo assistant for MedSafe AI, I can provide information about:\n\n' +
    '• Polypharmacy and deprescribing principles\n' +
    '• Multi-drug interaction screening\n' +
    '• The Odisha Niramaya Free Medicine Formulary\n' +
    '• Clinical STOPP/START & AGS Beers Criteria guidelines\n\n' +
    'Try asking one of the suggested questions above, or ask about drug interactions or Niramaya free medicines!'
  )
}

export default function MedSafeChatbot({ isOpen: controlledIsOpen, onToggleOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const setIsOpen = (val) => {
    const nextVal = typeof val === 'function' ? val(isOpen) : val
    if (isControlled && onToggleOpen) {
      onToggleOpen(nextVal)
    } else {
      setInternalIsOpen(nextVal)
    }
  }

  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, isTyping])

  // Handle click outside and Escape key to close dropdown menu and confirmation modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showClearConfirm) {
          setShowClearConfirm(false)
        } else if (isMenuOpen) {
          setIsMenuOpen(false)
        }
      }
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen || showClearConfirm) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen, showClearConfirm])

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputValue).trim()
    if (!query) return

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate realistic AI response delay (700ms)
    setTimeout(() => {
      const responseText = getEducationalResponse(query)
      const botMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 700)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage()
  }

  // Dropdown Menu Handlers
  const handleNewChat = () => {
    setIsMenuOpen(false)
    setIsTyping(false)
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: 'welcome-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleClearChatPrompt = () => {
    setIsMenuOpen(false)
    setShowClearConfirm(true)
  }

  const handleConfirmClear = () => {
    setShowClearConfirm(false)
    setMessages([])
  }

  const handleMinimize = () => {
    setIsMenuOpen(false)
    setIsOpen(false)
  }

  const handleAbout = () => {
    setIsMenuOpen(false)
    const aboutMsg = {
      id: 'about-' + Date.now(),
      sender: 'bot',
      text:
        '🛡️ About MedSafe AI Assistant:\n\n' +
        'MedSafe AI is an intelligent clinical decision support system developed for the Odisha Healthcare Hackathon.\n\n' +
        '• Purpose: Demonstrates rapid (<200ms) multi-drug interaction screening, polypharmacy defense, and integration with the Government of Odisha Niramaya Essential Drug Formulary.\n' +
        '• Clinical Frameworks: Grounded in STOPP/START Version 3 guidelines and AGS Beers Criteria®.\n' +
        '• Educational Demonstration: Designed for clinical workflow exploration and decision-support prototyping. Does not evaluate personal symptoms or provide medical diagnosis.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, aboutMsg])
  }

  const chatbotJSX = (
    <div className="medsafe-chatbot-root">
      {/* Floating Chatbot Launch Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] pointer-events-auto">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open MedSafe AI Assistant"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-500 text-white shadow-xl shadow-blue-600/35 hover:shadow-2xl hover:shadow-cyan-400/40 hover:scale-108 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50 chatbot-float-btn"
          >
            {/* Subtle Pulsing Beacon Ring */}
            <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping opacity-60 pointer-events-none" />

            {/* AI Medical Chatbot Icon */}
            <svg
              className="w-7 h-7 transform group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>

            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-teal-400 border-2 border-white shadow-sm" />
          </button>
        </div>
      )}

      {/* Floating Chatbot Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="MedSafe AI Assistant Dialog"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] w-[380px] max-w-[calc(100vw-32px)] h-[min(600px,calc(100dvh-48px))] flex flex-col bg-white/95 backdrop-blur-xl border border-blue-200/90 rounded-3xl shadow-2xl shadow-blue-950/25 overflow-hidden animate-chatbot-appear transition-all duration-300 pointer-events-auto"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-teal-700 p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0 shadow-sm relative z-20">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
                🤖
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate">
                    MedSafe AI Assistant
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-teal-400/25 text-teal-200 border border-teal-300/30 shrink-0">
                    Demo
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5 text-[10px] sm:text-[11px] text-teal-200 font-medium truncate">
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse shrink-0" />
                  <span className="truncate">Clinical Decision Support</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls (Three-dot Menu & Close Button) */}
            <div className="flex items-center space-x-1 relative shrink-0" ref={menuRef}>
              {/* Three-dot (⋮) Menu Button */}
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Chatbot options menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 ${
                  isMenuOpen
                    ? 'bg-white/25 text-white'
                    : 'bg-white/10 hover:bg-white/25 text-white/90 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsOpen(false)
                }}
                aria-label="Close Assistant"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/90 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Three-dot Dropdown Menu */}
              {isMenuOpen && (
                <div
                  role="menu"
                  aria-label="Chatbot menu options"
                  className="absolute top-10 right-0 w-48 sm:w-52 bg-white rounded-2xl shadow-xl shadow-blue-950/20 border border-slate-200/90 py-1.5 z-50 text-slate-800 animate-dropdown-appear"
                >
                  {/* New Chat */}
                  <button
                    onClick={handleNewChat}
                    role="menuitem"
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 flex items-center space-x-2.5 transition-colors group"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-105 transition-all text-xs sm:text-sm shrink-0">
                      ✨
                    </span>
                    <span>New Chat</span>
                  </button>

                  {/* Clear Chat */}
                  <button
                    onClick={handleClearChatPrompt}
                    role="menuitem"
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50/80 flex items-center space-x-2.5 transition-colors group"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 group-hover:scale-105 transition-all text-xs sm:text-sm shrink-0">
                      🗑️
                    </span>
                    <span>Clear Chat</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {/* Minimize Chat */}
                  <button
                    onClick={handleMinimize}
                    role="menuitem"
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 flex items-center space-x-2.5 transition-colors group"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-105 transition-all text-xs sm:text-sm shrink-0">
                      ➖
                    </span>
                    <span>Minimize Chat</span>
                  </button>

                  {/* About MedSafe AI */}
                  <button
                    onClick={handleAbout}
                    role="menuitem"
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 flex items-center space-x-2.5 transition-colors group"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 group-hover:scale-105 transition-all text-xs sm:text-sm shrink-0">
                      ℹ️
                    </span>
                    <span>About MedSafe AI</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Educational Demo Advisory Banner */}
          <div className="bg-blue-50/90 border-b border-blue-200/70 px-3.5 sm:px-4 py-2 text-[10.5px] sm:text-[11px] text-[#0F172A] flex items-center justify-between gap-2 shrink-0">
            <span className="font-medium leading-tight">
              💡 <span className="font-bold text-blue-900">Educational Assistant</span> • Ask questions about polypharmacy & interactions.
            </span>
          </div>

          {/* Clear Confirmation Dialog Overlay */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-xs w-full text-center space-y-3 border border-slate-200 animate-dropdown-appear">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-lg shadow-2xs">
                  🗑️
                </div>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Clear Chat History?</h4>
                <p className="text-xs text-[#334155] font-medium leading-relaxed">
                  This will clear all current messages and reset the conversation.
                </p>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Scroll Area - ONLY this area scrolls vertically */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3.5 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-2">
                <span className="text-3xl">💬</span>
                <p className="text-xs font-bold text-[#0F172A]">Chat history cleared</p>
                <p className="text-[11px] text-[#334155]">Select a suggested topic below or type a message to start again.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs leading-relaxed shadow-2xs whitespace-pre-line break-words ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-xs shadow-blue-500/10'
                        : 'bg-white border border-slate-200/90 text-[#0F172A] font-medium rounded-tl-xs shadow-slate-200/40'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 w-fit shadow-2xs">
                <span className="text-[11px] text-[#334155] font-semibold">Synthesizing</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions - Wraps naturally onto multiple lines without horizontal overflow */}
          <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border-t border-slate-200/80 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Suggested Topics
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isTyping}
                  className="text-left text-[10.5px] sm:text-[11px] leading-snug font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/90 px-2.5 py-1 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 break-words"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar - Always visible at bottom, no overflow */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about polypharmacy, interactions..."
              disabled={isTyping}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-[#0F172A] placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-150 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send Message"
              className="group shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-600 hover:via-blue-600 hover:to-teal-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-cyan-400/35 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95 active:translate-y-0 transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 chatbot-send-btn cursor-pointer disabled:pointer-events-none"
            >
              <span className="font-bold">Send</span>
              <svg className="w-3.5 h-3.5 transform rotate-45 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-115" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )

  // Render via React Portal attached to document.body to prevent parent container transform/perspective interference
  if (typeof document === 'undefined') return null
  return createPortal(chatbotJSX, document.body)
}
