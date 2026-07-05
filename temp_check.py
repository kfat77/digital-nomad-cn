import json, os, glob, re

# Read all country JSONs
COUNTRY_DIR = r"C:\Users\22617\Documents\kimi\workspace\website\data\entities\country"

countries = []
for path in glob.glob(os.path.join(COUNTRY_DIR, "*.json")):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    countries.append(data)

# Sort by name
countries.sort(key=lambda x: x['name'])

print(f"Total countries: {len(countries)}")
for c in countries:
    print(f"  {c['id']}: {c['name']} (region={c.get('region','?')}, score={c.get('digital_nomad_score','?')}, visa={c.get('china_passport_visa_status','?')})")
