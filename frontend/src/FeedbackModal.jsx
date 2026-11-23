import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export const FEEDBACK_CATEGORIES = [
  { id: 'Suggestion', label: 'Suggestion', icon: '💡' },
  { id: 'Report a Bug', label: 'Report a Bug', icon: '🐛' },
  { id: 'General Experience', label: 'General Experience', icon: '✨' },
]

export const STAR_DESCRIPTIONS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

/**
 * Storage helper structured for future backend API integration.
 * In production, replace the localStorage call with an asynchronous fetch to a backend endpoint.
 */
export async function submitFeedbackToStorage(payload) {
  // Future backend API integration point:
  // const res = await fetch('/api/feedback', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // return await res.json()

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const STORAGE_KEY = 'medsafe_feedback_records'
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        const updated = [payload, ...existing]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        resolve({ success: true, record: payload })
      } catch (err) {
        console.error('Failed to save feedback to localStorage:', err)
        resolve({ success: false, error: err?.message || 'Storage error' })
      }
    }, 280) // Authentic slight async delay
  })
}

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('Suggestion')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  // Prevent background body scroll while modal is active & Escape key handling
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleResetForm = () => {
    setRating(0)
    setHoverRating(0)
    setCategory('Suggestion')
    setMessage('')
    setErrors({})
    setIsSubmitting(false)
    setIsSubmitted(false)
    setSubmittedData(null)
  }

  const handleClose = () => {
    handleResetForm()
    onClose()
  }

  const validateForm = () => {
    const newErrors = {}
    if (!rating || rating < 1) {
      newErrors.rating = 'Please select a star rating between 1 and 5.'
    }
    if (!message || message.trim().length === 0) {
      newErrors.message = 'Please provide your feedback comments before submitting.'
    } else if (message.trim().length < 5) {
      newErrors.message = 'Feedback message should be at least 5 characters long.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const feedbackPayload = {
      id: 'fb-' + Date.now(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      rating,
      category,
      message: message.trim(),
      clientInfo: {
        platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      },
    }

    const result = await submitFeedbackToStorage(feedbackPayload)
    setIsSubmitting(false)

    if (result.success) {
      setSubmittedData(feedbackPayload)
      setIsSubmitted(true)
    } else {
      setErrors({ form: 'An error occurred while saving your feedback. Please try again.' })
    }
  }

  const activeDisplayRating = hoverRating || rating

  const modalJSX = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-100 animate-modal-scale-in relative max-h-[92vh] overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          aria-label="Close Feedback Modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubmitted ? (
          /* Feedback Entry Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-center space-x-3.5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/25 shrink-0">
                💬
              </div>
              <div>
                <h3 id="feedback-modal-title" className="font-extrabold text-lg text-[#0F172A] tracking-tight">
                  Share Your Feedback
                </h3>
                <p className="text-xs text-[#334155] font-medium mt-0.5">
                  Help us refine MedSafe AI's clinical precision & usability
                </p>
              </div>
            </div>

            {/* General form error if any */}
            {errors.form && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2">
                <span>⚠️</span>
                <span>{errors.form}</span>
              </div>
            )}

            {/* 1. Star Rating Selector (1-5) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rate Your Experience <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold text-blue-700 min-h-[1rem]">
                  {activeDisplayRating ? `${activeDisplayRating} - ${STAR_DESCRIPTIONS[activeDisplayRating]}` : ''}
                </span>
              </div>

              <div
                className="flex items-center space-x-2 py-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeDisplayRating
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star)
                        if (errors.rating) {
                          setErrors((prev) => ({ ...prev, rating: undefined }))
                        }
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''} - ${STAR_DESCRIPTIONS[star]}`}
                      className="group p-1 focus:outline-none transition-transform duration-150 transform hover:scale-125 active:scale-95 cursor-pointer"
                    >
                      <svg
                        className={`w-8 h-8 transition-colors duration-150 ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-slate-300 fill-transparent hover:text-amber-300'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  )
                })}
              </div>

              {errors.rating && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center space-x-1 mt-0.5">
                  <span>⚠️</span>
                  <span>{errors.rating}</span>
                </p>
              )}
            </div>

            {/* 2. Feedback Category Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Feedback Category <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border border-blue-600 shadow-sm shadow-blue-500/25 font-bold'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Multiline Message Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="feedback-message" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your Comments <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  {message.length}/600
                </span>
              </div>
              <textarea
                id="feedback-message"
                rows={4}
                maxLength={600}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (errors.message) {
                    setErrors((prev) => ({ ...prev, message: undefined }))
                  }
                }}
                placeholder="Share your thoughts, clinical recommendations, bug reports, or feature requests..."
                className={`w-full rounded-2xl bg-slate-50 p-3.5 text-xs text-[#0F172A] placeholder-slate-400 border font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all duration-150 resize-none ${
                  errors.message
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.message && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center space-x-1 mt-0.5">
                  <span>⚠️</span>
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            {/* 4. Demo Advisory Box (No personal or medical data) */}
            <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-3 text-[11px] text-[#0F172A] flex items-start space-x-2.5">
              <span className="text-base shrink-0 leading-none mt-0.5">🔒</span>
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-blue-900 block">Frontend Demo Mode</span>
                <span className="text-[#334155] font-medium block">
                  Feedback is saved locally in your browser (<code className="font-mono text-[10px] text-blue-800 bg-blue-100/60 px-1 py-0.5 rounded">localStorage</code>) for demonstration. It is not transmitted to external servers. Please do not submit real patient names, prescriptions, or clinical confidential records.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Feedback</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Confirmation View */
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto text-3xl shadow-md shadow-emerald-500/10">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-[#0F172A] tracking-tight">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs text-[#334155] font-medium max-w-sm mx-auto leading-relaxed">
                Your response has been saved to your browser demo storage. Thank you for contributing to clinical usability and patient safety!
              </p>
            </div>

            {submittedData && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Rating
                  </span>
                  <span className="font-extrabold text-amber-500 flex items-center space-x-1">
                    <span>{'★'.repeat(submittedData.rating)}</span>
                    <span className="text-slate-600 font-semibold text-[11px]">({submittedData.rating}/5 - {STAR_DESCRIPTIONS[submittedData.rating]})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Category
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px]">
                    {submittedData.category}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Comments
                  </span>
                  <p className="text-[#0F172A] font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60 break-words whitespace-pre-wrap">
                    {submittedData.message}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 text-right pt-1 font-medium">
                  Recorded: {submittedData.formattedDate}
                </div>
              </div>
            )}

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Submit Another Response
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalJSX, document.body)
}
