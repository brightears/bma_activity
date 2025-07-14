// Google Apps Script Code for BMA Weekly Reports
// Instructions:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Replace all code with this script
// 4. Save and deploy as Web App

function doPost(e) {
  try {
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reports');
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Week Number',
        'Report Date',
        'New Zones',
        'Monthly Recurring',
        'Pipeline Value',
        'Sales Details',
        'Music Details',
        'Tech Details',
        'Challenges',
        'Next Week Priorities',
        'Submitted By'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#E31937');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Prepare row data
    const rowData = [
      new Date(), // Timestamp
      data.week,
      data.date,
      data.metrics.zones,
      data.metrics.mrr,
      data.metrics.pipeline,
      formatSalesData(data.sales),
      formatActivityData(data.music),
      formatActivityData(data.tech),
      data.challenges || 'None',
      data.priorities || 'None',
      Session.getActiveUser().getEmail()
    ];
    
    // Append the data
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 12);
    
    // Create a summary sheet if it doesn't exist
    createOrUpdateSummary(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Report saved successfully!',
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  // Simple GET endpoint for testing
  return ContentService.createTextOutput('BMA Weekly Report API is active and ready to receive reports.');
}

function formatSalesData(sales) {
  if (!sales || sales.length === 0) return 'No sales data';
  
  return sales.map(item => {
    let text = `[${item.status.toUpperCase()}] ${item.description}`;
    if (item.zones) text += ` (${item.zones} zones)`;
    if (item.yearly) text += ` ($${parseInt(item.yearly).toLocaleString()}/year)`;
    if (item.member) text += ` - ${item.member}`;
    return text;
  }).join('\n');
}

function formatActivityData(activities) {
  if (!activities || activities.length === 0) return 'No activity data';
  
  return activities.map(item => {
    let text = `[${item.status.toUpperCase()}] ${item.description}`;
    if (item.member) text += ` - ${item.member}`;
    return text;
  }).join('\n');
}

function createOrUpdateSummary(data) {
  let summarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Summary');
  
  // Create summary sheet if it doesn't exist
  if (!summarySheet) {
    summarySheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Summary');
    
    // Set up summary headers
    const headers = [
      ['BMA Weekly Reports Summary'],
      [''],
      ['Metric', 'This Week', 'Last Week', 'Change', 'YTD Total'],
      ['New Zones', '', '', '', ''],
      ['Monthly Recurring Revenue', '', '', '', ''],
      ['Pipeline Value', '', '', '', ''],
      [''],
      ['Team Performance This Week'],
      ['Sales Team', 'Activities'],
      ['Music Team', 'Activities'],
      ['Tech Team', 'Activities']
    ];
    
    summarySheet.getRange(1, 1, headers.length, 5).setValues(headers);
    
    // Format title
    summarySheet.getRange(1, 1, 1, 5).merge();
    summarySheet.getRange(1, 1).setFontSize(18);
    summarySheet.getRange(1, 1).setFontWeight('bold');
    
    // Format headers
    summarySheet.getRange(3, 1, 1, 5).setFontWeight('bold');
    summarySheet.getRange(3, 1, 1, 5).setBackground('#f0f0f0');
  }
  
  // Update summary with latest data
  const zones = parseInt(data.metrics.zones) || 0;
  const mrr = data.metrics.mrr.replace('$', '').replace(',', '');
  const pipeline = data.metrics.pipeline.replace('$', '').replace(',', '');
  
  summarySheet.getRange(4, 2).setValue(zones);
  summarySheet.getRange(5, 2).setValue(mrr);
  summarySheet.getRange(6, 2).setValue(pipeline);
  
  // Update team counts
  summarySheet.getRange(9, 2).setValue(data.sales ? data.sales.length : 0);
  summarySheet.getRange(10, 2).setValue(data.music ? data.music.length : 0);
  summarySheet.getRange(11, 2).setValue(data.tech ? data.tech.length : 0);
}

// Utility function to get report data for analysis
function getWeeklyReportData(weekNumber) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reports');
  const data = sheet.getDataRange().getValues();
  
  // Filter by week number
  const weekData = data.filter((row, index) => {
    return index > 0 && row[1] == weekNumber;
  });
  
  return weekData;
}

// Function to email weekly report
function emailWeeklyReport(weekNumber) {
  const data = getWeeklyReportData(weekNumber);
  if (data.length === 0) {
    throw new Error('No data found for week ' + weekNumber);
  }
  
  const latestReport = data[data.length - 1];
  const recipient = Session.getActiveUser().getEmail();
  
  const subject = `BMA Weekly Report - Week ${weekNumber}`;
  const body = `
    Weekly Report Summary
    
    Week: ${latestReport[1]}
    Date: ${latestReport[2]}
    
    Metrics:
    - New Zones: ${latestReport[3]}
    - Monthly Recurring: ${latestReport[4]}
    - Pipeline Value: ${latestReport[5]}
    
    Sales Activities:
    ${latestReport[6]}
    
    Music Design Activities:
    ${latestReport[7]}
    
    Tech/Ops Activities:
    ${latestReport[8]}
    
    Challenges:
    ${latestReport[9]}
    
    Next Week Priorities:
    ${latestReport[10]}
  `;
  
  GmailApp.sendEmail(recipient, subject, body);
}