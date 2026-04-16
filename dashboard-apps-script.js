// ==========================================
// CWIS Dashboard — Google Apps Script Backend
// ==========================================
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com → New Project (separate from your survey script)
// 2. Paste this entire file content
// 3. Use the SAME Spreadsheet ID as your survey
// 4. Click Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone (or restrict to your org)
// 5. Copy the deployment URL → paste into dashboard.html as DASHBOARD_SCRIPT_URL
// ==========================================

const SPREADSHEET_ID = '1UqSr8X56m2vQwBS2B6P9-mfy1T-BwOP2a7aQqgtLHXw';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Responses');

    if (!sheet || sheet.getLastRow() < 2) {
      return jsonResponse({ status: 'ok', totalResponses: 0, rows: [], headers: [] });
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    const data = dataRange.getValues();

    // Convert to array of objects
    const rows = data.map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });

    return jsonResponse({
      status: 'ok',
      totalResponses: rows.length,
      headers: headers,
      rows: rows
    });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
