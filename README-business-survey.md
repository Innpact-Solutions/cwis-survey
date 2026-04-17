# CWIS Business Sanitation Survey — Setup Guide

This is the commercial-establishment counterpart to the household survey
(`index.html` / `google-apps-script.js`). It mirrors the same architecture:
a static HTML form hosted on GitHub Pages that POSTs to a Google Apps
Script Web App backed by a Google Sheet.

## Files

- `business-survey.html` — Public survey form. Drop into the
  `cwis-survey` repo (suggested filename: `business.html`).
- `business-apps-script.js` — Apps Script backend that writes
  responses to a Google Sheet.

## One-time Setup

1. **Create a NEW Google Sheet** for business responses. Keep it
   separate from the household sheet so the two datasets don't mix.
   - Copy the sheet ID from its URL:
     `https://docs.google.com/spreadsheets/d/`**`SHEET_ID`**`/edit`

2. **Create a NEW Apps Script project** at https://script.google.com
   (do NOT reuse the household project).
   - Paste the entire contents of `business-apps-script.js` as `Code.gs`.
   - Replace `PASTE_YOUR_BUSINESS_SHEET_ID_HERE` with your sheet ID
     from step 1.
   - (Optional) Run `setupHeaders()` once to write the header row.
   - **Deploy → New Deployment → Web App**
     - *Execute as:* Me
     - *Who has access:* Anyone
   - Copy the deployment URL.

3. **Wire the form to the backend.**
   - Open `business-survey.html`.
   - Near the top of the `<script>` block, find:
     ```js
     const SCRIPT_URL = 'REPLACE_WITH_YOUR_BUSINESS_APPS_SCRIPT_URL';
     ```
   - Replace it with the deployment URL from step 2.

4. **Publish.**
   - Push the file to the GitHub Pages repo (`innpact-solutions/cwis-survey`).
   - Live URL will be e.g.
     `https://innpact-solutions.github.io/cwis-survey/business.html`.

## What's different from the household form

- Welcome page targeted at business owners / managers (not residents).
- Single language (English only) — Cebuano can be added later by
  copying the household pattern (`CHOICE_LISTS_CEB`, `UI_TEXT.ceb`).
- No separate "Survey Identification" section — the form starts
  directly with **Section A. Business Information**.
- **Signature pad** at the end (H4) — the respondent can sign with
  finger (mobile) or mouse (laptop). Stored as a PNG data URL in the
  spreadsheet column "H4. Respondent Signature".
- Conditional **section-skip logic**: Sections E (Septic) and F (STP)
  are auto-skipped depending on what the respondent picks in D2 (system
  type). The progress bar honestly reflects only the sections that
  apply to this respondent.
- **Multi-tank capture** in Section E: the user enters the tank count
  and the form generates that many L×W×D rows, each with live volume.
- The interactive 3D tank canvas previews **Tank 1**'s dimensions as
  you type (same look as the household form's tank diagram).
- Sub-block conditionals for A5 → B.1/B.2/B.3/B.4 so a hotel respondent
  doesn't see restaurant questions, etc.
- Tagbilaran City barangays only (15 barangays) — no city/municipality
  picker since this survey is Tagbilaran-scoped.
- No photo capture; GPS is captured on the closing section.

## Preview mode

If you open the form before deploying the Apps Script, the
`SCRIPT_URL` will still hold its placeholder value. In that mode, the
form runs end-to-end normally and shows the success modal, but the
submission is logged to the browser console (`SURVEY DATA (no backend
configured): {...}`) instead of being POSTed anywhere. Useful for
demos and walk-throughs before the backend is wired.

## Dashboard

To add a dashboard for the business responses, copy
`dashboard-apps-script.js` from the household repo into a new Apps
Script project, repoint its `SPREADSHEET_ID` to the business sheet,
deploy as a Web App, and copy `dashboard.html` to a new file (e.g.
`business-dashboard.html`) with the new dashboard URL.