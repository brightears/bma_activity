// Google Apps Script Code for BMA Weekly Reports - Updated Version
// This version matches the new metrics structure with International/Thailand split

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
        // International (USD) columns
        'Closed Zones (USD)',
        'Closed Amount (USD)',
        'Pipeline Zones (USD)',
        'Pipeline Amount (USD)',
        // Thailand (THB) columns
        'Closed Zones (THB)',
        'Closed Amount (THB)',
        'Pipeline Zones (THB)',
        'Pipeline Amount (THB)',
        // Details columns
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
      headerRange.setBackground('#FF6B35'); // BMAsia orange
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Prepare row data
    const rowData = [
      new Date(), // Timestamp
      data.week,
      data.date,
      // International metrics
      data.metrics.international.closedZones,
      data.metrics.international.closedAmount,
      data.metrics.international.pipelineZones,
      data.metrics.international.pipelineAmount,
      // Thailand metrics
      data.metrics.thailand.closedZones,
      data.metrics.thailand.closedAmount,
      data.metrics.thailand.pipelineZones,
      data.metrics.thailand.pipelineAmount,
      // Details
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
    sheet.autoResizeColumns(1, 17);
    
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
    if (item.yearly && item.currency) {
      const symbol = item.currency === 'THB' ? '฿' : '$';
      text += ` (${symbol}${parseInt(item.yearly).toLocaleString()}/year)`;
    }
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
      ['', 'International (USD)', '', '', '', 'Thailand (THB)', '', '', ''],
      ['Metric', 'This Week', 'Last Week', 'Change', '', 'This Week', 'Last Week', 'Change', ''],
      ['Closed Zones', '', '', '', '', '', '', '', ''],
      ['Closed Amount', '', '', '', '', '', '', '', ''],
      ['Pipeline Zones', '', '', '', '', '', '', '', ''],
      ['Pipeline Amount', '', '', '', '', '', '', '', ''],
      [''],
      ['Team Performance This Week'],
      ['Sales Team', 'Activities', '', 'Music Team', 'Activities', '', 'Tech Team', 'Activities']
    ];
    
    summarySheet.getRange(1, 1, headers.length, 9).setValues(headers);
    
    // Format title
    summarySheet.getRange(1, 1, 1, 9).merge();
    summarySheet.getRange(1, 1).setFontSize(18);
    summarySheet.getRange(1, 1).setFontWeight('bold');
    
    // Format section headers
    summarySheet.getRange(3, 2, 1, 3).merge();
    summarySheet.getRange(3, 6, 1, 3).merge();
    summarySheet.getRange(3, 1, 2, 9).setFontWeight('bold');
    summarySheet.getRange(3, 1, 2, 9).setBackground('#f0f0f0');
  }
  
  // Update summary with latest data
  // International metrics
  summarySheet.getRange(5, 2).setValue(data.metrics.international.closedZones);
  summarySheet.getRange(6, 2).setValue(data.metrics.international.closedAmount);
  summarySheet.getRange(7, 2).setValue(data.metrics.international.pipelineZones);
  summarySheet.getRange(8, 2).setValue(data.metrics.international.pipelineAmount);
  
  // Thailand metrics
  summarySheet.getRange(5, 6).setValue(data.metrics.thailand.closedZones);
  summarySheet.getRange(6, 6).setValue(data.metrics.thailand.closedAmount);
  summarySheet.getRange(7, 6).setValue(data.metrics.thailand.pipelineZones);
  summarySheet.getRange(8, 6).setValue(data.metrics.thailand.pipelineAmount);
  
  // Update team counts
  summarySheet.getRange(11, 2).setValue(data.sales ? data.sales.length : 0);
  summarySheet.getRange(11, 5).setValue(data.music ? data.music.length : 0);
  summarySheet.getRange(11, 8).setValue(data.tech ? data.tech.length : 0);
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

// Function to email weekly report (optional)
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
    
    International (USD):
    - Closed: ${latestReport[3]} zones, ${latestReport[4]}
    - Pipeline: ${latestReport[5]} zones, ${latestReport[6]}
    
    Thailand (THB):
    - Closed: ${latestReport[7]} zones, ${latestReport[8]}
    - Pipeline: ${latestReport[9]} zones, ${latestReport[10]}
    
    Sales Activities:
    ${latestReport[11]}
    
    Music Design Activities:
    ${latestReport[12]}
    
    Tech/Ops Activities:
    ${latestReport[13]}
    
    Challenges:
    ${latestReport[14]}
    
    Next Week Priorities:
    ${latestReport[15]}
  `;
  
  GmailApp.sendEmail(recipient, subject, body);
}