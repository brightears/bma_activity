# BMA Activity Report - Render Quick Start Guide

Deploy your BMA Activity Report system to Render in just a few clicks!

## One-Click Deployment

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push -u origin main
   ```

2. **Deploy to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy all services

3. **Initialize the Database** (after deployment):
   - Go to your backend service in Render
   - Click on "Shell" tab
   - Run: `npm run init-db`

4. **Access Your App**:
   - Frontend URL: `https://bma-activity-frontend.onrender.com`
   - Login: admin / BMA2024admin!

### Option 2: Manual Setup

If you prefer to set up services manually, see DEPLOYMENT_GUIDE.md

## Post-Deployment

### Update Frontend API URL

If your backend URL is different than expected:

1. Go to your frontend service
2. Update the `REACT_APP_API_URL` environment variable
3. The service will automatically redeploy

### Custom Domain

To use your own domain (e.g., reports.bmasiapte.com):

1. Go to your frontend service
2. Settings → Custom Domains
3. Add your domain and follow DNS instructions

## Costs

- PostgreSQL Database: $7/month
- Backend Web Service: $7/month (Starter plan)
- Frontend Web Service: Free
- **Total: $14/month**

Note: Free tier services sleep after 15 minutes of inactivity. For always-on service, use Starter plan.

## Quick Commands

### View Logs
```bash
# In Render dashboard, go to your service → Logs
```

### Connect to Database
```bash
# In backend service shell:
psql $DATABASE_URL
```

### Update Code
```bash
git add .
git commit -m "Your changes"
git push
# Render auto-deploys on push
```

## Troubleshooting

**Services not starting?**
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure database is initialized (`npm run init-db`)

**Can't access the app?**
- Wait 5-10 minutes for initial deployment
- Check if services show as "Live" in dashboard
- Verify CORS_ORIGIN matches frontend URL

## Support

Need help? Check the logs first, then refer to DEPLOYMENT_GUIDE.md for detailed troubleshooting.