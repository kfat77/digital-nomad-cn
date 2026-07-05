import re, json, os, glob

WORKSPACE = r"C:\Users\22617\Documents\kimi\workspace\website"
COUNTRY_DIR = os.path.join(WORKSPACE, "data", "entities", "country")
INDEX_PATH = os.path.join(WORKSPACE, "index.html")

# Read all countries to get has_digital_nomad_visa
nomad_visa_map = {}
for path in glob.glob(os.path.join(COUNTRY_DIR, "*.json")):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    nomad_visa_map[data['id']] = data.get('has_digital_nomad_visa', False)

# Read index.html
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix: add data-has-nomad-visa to country cards
# Pattern: data-region="..." data-visa="..." data-score="...">
def replace_card(match):
    region = match.group(1)
    visa = match.group(2)
    score = match.group(3)
    # Extract country id from href="country/XXX/index.html"
    id_match = re.search(r'href="country/([^/]+)/index\.html"', match.group(0))
    if id_match:
        cid = id_match.group(1)
        has_nom = 'true' if nomad_visa_map.get(cid, False) else 'false'
    else:
        has_nom = 'false'
    return f'data-region="{region}" data-visa="{visa}" data-score="{score}" data-has-nomad-visa="{has_nom}">'

new_html = re.sub(
    r'data-region="([^"]+)" data-visa="([^"]+)" data-score="([^"]+)">',
    replace_card,
    html
)

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Fixed data-has-nomad-visa attributes")
