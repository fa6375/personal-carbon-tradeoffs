"""Generates architecture.svg for Carbon Choices.
Run: python3 make_architecture.py && qlmanage -t -s 2400 -o . architecture.svg && mv architecture.svg.png architecture.png
"""
from html import escape
FONT = "font-family='Helvetica, Arial, sans-serif'"
W, H = 1400, 1170
out = [f"<svg xmlns='http://www.w3.org/2000/svg' width='{W}' height='{H}' viewBox='0 0 {W} {H}'>",
       "<defs><marker id='a' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='8' markerHeight='8' orient='auto-start-reverse'><path d='M0,0 L10,5 L0,10 z' fill='#38473e'/></marker></defs>",
       f"<rect x='0' y='0' width='{W}' height='{H}' fill='#f6f8f6'/>"]

def text(x, y, t, size=13, weight=400, fill='#1b2a22', anchor='start'):
    out.append(f"<text x='{x}' y='{y}' {FONT} font-size='{size}' font-weight='{weight}' fill='{fill}' text-anchor='{anchor}'>{escape(t, quote=False)}</text>")

def box(x, y, w, h, title, lines=(), fill='#ffffff', stroke='#1f6b45', title_fill='#163d29', dash=False, size=15):
    d = " stroke-dasharray='7 5'" if dash else ''
    out.append(f"<rect x='{x}' y='{y}' width='{w}' height='{h}' rx='10' fill='{fill}' stroke='{stroke}' stroke-width='2'{d}/>")
    text(x + 14, y + 26, title, size, 700, title_fill)
    for i, l in enumerate(lines):
        text(x + 14, y + 50 + i * 19, l, 12.5, 400, '#33433a')

def arrow(d, label=None, lx=0, ly=0, both=False, anchor='start'):
    start = " marker-start='url(#a)'" if both else ''
    out.append(f"<path d='{d}' stroke='#38473e' stroke-width='2' fill='none' marker-end='url(#a)'{start}/>")
    if label:
        for i, part in enumerate(label.split('|')):
            text(lx, ly + i * 16, part, 12, 400, '#38473e', anchor)

text(30, 42, 'Carbon Choices — system architecture', 26, 700, '#163d29')
text(30, 66, 'Static React single-page app; Firebase is the managed backend (no custom server). External REST data comes from OpenStreetMap services.', 13.5, 400, '#4f5c54')

box(470, 90, 460, 70, 'User — browser on phone or desktop', ['Any device; data follows the signed-in account'], '#ffffff', '#38473e', '#1b2a22')

# App container
out.append("<rect x='30' y='200' width='900' height='760' rx='14' fill='#eef5f0' stroke='#1f6b45' stroke-width='2'/>")
text(48, 230, 'React 19 + TypeScript 6 single-page application (built with Vite 8)', 17, 700, '#163d29')
text(48, 252, 'src/  ·  served as static files  ·  hash routes #/, #/compare, #/saved, #/goals, #/tracking, #/account, #/settings', 12.5, 400, '#4f5c54')

box(50, 270, 860, 70, 'App shell', ['AppLayout (skip link, sidebar / mobile menu, offline banner) · useHashRoute · RequireAuth gate on Tracking, Goals, Saved'])
box(50, 355, 275, 150, 'Compare Everyday Choices', ['Faraj · src/features/compare', '10 screens + Saved comparisons', 'calculate.ts: CO₂ / cost / time,', 'weighted recommendation'], '#ffffff', '#8a5a14')
box(342, 355, 275, 150, 'Carbon Reduction Goals', ['Martin · src/features/goals', '10 screens in 5 steps', 'budget.ts, goalPlanStore +', 'goalPlanSync (autosave)'], '#ffffff', '#6b3fa0')
box(634, 355, 276, 150, 'Personal Carbon Tracking', ['Lazar · src/features/tracking', '10 screens', 'emissionFactors.ts (shared by all', 'three features), stats.ts'], '#ffffff', '#2f5f8a')
box(50, 520, 420, 165, 'Localization  (src/i18n)', ['Typed messages en / hr / de (custom module, no library)', 'Intl.PluralRules · NumberFormat · DateTimeFormat', 'Intl.Collator for sorted names', '<html lang> follows the language; choice saved in', 'localStorage and in users/{uid}.locale when signed in'], '#ffffff', '#1f6b45')
box(490, 520, 420, 165, 'Auth + data layer', ['AuthProvider · sign-in / register · Account page', 'Repositories: activities (live listener), comparisons,', 'goal plan · DataError codes · 15 s timeouts', 'src/lib/firebase.ts: single initialisation', '→ Firebase Authentication and Cloud Firestore'], '#ffffff', '#1f6b45')
box(50, 700, 420, 130, 'Data import and preferences', ['One-time import of data saved in the browser', 'before accounts existed (no duplicates)', 'Locale preference sync on sign-in'], '#ffffff', '#1f6b45')
box(490, 700, 420, 130, 'Route service  (src/features/routing)', ['10 s timeout · 1 request/s per host · 7-day cache', 'RouteError codes (429, 5xx, empty, malformed…)', 'Lookup UI with OpenStreetMap attribution', '→ Nominatim and OSRM'], '#ffffff', '#1f6b45')
box(50, 845, 860, 100, 'Browser storage (localStorage) — device conveniences only', ['carbon-choices.locale (language before sign-in) · carbon-choices.routes.v1:* (map lookup cache)', 'legacy tracking / compare keys — read once by the import, never written · Firebase Auth session (IndexedDB)'], '#ffffff', '#8f9a93', '#33433a', dash=True)

# Firebase
out.append("<rect x='980' y='200' width='390' height='470' rx='14' fill='#fff7e6' stroke='#c77700' stroke-width='2'/>")
text(998, 230, 'Firebase (managed backend)', 17, 700, '#7a4a00')
text(998, 252, 'project personal-carbon-tradeoff', 12.5, 400, '#7a4a00')
box(1000, 270, 350, 100, 'Firebase Authentication', ['Email / password', 'uid identifies the owner of all data'], '#ffffff', '#c77700', '#7a4a00')
box(1000, 390, 350, 80, 'Firestore Security Rules', ['firestore.rules: request.auth.uid == uid,', 'field and range validation'], '#ffffff', '#9b231a', '#7f1c15')
box(1000, 490, 350, 160, 'Cloud Firestore — (default)', ['users/{uid}', '  /activities/{id}', '  /comparisons/{id}', '  /goalPlans/current', 'UTC server timestamps · UTF-8'], '#ffffff', '#c77700', '#7a4a00')
arrow('M1175,470 V488')

# External APIs
out.append("<rect x='980' y='700' width='390' height='260' rx='14' fill='#e9f0f8' stroke='#2f5f8a' stroke-width='2'/>")
text(998, 730, 'External REST APIs (OpenStreetMap)', 17, 700, '#1f4466')
box(1000, 745, 350, 95, 'Nominatim — geocoding', ['GET nominatim.openstreetmap.org/search', 'sends: typed place text · returns lat, lon, name'], '#ffffff', '#2f5f8a', '#1f4466')
box(1000, 855, 350, 95, 'OSRM (FOSSGIS) — routing', ['GET routing.openstreetmap.de/routed-{car,bike,foot}', 'sends: coordinates · returns distance, duration'], '#ffffff', '#2f5f8a', '#1f4466')

# Emulator
box(30, 990, 900, 110, 'Development and tests: Firebase Emulator Suite (local, project demo-carbon-choices)', ['Auth :9099 · Firestore :8080 · UI :4000 — used by npm run demo (seeded demo data), npm run test:emulator (rules + repositories)', 'VITE_FIREBASE_USE_EMULATOR=true switches the same code to the emulators; real config is never used in emulator mode'], '#ffffff', '#6b7a70', '#33433a', dash=True)

# arrows
arrow('M700,160 V198', 'HTTPS (static app)', 708, 186)
arrow('M910,600 H955 V320 H998')
arrow('M955,560 H998')
arrow('M910,765 H955 V792 H998')
arrow('M955,792 V900 H998')
text(964, 312, 'Auth', 11, 700, '#38473e')
text(964, 552, 'data', 11, 700, '#38473e')
text(964, 784, 'HTTP', 11, 700, '#38473e')

def head(x, y, direction):
    pts = {'right': f'{x},{y} {x-11},{y-6} {x-11},{y+6}', 'down': f'{x},{y} {x-6},{y-11} {x+6},{y-11}'}[direction]
    out.append(f"<polygon points='{pts}' fill='#38473e'/>")

for x, y, direction in [(700, 199, 'down'), (1175, 489, 'down'), (999, 320, 'right'), (999, 560, 'right'), (999, 792, 'right'), (999, 900, 'right')]:
    head(x, y, direction)

text(30, 1140, 'Notes: there is no custom backend server and no API key; access control is enforced by Firestore Security Rules. Figures (emission factors, cost, speed) are illustrative constants in the code.', 12.5, 400, '#4f5c54')
out.append('</svg>')
open('architecture.svg', 'w').write('\n'.join(out))
