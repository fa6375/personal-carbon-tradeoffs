"""Generates erd.svg, the Firestore ERD for Carbon Choices.
Edit the entities below and run:  python3 make_erd.py && qlmanage -t -s 2400 -o . erd.svg && mv erd.svg.png erd.png
"""
FONT = "font-family='Helvetica, Arial, sans-serif'"
W, H = 1400, 1120
out = []

def text(x, y, t, size=12.5, weight=400, fill='#1b2a22', anchor='start'):
    out.append(f"<text x='{x}' y='{y}' {FONT} font-size='{size}' font-weight='{weight}' fill='{fill}' text-anchor='{anchor}'>{t}</text>")

def entity(x, y, w, title, subtitle, rows, color):
    h = 56 + len(rows) * 20 + 10
    out.append(f"<rect x='{x}' y='{y}' width='{w}' height='{h}' rx='8' fill='#ffffff' stroke='{color}' stroke-width='2'/>")
    out.append(f"<path d='M{x},{y+48} V{y+8} Q{x},{y} {x+8},{y} H{x+w-8} Q{x+w},{y} {x+w},{y+8} V{y+48} Z' fill='{color}'/>")
    text(x + 12, y + 21, title, 16, 700, '#ffffff')
    text(x + 12, y + 39, subtitle, 11, 400, '#eef4f0')
    yy = y + 70
    for key, name, kind in rows:
        if key:
            text(x + 12, yy, key, 11, 700, {'PK': '#9b5c00', 'FK': '#2f5f8a'}[key])
        text(x + 40, yy, name)
        text(x + w - 12, yy, kind, 11.5, 400, '#5b6b61', 'end')
        yy += 20
    return y + h

def line(d, dash=False, color='#38473e'):
    extra = " stroke-dasharray='6 5'" if dash else ''
    out.append(f"<path d='{d}' stroke='{color}' stroke-width='2' fill='none'{extra}/>")

out.append(f"<svg xmlns='http://www.w3.org/2000/svg' width='{W}' height='{H}' viewBox='0 0 {W} {H}'>")
out.append(f"<rect x='0' y='0' width='{W}' height='{H}' fill='#f6f8f6'/>")
text(30, 42, 'Carbon Choices — Cloud Firestore data model (ERD)', 26, 700, '#163d29')
text(30, 66, 'Project personal-carbon-tradeoff · database (default) · ownership by path: every document lives under users/{uid}. Matches firestore.rules and src/features/*/types.ts.', 13.5, 400, '#4f5c54')

ub = entity(540, 95, 320, 'USER', 'users/{uid}  ·  Firebase Auth uid', [
    ('PK', 'uid (document id)', 'string'), ('', 'email', 'string ≤ 320'), ('', 'locale?', '"en" | "hr" | "de"'),
    ('', 'createdAt', 'timestamp (UTC)'), ('', 'updatedAt', 'timestamp (UTC)')], '#1f6b45')
ab = entity(30, 400, 410, 'ACTIVITY', 'users/{uid}/activities/{activityId}', [
    ('PK', 'activityId', 'auto id'), ('FK', 'owner uid', 'path segment'), ('', 'date', '"YYYY-MM-DD"'), ('', 'note', 'string ≤ 120'),
    ('', 'details.category', 'transport | food | home'), ('', 'details.mode | item | source', 'enum'),
    ('', 'details.distanceKm | servings | kwh', 'number'), ('', 'details.passengers | householdSize', 'int'),
    ('', 'importedFrom?', '"localStorage"'), ('', 'createdAt / updatedAt', 'timestamp (UTC)')], '#2f5f8a')
entity(495, 400, 410, 'SAVED_COMPARISON', 'users/{uid}/comparisons/{comparisonId}', [
    ('PK', 'comparisonId', 'auto id'), ('FK', 'owner uid', 'path segment'), ('', 'name', 'string 1–80'),
    ('', 'input.modes[]', '2–6 transport ids'), ('', 'input.journey{from,to,distanceKm,passengers}', 'map'),
    ('', 'input.priorities{emissions,cost,time}', 'int 0–3'), ('', 'options[]{mode,emissionsKg,costEur,…}', 'snapshot'),
    ('', 'recommended', 'transport id'), ('', 'importedFrom?', '"localStorage"'), ('', 'createdAt / updatedAt', 'timestamp (UTC)')], '#8a5a14')
pb = entity(960, 400, 410, 'GOAL_PLAN', 'users/{uid}/goalPlans/current  (one per user)', [
    ('PK', '"current"', 'fixed id'), ('FK', 'owner uid', 'path segment'), ('', 'baseline{source,amounts,takenAt?}', 'map'),
    ('', 'reductionPercent', 'number 0–100'), ('', 'durationMonths', 'int 1–36'), ('', 'startMonth', '"YYYY-MM"'),
    ('', 'allocation{transport,food,home}', 'percent'), ('', 'priorities[]', 'ordered ids'),
    ('', 'selectedOpportunityIds[]', '≤ 50'), ('', 'adjustments[]', 'embedded, ≤ 200'), ('', 'schemaVersion', '1'),
    ('', 'createdAt / updatedAt', 'timestamp (UTC)')], '#6b3fa0')
adj_y = pb + 90
entity(960, adj_y, 410, 'BUDGET_ADJUSTMENT (embedded)', 'element of goalPlans/current.adjustments[]', [
    ('PK', 'id', 'string'), ('', 'kind', 'reallocate | goal'), ('', 'from? / to? / percentPoints?', 'reallocate only'),
    ('', 'reductionBefore / reductionAfter', 'number'), ('', 'budgetBefore / budgetAfter', 'kg CO₂e'),
    ('', 'allocationBefore / allocationAfter', 'map'), ('', 'reason, createdAt', 'string (ISO UTC)')], '#6b3fa0')

# USER 1 — owns — 0..* / 0..* / 0..1
bus = ub + 40
line(f'M700,{ub} V{bus}'); line(f'M235,{bus} H1165')
for x in (235, 700, 1165):
    line(f'M{x},{bus} V400')
text(708, ub + 18, '1', 13, 700, '#163d29'); text(245, bus - 8, 'owns', 13, 700, '#163d29')
text(243, 392, '0..*', 13, 700, '#163d29'); text(708, 392, '0..*', 13, 700, '#163d29'); text(1173, 392, '0..1', 13, 700, '#163d29')
# GOAL_PLAN 1 — contains — 0..200
line(f'M1165,{pb} V{adj_y}')
text(1173, pb + 18, '1', 13, 700, '#163d29'); text(1173, adj_y - 8, '0..200', 13, 700, '#163d29')
text(1155, pb + 50, 'contains (embedded array)', 12, 400, '#4f5c54', 'end')
# derived relationship
line(f'M150,{ab} V{ab + 60} H930 V{pb - 30} H958', dash=True, color='#8f9a93')
text(160, ab + 82, 'derived: goal progress and the tracked baseline are calculated from ACTIVITY when read (not stored)', 12, 400, '#4f5c54')

ly = adj_y + 56 + 7 * 20 + 10 + 50
text(30, ly, "<tspan font-weight='700' fill='#9b5c00'>PK</tspan> document id   <tspan font-weight='700' fill='#2f5f8a'>FK</tspan> owner = parent path users/{uid} (no stored userId field)   ? optional   ·   solid line: sub-collection or embedded array   ·   dashed: derived, not stored")
text(30, ly + 22, 'Every read and write is restricted to request.auth.uid == uid by firestore.rules, which also validate field types and ranges. Text is UTF-8 (tested with Croatian, Cyrillic and Arabic).')
text(30, ly + 44, 'No SQL tables or migrations: Firestore is schemaless; the schema is enforced by firestore.rules and the TypeScript types. Emissions are always recalculated from stored inputs.')
out.append('</svg>')
open('erd.svg', 'w').write('\n'.join(out))
print('content bottom', ly + 44)
