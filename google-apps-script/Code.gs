// Google Apps Script — paste this into Extensions > Apps Script in your Google Sheet.
// Then deploy as a web app (Execute as: Me, Access: Anyone).
// Copy the deployment URL and set it as GOOGLE_SHEET_WEBHOOK in your .env file.

const HEADERS = [
  'ID',
  'Timestamp',
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

// GET handler for testing — visit the URL in a browser to verify deployment
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Screener webhook is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
