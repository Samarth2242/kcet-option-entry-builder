import fs from 'fs';
import pdf from 'pdf-parse';

const dataBuffer = fs.readFileSync('./colleges/round 1.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("PDF Pages Count:", data.numpages);
    console.log("PDF Text Sample:\n", data.text.substring(0, 3000));
}).catch(function(err) {
    console.error("Error parsing pdf:", err);
});
