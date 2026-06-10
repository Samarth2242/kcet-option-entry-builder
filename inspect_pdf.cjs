const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
    const dataBuffer = fs.readFileSync('./colleges/round 1.pdf');
    const parser = new pdf.PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    
    const segments = textResult.text.split('College:');
    console.log("Number of college segments found:", segments.length - 1);
    
    // Let's print the first 200 chars of the first 5 college segments
    for (let i = 1; i <= Math.min(5, segments.length - 1); i++) {
        console.log(`\n--- Segment ${i} ---`);
        console.log(segments[i].substring(0, 400).replace(/\n/g, ' [NL] '));
    }
}

main().catch(console.error);
