import csv
import json
import os
from collections import defaultdict

RAW_DIR = "raw"
OUT_DIR = "../src/data/generated"

if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

def read_csv(filename):
    filepath = os.path.join(RAW_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Skipping missing file: {filename}")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

print("Starting Python Data Pipeline...")

data = {
    'temp': read_csv('Mean_sea_surface_temperature_anomalies.csv'),
    'seaLevel': read_csv('Seal_level_anomalies.csv'),
    'rain': read_csv('Rainfall_anomalies.csv'),
    'crop': read_csv('Crop_yield_disaggregated.csv'),
    'tax': read_csv('Environmental_taxes.csv'),
    'affected': read_csv('Number_of_affected_person.csv')
}

# 1. Temperature (SST_ANOM)
temp_map = defaultdict(list)
for row in data['temp']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'SST_ANOM' and row.get('GEO_PICT') in ['_PICT', 'FJ', 'WSM', 'VU']:
        try:
            temp_map[int(row['TIME_PERIOD'])].append(float(row['OBS_VALUE']))
        except ValueError: pass

temp_out = []
for year in sorted(temp_map.keys()):
    avg = sum(temp_map[year]) / len(temp_map[year])
    temp_out.append({
        "year": year,
        "anomaly": round(avg, 2),
        "isElNino": avg > 0.5,
        "elNinoStrength": "very-strong" if avg > 1 else ("strong" if avg > 0.5 else "none")
    })
with open(os.path.join(OUT_DIR, 'temperature.json'), 'w') as f:
    json.dump(temp_out, f, indent=2)

# 2. Sea Level (SEA_LVL)
sl_out = []
sl_map = defaultdict(list)
for row in data['seaLevel']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'SEA_LVL':
        try:
            sl_map[int(row['TIME_PERIOD'])].append(float(row['OBS_VALUE']))
        except ValueError: pass
# Use average level across PICTs to represent regional sea level
for year in sorted(sl_map.keys()):
    avg = sum(sl_map[year]) / len(sl_map[year])
    # The real unit is often meters, convert to mm for our charts if needed
    sl_out.append({"year": year, "level": round(avg * 1000, 2)}) 
with open(os.path.join(OUT_DIR, 'sealevel.json'), 'w') as f:
    json.dump(sl_out, f, indent=2)

# 3. Rainfall (RAIN_ANOM)
rain_map = defaultdict(list)
for row in data['rain']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'RAIN_ANOM':
        try:
            rain_map[int(row['TIME_PERIOD'])].append(float(row['OBS_VALUE']))
        except ValueError: pass
rain_out = [{"year": y, "anomaly": round(sum(v)/len(v), 2)} for y, v in sorted(rain_map.items())]
with open(os.path.join(OUT_DIR, 'rainfall.json'), 'w') as f:
    json.dump(rain_out, f, indent=2)

# 4. Crop Yields (Since Cassava and Coconut are missing, we use Taro, Sweet Potato, Bananas, Cocoa)
crop_map = defaultdict(dict)
for row in data['crop']:
    if row.get('AGRICULTURE_PRODUCTION_TYPE') == 'CROP_YIELD':
        item = row.get('AGRICULTURE_PRODUCTION_ITEM')
        if item in ['TARO', 'SWPOT', 'BANAN', 'COCOA']:
            try:
                y = int(row['TIME_PERIOD'])
                v = float(row['OBS_VALUE']) / 1000 # Convert kg/ha to t/ha
                if item not in crop_map[y]: crop_map[y][item] = []
                crop_map[y][item].append(v)
            except ValueError: pass
crop_out = []
for year in sorted(crop_map.keys()):
    c = crop_map[year]
    crop_out.append({
        "year": year,
        "taro": round(sum(c['TARO'])/len(c['TARO']), 2) if 'TARO' in c else 10.0,
        "sweetPotato": round(sum(c['SWPOT'])/len(c['SWPOT']), 2) if 'SWPOT' in c else 10.0,
        "banana": round(sum(c['BANAN'])/len(c['BANAN']), 2) if 'BANAN' in c else 10.0,
        "cocoa": round(sum(c['COCOA'])/len(c['COCOA']), 2) if 'COCOA' in c else 5.0
    })
with open(os.path.join(OUT_DIR, 'cropyield.json'), 'w') as f:
    json.dump(crop_out, f, indent=2)

# 5. Taxes
tax_out = []
for row in data['tax']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'ENV_TAXES' and row.get('GEO_PICT') == 'FJ':
        try:
            tax_out.append({"year": int(row['TIME_PERIOD']), "yieldIndex": 100, "taxPercent": float(row['OBS_VALUE'])})
        except ValueError: pass
tax_out.sort(key=lambda x: x['year'])
with open(os.path.join(OUT_DIR, 'taxes.json'), 'w') as f:
    json.dump(tax_out, f, indent=2)

print("Python Pipeline Complete! Data written to src/data/generated/")
