// Google Apps Script Code for BMA Weekly Reports - Complete Version
// Copy ALL of this code and replace everything in your Apps Script editor

function doPost(e) {
  try {
    // Log the incoming request
    console.log('Received POST request');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Spreadsheet name:', spreadsheet.getName());
    
    // Try to get the Reports sheet
    let sheet = spreadsheet.getSheetByName('Reports');
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      console.log('Reports sheet not found, creating it...');
      sheet = spreadsheet.insertSheet('Reports');
    }
    
    console.log('Sheet found/created:', sheet.getName());
    
    // Parse the incoming data - handle both JSON body and form data
    let data;
    if (e.postData && e.postData.contents) {
      // Check if it's form data (starts with "data=")
      if (e.postData.contents.startsWith('data=')) {
        console.log('Form submission detected');
        // Remove "data=" prefix and decode
        const jsonString = decodeURIComponent(e.postData.contents.substring(5));
        console.log('Decoded JSON:', jsonString.substring(0, 100) + '...');
        data = JSON.parse(jsonString);
      } else {
        // JSON body (from test function)
        data = JSON.parse(e.postData.contents);
      }
    } else if (e.parameter && e.parameter.data) {
      // URL parameter (backup method)
      console.log('URL parameter data:', e.parameter.data.substring(0, 100) + '...');
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No data received. Debug info: ' + JSON.stringify(e));
    }
    console.log('Parsed data successfully');
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      console.log('Adding headers...');
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
      Session.getActiveUser().getEmail() || 'Unknown'
    ];
    
    console.log('Appending row...');
    
    // Append the data
    sheet.appendRow(rowData);
    
    console.log('Row appended successfully');
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 17);
    
    // Try to create or update summary
    try {
      createOrUpdateSummary(data);
    } catch (summaryError) {
      console.error('Error creating summary:', summaryError);
      // Continue even if summary fails
    }
    
    // Return appropriate response
    if (e.postData && e.postData.contents && e.postData.contents.startsWith('data=')) {
      // Return HTML for form submission
      return ContentService.createTextOutput(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #4CAF50;">✓ Report Saved Successfully!</h2>
            <p>Your report has been saved to Google Sheets.</p>
            <p>You can close this tab and return to your report form.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `).setMimeType(ContentService.MimeType.HTML);
    } else {
      // Return JSON for API calls
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Report saved successfully!',
          row: sheet.getLastRow()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch(error) {
    console.error('Error in doPost:', error.toString());
    console.error('Stack trace:', error.stack);
    
    // Return error response
    if (e && e.postData && e.postData.contents && e.postData.contents.startsWith('data=')) {
      // Return HTML error for form submission
      return ContentService.createTextOutput(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #f44336;">❌ Error Saving Report</h2>
            <p>Error: ${error.toString()}</p>
            <p>Please close this tab and try again.</p>
          </body>
        </html>
      `).setMimeType(ContentService.MimeType.HTML);
    } else {
      // Return JSON error for API calls
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: error.toString(),
          stack: error.stack
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
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
    try {
      summarySheet.getRange(3, 2, 1, 3).merge();
      summarySheet.getRange(3, 6, 1, 3).merge();
    } catch (e) {
      console.log('Could not merge cells, continuing...');
    }
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

// Test function to check sheet access
function testSheetAccess() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Spreadsheet name:', spreadsheet.getName());
    
    const sheets = spreadsheet.getSheets();
    console.log('All sheets:');
    sheets.forEach(sheet => {
      console.log('- ' + sheet.getName());
    });
    
    const reportsSheet = spreadsheet.getSheetByName('Reports');
    if (reportsSheet) {
      console.log('Reports sheet found! Rows:', reportsSheet.getLastRow());
    } else {
      console.log('Reports sheet NOT found');
    }
  } catch (error) {
    console.error('Error:', error.toString());
  }
}

// Test function to simulate a form submission
function testDoPost() {
  // Create test data that matches the structure from your HTML form
  const testData = {
    week: "50",
    date: "December 13, 2024",
    sales: [
      {
        status: "closed",
        description: "Test Hotel Bangkok",
        zones: "10",
        yearly: "50000",
        currency: "THB",
        member: "Nikki"
      }
    ],
    music: [
      {
        status: "complete",
        description: "Created playlist for Novotel",
        member: "Tohmo"
      }
    ],
    tech: [
      {
        status: "progress",
        description: "Updating Android app",
        member: "Keith"
      }
    ],
    challenges: "Test challenge - connectivity issues",
    priorities: "Test priority - Close deal with Marriott",
    metrics: {
      international: {
        closedZones: "0",
        closedAmount: "$0",
        pipelineZones: "0",
        pipelineAmount: "$0"
      },
      thailand: {
        closedZones: "10",
        closedAmount: "฿50,000",
        pipelineZones: "0",
        pipelineAmount: "฿0"
      }
    }
  };
  
  // Simulate the POST request
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  // Call the doPost function
  const result = doPost(e);
  
  // Log the result
  console.log('Test result:', result.getContent());
}

// Utility function to get report data for analysis
function getWeeklyReportData(weekNumber) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reports');
  if (!sheet) {
    throw new Error('Reports sheet not found');
  }
  
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