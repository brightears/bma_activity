# BMA Activity Report - Project Documentation

## Overview
This is a weekly activity report system for BMA Asia that allows team members to track sales, activities, and deliverables. The system uses Supabase for shared data storage, allowing all team members to see and edit the same data in real-time (like Google Sheets).

## Live URL
https://bma-activity.vercel.app

## Current Stable Version
- **Git Tag**: `v1.0-stable` (commit: de1df12)
- **Date**: December 15, 2024
- **Status**: All features working correctly

## Key Features
- **Shared Data**: All users see and edit the same data (stored in Supabase)
- **Auto-save**: Saves automatically 1 second after any change
- **Real-time Updates**: Refreshes data every 30 seconds to show changes from other users
- **No Authentication**: Internal use only, no login required
- **Report Generation**: Generate and print weekly reports
- **Metrics Tracking**: Automatic calculation of sales metrics (zones, amounts, MRR)
- **Google Sheets Export**: Export reports to Google Sheets (partially implemented)

## Technology Stack
- **Frontend**: Single HTML file with vanilla JavaScript (no framework)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (automatic deployment from GitHub)
- **Version Control**: GitHub (https://github.com/brightears/bma_activity.git)

## Main File
`/simple-version/bma-weekly-report-with-activities.html` - This is the ONLY file being used

## Sections
1. **Sales Highlights**: Track new/closed deals with zones, yearly values, and currencies
2. **Sales Activities**: Track ongoing sales activities with status (In Progress/Complete)
3. **Music Design Deliverables**: Track music team deliverables
4. **Tech/Ops Updates**: Track technical team updates
5. **Challenges**: List weekly challenges (one per line)
6. **Next Week Priorities**: List priorities for the following week (one per line)

## Database Schema (Supabase)
- `reports`: Main table linking week/year to report data
- `sales_items`: Sales highlights with status, region, value
- `sales_activities`: Sales activities with progress status
- `music_items`: Music deliverables with status
- `tech_items`: Tech updates with status
- `challenges`: Weekly challenges (stored as individual entries)
- `priorities`: Next week priorities (stored as individual entries)

## How It Works
1. Data is automatically saved to Supabase when users make changes (1 second debounce)
2. Every 30 seconds, the page checks for updates from other users
3. All users see the same data for a given week/year
4. No authentication required - designed for internal team use
5. Challenges and priorities are split by line and stored separately, then recombined on load

## Recent Fixes (as of v1.0-stable)
1. **Auto-adding rows**: Fixed issue where empty rows were being added on each refresh
2. **Clear Form**: Now properly deletes data from Supabase
3. **Dropdown width**: Increased to 130px to show "In Progress" fully
4. **Duplicate data**: Fixed challenges/priorities duplicating on save
5. **Clean fields**: Removed sample placeholder text and filters out old test data

## Important Notes
- **Design**: The HTML design must NOT be changed - it works exactly as the client wants
- **Single File**: Only use `bma-weekly-report-with-activities.html`
- **Public Access**: RLS policies allow public read/write since no auth is used
- **Week-based**: Each week/year combination has its own report
- **Dropdown Width**: Status dropdowns are 130px wide
- **No Placeholders**: Challenges and priorities fields have no placeholder text

## Common Commands
- Deploy: Automatic via Vercel when pushing to GitHub
- Test locally: Open the HTML file directly in a browser
- View logs: Check browser console for any errors
- Rollback: `git checkout v1.0-stable` to return to this stable version

## Supabase Configuration
```javascript
const supabase = window.supabase.createClient(
    'https://dzxytqfpxvmkuwrqncbq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eHl0cWZweHZta3V3cnFuY2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMjE4OTIsImV4cCI6MjA0OTU5Nzg5Mn0.9w6F_noe7PzhF-YzmW0RrI7k3V2fJoS4v_ePvK30aqY'
);
```

## Troubleshooting
- If data doesn't save: Check browser console for errors, verify Supabase is accessible
- If "Clear Form" doesn't work: Make sure RLS policies allow DELETE operations
- If data doesn't sync: Check that the week/year matches between different browsers
- If seeing duplicate data: The form now filters out known test data like "Android app didn't work"

## Team Member Dropdowns
- **Sales Highlights**: Nikki, Norbert, All
- **Sales Activities**: Nikki, Norbert, All
- **Music Design Deliverables**: Tohmo, Kuk, Scotty, All
- **Tech/Ops Updates**: Keith, A, Joe, All

## Known Limitations
- Google Sheets export doesn't include Sales Activities column yet
- No authentication - suitable for internal use only
- All data is publicly accessible via the Supabase API
- No data validation beyond basic HTML form validation

## Future Considerations
- Complete Google Sheets integration with Sales Activities
- Add user tracking to see who made changes
- Consider adding basic authentication for external access
- Add data export features (CSV, PDF)