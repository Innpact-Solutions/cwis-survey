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
  const callback = e && e.parameter && e.parameter.callback;

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Responses');

    if (!sheet || sheet.getLastRow() < 2) {
      return jsonpResponse({ status: 'ok', totalResponses: 0, rows: [], headers: [] }, callback);
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

    return jsonpResponse({
      status: 'ok',
      totalResponses: rows.length,
      headers: headers,
      rows: rows
    }, callback);

  } catch (err) {
    return jsonpResponse({ status: 'error', message: err.message }, callback);
  }
}

function jsonpResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    // JSONP: wrap in callback function to bypass CORS
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
