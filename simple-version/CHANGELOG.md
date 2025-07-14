# Changelog

## Version 2.0 - July 11, 2025

### Major Features Added
- **Auto-save functionality**: Form data now automatically saves to browser storage as you type
- **Dual currency support**: Separate tracking for International (USD) and Thailand (THB) markets
- **Product selection**: Added dropdown for SYB and LIM products in sales
- **Team collaboration**: Added "All" option for team-wide projects

### UI/UX Improvements
- **Simplified sales status**: Removed "In Progress", now only "New" and "Closed"
- **Compact metrics display**: Made sales metrics less prominent and moved them under Sales section
- **Bullet point formatting**: Challenges and priorities now display as proper bullet points
- **Professional PDF export**: 
  - Custom header format: "BMAsia Report - Week X (Date Range)"
  - Removed duplicate metrics in PDF
  - Cleaner, more compact layout

### Technical Updates
- **Google Sheets integration**: Updated script to handle form data submission
- **CORS fix**: Implemented iframe solution for Google Sheets submission
- **localStorage implementation**: Added draft saving with week-based storage
- **Print CSS optimization**: Better control over PDF generation

### Bug Fixes
- Fixed form breaking when localStorage was added
- Fixed data persistence between browser sessions
- Fixed PDF duplication of sales metrics
- Fixed bullet point display in challenges/priorities sections

### Data Structure Changes
- Added product field to sales items
- Separated metrics by region (International/Thailand)
- Removed MRR calculations (handled elsewhere)
- Updated Google Sheets to track regional metrics separately

## Version 1.0 - Initial Release

### Core Features
- Single HTML file solution
- Sales, Music, and Tech tracking sections
- Automatic metric calculations
- Report generation and PDF export
- Basic Google Sheets integration