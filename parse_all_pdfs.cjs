const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const CATEGORY_COLUMNS = {
  "1G": 0,
  "2AG": 3,
  "2BG": 6,
  "3AG": 9,
  "3BG": 12,
  "GM": 15,
  "SCG": 18,
  "STG": 21
};

const BRANCH_MAP = [
  // Specializations
  { code: "AD", keywords: ["ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", "AIML", "AI & ML", "AI AND ML", "AI AND MACHINE LEARNING", "AI & MACHINE LEARNING"] },
  { code: "AI", keywords: ["ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", "ARTIFICIAL INTELLIGENCE & DATA SCIENCE", "AIDS", "AI & DS", "AI AND DS", "AI AND DATA SCIENCE", "AI & DATA SCIENCE"] },
  { code: "DS", keywords: ["DATA SCIENCE", "DATA-SCIENCE", "DAT A SCIENCE", "DATA SCI"] },
  { code: "CY", keywords: ["CYBER SECURITY", "CYBER-SECURITY", "CYB ER SECURITY", "CYBER SECURITY"] },
  { code: "CD", keywords: ["DESIGN", "COMPUTER SCIENCE AND DESIGN", "CSD"] },
  { code: "BS", keywords: ["BUSINESS SYSTEMS", "CSBS", "BUSINESS MANAGEMENT"] },
  { code: "IOT", keywords: ["INTERNET OF THINGS", "IOT"] },
  
  // General Core Branches
  { code: "CS", keywords: ["COMPUTER SCIENCE", "CSE", "COMP.SCI", "B TECH IN COMPUTER SCIENCE"] },
  { code: "IS", keywords: ["INFORMATION SCIENCE", "ISE", "INFO.SCI", "INFORMATION TECH"] },
  { code: "EC", keywords: ["ELECTRONICS AND COMMUNICATION", "ELECTRONICS & COMMUNICATION", "ECE", "ELECTRONICS AND TELECOMMUNICATION", "VLSI"] },
  { code: "EE", keywords: ["ELECTRICAL", "EEE"] },
  { code: "ME", keywords: ["MECHANICAL", "MECH"] },
  { code: "CE", keywords: ["CIVIL"] },
  { code: "BT", keywords: ["BIO-TECHNOLOGY", "BIOTECHNOLOGY", "BIO TECHNOLOGY", "BIO-TECH", "BIOMEDICAL"] },
  { code: "CH", keywords: ["CHEMICAL"] },
  { code: "AE", keywords: ["AERO SPACE", "AERONAUTICAL", "AEROSPACE"] }
];

function matchBranch(name) {
  const clean = name.toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/DAT\s+A/g, 'DATA')
    .replace(/ARTI\s+FICAL/g, 'ARTIFICIAL')
    .replace(/ARTI\s+FICIAL/g, 'ARTIFICIAL')
    .replace(/TELECOMMUNICAT\s+ION/g, 'TELECOMMUNICATION');
    
  for (const mapping of BRANCH_MAP) {
    for (const kw of mapping.keywords) {
      if (clean.includes(kw)) {
        return mapping.code;
      }
    }
  }
  return null;
}

function getCollegeType(name, firstLine) {
  const full = (name + " " + firstLine).toUpperCase();
  if (full.includes("GOVT") || full.includes("GOVERNMENT") || full.includes("CONSTITUENT")) {
    if (full.includes("AUTONOMOUS")) return "Government Autonomous";
    return "Government";
  }
  if (full.includes("AIDED")) {
    if (full.includes("AUTONOMOUS")) return "Private Aided Autonomous";
    return "Private Aided";
  }
  if (full.includes("UNIVERSITY")) {
    return "Private University";
  }
  if (full.includes("AUTONOMOUS")) {
    return "Private Autonomous";
  }
  return "Private";
}

function extractLocation(firstLine) {
  const knownLocations = [
    "Bangalore", "Mysuru", "Mangalore", "Belagavi", "Tumkur", "Dharwad", "Davangere", "Hassan",
    "Mandya", "Hubli", "Bagalkot", "Vijayapur", "Bhatkal", "Haliyal", "Kalaburagi", "Ballari",
    "Nitte", "Sullia", "Moodbidri", "Ujire", "Shivamogga", "Ramanagara", "Chickballapur", "Kolar",
    "Tiptur", "Gokak", "Chamarajanagar", "Koppal", "Yadgir", "Bidar", "Raichur", "Gadag", "Karwar"
  ];
  const upperLine = firstLine.toUpperCase();
  for (const loc of knownLocations) {
    if (upperLine.includes(loc.toUpperCase())) return loc;
  }
  
  // Regex fallback
  const match = firstLine.match(/,\s*([A-Za-z\s]+)$/);
  if (match) return match[1].trim();
  
  return "Karnataka";
}

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new pdf.PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();
  return textResult.text;
}

function parseLine(line) {
  const tokens = line.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0);
  let cutoffCount = 0;
  let boundaryIdx = tokens.length;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];
    if (/^\d+(?:\.\d+)?$/.test(t) || t === '--') {
      cutoffCount++;
      boundaryIdx = i;
    } else {
      break;
    }
  }
  
  if (cutoffCount >= 10) {
    const courseName = tokens.slice(0, boundaryIdx).join(' ');
    const cutoffLine = tokens.slice(boundaryIdx).join(' ');
    return { isSplit: true, courseName, cutoffLine };
  }
  return { isSplit: false, line };
}

async function main() {
  const collegesMap = new Map();
  const cutoffsMap = {};
  
  const files = [
    { round: 1, file: './colleges/round 1.pdf' },
    { round: 2, file: './colleges/round 2.pdf' },
    { round: 3, file: './colleges/round 3.pdf' }
  ];

  function processCourseAndCutoffs(collegeCode, courseName, cutoffLine, roundNo) {
    const branchCode = matchBranch(courseName);
    if (!branchCode) return;
    
    const values = cutoffLine.split(/\s+/).map(v => v.trim()).filter(v => v.length > 0);
    if (values.length >= 22) {
      // Record that the college offers this branch
      const colObj = collegesMap.get(collegeCode);
      if (colObj && !colObj.offeredBranches.includes(branchCode)) {
        colObj.offeredBranches.push(branchCode);
      }
      
      for (const [catCode, colIdx] of Object.entries(CATEGORY_COLUMNS)) {
        const val = values[colIdx];
        if (val && val !== '--') {
          const rankVal = Math.round(parseFloat(val));
          const cutoffKey = `${collegeCode}_${branchCode}_${catCode}_${roundNo}`;
          cutoffsMap[cutoffKey] = rankVal;
          
          // If GM Round 1 CS, update baseCSE
          if (branchCode === "CS" && catCode === "GM" && roundNo === 1) {
            colObj.baseCSE = rankVal;
          }
        }
      }
    }
  }
  
  for (const item of files) {
    console.log(`Parsing Round ${item.round} PDF...`);
    const text = await parsePDF(item.file);
    console.log(`PDF text loaded (${text.length} chars). Splitting...`);
    const segments = text.split('College:');
    console.log(`Found ${segments.length - 1} college segments. Processing...`);
    
    // Ignore first segment as it is PDF header info
    for (let s = 1; s < segments.length; s++) {
      if (s % 50 === 0) {
        console.log(`  Processed ${s} / ${segments.length - 1} colleges...`);
      }
      const segment = segments[s];
      const lines = segment.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) continue;
      
      const firstLine = lines[0];
      const codeMatch = firstLine.match(/^(E\d{3})/);
      if (!codeMatch) continue;
      const collegeCode = codeMatch[1];
      
      // Parse college name
      let collegeName = firstLine.substring(collegeCode.length).trim();
      // Clean college name: strip address after comma or parenthesis
      const commaIdx = collegeName.indexOf(',');
      const parenIdx = collegeName.indexOf('(');
      let cleanName = collegeName;
      if (commaIdx !== -1 && parenIdx !== -1) {
        cleanName = collegeName.substring(0, Math.min(commaIdx, parenIdx));
      } else if (commaIdx !== -1) {
        cleanName = collegeName.substring(0, commaIdx);
      } else if (parenIdx !== -1) {
        cleanName = collegeName.substring(0, parenIdx);
      }
      cleanName = cleanName.trim();
      
      const location = extractLocation(firstLine);
      const type = getCollegeType(cleanName, firstLine);
      
      if (!collegesMap.has(collegeCode)) {
        collegesMap.set(collegeCode, {
          code: collegeCode,
          name: cleanName,
          location: location,
          type: type,
          baseCSE: 260000,
          offeredBranches: []
        });
      }
      
      // Now parse courses and cutoffs
      let currentCourseName = "";
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip header lines
        if (line.includes("Course Name") || line.includes("1G 1K 1R")) continue;
        
        // Check if line is a combined line or pure cutoff line
        const parsed = parseLine(line);
        if (parsed.isSplit) {
          const fullCourseName = (currentCourseName ? currentCourseName + " " : "") + parsed.courseName;
          processCourseAndCutoffs(collegeCode, fullCourseName, parsed.cutoffLine, item.round);
          currentCourseName = "";
        } else {
          // Check if line is a pure cutoff line
          const isCutoff = line.split(/\s+/).every(part => /^\d+(?:\.\d+)?$/.test(part) || part === '--');
          if (!isCutoff) {
            currentCourseName += (currentCourseName ? " " : "") + line;
          } else {
            processCourseAndCutoffs(collegeCode, currentCourseName, line, item.round);
            currentCourseName = "";
          }
        }
      }
    }
  }
  
  const BRANCH_MULTIPLIERS = {
    "CS": 1.0,
    "IS": 1.22,
    "AD": 1.28,
    "AI": 1.34,
    "DS": 1.34,
    "CY": 1.34,
    "CD": 1.5,
    "BS": 1.5,
    "IOT": 1.5,
    "EC": 2.1,
    "EE": 4.2,
    "ME": 11.5,
    "CE": 14.0,
    "BT": 15.0,
    "CH": 15.0,
    "AE": 12.0
  };

  // Estimate baseCSE for colleges that do not have CS GM Round 1
  for (const college of collegesMap.values()) {
    if (college.baseCSE === 260000) {
      let bestEstimatedCS = 260000;
      for (const [branchCode, multiplier] of Object.entries(BRANCH_MULTIPLIERS)) {
        const cutoffKey = `${college.code}_${branchCode}_GM_1`;
        if (cutoffsMap[cutoffKey]) {
          const rank = cutoffsMap[cutoffKey];
          const estCS = Math.round(rank / multiplier);
          if (estCS < bestEstimatedCS) {
            bestEstimatedCS = estCS;
          }
        }
      }
      college.baseCSE = bestEstimatedCS;
    }
  }

  const collegesList = Array.from(collegesMap.values()).sort((a, b) => a.baseCSE - b.baseCSE);
  
  const output = {
    colleges: collegesList,
    cutoffs: cutoffsMap
  };
  
  fs.writeFileSync('./src/colleges_data.json', JSON.stringify(output, null, 2));
  console.log(`Extraction complete! Saved ${collegesList.length} colleges and ${Object.keys(cutoffsMap).length} cutoff mappings to ./src/colleges_data.json`);
}

main().catch(console.error);
