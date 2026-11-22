export const mockPatients = [
  {
    id: 'p1',
    name: 'Patient Case #8841',
    age: 68,
    gender: 'Male',
    location: 'Cuttack, Odisha',
    healthCenter: 'SCB Medical College & Hospital',
    uhid: 'OD-CTC-2024-8841',
    diagnoses: ['Type 2 Diabetes Mellitus', 'Hypertension', 'CKD Stage 3 (eGFR 42)', 'Osteoarthritis Knee'],
    allergies: ['Sulfonamides'],
    medications: [
      { id: 'm1', name: 'Metformin', dose: '1000 mg', freq: 'Twice daily', category: 'Antidiabetic', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'medium' },
      { id: 'm2', name: 'Telmisartan', dose: '40 mg', freq: 'Once daily (morning)', category: 'Antihypertensive', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' },
      { id: 'm3', name: 'Furosemide', dose: '40 mg', freq: 'Once daily (morning)', category: 'Loop Diuretic', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'medium' },
      { id: 'm4', name: 'Diclofenac', dose: '50 mg', freq: 'Twice daily PRN', category: 'NSAID', niramayaStock: 'In Stock (CHC)', riskLevel: 'high' },
      { id: 'm5', name: 'Aspirin (Ecosprin)', dose: '75 mg', freq: 'Once daily', category: 'Antiplatelet', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'medium' },
      { id: 'm6', name: 'Pantoprazole', dose: '40 mg', freq: 'Once daily (before food)', category: 'Proton Pump Inhibitor', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' },
      { id: 'm7', name: 'Calcium + Vit D3', dose: '500 mg', freq: 'Once daily', category: 'Supplement', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' }
    ],
    alerts: [
      {
        id: 'a1',
        severity: 'critical',
        title: 'High Risk "Triple Whammy" Nephrotoxicity',
        description: 'Combination of Telmisartan (ARB) + Furosemide (Diuretic) + Diclofenac (NSAID) significantly impairs glomerular filtration and may precipitate acute kidney injury (AKI) in CKD Stage 3.',
        action: 'Discontinue oral Diclofenac. Substitute with Paracetamol 500mg or topical analgesic.'
      },
      {
        id: 'a2',
        severity: 'high',
        title: 'Elevated GI Bleeding Risk',
        description: 'Concurrent use of Aspirin 75mg and Diclofenac 50mg multiplies upper gastrointestinal ulceration and bleeding risk, especially in patients aged >65.',
        action: 'Review necessity of NSAID. If pain management requires NSAID, co-prescribe gastroprotection and monitor hemoglobin.'
      },
      {
        id: 'a3',
        severity: 'warning',
        title: 'Metformin Dose Review in Renal Impairment',
        description: 'Patient eGFR is 42 mL/min/1.73m². Maximum recommended Metformin daily dose is 1000 mg (patient currently receives 2000 mg/day).',
        action: 'Reduce Metformin dose to 500 mg BD or switch to Linagliptin.'
      }
    ],
    aiSummary: 'Patient presents with severe polypharmacy (7 active medicines). Acute renal risk identified due to concurrent ARB + Diuretic + NSAID in the setting of baseline CKD 3. Recommend immediate deprescribing of Diclofenac and dose adjustment of Metformin.'
  },
  {
    id: 'p2',
    name: 'Patient Case #3910',
    age: 74,
    gender: 'Female',
    location: 'Puri, Odisha',
    healthCenter: 'District Headquarters Hospital, Puri',
    uhid: 'OD-PRI-2024-3910',
    diagnoses: ['Non-valvular Atrial Fibrillation', 'Ischemic Heart Disease', 'Osteoporosis', 'Insomnia'],
    allergies: ['Penicillin'],
    medications: [
      { id: 'm201', name: 'Warfarin', dose: '3 mg', freq: 'Once daily at night', category: 'Anticoagulant', niramayaStock: 'In Stock (DHH)', riskLevel: 'high' },
      { id: 'm202', name: 'Amiodarone', dose: '200 mg', freq: 'Once daily', category: 'Antiarrhythmic', niramayaStock: 'Special Indent', riskLevel: 'high' },
      { id: 'm203', name: 'Atorvastatin', dose: '20 mg', freq: 'At bedtime', category: 'Statin', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' },
      { id: 'm204', name: 'Alprazolam', dose: '0.25 mg', freq: 'At bedtime PRN', category: 'Benzodiazepine', niramayaStock: 'Restricted Supply', riskLevel: 'high' },
      { id: 'm205', name: 'Alendronate', dose: '70 mg', freq: 'Weekly once', category: 'Bisphosphonate', niramayaStock: 'In Stock (DHH)', riskLevel: 'medium' }
    ],
    alerts: [
      {
        id: 'a201',
        severity: 'critical',
        title: 'Severe Warfarin & Amiodarone Interaction',
        description: 'Amiodarone inhibits CYP2C9 and CYP3A4, substantially elevating Warfarin plasma concentration and INR, risking catastrophic bleeding.',
        action: 'Reduce Warfarin dose by 30-50% and monitor INR every 48-72 hours.'
      },
      {
        id: 'a202',
        severity: 'high',
        title: 'Beers Criteria Alert: Alprazolam in Geriatric Patient',
        description: 'Benzodiazepines in elderly patients increase risk of falls, hip fractures, motor impairment, and cognitive decline.',
        action: 'Consider tapering Alprazolam; implement non-pharmacological sleep hygiene protocols.'
      }
    ],
    aiSummary: 'Critical anticoagulation interaction detected (Warfarin + Amiodarone). Fall-risk medication (Alprazolam) flagged under AGS Beers Criteria for elderly patients.'
  },
  {
    id: 'p3',
    name: 'Patient Case #5120',
    age: 61,
    gender: 'Male',
    location: 'Berhampur, Ganjam, Odisha',
    healthCenter: 'MKCG Medical College & Hospital',
    uhid: 'OD-GJM-2024-5120',
    diagnoses: ['COPD GOLD Stage II', 'Benign Prostatic Hyperplasia (BPH)', 'Hypertension'],
    allergies: ['No Known Drug Allergies'],
    medications: [
      { id: 'm301', name: 'Tiotropium Inhaler', dose: '18 mcg', freq: 'Once daily', category: 'LAMA Anticholinergic', niramayaStock: 'In Stock (DHH/Medical College)', riskLevel: 'low' },
      { id: 'm302', name: 'Tamsulosin', dose: '0.4 mg', freq: 'Once daily at night', category: 'Alpha-1 Blocker', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' },
      { id: 'm303', name: 'Amlodipine', dose: '5 mg', freq: 'Once daily', category: 'Calcium Channel Blocker', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'low' },
      { id: 'm304', name: 'Cetirizine', dose: '10 mg', freq: 'Once daily PRN', category: 'Antihistamine', niramayaStock: 'In Stock (PHC/CHC)', riskLevel: 'medium' }
    ],
    alerts: [
      {
        id: 'a301',
        severity: 'warning',
        title: 'Cumulative Anticholinergic Burden in BPH',
        description: 'Tiotropium and systemic Cetirizine exert additive anticholinergic effects that may worsen urinary retention in patients with BPH.',
        action: 'Monitor urinary flow symptoms; avoid first-generation antihistamines or optimize inhaler technique.'
      }
    ],
    aiSummary: 'Mild polypharmacy with moderate anticholinergic risk in underlying BPH. Prescription is generally well-reconciled with high Odisha Niramaya formulary compliance.'
  }
];

export const niramayaFormulary = [
  { code: 'NIR-001', name: 'Paracetamol 500mg', category: 'Analgesic', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-014', name: 'Metformin 500mg', category: 'Antidiabetic', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-022', name: 'Telmisartan 40mg', category: 'Antihypertensive', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-035', name: 'Amlodipine 5mg', category: 'Antihypertensive', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-049', name: 'Atorvastatin 20mg', category: 'Lipid-lowering', tier: 'CHC / DHH', status: 'Available' },
  { code: 'NIR-061', name: 'Aspirin 75mg', category: 'Antiplatelet', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-082', name: 'Pantoprazole 40mg', category: 'Gastroprotective', tier: 'PHC / CHC / DHH', status: 'Available' },
  { code: 'NIR-103', name: 'Diclofenac 50mg', category: 'NSAID', tier: 'CHC / DHH (Caution Flagged)', status: 'Restricted' }
];
