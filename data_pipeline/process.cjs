const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, 'raw');
const OUT_DIR = path.join(__dirname, '../src/data');

function readCSV(filename) {
    try {
        const content = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
        const lines = content.split('\n').filter(l => l.trim() !== '');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const parts = line.split(',');
            const row = {};
            headers.forEach((h, i) => { row[h] = parts[i]; });
            return row;
        });
    } catch(e) {
        console.error("Missing or unreadable file:", filename);
        return [];
    }
}

console.log("Commencing Full Data Pipeline Extraction...");

const data = {
    temp: readCSV('Mean_sea_surface_temperature_anomalies.csv'),
    seaLevel: readCSV('Seal_level_anomalies.csv'),
    rain: readCSV('Rainfall_anomalies.csv'),
    crop: readCSV('Crop_yield_disaggregated.csv'),
    tax: readCSV('Environmental_taxes.csv'),
    affected: readCSV('Number_of_affected_person.csv')
};

// 1. Process Temperature (SST_ANOM)
const sstData = data.temp
    .filter(r => r.CLIMATE_CHANGE_INDICATORS === 'SST_ANOM' && (r.GEO_PICT === '_PICT' || r.GEO_PICT === 'FJ' || r.GEO_PICT === 'WSM'))
    .map(r => ({ year: parseInt(r.TIME_PERIOD), val: parseFloat(r.OBS_VALUE) }))
    .filter(r => !isNaN(r.val) && !isNaN(r.year));

// Group by year and average
const tempMap = {};
sstData.forEach(d => { if(!tempMap[d.year]) tempMap[d.year]=[]; tempMap[d.year].push(d.val); });
const finalTemp = Object.keys(tempMap).sort().map(y => {
    const avg = tempMap[y].reduce((a,b)=>a+b,0)/tempMap[y].length;
    return { year: parseInt(y), anomaly: parseFloat(avg.toFixed(2)), isElNino: avg > 0.5, elNinoStrength: avg > 1 ? 'very-strong' : (avg > 0.5 ? 'strong' : 'none') };
});

if(finalTemp.length > 0) {
    const tsContent = `export const temperatureData = ${JSON.stringify(finalTemp, null, 2)};`;
    fs.writeFileSync(path.join(OUT_DIR, 'temperatureData.ts'), tsContent);
    console.log("-> temperatureData.ts generated.");
}

// 2. Process Taxes
const taxes = data.tax
    .filter(r => r.CLIMATE_CHANGE_INDICATORS === 'ENV_TAXES' && r.GEO_PICT === 'FJ')
    .map(r => ({ year: parseInt(r.TIME_PERIOD), yieldIndex: 100, taxPercent: parseFloat(r.OBS_VALUE) }))
    .filter(r => !isNaN(r.taxPercent) && !isNaN(r.year))
    .sort((a,b) => a.year - b.year);

if(taxes.length > 0) {
    // We will merge this into cropYield.ts later or just save it
    fs.writeFileSync(path.join(OUT_DIR, 'extracted_taxes.json'), JSON.stringify(taxes, null, 2));
    console.log("-> extracted_taxes.json generated.");
}

console.log("Pipeline executed. Valid data extracted where found.");
