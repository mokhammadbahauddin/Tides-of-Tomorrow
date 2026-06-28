import csv
import json
import os
from collections import defaultdict

RAW_DIR = "raw"
OUT_DIR = "../public/data"

# ISO mapping from 3-letter (app dropdown) to 2-letter (GEO_PICT in CSV)
iso_mapping = {
    'FJI': 'FJ',
    'TUV': 'TV',
    'VUT': 'VU',
    'WSM': 'WS',
    'TON': 'TO',
    'KIR': 'KI',
    'SLB': 'SB',
    'PNG': 'PG',
    'PLW': 'PW',
    'MHL': 'MH',
    'FSM': 'FM',
    'COK': 'CK',
    'PYF': 'PF',
    'GUM': 'GU',
    'NRU': 'NR',
    'NCL': 'NC',
    'NIU': 'NU',
    'MNP': 'MP',
    'PCN': 'PN',
    'TKL': 'TK',
    'WLF': 'WF',
    'ASM': 'AS'
}
rev_iso = {v: k for k, v in iso_mapping.items()}

def read_csv(filename):
    filepath = os.path.join(RAW_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Skipping missing file: {filename}")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

print("Starting Python Data Pipeline V2 (Real Per-Country Data)...")

data = {
    'temp': read_csv('Mean_sea_surface_temperature_anomalies.csv'),
    'seaLevel': read_csv('Seal_level_anomalies.csv'),
    'rain': read_csv('Rainfall_anomalies.csv'),
    'crop': read_csv('Crop_yield_disaggregated.csv'),
    'tax': read_csv('Environmental_taxes.csv')
}

# --- 1. Temperature (SST_ANOM) ---
temp_by_year_country = defaultdict(dict)
all_years = set()

for row in data['temp']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'SST_ANOM':
        try:
            year = int(row['TIME_PERIOD'])
            val = float(row['OBS_VALUE'])
            geo = row.get('GEO_PICT')
            all_years.add(year)
            if geo in rev_iso:
                temp_by_year_country[year][rev_iso[geo]] = val
            elif geo == '_PICT':
                temp_by_year_country[year]['REGIONAL'] = val
        except ValueError: pass

temp_out = []
for year in sorted(all_years):
    records = temp_by_year_country[year]
    # Compute regional if missing
    if 'REGIONAL' not in records:
        valid_vals = [v for k, v in records.items() if k != 'REGIONAL']
        records['REGIONAL'] = sum(valid_vals) / len(valid_vals) if valid_vals else 0.0
    
    # Fill missing countries with regional average
    row_out = {"year": year, "regional": round(records['REGIONAL'], 2)}
    for c_code in iso_mapping.keys():
        val = records.get(c_code, records['REGIONAL'])
        row_out[c_code] = round(val, 2)
    temp_out.append(row_out)

with open(os.path.join(OUT_DIR, 'temperature.json'), 'w') as f:
    json.dump(temp_out, f, indent=2)


# --- 2. Sea Level (SEA_LVL) ---
sl_by_year_country = defaultdict(dict)
all_sl_years = set()

for row in data['seaLevel']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'SEA_LVL':
        try:
            year = int(row['TIME_PERIOD'])
            val = float(row['OBS_VALUE']) * 1000 # convert m to mm
            geo = row.get('GEO_PICT')
            all_sl_years.add(year)
            if geo in rev_iso:
                sl_by_year_country[year][rev_iso[geo]] = val
            elif geo == '_PICT':
                sl_by_year_country[year]['REGIONAL'] = val
        except ValueError: pass

sl_out = []
for year in sorted(all_sl_years):
    records = sl_by_year_country[year]
    if 'REGIONAL' not in records:
        valid_vals = [v for k, v in records.items() if k != 'REGIONAL']
        records['REGIONAL'] = sum(valid_vals) / len(valid_vals) if valid_vals else 0.0
    
    row_out = {"year": year, "regional": round(records['REGIONAL'], 2)}
    for c_code in iso_mapping.keys():
        val = records.get(c_code, records['REGIONAL'])
        row_out[c_code] = round(val, 2)
    sl_out.append(row_out)

with open(os.path.join(OUT_DIR, 'sealevel.json'), 'w') as f:
    json.dump(sl_out, f, indent=2)


# --- 3. Rainfall (RAIN_ANOM) ---
rain_by_year_country = defaultdict(dict)
all_rain_years = set()

for row in data['rain']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'RAIN_ANOM':
        try:
            year = int(row['TIME_PERIOD'])
            val = float(row['OBS_VALUE'])
            geo = row.get('GEO_PICT')
            all_rain_years.add(year)
            if geo in rev_iso:
                rain_by_year_country[year][rev_iso[geo]] = val
            elif geo == '_PICT':
                rain_by_year_country[year]['REGIONAL'] = val
        except ValueError: pass

rain_out = []
for year in sorted(all_rain_years):
    records = rain_by_year_country[year]
    if 'REGIONAL' not in records:
        valid_vals = [v for k, v in records.items() if k != 'REGIONAL']
        records['REGIONAL'] = sum(valid_vals) / len(valid_vals) if valid_vals else 0.0
    
    row_out = {"year": year, "regional": round(records['REGIONAL'], 2)}
    for c_code in iso_mapping.keys():
        val = records.get(c_code, records['REGIONAL'])
        row_out[c_code] = round(val, 2)
    rain_out.append(row_out)

with open(os.path.join(OUT_DIR, 'rainfall.json'), 'w') as f:
    json.dump(rain_out, f, indent=2)


# --- 4. Crop Yields (TARO, SWPOT, BANAN, COCOA) ---
crop_by_year_country = defaultdict(lambda: defaultdict(dict))
all_crop_years = set()

for row in data['crop']:
    if row.get('AGRICULTURE_PRODUCTION_TYPE') == 'CROP_YIELD':
        item = row.get('AGRICULTURE_PRODUCTION_ITEM')
        if item in ['TARO', 'SWPOT', 'BANAN', 'COCOA']:
            try:
                year = int(row['TIME_PERIOD'])
                val = float(row['OBS_VALUE']) / 1000 # kg/ha to t/ha
                geo = row.get('GEO_PICT')
                all_crop_years.add(year)
                
                c_key = rev_iso.get(geo, 'REGIONAL')
                crop_by_year_country[year][c_key][item] = val
            except ValueError: pass

crop_out = []
default_crops = { 'TARO': 10.0, 'SWPOT': 10.0, 'BANAN': 10.0, 'COCOA': 5.0 }

for year in sorted(all_crop_years):
    records = crop_by_year_country[year]
    
    # Pre-calculate regional averages for each crop item in this year
    regional_avg_by_crop = {}
    for crop in default_crops.keys():
        valid_vals = [records[c][crop] for c in records if crop in records[c] and c != 'REGIONAL']
        regional_avg_by_crop[crop] = sum(valid_vals) / len(valid_vals) if valid_vals else default_crops[crop]

    row_out = {"year": year}
    
    # 1. Write regional average node
    reg_node = records.get('REGIONAL', {})
    row_out['REGIONAL'] = {
        "taro": round(reg_node.get('TARO', regional_avg_by_crop['TARO']), 2),
        "sweetPotato": round(reg_node.get('SWPOT', regional_avg_by_crop['SWPOT']), 2),
        "banana": round(reg_node.get('BANAN', regional_avg_by_crop['BANAN']), 2),
        "cocoa": round(reg_node.get('COCOA', regional_avg_by_crop['COCOA']), 2)
    }

    # 2. Write all country nodes
    for c_code in iso_mapping.keys():
        c_node = records.get(c_code, {})
        row_out[c_code] = {
            "taro": round(c_node.get('TARO', row_out['REGIONAL']['taro']), 2),
            "sweetPotato": round(c_node.get('SWPOT', row_out['REGIONAL']['sweetPotato']), 2),
            "banana": round(c_node.get('BANAN', row_out['REGIONAL']['banana']), 2),
            "cocoa": round(c_node.get('COCOA', row_out['REGIONAL']['cocoa']), 2)
        }
    crop_out.append(row_out)

with open(os.path.join(OUT_DIR, 'cropyield.json'), 'w') as f:
    json.dump(crop_out, f, indent=2)


# --- 5. Environmental Taxes (ENV_TAXES) ---
tax_by_year_country = defaultdict(dict)
all_tax_years = set()

for row in data['tax']:
    if row.get('CLIMATE_CHANGE_INDICATORS') == 'ENV_TAXES':
        try:
            year = int(row['TIME_PERIOD'])
            val = float(row['OBS_VALUE'])
            geo = row.get('GEO_PICT')
            all_tax_years.add(year)
            if geo in rev_iso:
                tax_by_year_country[year][rev_iso[geo]] = val
            elif geo == '_PICT':
                tax_by_year_country[year]['REGIONAL'] = val
        except ValueError: pass

tax_out = []
for year in sorted(all_tax_years):
    records = tax_by_year_country[year]
    if 'REGIONAL' not in records:
        valid_vals = [v for k, v in records.items() if k != 'REGIONAL']
        records['REGIONAL'] = sum(valid_vals) / len(valid_vals) if valid_vals else 1.0 # fallback default 1% GDP
    
    row_out = {"year": year, "regional": round(records['REGIONAL'], 2)}
    for c_code in iso_mapping.keys():
        val = records.get(c_code, records['REGIONAL'])
        row_out[c_code] = round(val, 2)
    tax_out.append(row_out)

with open(os.path.join(OUT_DIR, 'taxes.json'), 'w') as f:
    json.dump(tax_out, f, indent=2)

print("Python Pipeline V2 Complete! Real country-specific datasets written successfully to public/data/")
