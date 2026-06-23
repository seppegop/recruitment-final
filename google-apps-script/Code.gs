// Google Apps Script — paste this into Extensions > Apps Script in your Google Sheet.
// Then deploy as a web app (Execute as: Me, Access: Anyone).
// Copy the deployment URL and set it as GOOGLE_SHEET_WEBHOOK in your .env file.
// IMPORTANT: After updating this code, create a NEW deployment version in Apps Script.

const HEADERS = [
  'ID',
  'Timestamp',
  'Full Name',
  'E-mail',
  'Eligible',
  'Segment Label',
  'Experience Segment',
  'Usage Segment',
  'Low Experience Flag',
  'Q1 — Years of Experience',
  'Q2 — AI Usage Frequency',
  'Q3 — AI Ideation Practice',
  'Q4 — Role',
  'Q4 — Industry',
  'Q4 — Employer',
  'Q5 — AI Tools Used',
  'Q6 — Ideation Episode',
  'Q7 — Willing to Screen-Share',
];

const FIELD_KEYS = [
  'id', 'created_at', 'eligible', 'segment_label',
  'experience_segment', 'usage_segment', 'low_experience_flag',
  'q1', 'q2', 'q3', 'q4_role', 'q4_industry', 'q4_employer',
  'q5', 'q6', 'q7',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1')
                  || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    const row = [
      data.id || '',
      data.created_at || '',
      data.full_name || '',
      data.email || '',
      data.eligible ? 'Yes' : 'No',
      data.segment_label || '',
      data.experience_segment || '',
      data.usage_segment || '',
      data.low_experience_flag ? 'Yes' : '',
      data.q1 || '',
      data.q2 || '',
      data.q3 || '',
      data.q4_role || '',
      data.q4_industry || '',
      data.q4_employer || '',
      Array.isArray(data.q5) ? data.q5.join(', ') : (data.q5 || ''),
      data.q6 || '',
      data.q7 || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var params = e ? e.parameter : {};

  // Read action: return all rows as JSON (requires admin key)
  if (params.action === 'read') {
    var adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    if (!adminKey) {
      // Fallback: accept any key if ADMIN_KEY is not set in script properties
      // To secure this, go to Apps Script > Project Settings > Script Properties and add ADMIN_KEY
    } else if (params.key !== adminKey) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1')
                || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var dataRange = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
    var values = dataRange.getValues();
    var rows = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var obj = {};
      obj.id = row[0];
      obj.created_at = row[1] instanceof Date ? row[1].toISOString() : String(row[1]);
      obj.full_name = row[2];
      obj.email = row[3];
      obj.eligible = row[4] === 'Yes' ? 1 : 0;
      obj.segment_label = row[5];
      obj.experience_segment = row[6];
      obj.usage_segment = row[7];
      obj.low_experience_flag = row[8] === 'Yes' ? 1 : 0;
      obj.q1 = row[9];
      obj.q2 = row[10];
      obj.q3 = row[11];
      obj.q4_role = row[12];
      obj.q4_industry = row[13];
      obj.q4_employer = row[14];
      obj.q5 = row[15];
      obj.q6 = row[16];
      obj.q7 = row[17];
      rows.push(obj);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Default: health check
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Screener webhook is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
