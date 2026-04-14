// ==========================================
// CWIS Survey — Google Apps Script Backend
// ==========================================
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com → New Project
// 2. Paste this entire file content
// 3. Replace SPREADSHEET_ID and DRIVE_FOLDER_ID below
// 4. Click Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployment URL → paste into index.html as SCRIPT_URL
// ==========================================

const SPREADSHEET_ID = '1UqSr8X56m2vQwBS2B6P9-mfy1T-BwOP2a7aQqgtLHXw'; // CWIS Survey Responses
const DRIVE_FOLDER_ID = '1Lel80sZ6a1zILeHwyxr4w7OwNciUqv_A'; // CWIS Survey Photos folder

// Column headers matching survey fields
const HEADERS = [
  'Timestamp',
  'City / Municipality',
  'Barangay / Ward',
  'Respondent Name',
  'Contact Number',
  // Section A
  'Latitude',
  'Longitude',
  'GPS Accuracy (m)',
  'Address / Landmark',
  // Photos
  'HH Photo URL',
  'HH Photo GPS',
  'Toilet Photo URL',
  'Toilet Photo GPS',
  'Tank Photo URL',
  'Tank Photo GPS',
  'Outlet Photo URL',
  'Outlet Photo GPS',
  // Section B
  'B1. Storm Surge Risk',
  'B2. High Tide Risk',
  'B3. Urban Flooding Risk',
  'B4. Flood Entered Containment',
  'B5. Flood Water Level',
  'B6. Flood Frequency',
  // Section C
  'C1. High GWT Risk',
  'C2. Sinkhole Risk',
  'C3. Water Seepage Tank',
  // Section D
  'D1. Family Members',
  'D2. Children Under 5',
  'D3. Dwelling Type',
  // Section E
  'E1. Sanitation Type',
  'E1a. Sanitation Type Other',
  'E2. Wall Type',
  'E3. Bottom Type',
  'E4. Has Partition',
  'E5. Partition Count',
  'E6. Has Outlet',
  'E7. Outlet Destination',
  'E8. Year Constructed',
  'E9. Tank Size',
  // Section F
  'F1. Kitchen Same Tank',
  'F2. Bathroom Same Tank',
  'F3. Greywater Destination',
  // Section G
  'G1. Ever Desludged',
  'G2. Last Desludge When',
  'G3. Desludging Method',
  'G4. Truck Trips',
  'G5. Desludging Cost (PHP)',
  'G6. Desludging Provider',
  'G6a. Provider Other',
  'G7. Desludging Satisfaction',
  'G8. No Desludge Reason',
  'G8a. No Desludge Other',
  // Section H
  'H1. Drinking Water Source',
  'H2. Non-Drinking Water Source',
  'H3. Borewell Depth (ft)',
  'H4. Borewell-Tank Distance (m)',
  'H5. Borewell Odor/Discolor',
  // Section I
  'I1. Diarrhea 6 Months',
  'I2. Cholera / Waterborne',
  'I3. Health Affected Count',
  'I4. Past Septic Issues',
  'I5. Septic Issue Description',
  'I6. Past Toilet Issues',
  'I7. Toilet Issue Description',
  // Section J
  'J4. Enumerator Notes',
  'J5. Respondent Consent',
];

// ==========================================
// Handle POST request from survey form
// ==========================================
function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Responses');

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Responses');
      sheet.appendRow(HEADERS);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground('#1a6b4e');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Save photos to Drive and get URLs
    const hhPhotoUrl    = savePhotoToDrive(data.hh_photo, data.respondent_name, 'HH', data.timestamp);
    const toiletPhotoUrl = savePhotoToDrive(data.toilet_photo, data.respondent_name, 'Toilet', data.timestamp);
    const tankPhotoUrl  = savePhotoToDrive(data.tank_access_photo, data.respondent_name, 'Tank', data.timestamp);
    const outletPhotoUrl = savePhotoToDrive(data.outlet_photo, data.respondent_name, 'Outlet', data.timestamp);

    // Build row
    const row = [
      data.timestamp || '',
      data.city_municipality || '',
      data.barangay_ward || '',
      data.respondent_name || '',
      data.contact_number || '',
      // Section A
      data.latitude || '',
      data.longitude || '',
      data.gps_accuracy || '',
      data.address_landmark || '',
      // Photos
      hhPhotoUrl,
      data.hh_photo_gps || '',
      toiletPhotoUrl,
      data.toilet_photo_gps || '',
      tankPhotoUrl,
      data.tank_photo_gps || '',
      outletPhotoUrl,
      data.outlet_photo_gps || '',
      // Section B
      data.storm_surge_risk || '',
      data.high_tide_risk || '',
      data.urban_flooding_risk || '',
      data.flood_entered_containment || '',
      data.flood_water_level || '',
      data.flood_frequency || '',
      // Section C
      data.high_gwt_risk || '',
      data.sinkhole_risk || '',
      data.water_seepage_tank || '',
      // Section D
      data.family_members || '',
      data.children_under5 || '',
      data.dwelling_type || '',
      // Section E
      data.sanitation_type || '',
      data.sanitation_type_other || '',
      data.wall_type || '',
      data.bottom_type || '',
      data.has_partition || '',
      data.partition_count || '',
      data.has_outlet || '',
      data.outlet_destination || '',
      data.year_constructed || '',
      data.tank_size || '',
      // Section F
      data.kitchen_same_tank || '',
      data.bathroom_same_tank || '',
      data.greywater_destination || '',
      // Section G
      data.ever_desludged || '',
      data.last_desludge_when || '',
      data.desludging_method || '',
      data.truck_trips || '',
      data.desludging_cost || '',
      data.desludging_provider || '',
      data.desludge_provider_other || '',
      data.desludging_satisfaction || '',
      data.no_desludge_reason || '',
      data.no_desludge_other || '',
      // Section H
      data.drinking_water_source || '',
      data.nondrinking_water_source || '',
      data.borewell_depth_ft || '',
      data.borewell_tank_dist_m || '',
      data.borewell_odor_discolor || '',
      // Section I
      data.diarrhea_6months || '',
      data.cholera_waterborne || '',
      data.health_affected_count || '',
      data.past_septic_issues || '',
      data.septic_issue_desc || '',
      data.past_toilet_issues || '',
      data.toilet_issue_desc || '',
      // Section J
      data.enumerator_notes || '',
      data.respondent_consent || '',
    ];

    sheet.appendRow(row);

    // Auto-resize columns (only first 10 to keep it fast)
    sheet.autoResizeColumns(1, 10);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Survey saved!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// Save base64 photo to Google Drive
// ==========================================
function savePhotoToDrive(base64Data, respondentName, photoType, timestamp) {
  if (!base64Data || base64Data.length < 50) return '';
  try {
    // Strip data:image/...;base64, prefix
    const matches = base64Data.match(/^data:([a-zA-Z0-9+\/]+\/[a-zA-Z0-9+\/]+);base64,(.+)$/);
    if (!matches) return '';
    const mimeType = matches[1];
    const base64 = matches[2];
    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');

    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType);
    const safeName = (respondentName || 'unknown').replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
    const safeDate = (timestamp || new Date().toISOString()).replace(/[:.]/g, '-').slice(0, 19);
    blob.setName(`${safeName}_${photoType}_${safeDate}.${ext}`);

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.error('Photo save error:', err.message);
    return 'Error saving photo: ' + err.message;
  }
}

// ==========================================
// Handle GET (used to verify deployment)
// ==========================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'CWIS Survey API is running!' }))
    .setMimeType(ContentService.MimeType.JSON);
}
