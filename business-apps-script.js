// =====================================================================
// CWIS BUSINESS Survey — Google Apps Script Backend
// =====================================================================
// SETUP INSTRUCTIONS:
// 1. Create a NEW Google Sheet (separate from the household survey sheet).
//    Copy its ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
// 2. Go to https://script.google.com → New Project (do NOT reuse the
//    household survey project — keep them separate).
// 3. Paste this entire file as the Code.gs content.
// 4. Replace SPREADSHEET_ID below with your new sheet's ID.
// 5. (Optional) Run setupHeaders() once manually to write the header row.
// 6. Click Deploy → New Deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
// 7. Copy the deployment URL → paste into business-survey.html as SCRIPT_URL.
// =====================================================================

const SPREADSHEET_ID = '1dsopwHtngNY8GfGshqIw4mjn04JeFMNWs3GvK0q74qk';

// Column headers — match the order of the row built in doPost()
const HEADERS = [
  'Timestamp',

  // Section A. Business Information
  'A1. Business Name',
  'A2. Respondent Name',
  'A2a. Respondent Role',
  'A3. Mobile Number',
  'A3a. Email',
  'A4. Barangay',
  'A4a. Street / Landmark',
  'A5. Business Type',
  'A5a. Business Type — Other',
  'A6. Years Operating',

  // Section B. Establishment Size
  'B1. Guest Rooms (Hotel/Resort/Rental)',
  'B2. Hotel CR Count',
  'B3. Occupancy Rate',
  'B4. Seating Capacity (Restaurant)',
  'B5. Meals per Day',
  'B6. Restaurant CR Count',
  'B7. Stalls / Shops Count (Mall)',
  'B8. Mall CR Count',
  'B9. Other — Size Description',
  'B9a. Other CR Count',

  // Section C. Water Use
  'C1. Water Sources',
  'C1a. Water Source — Other',
  'C2. Monthly Water Use',

  // Section D. Wastewater System
  'D1. Own or Shared System',
  'D2. System Type',

  // Section E. Septic Tank Details
  'E1. Number of Septic Tanks',
  'E2. Tank Size Known',
  'E3. Tank Length',
  'E3. Tank Width',
  'E3. Tank Depth',
  'E3. Tank Unit',
  'E4. Chamber Count',
  'E5. Tank Built',
  'E6. Tank Bottom',
  'E7. Tank Walls',
  'E8. Has Grease Trap',
  'E8a. Grease Trap Count',
  'E9. Separate Black/Grey Tanks',
  'E9a. Separate Tanks — Description',
  'E10. Outfall',
  'E11. Last Desludged',
  'E12. Desludge Calls (12m)',
  'E13. Desludge Operator',
  'E14. Cost per Trip',
  'E15. Tank Problems',
  'E15a. Tank Problems — Other',
  'E16. Flooding Around Business',
  'E17. Flood Level',
  'E18. Rain Enters Tank',

  // Section F. STP Details
  'F1. STP Capacity',
  'F2. STP Technology',
  'F2a. STP Technology — Other',
  'F3. STP Built',
  'F4. STP Operational Cost / Year',
  'F5. Lab Testing',
  'F6. Lab Test Frequency',
  'F7. Lab Test Cost / Year',
  'F8. STP Problems',
  'F8a. STP Problems — Other',
  'F9. Sludge Disposal',
  'F9a. Sludge Disposal — Other',
  'F10. Haul Trips per Year',
  'F11. Haul Cost per Trip',
  'F12. Re-use Treated Water',
  'F12a. Re-use Water Purpose',
  'F12b. Re-use Water — Other',
  'F13. Re-use Treated Sludge',
  'F13a. Re-use Sludge Purpose',
  'F13b. Re-use Sludge — Other',

  // Section G. Regulatory & Sanitation Fee
  'G1. DENR Required',
  'G2. DENR Held',
  'G3. Mandatory Desludging Cert',
  'G4. Agree Septic Sanitation Fee',
  'G5. WTP Septic per Trip',
  'G6. Agree STP Sanitation Fee',
  'G7. WTP STP per Year',

  // Section H. Closure
  'H1. Other Comments',
  'H2. Respondent Consent',
];

// =====================================================================
// Apply headers to a sheet
// =====================================================================
function applyHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#1a6b4e');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// =====================================================================
// Run this ONCE manually to add headers to existing sheet
// =====================================================================
function setupHeaders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Responses');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Responses');
  }
  if (sheet.getLastRow() > 0 && sheet.getRange(1, 1).getValue() !== ''
      && sheet.getRange(1, 1).getValue() !== 'Timestamp') {
    sheet.insertRowBefore(1);
  }
  applyHeaders(sheet);
  SpreadsheetApp.flush();
  Logger.log('Headers set up on sheet: ' + sheet.getName());
}

// =====================================================================
// Handle POST request from survey form
// =====================================================================
function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Responses');

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Responses');
      applyHeaders(sheet);
    } else if (sheet.getLastRow() === 0
               || sheet.getRange(1, 1).getValue() !== 'Timestamp') {
      if (sheet.getLastRow() > 0
          && sheet.getRange(1, 1).getValue() !== 'Timestamp') {
        sheet.insertRowBefore(1);
      }
      applyHeaders(sheet);
    }

    // Build row in the same order as HEADERS
    const row = [
      data.timestamp || '',

      // Section A
      data.business_name || '',
      data.respondent_name || '',
      data.respondent_role || '',
      data.contact_number || '',
      data.contact_email || '',
      data.barangay || '',
      data.street_landmark || '',
      data.business_type || '',
      data.business_type_other || '',
      data.years_operating || '',

      // Section B
      data.guest_rooms || '',
      data.hotel_cr_count || '',
      data.occupancy_rate || '',
      data.seating_capacity || '',
      data.meals_per_day || '',
      data.resto_cr_count || '',
      data.stall_count || '',
      data.mall_cr_count || '',
      data.other_size_desc || '',
      data.other_cr_count || '',

      // Section C
      data.water_sources || '',
      data.water_source_other || '',
      data.monthly_water_use || '',

      // Section D
      data.own_or_shared || '',
      data.system_type || '',

      // Section E
      data.tank_count || '',
      data.tank_size_known || '',
      data.tank_length || '',
      data.tank_width || '',
      data.tank_depth || '',
      data.tank_unit || '',
      data.chamber_count || '',
      data.tank_built || '',
      data.tank_bottom || '',
      data.tank_walls || '',
      data.has_grease_trap || '',
      data.grease_trap_count || '',
      data.separate_tanks || '',
      data.separate_tanks_desc || '',
      data.outfall || '',
      data.last_desludged || '',
      data.desludge_calls_12m || '',
      data.desludge_operator || '',
      data.cost_per_trip || '',
      data.tank_problems || '',
      data.tank_problems_other || '',
      data.flooding_around || '',
      data.flood_level || '',
      data.rain_enters_tank || '',

      // Section F
      data.stp_capacity || '',
      data.stp_technology || '',
      data.stp_technology_other || '',
      data.stp_built || '',
      data.stp_op_cost || '',
      data.lab_testing || '',
      data.lab_test_freq || '',
      data.lab_test_cost || '',
      data.stp_problems || '',
      data.stp_problems_other || '',
      data.sludge_disposal || '',
      data.sludge_disposal_other || '',
      data.haul_per_year || '',
      data.haul_cost_per_trip || '',
      data.reuse_water || '',
      data.reuse_water_purpose || '',
      data.reuse_water_other || '',
      data.reuse_sludge || '',
      data.reuse_sludge_purpose || '',
      data.reuse_sludge_other || '',

      // Section G
      data.denr_required || '',
      data.denr_held || '',
      data.mandatory_cert || '',
      data.agree_septic_fee || '',
      data.wtp_septic_per_trip || '',
      data.agree_stp_fee || '',
      data.wtp_stp_per_year || '',

      // Section H
      data.other_comments || '',
      data.respondent_consent || '',
    ];

    sheet.appendRow(row);
    sheet.autoResizeColumns(1, 10);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Business survey saved!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================================
// Handle GET (used to verify deployment)
// =====================================================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'CWIS Business Survey API is running!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}