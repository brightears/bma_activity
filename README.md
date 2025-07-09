# BMA Activity Report System

A comprehensive weekly report generation system for BMAsia, tracking sales, music design, and tech operations achievements with trend analysis and PDF export capabilities.

## Features

- **Weekly Report Management**: Create, edit, and view weekly activity reports
- **Department Tracking**: Separate sections for Sales, Music Design, and Tech/Ops
- **Automated Calculations**: 
  - Monthly Recurring Revenue (MRR) from closed deals
  - Pipeline value tracking
  - Zone counting for sales
- **Trend Analysis**: Visual charts showing performance over time
- **Export Options**: PDF generation and CSV export
- **User Authentication**: Secure login system with JWT tokens
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **PDF Generation**: PDFKit

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (v6 or higher)

## Installation

### 1. Clone the repository

```bash
cd "/Users/benorbe/Documents/BMA Activity Report"
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. PostgreSQL Setup

First, ensure PostgreSQL is installed:
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql`
- **Windows**: Download from https://www.postgresql.org/download/

Then run the setup script:

```bash
./setup-database.sh
```

Or manually:

```bash
# Create database
createdb bma_activity_report

# Run schema
psql -d bma_activity_report -f src/database/bma_schema.sql
```

### 4. Environment Configuration

The `.env` file is already configured with:
- Database name: `bma_activity_report`
- Database user: `benorbe`
- JWT secret configured
- Ports: Backend (3000), Frontend (3001)

## Running the Application

### Development Mode

1. **Start the backend server**:
```bash
npm run dev
```

2. **Start the frontend** (in a new terminal):
```bash
cd client
npm start
```

3. **Access the application**:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

### Production Mode

```bash
# Backend
npm start

# Frontend (in client directory)
npm run build
npm install -g serve
serve -s build -l 3001
```

## Default Login Credentials

- **Username**: admin
- **Password**: BMA2024admin!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/:id/export/pdf` - Export report as PDF
- `GET /api/reports/:id/export/csv` - Export report as CSV

## Usage Guide

### Creating a Weekly Report

1. Log in with your credentials
2. Click "New Report" in the navigation
3. Fill in the form:
   - **Sales**: Add deals with status (New/Existing/Renewal), zones, and yearly value
   - **Music Design**: List deliverables and their status
   - **Tech/Ops**: Add technical updates and achievements
   - **Challenges**: Document any blockers or issues
   - **Priorities**: List next week's priorities
4. Click "Submit Report"

### Viewing Reports

1. Navigate to "Reports" in the sidebar
2. Use filters to find specific reports:
   - Date range
   - Team member
   - Full-text search
3. Click on any report to expand and view details

### Exporting Reports

1. Open any report
2. Click the export buttons:
   - **PDF**: Professional formatted report for email
   - **CSV**: Data export for further analysis

### Dashboard Analytics

The dashboard shows:
- Total reports submitted
- Current sales pipeline value
- Active deals count
- Completed projects
- Visual trends over time

## Deployment to Render

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - BMA Activity Report System"
git branch -M main
git remote add origin https://github.com/brightears/bma_activity.git
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name**: bma-activity-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Add PostgreSQL database** ($7/month)
   - **Environment Variables**: Copy from `.env`

### 3. Deploy Frontend on Render

1. Create another Web Service
2. Configure:
   - **Name**: bma-activity-frontend
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `serve -s build`
   - **Environment Variable**: 
     - `REACT_APP_API_URL`: Your backend URL

## Development Guidelines

### Adding New Features

1. Backend: Add routes in `src/routes/`, controllers in `src/controllers/`
2. Frontend: Add components in `client/src/components/`
3. Database: Create migrations in `src/database/`

### Code Style

- Use ES6+ syntax
- Follow RESTful conventions
- Add proper error handling
- Write descriptive commit messages

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_ctl status`
- Check credentials in `.env`
- Verify database exists: `psql -l`

### Port Conflicts
- Backend runs on port 3000
- Frontend runs on port 3001
- Change in `.env` and `client/package.json` if needed

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 14+)

## License

Internal use only - BMAsia Pte Ltd

## Support

For issues or questions, contact the development team.