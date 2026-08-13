# HUDA Medical Panel

Ionic + Angular pharmacy counter app for the HUDA Clinic ERP.

## Features

- Login (clinic pharmacist / staff with `dispenseMedicines`)
- Dispense queue from doctor-finalized prescriptions (`pharmacy_counter` mode)
- Dispense → FEFO stock → medicine bill → mark paid → WhatsApp (wa.me + PDF)
- OTC walk-in sales
- Stock receive (shared clinic inventory)
- Analytics (sales, profit, top drugs)
- Returns, day-close, barcode/batch lookup

## Setup

1. Run the HUDA-CRM API on port **3333** with `server/.env` configured.
2. In the CRM inventory settings, set **Dispense on** → **Pharmacy counter**.
3. Create a **pharmacist** staff user (owner/admin/doctor).
4. Point the app at the API:

```bash
# src/environments/environment.ts
apiBaseUrl: 'http://127.0.0.1:3333'
```

For Android emulator use `http://10.0.2.2:3333`.

```bash
npm install
npm start
# open http://localhost:8100
```

## API

All calls go to `/api/v1/projects/:clinicSlug/pharmacy/...` (and shared payments/inventory routes).

The API's `CORS_ORIGIN` must list the dev server origin. Port 8100 is taken by the staff app, so
this app usually lands on 8101.

## UI

The app follows the HUDA / Groweb design system — see `docs/HUDA-ERP-UI-HANDOFF.md`.

- `src/theme/huda-tokens.scss` and `src/theme/huda-components.scss` are kept byte-identical with
  `Huda-Staff-Web-app` so the two surfaces never drift. Change them there first, then copy across.
- `src/theme/huda-pharmacy.scss` holds counter-only additions (lot chips, quantity steppers, flat
  CSS charts, data tables, the dark day-close band).
- `src/app/shared/ui` exposes `HudaUiModule` — add it to a page's NgModule imports to get
  `huda-page-header`, `huda-empty-state`, `huda-badge` and `huda-avatar`.

Pages compose `div.huda-card` on top of Ionic primitives rather than using `ion-card`, and every
value comes from a token. Light palette only; no chart libraries.
# Huda-Medical-Panel
# Huda-Medical-Panel
