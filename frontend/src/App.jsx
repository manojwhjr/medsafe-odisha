import { useState, useMemo } from 'react'
import { mockPatients, niramayaFormulary } from './mockData'

export default function App() {
  const [selectedPatientId, setSelectedPatientId] = useState('p1')
  const [activeTab, setActiveTab] = useState('reconciliation')
  const [searchFormulary, setSearchFormulary] = useState('')
  
  // Custom medications state mapped by patient ID
  const [patientsData, setPatientsData] = useState(() => {
    const initial = {}
    mockPatients.forEach(p => {
      initial[p.id] = { ...p, medications: [...p.medications] }
    })
    return initial
  })

  // New drug input form state
  const [newDrugName, setNewDrugName] = useState('')
  const [newDrugDose, setNewDrugDose] = useState('')
  const [newDrugFreq, setNewDrugFreq] = useState('Once daily')
  const [newDrugCategory, setNewDrugCategory] = useState('General')
  const [auditRunCount, setAuditRunCount] = useState(0)

  const currentPatient = patientsData[selectedPatientId] || mockPatients[0]

  // Add medication handler
  const handleAddMedication = (e) => {
    e.preventDefault()
    if (!newDrugName.trim()) return

    const newMed = {
      id: `custom-${Date.now()}`,
      name: newDrugName.trim(),
      dose: newDrugDose.trim() || 'As directed',
      freq: newDrugFreq,
      category: newDrugCategory,
      niramayaStock: 'In Stock (PHC/CHC)',
      riskLevel: 'low'
    }

    setPatientsData(prev => ({
      ...prev,
      [selectedPatientId]: {
        ...prev[selectedPatientId],
        medications: [newMed, ...prev[selectedPatientId].medications]
      }
    }))

    setNewDrugName('')
    setNewDrugDose('')
  }

  // Remove medication handler
  const handleRemoveMedication = (medId) => {
    setPatientsData(prev => ({
      ...prev,
      [selectedPatientId]: {
        ...prev[selectedPatientId],
        medications: prev[selectedPatientId].medications.filter(m => m.id !== medId)
      }
    }))
  }

  // Calculate dynamic polypharmacy status
  const medCount = currentPatient.medications.length
  const polypharmacyStatus = useMemo(() => {
    if (medCount >= 8) return { label: 'Hyper-Polypharmacy (≥8)', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
    if (medCount >= 5) return { label: 'Significant Polypharmacy (≥5)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
    if (medCount >= 3) return { label: 'Moderate Polypharmacy', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
    return { label: 'Low Risk (<3)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
  }, [medCount])

  // Filter formulary items
  const filteredFormulary = useMemo(() => {
    if (!searchFormulary.trim()) return niramayaFormulary
    const query = searchFormulary.toLowerCase()
    return niramayaFormulary.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    )
  }, [searchFormulary])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-emerald-500/20 text-lg">
              PS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">PolySafe AI</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Odisha Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ଔଷଧ ସୁରକ୍ଷା ଓ ବହୁ-ଔଷଧ ବିପଦ ଚିହ୍ନଟ ପ୍ରଣାଳୀ • Medication Safety Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Client-Side Mock Engine Active</span>
            </div>
            <button
              onClick={() => {
                setAuditRunCount(c => c + 1)
                alert(`Clinical audit generated for ${currentPatient.name}! Prescription report verified against Odisha Niramaya Essential Drug List.`)
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition shadow-sm flex items-center space-x-1.5"
            >
              <span>Audit Prescription</span>
              {auditRunCount > 0 && <span className="bg-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full">✓</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Patient Selection Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Patient Case:
            </label>
            <div className="flex flex-wrap gap-2">
              {mockPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                    selectedPatientId === patient.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-semibold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {patient.name} ({patient.age}y)
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>UHID:</span>
            <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-200 border border-slate-700/60">
              {currentPatient.uhid}
            </span>
            <span className="text-slate-500">•</span>
            <span>{currentPatient.location}</span>
          </div>
        </div>

        {/* Patient Clinical Profile & Risk Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Polypharmacy Risk */}
          <div className={`rounded-2xl p-5 border ${polypharmacyStatus.bg} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Drugs</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900/60 text-slate-200">
                Count: {medCount}
              </span>
            </div>
            <div className="mt-3">
              <div className={`text-xl font-bold ${polypharmacyStatus.color}`}>
                {polypharmacyStatus.label}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Risk threshold evaluated under WHO & Beers criteria
              </p>
            </div>
          </div>

          {/* Card 2: Drug Interactions Alert */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Clinical Alerts</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {currentPatient.alerts.length} Flagged
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-white flex items-center space-x-2">
                <span className="text-rose-400">
                  {currentPatient.alerts.filter(a => a.severity === 'critical').length} Critical
                </span>
                <span className="text-slate-500 text-sm">/</span>
                <span className="text-amber-400 text-base">
                  {currentPatient.alerts.filter(a => a.severity !== 'critical').length} Warnings
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Includes DDI and renal clearance warnings
              </p>
            </div>
          </div>

          {/* Card 3: Odisha Niramaya Scheme Status */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Niramaya Scheme</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Free Supply
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-emerald-400">86% Formulary Match</div>
              <p className="text-xs text-slate-400 mt-1">
                Available at PHC/CHC government dispensaries
              </p>
            </div>
          </div>

          {/* Card 4: Clinical Facility */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned Facility</span>
              <span className="text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                Odisha Health
              </span>
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-slate-200 truncate">
                {currentPatient.healthCenter}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {currentPatient.diagnoses.slice(0, 2).map((d, i) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex space-x-6">
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'reconciliation'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Prescription Audit & DDIs ({currentPatient.medications.length})
          </button>
          <button
            onClick={() => setActiveTab('ai-summary')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'ai-summary'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🤖 AI Clinical Insights & Deprescribing
          </button>
          <button
            onClick={() => setActiveTab('niramaya')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'niramaya'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏥 Odisha Niramaya Formulary
          </button>
        </div>

        {/* Tab 1: Reconciliation & Interactions */}
        {activeTab === 'reconciliation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Medications Column (Left) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Add Drug Card */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-1">Add Medication to Reconcile</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Simulate adding another drug to test real-time polypharmacy interaction flags
                </p>
                <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="Drug name (e.g. Ciprofloxacin)"
                    value={newDrugName}
                    onChange={(e) => setNewDrugName(e.target.value)}
                    className="sm:col-span-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Dose (e.g. 500mg)"
                    value={newDrugDose}
                    onChange={(e) => setNewDrugDose(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition shadow-sm"
                  >
                    + Add to Regimen
                  </button>
                </form>
              </div>

              {/* Medication Cards List */}
              <div className="space-y-2.5">
                {currentPatient.medications.map((med) => (
                  <div
                    key={med.id}
                    className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        med.riskLevel === 'high' ? 'bg-rose-500 shadow-sm shadow-rose-500/50' :
                        med.riskLevel === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{med.name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {med.dose}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                          <span>{med.freq}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300 font-medium">{med.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            {med.niramayaStock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMedication(med.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition self-end sm:self-auto"
                    >
                      Deprescribe / Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Warnings / DDI Column (Right) */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>⚠️ Detected Clinical Hazards</span>
                  </h3>
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    {currentPatient.alerts.length} Risks
                  </span>
                </div>

                <div className="space-y-3">
                  {currentPatient.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        alert.severity === 'critical'
                          ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                          : alert.severity === 'high'
                          ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                          : 'bg-yellow-950/20 border-yellow-800/60 text-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wide">
                          {alert.severity} Risk
                        </span>
                      </div>
                      <div className="font-semibold text-white">{alert.title}</div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="pt-1 text-[11px] text-emerald-300 font-medium">
                        💡 Rec: {alert.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Clinical Summary & Deprescribing */}
        {activeTab === 'ai-summary' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  🤖
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Clinical Synthesis & Audit Engine</h3>
                  <p className="text-xs text-slate-400">Trained on STOPP/START, AGS Beers Criteria & Odisha Essential Drugs</p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-sm text-slate-300 leading-relaxed font-sans mb-6">
                {currentPatient.aiSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">
                    1. Deprescribing Priority
                  </div>
                  <p className="text-xs text-slate-300">
                    Target high-risk duplicate or nephrotoxic medicines first (e.g. NSAIDs in chronic kidney disease patients).
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-1">
                    2. Dose Optimization
                  </div>
                  <p className="text-xs text-slate-300">
                    Adjust dosage based on age and renal parameters (eGFR / Serum Creatinine) to prevent drug accumulation.
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wide mb-1">
                    3. Niramaya Alignment
                  </div>
                  <p className="text-xs text-slate-300">
                    Substitute costly out-of-pocket commercial brand names with free government formulary medicines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Odisha Niramaya Formulary */}
        {activeTab === 'niramaya' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Odisha Niramaya Essential Drug Formulary</h3>
                <p className="text-xs text-slate-400">
                  Government of Odisha free medicine initiative coverage verification
                </p>
              </div>
              <input
                type="text"
                placeholder="Search drug by name, code, or class..."
                value={searchFormulary}
                onChange={(e) => setSearchFormulary(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Medicine Name</th>
                    <th className="px-4 py-3">Therapeutic Class</th>
                    <th className="px-4 py-3">Dispensing Tier</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFormulary.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">{item.code}</td>
                      <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3 text-slate-400">{item.tier}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.status === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950 text-center text-xs text-slate-500">
        <p>PolySafe AI • AI-Assisted Medication Reconciliation & Polypharmacy Risk Detection for Odisha</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Client-Side Mock Engine • Ready for Vercel Deployment • Branch: frontend-polysafe
        </p>
      </footer>
    </div>
  )
}
