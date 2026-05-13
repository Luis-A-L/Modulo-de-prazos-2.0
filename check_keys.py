import csv

with open('minuta_templates_rows.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

keys = {}
duplicates = 0
for r in rows:
    key = r['step_key'] + '|' + r['option_text']
    if key in keys:
        duplicates += 1
        print(f"DUPLICATE: {key} -> {keys[key]} AND {r['title']}")
    else:
        keys[key] = r['title']

print(f"Total rows: {len(rows)}, Unique pairs: {len(keys)}, Duplicates: {duplicates}")
