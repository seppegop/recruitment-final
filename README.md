# Recruitment Screener

A self-hostable web form for screening and classifying participants for a UX Engineering dissertation study. Filters for active ideation practice, auto-classifies respondents into an Experience × AI Usage segmentation matrix, and tracks coverage against a target quota of 9–10 participants.

## Quick Start

```bash
npm install
npm run dev
```

This starts both the Vite dev server (port 5173) and the Express API (port 3001). Open http://localhost:5173 to see the form.

### Admin View

Navigate to http://localhost:5173/admin and log in with the admin password (default: `screener-admin-2024`). The admin view shows:

- **Coverage dashboard** — 3×3 matrix of current vs. target counts per segment
- **Response table** — all submissions with segment labels and flags
- **CSV export** — downloads all eligible responses as a UTF-8 CSV that opens in Excel

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express server port |
| `ADMIN_PASSWORD` | `screener-admin-2024` | Password for the `/admin` view |
| `DB_PATH` | `./data/responses.db` | Path to the SQLite database file |
| `GOOGLE_SHEET_WEBHOOK` | *(empty)* | Google Apps Script web app URL for syncing to Google Sheets |

## Google Sheets Integration

Eligible submissions are automatically synced to a Google Sheet when `GOOGLE_SHEET_WEBHOOK` is set. Setup:

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace the default code with the contents of `google-apps-script/Code.gs`
4. Click **Deploy → New deployment**
5. Set type to **Web app**, execute as **Me**, access to **Anyone**
6. Click **Deploy**, then authorize when prompted
7. Copy the web app URL and set it as `GOOGLE_SHEET_WEBHOOK` in your environment

The script auto-creates headers on the first submission. Data flows to the sheet in the background — if the webhook is unreachable, submissions are still saved locally in SQLite.

## Production Deployment

```bash
npm run build
NODE_ENV=production ADMIN_PASSWORD=your-secure-password npm start
```

This builds the React app into `dist/` and serves everything from the Express server on a single port.

## Data Storage

- Responses are stored in a local **SQLite** database at `data/responses.db` (configurable via `DB_PATH`).
- No data is sent to any third-party service.
- The CSV export includes a UTF-8 BOM for Excel compatibility.

## Editing Consent / Intro Text

All editable text is in `src/screenerConfig.js`:

- `INTRO_TEXT` — shown at the top of the form
- `CONSENT_TEXT` — placeholder for ethics-board-approved consent language
- `PRIVACY_TEXT` — shown near the submit button

**Important:** Replace `CONSENT_TEXT` with the language approved by your institution's ethics review board before deploying.

## Config Flag

`SHOW_SEGMENT_LABELS_TO_RESPONDENT` in `src/screenerConfig.js` controls whether segment labels like "(Junior)", "(Light)", "(Regular)", "(Power)" are shown to respondents. Default is `true` (labels shown). Set to `false` to strip them from the UI without affecting stored data.

## Static Fallback

If you cannot host a server, open `static-fallback/index.html` directly in a browser. It performs the same eligibility gating and classification client-side and lets the respondent download their answers as JSON or CSV.

## Project Structure

```
├── server/index.js          # Express API + SQLite
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Router (form vs admin)
│   ├── screenerConfig.js    # All screener content + config flag
│   ├── pages/
│   │   ├── ScreenerForm.jsx # Multi-step form
│   │   └── AdminPage.jsx    # Admin dashboard
│   ├── components/
│   │   ├── StepEligibility.jsx
│   │   ├── StepClassification.jsx
│   │   ├── StepContext.jsx
│   │   └── RadioGroup.jsx
│   └── styles/global.css
├── static-fallback/index.html
└── data/                    # SQLite DB (created at runtime)
```
