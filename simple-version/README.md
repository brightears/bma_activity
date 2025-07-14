# BMA Weekly Report - Simple Version

A single HTML file that generates professional weekly reports for BMAsia. No servers, no hosting costs, no complexity!

## Features

✅ **One File Solution** - Everything in a single HTML file  
✅ **Automatic Calculations** - Zone counts and deal values by region  
✅ **Dual Currency Support** - Separate tracking for USD (International) and THB (Thailand)  
✅ **Professional Reports** - Clean, formatted output ready to email  
✅ **PDF Export** - Print to PDF directly from browser  
✅ **Auto-Save Draft** - Preserves your work automatically using browser storage  
✅ **Google Sheets Integration** - Optional backup to cloud  
✅ **Works Offline** - No internet required after initial setup  
✅ **Free Forever** - No hosting or subscription costs

## How to Use

### 1. Open the File
Simply double-click `bma-weekly-report.html` to open in your browser.

### 2. Fill Out the Form
- **Sales**: Add all deals with status (New/Closed), product (SYB/LIM), zones, value, and team member
- **Music Design**: List deliverables with status (In Progress/Complete)
- **Tech/Ops**: Add technical updates with status
- **Challenges**: Document any blockers (use "- " prefix for bullet points)
- **Priorities**: List next week's focus areas (use "- " prefix for bullet points)

### 3. Generate Report
Click "Generate Report" to see the formatted output.

### 4. Export Report
- **PDF**: Click "Print/Save as PDF" (Cmd+P on Mac)
- **Copy**: Click "Copy Report" to paste into email
- **Print**: Send directly to printer

## Quick Tips

### Adding Multiple Items
Click the green "+ Add Item" buttons to add more entries in each section.

### Real-time Calculations
The metrics update automatically as you type, separated by region:

**International (USD)**
- **Closed Zones**: Total zones from closed deals
- **Closed Amount**: Total yearly value of closed deals
- **Pipeline Zones**: Zones from deals in progress
- **Pipeline Amount**: Value of deals in the pipeline

**Thailand (THB)**
- Same metrics as above, but for Thai clients

### Saving Your Work
The form now auto-saves your draft every time you make changes! Your data is stored locally in your browser.
- **Auto-save**: Works automatically as you type
- **Persists between sessions**: Close and reopen anytime
- **Weekly drafts**: Each week's data is saved separately
- **Google Sheets backup**: Optional cloud storage (see below)

## Google Sheets Integration (Optional)

Want to save your data to Google Sheets? Follow these steps:

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "BMA Weekly Reports"
3. Name the first sheet "Reports"

### Step 2: Set Up Google Apps Script
1. In your Google Sheet, go to Extensions → Apps Script
2. Delete any existing code
3. Copy all the code from `google-script-complete.js` in this folder
4. Paste it into the Apps Script editor
5. Save the project (Ctrl/Cmd + S)

### Step 3: Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Choose type: "Web app"
3. Settings:
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click "Deploy"
5. Copy the Web App URL

### Step 4: Update the HTML File
1. Open `bma-weekly-report.html` in a text editor
2. Find line 848 where it says:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/a/macros/bmasiamusic.com/s/AKfycbyriHnGjacGzF77SrlZQz54wg6KdmHTvr-WrXk4Hui3zKhwJh4MsM02U1bPxrOZ4sS1gw/exec';
   ```
3. Replace with your Web App URL from Step 3

## Customization

### Team Members
Current team members in the dropdowns:
- **Sales**: Nikki, Norbert, All
- **Music**: Tohmo, Kuk, Scotty, All
- **Tech**: Keith, A, Joe, All

To add/remove team members, edit the `<option>` tags in the HTML file around lines 315-345.

### Products
Current products available:
- **SYB**: Select Your Brand
- **LIM**: Location Independent Music

To modify products, edit the product dropdown around line 331.

### Company Branding
Change the color scheme by editing the CSS color values:
- Primary color: `#FF6B35` (BMA Orange)
- Update in the `<style>` section (lines 32, 49, etc.)

### Additional Sections
Copy one of the existing sections and modify:
1. The form section
2. The collection logic in `collectFormData()`
3. The display logic in `createReportHTML()`

## Tips for Best Results

1. **Fill incrementally**: Update throughout the week as things happen
2. **Be specific**: Include client names and project details
3. **Use status consistently**: 
   - Sales: New = Fresh opportunities this week, Closed = Deals won this week
   - Music/Tech: In Progress = Still working on it, Complete = Finished this week
4. **Print settings**: Use "Save as PDF" for best formatting

## Troubleshooting

**Metrics not updating?**
- Make sure to select "Closed" for completed deals
- Enter values in number fields (zones, yearly value)

**Report looks wrong when printed?**
- Use Chrome or Safari for best results
- Check print preview before printing
- Ensure "Background graphics" is enabled in print settings
- To remove browser headers/footers:
  - Chrome: Print dialog → More settings → Uncheck "Headers and footers"
  - Safari: File → Print → Show Details → Uncheck "Print headers and footers"

**Can't copy report?**
- Some browsers block clipboard access
- Try using Ctrl/Cmd+C after selecting the text manually

## Future Enhancements

Want to add features? The file is just HTML/CSS/JavaScript - easy to modify:
- Add more sections
- Include charts (use Chart.js CDN)
- Email integration (use mailto: links)
- Local storage for draft saving

## Support

This is a simple, standalone tool. For issues:
1. Check the browser console for errors (F12)
2. Ensure you're using a modern browser
3. Try refreshing the page

---

Built with ❤️ for BMAsia - Simple, effective, free!