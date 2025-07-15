# BMA Activity Report - Project Documentation (Simplified Version)

## Overview
This is a weekly activity report system for BMA Asia that allows team members to track sales, activities, and deliverables. The system uses a simple single-document approach with Supabase for data storage.

## Live URL
https://bma-activity.vercel.app

## Current Version
- **Version**: 2.0 (Simplified)
- **Date**: July 15, 2025
- **Status**: Completely rewritten for simplicity and reliability

## Key Features
- **Simple JSON Storage**: All form data stored as a single JSON document per week
- **Manual Save**: Users click "Save Draft" to save changes
- **Manual Refresh**: Users refresh the page to see others' changes
- **No Authentication**: Internal use only, no login required
- **Report Generation**: Generate and print weekly reports
- **Metrics Tracking**: Automatic calculation of sales metrics
- **Google Sheets Export**: Export reports to Google Sheets

## Technology Stack
- **Frontend**: Single HTML file with vanilla JavaScript
- **Database**: Supabase (single table with JSON storage)
- **Hosting**: Vercel (automatic deployment from GitHub)
- **Version Control**: GitHub

## Project Structure
```
/BMA Activity Report
├── simple-version/
│   ├── bma-weekly-report-with-activities.html  # Main application file
│   └── google-script.js                         # Google Sheets integration
├── simple-table-structure.sql                   # Database schema
├── CLAUDE.md                                    # This file
├── README.md                                    # User documentation
├── TEAM_MEMBERS.md                             # Team member reference
└── vercel.json                                 # Deployment configuration
```

## Database Schema
Single table approach:
```sql
CREATE TABLE form_states (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    form_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week_number, year)
);
```

## How It Works
1. All form data is saved as a single JSON document when users click "Save Draft"
2. Each week/year combination has one document
3. Users must manually refresh to see others' updates
4. No complex sync logic - simple "last write wins"

## Supabase Configuration
```javascript
const supabase = window.supabase.createClient(
    'https://dzxytqfpxvmkuwrqncbq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

## Team Member Dropdowns
- **Sales Highlights**: Nikki, Norbert, All
- **Sales Activities**: Nikki, Norbert, All
- **Music Design Deliverables**: Tohmo, Kuk, Scotty, All
- **Tech/Ops Updates**: Keith, A, Joe, All

## Setup Instructions
1. Create the `form_states` table in Supabase using `simple-table-structure.sql`
2. Update Supabase credentials in the HTML file if needed
3. Deploy to Vercel
4. Share the URL with team members

## Usage
1. Open the report for the current week
2. Fill in your activities
3. Click "Save Draft" to save
4. Click "Generate Report" to create the weekly report
5. Refresh the page to see others' updates

## Troubleshooting
- **Data not saving**: Check browser console for errors
- **Data not loading**: Ensure week/year match and refresh the page
- **Can't see others' changes**: Manually refresh the page

## Benefits of Simplified Approach
- No more duplication issues
- No complex state management
- Easy to understand and debug
- More reliable multi-user experience
- Faster performance
- Less code to maintain