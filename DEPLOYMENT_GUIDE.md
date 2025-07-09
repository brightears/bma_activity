# BMA Activity Report - Render Deployment Guide

This guide will walk you through deploying the BMA Activity Report system to Render with PostgreSQL.

## Prerequisites

- GitHub account with the code pushed to repository
- Render account (sign up at render.com)
- Basic understanding of environment variables

## Step 1: Push Code to GitHub

If you haven't already pushed your code:

```bash
git push -u origin main
```

## Step 2: Deploy Backend on Render

### 2.1 Create PostgreSQL Database

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `bma-activity-db`
   - **Database**: `bma_activity_report`
   - **User**: Leave as default
   - **Region**: Singapore (or closest to you)
   - **Plan**: Starter ($7/month)
4. Click "Create Database"
5. Wait for database to be ready (takes 1-2 minutes)
6. Copy the **Internal Database URL** for later use

### 2.2 Create Backend Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository (`brightears/bma_activity`)
3. Configure:
   - **Name**: `bma-activity-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier (or Starter for better performance)

4. Add Environment Variables (click "Advanced"):
   ```
   DATABASE_URL = [Internal Database URL from step 2.1]
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = bma_super_secret_key_2024_activity_reports_prod
   CORS_ORIGIN = https://bma-activity-frontend.onrender.com
   ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Copy the service URL (e.g., `https://bma-activity-backend.onrender.com`)

### 2.3 Initialize Database

1. In Render dashboard, go to your backend service
2. Click "Shell" tab
3. Run:
   ```bash
   psql $DATABASE_URL -f src/database/bma_schema.sql
   ```

## Step 3: Deploy Frontend on Render

1. Click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `bma-activity-frontend`
   - **Root Directory**: `client`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build`
   - **Plan**: Free tier

4. Add Environment Variables:
   ```
   REACT_APP_API_URL = https://bma-activity-backend.onrender.com/api
   NODE_ENV = production
   ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)

## Step 4: Update Backend CORS

1. Go back to your backend service in Render
2. Update the `CORS_ORIGIN` environment variable to match your frontend URL
3. The service will automatically redeploy

## Step 5: Test the Application

1. Navigate to your frontend URL (e.g., `https://bma-activity-frontend.onrender.com`)
2. Login with:
   - Username: `admin`
   - Password: `BMA2024admin!`
3. Test creating a report
4. Test viewing the dashboard

## Custom Domain Setup (Optional)

### For Frontend:

1. In Render dashboard, go to your frontend service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `reports.bmasiapte.com`)
4. Follow DNS configuration instructions

### For Backend (if needed):

1. Same process for backend service
2. Use subdomain like `api.reports.bmasiapte.com`
3. Update `REACT_APP_API_URL` in frontend environment

## Monitoring & Maintenance

### Health Checks

Render automatically monitors your services. Configure health check endpoints:

1. Backend: Already configured at `/` endpoint
2. Frontend: Static site, monitored automatically

### Logs

- View logs in Render dashboard under "Logs" tab
- Use filters to find specific errors
- Set up log alerts if needed

### Database Backups

1. Go to your PostgreSQL instance
2. Click "Backups" tab
3. Configure automatic backups (recommended: daily)
4. Download backups regularly

### Scaling

If you need better performance:

1. **Backend**: Upgrade to Starter or Standard plan
2. **Frontend**: Usually fine on free tier
3. **Database**: Monitor storage usage, upgrade if needed

## Troubleshooting

### Backend won't start

1. Check logs for errors
2. Verify DATABASE_URL is correct
3. Ensure all environment variables are set
4. Check if database is accessible

### Frontend can't connect to backend

1. Verify REACT_APP_API_URL is correct
2. Check CORS_ORIGIN matches frontend URL
3. Test backend API directly in browser
4. Check browser console for errors

### Database connection issues

1. Verify DATABASE_URL includes `?ssl=true`
2. Check if database is running in Render dashboard
3. Try connecting via Render Shell

### Slow performance

1. Check if services are on free tier (they sleep after 15 min)
2. Upgrade to paid tier for always-on service
3. Check database query performance
4. Enable caching if needed

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Database**: Use Render's internal network when possible
3. **HTTPS**: Automatically provided by Render
4. **Updates**: Keep dependencies updated

## Cost Breakdown

- **Database**: $7/month (Starter)
- **Backend**: Free (or $7/month for Starter)
- **Frontend**: Free
- **Total**: $7-14/month

## Support

- Render Support: support@render.com
- Render Docs: https://render.com/docs
- Service Status: https://status.render.com

## Next Steps

1. Set up monitoring alerts
2. Configure custom domains
3. Set up automated backups
4. Add team members to Render dashboard
5. Configure CI/CD with GitHub Actions (optional)