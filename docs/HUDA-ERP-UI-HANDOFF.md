# HUDA ERP — UI Design Handoff & Style Guide
### For the UI design team · Groweb Design System

**Product:** HUDA ERP — one point of contact for a multi-doctor clinic (paperless operations)
**Client:** Dr Amit Dhakoji clinic · Pune, India
**Base system:** Groweb Design System (`GrowebDesignSystem_e601e5`)
**This doc:** the design-craft handoff — anatomy, redlines, states, grids, rhythm, and do/don'ts. (For data model / business rules / routes, pair with `HUDA-ERP-DESIGN.md`.)

> Read this before touching a frame. It encodes *why* the UI looks the way it does so anyone extending it stays invisible-seam consistent. Every measurement is real and used in the build.

---

## 0. Design principles (the north star)

1. **Density with air.** It's an ERP — show a lot, but let each block breathe. Hairline dividers over heavy borders; whitespace over boxes-in-boxes.
2. **One primary action per view.** The azure filled pill is precious — exactly one per screen (header action or the sticky panel CTA). Everything else is ghost/secondary.
3. **Status is color + label, never color alone.** Every badge is tint + word; lab flags add ↑/↓. Accessibility and glanceability.
4. **The workflow is the product.** The OPD chain (queue → consult → Rx → lab → bill → pay) must feel like one continuous motion. Every screen ends with the button that starts the next screen.
5. **Calm clinical trust.** Cool azure/ink palette, generous radius, soft cool shadows. No alarm-red except real danger (allergy, expired, variance). No decorative gradient walls.
6. **Numbers earn their size.** KPIs and tokens are the biggest type on the page; supporting copy stays quiet.

---

## 1. Grid & layout system

### 1.1 App frame
```
┌──────────┬────────────────────────────────────────┐
│ Sidebar  │  Utility bar (56px)                     │
│ 264px    ├────────────────────────────────────────┤
│ fixed    │  Page header (~84px)                    │
│ 100vh    ├────────────────────────────────────────┤
│          │  Content — scroll · padding 28/32/56px  │
└──────────┴────────────────────────────────────────┘
```
- **Sidebar:** 264px, never collapses on desktop; white; 1px right hairline.
- **Content max readable width:** forms cap at 600–680px; tables/dashboards go full width.
- **Content padding:** `28px top · 32px sides · 56px bottom`.
- **Column gap standard:** `18px` between cards; `14px` between KPI tiles; `16px` inside card groups.

### 1.2 Canonical content grids (reuse these — don't invent new splits)
| Pattern | Grid | Used on |
|---|---|---|
| Dashboard | `1.4fr / 1fr` | Dashboard |
| Workspace + rail | `1fr / 340px` (sticky rail) | Consultation, Bill builder, Messages |
| Work + context rail | `1fr / 320px` | Labs |
| List + live panel | `1fr / 300px` | Appointments |
| Ledger + actions | `1.5fr / 1fr` | Payments |
| Analytics | `1fr / 1fr` (2×2) | Reports, Inventory reports |
| Detail | `320px / 1fr` | Patient chart |
| KPI strip | `repeat(4–5, 1fr)` | Dashboard, Payments, Reports, Messages |
| Card gallery | `repeat(3, 1fr)` or `auto-fill minmax(330px,1fr)` | Doctors, Suppliers |

**Rule:** the sticky right rail (320–340px) always holds *context or the commit action* — snapshot, summary, compose, quick-order. Main work lives left.

---

## 2. Color application (where each token goes)

| Intent | Token | Applied to |
|---|---|---|
| Primary action / identity | `--brand` `#4E93FF` | Filled pill CTA, active nav text, mark, links |
| Emphasis text on light | `--brand-strong` | KPI accents, "Now serving" token, mono metrics |
| Active-nav chip / ghost hover | `--brand-soft` | Nav pill fill, selected chips, info banners |
| Accent / secondary data | `--sky-*` cyan | Doctor avatars, secondary chart bars, AI panels (`--grad-sky`) |
| Dark bands | `--grad-ink` | Live-queue hero, Queue TV, roadmap/cover, day-close button |
| Neutral fills | `--ink-50/100/200` | Table hover, token tiles, chart tracks, disabled |
| Text ramp | `--text-strong / -body / -muted / -faint` | H1 / body / secondary / labels |
| Success | `#0f7a52` on `--success-50` | Paid, Completed, In stock, Balanced, Available |
| Warning | `#b9791b` on `--warning-50` | Pending, Low/Expiring stock, Dues |
| Danger | `--danger-500` on `--danger-50` | Allergy, Expired, No-show, Void, Variance |

**Backgrounds:** page `--surface-page #f6f7fa`; cards pure white. Rhythm = white cards on grey page + occasional `--grad-ink` band. **Max one dark band per screen.** Radial azure/sky wash only behind auth screens.

**Do not:** introduce new hues, use pure black shadows, fill a full page with gradient, or use red for anything that isn't a real risk.

---

## 3. Typography specimen (exact usage)

| Role | Font / weight / size | Tracking / case |
|---|---|---|
| Page H1 | Poppins 700 · 23px | −0.02em, sentence |
| Card / section title | Poppins 600–700 · 15–18px | −0.01em, sentence |
| KPI number | Poppins 700 · 27–34px | −0.02em |
| Hero token (queue) | Poppins 800 · 44–120px | −0.03em |
| Body / table cell | DM Sans 400 · 13.5–14px | 1.5 line-height |
| Field label | DM Sans 600 · 13px | sentence |
| Button label | DM Sans 600–700 · 13–14.5px | sentence |
| Eyebrow / overline | DM Mono 500 · 11–12px | UPPERCASE, .09–.12em |
| IDs / metrics / time | DM Mono 500–700 · 11.5–14px | tabular feel |

**Never** drop UI text below 12px. Numbers, IDs, timestamps, tokens, ₹ amounts → **always DM Mono** for alignment.

---

## 4. Component anatomy & states (redlines)

### 4.1 Buttons
- **Primary (filled):** pill (radius 999px), `--brand` bg, #fff text, `--shadow-brand`, padding `10–13px / 18–24px`, weight 700.
  - *Hover* brightness 1.06 · *Active* scale .98 · *Focus* azure ring · *Disabled* `--ink-200` bg, no shadow.
- **Ghost:** pill, white bg, `1px --border-subtle`, `--text-body`, weight 600.
  - *Hover* `--brand-soft` fill + `--azure-200` border.
- **Icon button:** 38px square, radius 11px, 1px border, white; icon 18px `currentColor`. Notification variant carries an 8px red dot (2px white ring).
- **Text/link action:** no chrome, `--text-link`, weight 600; used for "View →", "Remind", "View all".

### 4.2 Cards
- White · `1px --border-subtle` · radius 16–18px · `--shadow-sm` (static) / `--shadow-xs` (dense).
- **Interactive (`.lift`):** hover translateY(−3px) + `--shadow-md`.
- **Inverse feature card:** `--grad-ink`, white text, inner stat tiles at `rgba(255,255,255,.08)` — used for Live queue only.
- Inner padding: 18–24px. Section title sits top-left; optional chip/link top-right.

### 4.3 Tables
- **Header row:** DM Mono 11.5px uppercase `--text-faint`, padding `13px 20px`, hairline bottom.
- **Body cell:** DM Sans 14px, padding `15px 20px`, divider `1px --ink-100`.
- **Row hover:** `--ink-50` (whole row); clickable rows show a `View →` affordance in the last cell.
- **First cell of people rows:** 36px round avatar (initials, `--azure-50`/`--brand-strong`) + name (600) + ID (mono faint).
- Right-align numeric/amount columns; status columns carry a badge, not raw text.

### 4.4 Status badge
`display:inline-flex; gap:5px; padding:3–4px 10–11px; radius:999px; font: DM Sans 600 11.5–12px`. Tint bg + saturated text per §2. Optional 13px leading icon (allergy triangle, clock). One badge = one fact.

### 4.5 Form field
- Label (13px/600 strong, 7px gap) → control.
- Input/select/textarea: padding `11px 14px`, radius 12px, `1px --border-default`, white (or `--ink-50` for inline search).
- **Focus:** border → `--brand`, add 3px translucent azure ring. **Required** marked with `*`.
- Textarea min-height 60–80px, vertical resize only.
- Grid forms use `1fr 1fr` or `repeat(3,1fr)` with 14px gaps; full-width fields span all columns.

### 4.6 Modal
- Overlay `rgba(27,28,32,.42)` + `blur(3px)`, centered, 24px viewport padding.
- Panel: white, radius 20px, `--shadow-xl`, padding 28px, max-height 88vh scroll.
- Header = title (19px/700) + subtitle + 32px close (×) icon button. Footer = Cancel (ghost) + primary, right-aligned.
- Click overlay closes; click panel does not (stopPropagation).

### 4.7 Chips, pills, segmented
- **Filter/segmented control:** pill group in a `--border-subtle` container, 5px inner pad; active segment = `--brand` fill #fff (or `--brand-soft`/`--brand-strong` for lighter tabs).
- **Data chip:** ICD codes, allergies, tags — soft tint pill, 12px.
- **OPD stepper:** chips + `›` separators; done = `--brand-soft`/`--brand-strong`, upcoming = `--ink-100`/muted.

### 4.8 Sidebar nav item
- `display:flex; gap:11px; padding:9px 12px; radius:10px`; icon 19px (1.8 stroke); label DM Sans 14px.
- **Active:** `--brand-soft` bg, `--brand-strong` text, weight 600. **Hover:** `--ink-100`.
- **Group label:** DM Mono 10px uppercase `--text-faint`, padding `14px 12px 5px`.
- **Sub-items** (Inventory): 13px, indented under a left hairline, 7px vertical pad.
- **Count badge** (Queue): mono 10.5px on `--brand-soft` pill.

### 4.9 Empty state
Centered in a card: 64px `--brand-soft` rounded-tile icon → title (18px/700) → one-line muted body (max 380px) → "Coming soon" mono pill. Used for Purchases.

### 4.10 Charts (hand-built, keep them flat & tokenized)
- **Bar:** rounded top (7px), `--grad-sky`/`--grad-brand` for active, `--azure-200` for muted, `--ink-100` track. Labels DM Mono 11px faint.
- **Horizontal meter:** 20–22px track `--ink-100`, fill azure/success ramp, value right-aligned mono.
- **Sparkline:** flush mini-bars, latest bar in `--brand`, rest `--azure-200`.
- **Stacked mix bar:** single 26px rounded bar segmented by mode + legend dots.
- Never add gridlines, 3D, drop shadows, or chart libraries — these are CSS blocks.

---

## 5. Iconography rules
- **Lucide**, 24px grid, **2px round stroke, outline only**, `currentColor`. Sizes 15–19px inline, 30–40px in feature tiles/marks.
- Brand-azure stroke for emphasis icons; faint for decorative.
- The **only** filled glyph allowed: testimonial stars (amber) — not used in this ERP.
- No emoji, no dingbats, no duotone.

---

## 6. Spacing & radius quick-reference
| Element | Radius | Padding |
|---|---|---|
| Input, small tile | 12px | 11×14 |
| Card | 16–18px | 18–24 |
| Feature/dark panel, modal | 20–28px | 22–32 |
| Button, chip, badge | 999px (pill) | see §4 |
| Avatar | 50% (people) / 10–15px (brand tiles) | — |
| Mark tile | ~31% of size | — |

Vertical rhythm inside cards: 6–14px between rows; 14–18px before a new sub-section; 20px section title → content.

---

## 7. Screen inventory (what the team owns)
**Shell app (26):** Dashboard · Patients · Patient chart · Queue · Consultation · E-Prescriptions (list + builder) · Lab & Diagnostics · Appointments · Messages · Billing · Bill builder · Payments & day-end · Billing settings · Inventory ×8 (overview/add/purchases/suppliers/expiring/activity/reports/settings) · Reports · Doctors · Staff & roles · Clinic settings.
**Auth (3):** Login · Register · Onboarding.
**Full-bleed (4):** Queue TV · Mobile app · Prescription PDF · GST invoice PDF.

Each screen's field-level breakdown, header action, and status lifecycle → see `HUDA-ERP-DESIGN.md` §6–7. Match those exactly; this doc governs *how they look*, that doc governs *what they contain*.

---

## 8. The OPD flow — motion contract
Every clinical screen must end with the button that opens the next:
`Queue ▸ Call next → Consultation ▸ Finish & prescribe → Rx builder ▸ Finalize → Bill builder ▸ Issue & collect → Payments`.
Show the **OPD stepper** on Consultation and Bill builder so staff always know where they are. Back/secondary paths use ghost buttons; forward path uses the single primary.

---

## 9. Do / Don't (house rules)

**Do**
- Use tokens (`var(--*)`) for every value — color, radius, shadow, font.
- Keep one filled primary per screen; make it the workflow's next step.
- Pair every status color with a label; add ↑/↓ to lab values.
- Right-align money/quantity; use DM Mono for all numerics.
- Let cards sit on the grey page with hairline + soft shadow; group with gaps, not nested boxes.
- Keep the sticky rail for context/commit; keep the primary work on the left.

**Don't**
- Invent colors, fonts, or a second primary button.
- Use pure-black shadows, full-page gradients, or alarm-red for non-risk.
- Drop text below 12px or center long-form body copy.
- Add chart libraries, gridlines, or 3D — charts are flat CSS blocks.
- Use emoji or filled/duotone icons.
- Nest a bordered box inside a bordered card — use spacing/hairlines instead.

---

## 10. Redline cheat-sheet (memorize these)
- Sidebar **264** · utility bar **56** · content pad **28/32/56** · card gap **18** · KPI gap **14**.
- Card radius **16–18** · input radius **12** · pill **999** · card shadow **--shadow-sm**.
- Primary button pad **10–13 / 18–24**, weight **700**, **--shadow-brand**.
- Table th **mono 11.5 uppercase**, td **14**, row divider **--ink-100**, hover **--ink-50**.
- Sticky rail **320–340** · avatar (row) **36** / (chart) **54–76**.
- H1 **23/700** · KPI **27–34/700** · body **13.5–14** · label **13/600** · overline **11–12 mono**.

---

## 11. Handoff logistics
- **Source of truth:** `HUDA ERP.dc.html` (live, clickable, all routes). Deep-link any screen via hash (`#consultation`, `#bill-builder`, `#labs`…).
- **Canvas overview:** `HUDA Screens.dc.html` — every route framed for review.
- **Figma:** import `HUDA-ERP-figma.html` via html.to.design (From URL/HTML); append route hash per frame; widths **1440** app / **390** mobile / **820** PDF.
- **Tokens live** in `_ds/groweb-design-system-…/tokens/*.css` — pull real values there; do not eyeball from screenshots.
- **Fonts:** Poppins / DM Sans / DM Mono (Google Fonts).
- **Locale:** ₹ INR · IST · GST/GSTIN/SAC · +91 phones · Indian names.

---

*Consistency is the feature. When in doubt, copy an existing pattern from this doc rather than designing a new one — the seams should be invisible.*
