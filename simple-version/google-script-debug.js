// Replace your current doPost function with this debug version

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
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
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
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Report saved successfully!',
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    console.error('Error in doPost:', error.toString());
    console.error('Stack trace:', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Also add this simple test function
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