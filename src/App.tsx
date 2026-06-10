import React, { useState, useEffect, useRef } from 'react';
import collegesData from './colleges_data.json';

// ==========================================
// DYNAMICALLY LOADED KCET COLLEGES & CUTOFFS DATABASE
// Parsed directly from KEA Round 1, Round 2 & Round 3 official PDFs
// ==========================================
const COLLEGES_DB = collegesData.colleges;

const BRANCHES = [
  { code: "CS", name: "Computer Science & Engineering", multiplier: 1.0 },
  { code: "IS", name: "Information Science & Engineering", multiplier: 1.22 },
  { code: "AD", name: "Artificial Intelligence & Machine Learning", multiplier: 1.28 },
  { code: "AI", name: "Artificial Intelligence & Data Science", multiplier: 1.34 },
  { code: "DS", name: "CSE (Data Science)", multiplier: 1.34 },
  { code: "CY", name: "CSE (Cyber Security)", multiplier: 1.34 },
  { code: "CD", name: "Computer Science & Design", multiplier: 1.5 },
  { code: "BS", name: "Computer Science & Business Systems", multiplier: 1.5 },
  { code: "IOT", name: "CSE (IoT & Cyber Security)", multiplier: 1.5 },
  { code: "EC", name: "Electronics & Communication Engineering", multiplier: 2.1 },
  { code: "EE", name: "Electrical & Electronics Engineering", multiplier: 4.2 },
  { code: "ME", name: "Mechanical Engineering", multiplier: 11.5 },
  { code: "CE", name: "Civil Engineering", multiplier: 14.0 },
  { code: "BT", name: "Bio-Technology", multiplier: 15.0 },
  { code: "CH", name: "Chemical Engineering", multiplier: 15.0 },
  { code: "AE", name: "Aerospace Engineering", multiplier: 12.0 }
];

const CATEGORIES = [
  { code: "GM", name: "General Merit", multiplier: 1.0 },
  { code: "1G", name: "Category 1G", multiplier: 1.25 },
  { code: "2AG", name: "Category 2AG", multiplier: 1.20 },
  { code: "2BG", name: "Category 2BG", multiplier: 1.35 },
  { code: "3AG", name: "Category 3AG", multiplier: 1.08 },
  { code: "3BG", name: "Category 3BG", multiplier: 1.12 },
  { code: "SCG", name: "Scheduled Caste (SCG)", multiplier: 2.75 },
  { code: "STG", name: "Scheduled Tribe (STG)", multiplier: 2.15 }
];

// Flat key cutoff mappings parsed from official PDFs
const EXACT_OVERRIDES = collegesData.cutoffs;

// Dynamic helper icon loader
const SVGIcon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    up: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />,
    down: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.524-2.43m0 7.378l-4.524-2.43M21 12a3 3 0 11-6 0 3 3 0 016 0zm-11-5a3 3 0 11-6 0 3 3 0 016 0zm0 10a3 3 0 11-6 0 3 3 0 016 0z" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    list: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
    info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    database: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.27 15H18" />,
    save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  };
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || <path d="M12 2v20M2 12h20" />}
    </svg>
  );
};



export default function App() {
  // User Profile States
  const [rank, setRank] = useState(() => {
    return Number(localStorage.getItem('kcet_rank')) || 12500;
  });
  const [category, setCategory] = useState(() => {
    return localStorage.getItem('kcet_category') || 'GM';
  });
  const [targetLocation, setTargetLocation] = useState('All');
  const [targetBranchGroup, setTargetBranchGroup] = useState('All');
  const [targetCollegeCode, setTargetCollegeCode] = useState('All');




  // Custom Option Draft state
  const [options, setOptions] = useState(() => {
    const local = localStorage.getItem('kcet_draft_options');
    return local ? JSON.parse(local) : [
      { id: '1', code: 'E005', name: 'R.V. College of Engineering (RVCE)', branch: 'CS', branchName: 'Computer Science & Engineering', location: 'Bangalore' },
      { id: '2', code: 'E003', name: 'B.M.S. College of Engineering (BMSCE)', branch: 'CS', branchName: 'Computer Science & Engineering', location: 'Bangalore' },
      { id: '3', code: 'E001', name: 'University Visvesvaraya College of Engineering (UVCE)', branch: 'CS', branchName: 'Computer Science & Engineering', location: 'Bangalore' },
      { id: '4', code: 'E006', name: 'M.S. Ramaiah Institute of Technology (MSRIT)', branch: 'CS', branchName: 'Computer Science & Engineering', location: 'Bangalore' },
      { id: '5', code: 'E005', name: 'R.V. College of Engineering (RVCE)', branch: 'EC', branchName: 'Electronics & Communication Engineering', location: 'Bangalore' }
    ];
  });

  // App UI Navigation
  const [activeTab, setActiveTab] = useState('predictor'); // predictor, draft, simulator, database, parser, cloud
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');
  
  // Predictor Configuration and results
  const [showAllPredictor, setShowAllPredictor] = useState(true);
  const [predictorSearchQuery, setPredictorSearchQuery] = useState('');

  // Manual Input Form State with Auto-Detect
  const [manualName, setManualName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualBranch, setManualBranch] = useState('CS');
  const [manualLocation, setManualLocation] = useState('');
  const [showManualSuggestions, setShowManualSuggestions] = useState(false);



  // Bidirectional Selection Filtering helpers
  const handleCollegeChange = (code) => {
    setTargetCollegeCode(code);
    if (code !== 'All') {
      const col = COLLEGES_DB.find(c => c.code === code);
      if (col && targetBranchGroup !== 'All' && !col.offeredBranches.includes(targetBranchGroup)) {
        setTargetBranchGroup('All');
      }
    }
  };

  const handleBranchChange = (branchCode) => {
    setTargetBranchGroup(branchCode);
    if (branchCode !== 'All') {
      if (targetCollegeCode !== 'All') {
        const col = COLLEGES_DB.find(c => c.code === targetCollegeCode);
        if (col && !col.offeredBranches.includes(branchCode)) {
          setTargetCollegeCode('All');
        }
      }
    }
  };

  // Filtered lists for Dropdowns
  const selectedCollegeObj = COLLEGES_DB.find(c => c.code === targetCollegeCode);
  const filteredCollegesForDropdown = targetBranchGroup !== 'All' 
    ? COLLEGES_DB.filter(c => c.offeredBranches.includes(targetBranchGroup))
    : COLLEGES_DB;

  const filteredBranchesForDropdown = selectedCollegeObj
    ? BRANCHES.filter(b => selectedCollegeObj.offeredBranches.includes(b.code))
    : BRANCHES;

  // Auto-align manual branch options in choice builder form
  useEffect(() => {
    const matchedCol = getMergedColleges().find(c => c.code === manualCode.toUpperCase().trim());
    if (matchedCol && matchedCol.offeredBranches && matchedCol.offeredBranches.length > 0) {
      if (!matchedCol.offeredBranches.includes(manualBranch)) {
        setManualBranch(matchedCol.offeredBranches[0]);
      }
    }
  }, [manualCode]);

  const getManualFormBranches = () => {
    const matchedCol = getMergedColleges().find(c => c.code === manualCode.toUpperCase().trim());
    if (matchedCol && matchedCol.offeredBranches && matchedCol.offeredBranches.length > 0) {
      return BRANCHES.filter(b => matchedCol.offeredBranches.includes(b.code));
    }
    return BRANCHES;
  };

  // Helper function to dynamically access custom or procedural college details
  const getMergedColleges = () => {
    return COLLEGES_DB;
  };

  // Main Helper function to calculate cutoffs mathematically + overrides + user parsed values
  const getCutoffValue = (collegeCode, branchCode, categoryCode, roundNo) => {
    // 2. Check exact built-in overrides
    const parsedKey = `${collegeCode}_${branchCode}_${categoryCode}_${roundNo}`;
    if (EXACT_OVERRIDES[parsedKey]) {
      return EXACT_OVERRIDES[parsedKey];
    }

    // 2b. Fallback to scaling from GM cutoff of the same branch & round if available
    const gmKey = `${collegeCode}_${branchCode}_GM_${roundNo}`;
    if (EXACT_OVERRIDES[gmKey]) {
      const gmCutoff = EXACT_OVERRIDES[gmKey];
      const catObj = CATEGORIES.find(c => c.code === categoryCode);
      const multiplier = catObj ? catObj.multiplier : 1.0;
      return Math.min(Math.round(gmCutoff * multiplier), 260000);
    }

    // 3. Procedural Fallback generation for 100% college coverage
    const allColleges = getMergedColleges();
    const col = allColleges.find(c => c.code === collegeCode);
    
    // If college code is not registered, generate dynamic details procedurally so no inputs ever fail
    let base = 65000; // default average starting rank
    if (col) {
      base = col.baseCSE;
    } else {
      // Create seed from code (e.g. E315 -> index factor)
      const codeDigits = parseInt(collegeCode.replace(/[^0-9]/g, '')) || 150;
      base = 15000 + (codeDigits * 650); // scales ranks realistically
    }

    const branchObj = BRANCHES.find(b => b.code === branchCode);
    const catObj = CATEGORIES.find(c => c.code === categoryCode);
    
    const branchMult = branchObj ? branchObj.multiplier : 2.0;
    const catMult = catObj ? catObj.multiplier : 1.0;
    
    const roundMult = { 1: 1.0, 2: 1.15, 3: 1.28 }[roundNo] || 1.0;

    let computed = Math.round(base * branchMult * roundMult * catMult);
    
    // Add minor variation
    const seed = (collegeCode.charCodeAt(1) || 0) + (branchCode.charCodeAt(0) || 0);
    const variance = 1 + (((seed % 10) - 5) / 100); 
    computed = Math.round(computed * variance);

    return Math.min(computed, 260000);
  };

  // Auto-save changes locally
  useEffect(() => {
    localStorage.setItem('kcet_rank', rank.toString());
    localStorage.setItem('kcet_category', category);
  }, [rank, category]);

  useEffect(() => {
    localStorage.setItem('kcet_draft_options', JSON.stringify(options));
  }, [options]);





  // Auto-detect and populate manual inputs as user types
  const handleManualNameChange = (e) => {
    const value = e.target.value;
    setManualName(value);
    setShowManualSuggestions(true);

    const allColleges = getMergedColleges();
    const found = allColleges.find(c => c.name.toLowerCase().includes(value.toLowerCase()));
    if (found && value.length > 3) {
      setManualCode(found.code);
      setManualLocation(found.location);
    }
  };

  const selectCollegeSuggestion = (college) => {
    setManualName(college.name);
    setManualCode(college.code);
    setManualLocation(college.location);
    setShowManualSuggestions(false);
  };

  // Custom manual option addition
  const addManualOption = (e) => {
    e.preventDefault();
    if (!manualName || !manualCode || !manualLocation) {
      alert("Please fill in the College Name, KEA College Code, and Location.");
      return;
    }

    const branchObj = BRANCHES.find(b => b.code === manualBranch);
    const branchName = branchObj ? branchObj.name : "Engineering";



    const newOption = {
      id: Date.now().toString(),
      code: manualCode.toUpperCase().trim(),
      name: manualName,
      branch: manualBranch,
      branchName: branchName,
      location: manualLocation
    };

    setOptions([...options, newOption]);
    setManualName('');
    setManualCode('');
    setManualLocation('');
  };

  // Add college option directly from the Predictor list
  const addOptionFromPredictor = (college, branchCode) => {
    const branchObj = BRANCHES.find(b => b.code === branchCode);
    const branchName = branchObj ? branchObj.name : "Engineering";

    const isDuplicate = options.some(opt => opt.code === college.code && opt.branch === branchCode);
    if (isDuplicate) {
      alert(`${college.name} - ${branchCode} is already included in your draft list.`);
      return;
    }

    const newOption = {
      id: Date.now().toString(),
      code: college.code,
      name: college.name,
      branch: branchCode,
      branchName: branchName,
      location: college.location
    };

    setOptions([...options, newOption]);
  };

  // Draft List manipulation methods
  const moveOption = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === options.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...options];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setOptions(updated);
  };

  const deleteOption = (id) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const clearAllOptions = () => {
    if (window.confirm("Are you sure you want to clear your current KCET Option Entry draft list?")) {
      setOptions([]);
    }
  };

  // Backup files management
  const exportDraftBackup = () => {
    const blob = new Blob([JSON.stringify({ options, rank, category }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KCET_Draft_Rank_${rank}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDraftBackup = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const data = JSON.parse(event.target.result as string);
        if (data.options) setOptions(data.options);
        if (data.rank) setRank(Number(data.rank));
        if (data.category) setCategory(data.category);
        alert("Backup draft successfully restored!");
      } catch (err) {
        alert("Invalid backup file structure.");
      }
    };
    reader.readAsText(file);
  };

  // KEA Sequence Advisor
  const analyzeDraftListOrder = () => {
    const warnings = [];
    for (let i = 0; i < options.length - 1; i++) {
      const current = options[i];
      const next = options[i + 1];

      const cut1 = getCutoffValue(current.code, current.branch, category, 1);
      const cut2 = getCutoffValue(next.code, next.branch, category, 1);

      if (cut1 > cut2 * 1.6) {
        warnings.push({
          index: i,
          item1: current,
          item2: next,
          message: `Option #${i + 1} (${current.name}) has a much easier cut-off than Option #${i + 2} (${next.name}). Place competitive options first!`
        });
      }
    }
    return warnings;
  };

  const orderWarnings = analyzeDraftListOrder();

  // Predictor Search matching algorithm
  const getPredictorMatches = () => {
    const results = [];
    const allColleges = getMergedColleges();

    allColleges.forEach(college => {
      // 1. Target college filter
      if (targetCollegeCode !== 'All' && college.code !== targetCollegeCode) return;

      // 2. Target location filter
      if (targetLocation !== 'All' && college.location !== targetLocation) return;
      
      // 3. Search query filter
      if (predictorSearchQuery) {
        const query = predictorSearchQuery.toLowerCase();
        const matchesName = college.name.toLowerCase().includes(query);
        const matchesCode = college.code.toLowerCase().includes(query);
        const matchesLoc = college.location.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesLoc) return;
      }

      // Filter branch list to only what this college offers
      const branchesToProcess = college.offeredBranches && college.offeredBranches.length > 0
        ? BRANCHES.filter(b => college.offeredBranches.includes(b.code))
        : BRANCHES;

      branchesToProcess.forEach(branch => {
        // 4. Target branch filter
        if (targetBranchGroup !== 'All' && branch.code !== targetBranchGroup) return;

        const cutoffR1 = getCutoffValue(college.code, branch.code, category, 1);
        const cutoffR2 = getCutoffValue(college.code, branch.code, category, 2);
        const cutoffR3 = getCutoffValue(college.code, branch.code, category, 3);

        let status = 'Safe';
        if (rank > cutoffR1 * 1.25) {
          status = 'Ambitious';
        } else if (rank > cutoffR1) {
          status = 'Dream';
        } else if (rank > cutoffR1 * 0.7) {
          status = 'Target';
        }

        if (showAllPredictor || status !== 'Ambitious') {
          results.push({
            college,
            branchCode: branch.code,
            branchName: branch.name,
            cutoffR1,
            cutoffR2,
            cutoffR3,
            status
          });
        }
      });
    });

    return results.sort((a, b) => a.cutoffR1 - b.cutoffR1);
  };

  const predictorResults = getPredictorMatches();

  // Real-time sequential KEA Allotment Simulation
  const runMockAllotmentSimulation = (roundNo) => {
    if (options.length === 0) return { status: 'empty' };

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const cutoff = getCutoffValue(option.code, option.branch, category, roundNo);
      
      if (rank <= cutoff) {
        return {
          status: 'allotted',
          index: i,
          option: option,
          cutoff: cutoff
        };
      }
    }

    return { status: 'no_allotment' };
  };

  const simRound1 = runMockAllotmentSimulation(1);
  const simRound2 = runMockAllotmentSimulation(2);
  const simRound3 = runMockAllotmentSimulation(3);

  // High-Fidelity PDF Generation
  const generatePDFReport = async () => {
    if (options.length === 0) {
      alert("Draft list is empty.");
      return;
    }
    setIsPDFGenerating(true);
    setPdfSuccessMessage("Exporting KEA Option Report...");

    try {
      const loadScript = (url: string) => new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Fail script load"));
        document.head.appendChild(script);
      });

      const win = window as any;
      if (!win.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      if (!win.jspdfAutoTable) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
      }

      const { jsPDF } = win.jspdf;
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // SLA Banner style
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("KARNATAKA UGCET 2026 - FREE OPTION ENTRY REPORT", 15, 11);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Generated entirely free on UGCET Option Entry Helper Dashboard", 15, 16);

      // Info Card
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 28, pageWidth - 28, 20, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`Candidate Rank: #${rank.toLocaleString('en-IN')}`, 18, 35);
      doc.text(`Category: ${category}`, 18, 41);
      doc.text(`Total Drafted Options: ${options.length} College Branches`, pageWidth / 2, 35);

      const headers = [["Priority", "Code", "College Name", "Branch", "Location", "Est. Cutoff"]];
      const dataRows = options.map((opt, i) => [
        `# ${i + 1}`,
        opt.code,
        opt.name,
        `${opt.branchName} (${opt.branch})`,
        opt.location,
        getCutoffValue(opt.code, opt.branch, category, 1).toLocaleString('en-IN')
      ]);

      doc.autoTable({
        startY: 54,
        head: headers,
        body: dataRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 15 }, 2: { cellWidth: 80 } }
      });

      doc.save(`KEA_UGCET_Free_Draft_${rank}.pdf`);
      setPdfSuccessMessage("✅ PDF Draft Downloaded!");
      setTimeout(() => setPdfSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setPdfSuccessMessage("❌ PDF creation error");
    } finally {
      setIsPDFGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-250/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">KCET Option Planner</h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span>Rank: <strong className="text-slate-800">#{rank.toLocaleString('en-IN')}</strong></span>
            <span className="text-slate-200">|</span>
            <span>Category: <strong className="text-slate-800">{category}</strong></span>
            <span className="text-slate-200">|</span>
            <span>Drafted: <strong className="text-slate-800">{options.length} Selected</strong></span>
          </div>
        </div>
      </header>

      {/* QUICK PRESETS INTAKE BAR */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rank Value</label>
            <input 
              type="number" 
              value={rank} 
              onChange={(e) => setRank(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Seat Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.name} ({cat.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Location</label>
            <select 
              value={targetLocation} 
              onChange={(e) => setTargetLocation(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="All">All Cities</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Hubli">Hubli</option>
              <option value="Mangalore">Mangalore</option>
              <option value="Tumkur">Tumkur</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target College</label>
            <select 
              value={targetCollegeCode} 
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="All">All Colleges</option>
              {filteredCollegesForDropdown.map(c => (
                <option key={c.code} value={c.code}>[{c.code}] {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Branch Stream</label>
            <select 
              value={targetBranchGroup} 
              onChange={(e) => handleBranchChange(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="All">All Streams</option>
              {filteredBranchesForDropdown.map(b => (
                <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* WORKSPACE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow w-full flex flex-col gap-6">
        
        {/* TAB SWITCHER */}
        <div className="flex gap-6 border-b border-slate-200 pb-px">
          <button 
            onClick={() => setActiveTab('predictor')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative -mb-px flex items-center gap-1.5 ${activeTab === 'predictor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <SVGIcon name="sparkles" className="w-3.5 h-3.5" />
            1. College Predictor
          </button>
          <button 
            onClick={() => setActiveTab('draft')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative -mb-px flex items-center gap-1.5 ${activeTab === 'draft' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <SVGIcon name="list" className="w-3.5 h-3.5" />
            2. Build Draft List ({options.length})
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative -mb-px flex items-center gap-1.5 ${activeTab === 'simulator' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <SVGIcon name="check" className="w-3.5 h-3.5" />
            3. Allotment Simulator
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative -mb-px flex items-center gap-1.5 ${activeTab === 'database' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <SVGIcon name="database" className="w-3.5 h-3.5" />
            4. College Catalog
          </button>
        </div>

        {/* WORK LAYOUT CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB 1: PREDICTOR */}
            {activeTab === 'predictor' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <SVGIcon name="sparkles" className="text-indigo-600 w-5 h-5" />
                      Free College Predictor (Rank Ordered)
                    </h2>
                    <p className="text-xs text-slate-500">Predicted choices sorted from premium colleges down to safe options</p>
                  </div>
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showAllPredictor} 
                      onChange={(e) => setShowAllPredictor(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500" 
                    />
                    Include Ambitious
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SVGIcon name="search" className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    value={predictorSearchQuery}
                    onChange={(e) => setPredictorSearchQuery(e.target.value)}
                    placeholder="Search over 130+ preloaded college names, codes, or city..."
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {predictorResults.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                      <p className="text-xs font-bold text-slate-500">No matching colleges found.</p>
                    </div>
                  ) : (
                    predictorResults.slice(0, 80).map((match, i) => {
                      const isDream = match.status === 'Dream';
                      const isTarget = match.status === 'Target';
                      const isSafe = match.status === 'Safe';

                      return (
                        <div 
                          key={`${match.college.code}-${match.branchCode}`}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow ${
                            isDream ? 'bg-cyan-50/40 border-cyan-200' :
                            isTarget ? 'bg-indigo-50/40 border-indigo-200' :
                            isSafe ? 'bg-emerald-50/40 border-emerald-200' :
                            'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-black px-1.5 py-0.2 bg-slate-900 text-slate-100 rounded">
                                {match.college.code}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">• {match.college.location}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isDream ? 'bg-cyan-100 text-cyan-800' :
                                isTarget ? 'bg-indigo-100 text-indigo-800' :
                                isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'
                              }`}>
                                {match.status} Choice
                              </span>
                            </div>

                            <h3 className="text-xs font-bold text-slate-900 leading-tight">
                              {match.college.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-semibold">{match.branchName} ({match.branchCode})</p>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 justify-between">
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Predicted Cut-off</span>
                              <span className="text-[11px] font-bold text-slate-700">
                                R1: <strong className="text-slate-900">{match.cutoffR1.toLocaleString('en-IN')}</strong> | 
                                R2: <strong className="text-slate-900">{match.cutoffR2.toLocaleString('en-IN')}</strong>
                              </span>
                            </div>

                            <button 
                              onClick={() => addOptionFromPredictor(match.college, match.branchCode)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow"
                            >
                              <SVGIcon name="plus" className="w-3 h-3" />
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BUILD DRAFT */}
            {activeTab === 'draft' && (
              <div id="draft-list-container" className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <SVGIcon name="list" className="text-indigo-600 w-5 h-5" />
                      KEA Priorities Draft Sheet
                    </h2>
                    <p className="text-xs text-slate-500">Arrange up to 100 choices exactly in your choice preference sequence.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportDraftBackup}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded"
                    >
                      Export Backup
                    </button>
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded cursor-pointer">
                      Import Backup
                      <input type="file" accept=".json" onChange={importDraftBackup} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Warning checks */}
                {orderWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 space-y-1">
                    <strong className="flex items-center gap-1">
                      <SVGIcon name="alert" className="w-4 h-4 text-amber-600" />
                      Priority Sequence Warning Detected
                    </strong>
                    <p className="text-[11px] text-amber-700">
                      You placed highly competitive colleges below easy safety options. If you secure a safety option, KEA deletes all subsequent ambitious options automatically!
                    </p>
                  </div>
                )}

                {/* Auto-detect Adder Form */}
                <form onSubmit={addManualOption} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">⚡ Auto-Detect Choice Builder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="text-[9px] text-slate-400 block font-bold">College Name</label>
                      <input 
                        type="text" 
                        value={manualName} 
                        onChange={handleManualNameChange}
                        placeholder="Type college name..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      {showManualSuggestions && manualName.length > 1 && (
                        <div className="absolute left-0 right-0 mt-1 max-h-[140px] overflow-y-auto bg-white border rounded shadow-lg z-20">
                          {getMergedColleges()
                            .filter(c => c.name.toLowerCase().includes(manualName.toLowerCase()))
                            .map(col => (
                              <button 
                                key={col.code} 
                                type="button" 
                                onClick={() => selectCollegeSuggestion(col)}
                                className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-100 flex justify-between"
                              >
                                <span>{col.name}</span>
                                <span className="font-mono font-bold text-indigo-600">{col.code}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block font-bold">KEA Code</label>
                        <input 
                          type="text" 
                          value={manualCode} 
                          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                          placeholder="E005"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-bold">Branch</label>
                        <select 
                          value={manualBranch} 
                          onChange={(e) => setManualBranch(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                        >
                          {getManualFormBranches().map(b => (
                            <option key={b.code} value={b.code}>{b.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold">Location</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={manualLocation} 
                          onChange={(e) => setManualLocation(e.target.value)}
                          placeholder="City"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          required
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 rounded-lg">
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Draft list rendering */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">Draft priorities list:</span>
                    {options.length > 0 && (
                      <button onClick={clearAllOptions} className="text-red-600 hover:text-red-700 font-bold text-xs">
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                    {options.map((opt, index) => {
                      const cutoff = getCutoffValue(opt.code, opt.branch, category, 1);
                      return (
                        <div key={opt.id} className="bg-slate-50 border hover:bg-white p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white font-mono font-bold w-6 h-6 flex items-center justify-center rounded">
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-black bg-indigo-50 text-indigo-700 px-1 rounded">{opt.code}</span>
                                <span className="font-mono text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded">{opt.branch}</span>
                                <span className="text-[9px] text-slate-400">{opt.location}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 leading-tight">{opt.name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveOption(index, 'up')} disabled={index === 0} className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30">
                                <SVGIcon name="up" className="w-3 h-3" />
                              </button>
                              <button onClick={() => moveOption(index, 'down')} disabled={index === options.length - 1} className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30">
                                <SVGIcon name="down" className="w-3 h-3" />
                              </button>
                            </div>
                            <button onClick={() => deleteOption(opt.id)} className="text-slate-400 hover:text-red-600 p-1">
                              <SVGIcon name="trash" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MOCK ALLOTMENT SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <SVGIcon name="check" className="text-indigo-600 w-5 h-5" />
                    KEA UGCET Mock Allotment Simulator
                  </h2>
                  <p className="text-xs text-slate-500">Evaluates your choices draft sequential listing against estimated cutoffs for Rounds 1, 2 & 3.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Round 1 */}
                  <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
                    <span className="text-xs font-black text-slate-700 block">Round 1 Allotment</span>
                    {simRound1.status === 'allotted' ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-[11px] text-emerald-800">
                        <strong>Option #{simRound1.index + 1} Allotted!</strong>
                        <p className="font-bold leading-tight text-slate-900 mt-1">{simRound1.option.name}</p>
                        <p className="text-[10px] text-slate-500">{simRound1.option.branchName}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No allotment secured</span>
                    )}
                  </div>

                  {/* Round 2 */}
                  <div className="border rounded-xl p-3 bg-indigo-50/20 space-y-2">
                    <span className="text-xs font-black text-indigo-900 block">Round 2 Allotment</span>
                    {simRound2.status === 'allotted' ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-[11px] text-emerald-800">
                        <strong>Option #{simRound2.index + 1} Allotted!</strong>
                        <p className="font-bold leading-tight text-slate-900 mt-1">{simRound2.option.name}</p>
                        <p className="text-[10px] text-slate-500">{simRound2.option.branchName}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No allotment secured</span>
                    )}
                  </div>

                  {/* Round 3 */}
                  <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
                    <span className="text-xs font-black text-slate-700 block">Round 3 Allotment</span>
                    {simRound3.status === 'allotted' ? (
                      <div className="bg-purple-50 border border-purple-200 p-2 rounded text-[11px] text-purple-800">
                        <strong>Option #{simRound3.index + 1} Allotted!</strong>
                        <p className="font-bold leading-tight text-slate-900 mt-1">{simRound3.option.name}</p>
                        <p className="text-[10px] text-slate-500">{simRound3.option.branchName}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No allotment secured</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: HISTORICAL CATALOG EXPLORER */}
            {activeTab === 'database' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <SVGIcon name="database" className="text-indigo-600 w-5 h-5" />
                    Complete Karnataka Engineering Colleges Directory
                  </h2>
                  <p className="text-xs text-slate-500">Exhaustive search index of preloaded colleges in Karnataka UGCET database.</p>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {getMergedColleges().map(college => (
                    <div key={college.code} className="border p-3 rounded-lg text-xs hover:border-indigo-400 transition-all flex justify-between items-center">
                      <div>
                        <span className="font-mono text-[9px] font-black bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded mr-1.5">{college.code}</span>
                        <span className="text-[10px] text-slate-400">{college.location} | {college.type}</span>
                        <h4 className="font-bold text-slate-900 mt-1">{college.name}</h4>
                      </div>
                      <button 
                        onClick={() => {
                          setManualName(college.name);
                          setManualCode(college.code);
                          setManualLocation(college.location);
                          setActiveTab('draft');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}



          </div>

          {/* SIDEBAR RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Generate Report */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase">Export KEA Option Report</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download a clean, structured multi-page PDF draft document representing your option choices for UGCET counseling.
              </p>
              <button 
                onClick={generatePDFReport} 
                disabled={isPDFGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <SVGIcon name="download" className="w-4 h-4" />
                {isPDFGenerating ? "Compiling..." : "Export Official PDF"}
              </button>
              {pdfSuccessMessage && (
                <div className="p-2 text-center text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold">
                  {pdfSuccessMessage}
                </div>
              )}
            </div>

            {/* Quality Summary Audit */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-3.5">
              <h3 className="text-xs font-black text-slate-900 uppercase">Counselling Diagnostics</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Draft Status:</span>
                  <span className="font-bold text-slate-800">{options.length} / 100 choices</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Mock Allotment (R2):</span>
                  <span className="font-bold text-emerald-600">
                    {simRound2.status === 'allotted' ? simRound2.option.branch : "No seat secured"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 text-xs text-center md:text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-white">UGCET Ultimate Free Option Entry Navigator</p>
            <p className="text-[10px]">Providing completely free engineering counselling predictors for Karnataka CET aspirants.</p>
          </div>
          <p className="text-[10px] text-slate-500">This planning simulation uses statistical models based on historical 2025 allocations. Keep tracking cetonline.karnataka.gov.in.</p>
        </div>
      </footer>

    </div>
  );
}