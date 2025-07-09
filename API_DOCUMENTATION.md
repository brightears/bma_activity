# BMA Activity Report Backend API Documentation

## Overview
This is the backend API for the BMA Activity Report application. It provides authentication, report management, and export functionality.

## Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
# Create the database
createdb bma_activity_report

# Run the schema
psql -d bma_activity_report -f src/database/bma_schema.sql
```

3. Configure environment variables:
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with username/email and password.

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@bma.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

#### POST /api/auth/register
Register a new user.

Request:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "New User"
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

Headers:
```
Authorization: Bearer <jwt-token>
```

### Reports

All report endpoints require authentication.

#### GET /api/reports
Get all reports with pagination.

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### GET /api/reports/my-reports
Get reports created by the current user.

#### GET /api/reports/:id
Get a specific report by ID.

#### GET /api/reports/week/:weekNumber/year/:year
Get report for a specific week and year for the current user.

#### POST /api/reports
Create a new report.

Request:
```json
{
  "weekNumber": 45,
  "year": 2024,
  "salesItems": [
    {
      "status": "New",
      "description": "New client onboarding",
      "zones": "North America",
      "yearlyValue": 50000,
      "teamMember": "John Doe"
    }
  ],
  "musicItems": [
    {
      "description": "Music licensing deal",
      "teamMember": "Jane Smith"
    }
  ],
  "techItems": [
    {
      "description": "Platform integration completed",
      "teamMember": "Tech Team"
    }
  ],
  "challenges": [
    {
      "description": "Integration delays with third-party API"
    }
  ],
  "priorities": [
    {
      "description": "Complete Q4 sales targets"
    }
  ]
}
```

#### PUT /api/reports/:id
Update an existing report (same request format as create).

#### DELETE /api/reports/:id
Delete a report.

#### GET /api/reports/:id/export/pdf
Export report as PDF.

#### GET /api/reports/:id/export/csv
Export report as CSV.

#### GET /api/reports/stats/overview
Get report statistics for the current user.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Error Responses

All error responses follow this format:
```json
{
  "message": "Error description",
  "errors": []  // Optional validation errors
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users`: User accounts
- `reports`: Weekly reports
- `sales_items`: Sales activities
- `music_items`: Music-related activities
- `tech_items`: Tech-related activities
- `challenges`: Weekly challenges
- `priorities`: Weekly priorities

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- All endpoints use HTTPS in production
- CORS is configured for the frontend origin

## Development

### Generate Password Hash
```bash
node src/utils/generatePassword.js mypassword
```

### Run Migrations
```bash
psql -d bma_activity_report -f src/database/bma_schema.sql
```

### Test Endpoints
You can use curl or a tool like Postman to test the endpoints:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get reports (with token)
curl http://localhost:3000/api/reports \
  -H "Authorization: Bearer <jwt-token>"
```