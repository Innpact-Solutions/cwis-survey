# cwis-survey

## Survey
- `index.html` — Public survey form (hosted on GitHub Pages)
- `google-apps-script.js` — Backend that saves survey responses to Google Sheets

## Dashboard (Internal Assessment)
- `dashboard.html` — Internal results dashboard with charts & data table
- `dashboard-apps-script.js` — Read-only backend that fetches data from the same spreadsheet

### Dashboard Setup
1. Go to [script.google.com](https://script.google.com) → **New Project** (separate from your survey script)
2. Paste the contents of `dashboard-apps-script.js`
3. The `SPREADSHEET_ID` is already set to your survey spreadsheet
4. Deploy → New Deployment → Web App → Execute as **Me** → Access **Anyone** (or your org only)
5. Copy the deployment URL
6. Open `dashboard.html` and replace `YOUR_DASHBOARD_APPS_SCRIPT_URL` with your URL
7. Push to GitHub — the dashboard will be live at `https://innpact-solutions.github.io/cwis-survey/dashboard.html`

> **Tip:** You can also bookmark the dashboard URL on your phone for quick mobile access.