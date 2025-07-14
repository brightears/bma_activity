# BMA Activity Report - Complete Deployment Guide

This guide will walk you through deploying the BMA Activity Report system using Supabase (free database) and Vercel (free hosting).

## Prerequisites
- GitHub account
- Node.js 18+ installed locally
- Git installed

## Step 1: Set Up Supabase (5 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with your GitHub account
   - Click "New Project"

2. **Configure Your Project**
   ```
   Project name: bma-activity-report
   Database Password: [Choose a strong password and save it!]
   Region: [Choose closest to your team]
   Pricing Plan: Free tier
   ```

3. **Initialize Database**
   - Once project is created, go to **SQL Editor**
   - Click "New Query"
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

4. **Get Your API Keys**
   - Go to **Settings → API**
   - Copy these values (you'll need them soon):
     ```
     Project URL: https://xxxxxx.supabase.co
     Anon Key: eyJhbGc...
     Service Key: eyJhbGc... (keep this secret!)
     ```

5. **Enable Email Auth**
   - Go to **Authentication → Providers**
   - Ensure "Email" is enabled
   - Under **Authentication → Settings**:
     - Site URL: `https://bma-report.vercel.app` (we'll update this later)
     - Add to Redirect URLs: `https://bma-report.vercel.app/*`

## Step 2: Prepare Your Code (5 minutes)

1. **Clone/Push to GitHub**
   ```bash
   cd "/Users/benorbe/Documents/BMA Activity Report"
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install @supabase/supabase-js
   cd ..
   ```

3. **Update Client Files**
   - Replace `client/src/App.jsx` with `client/src/App-supabase.jsx`
   - Replace `client/src/components/ReportForm.jsx` with `client/src/components/ReportForm-supabase.jsx`
   - Make sure `client/src/contexts/SupabaseAuth.jsx` exists

## Step 3: Deploy to Vercel (10 minutes)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New → Project"

2. **Import Your Repository**
   - Select your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   In Vercel's environment variables section, add:
   ```
   SUPABASE_URL = https://xxxxxx.supabase.co
   SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_KEY = eyJhbGc...
   VITE_SUPABASE_URL = https://xxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (usually 2-3 minutes)
   - You'll get a URL like: `https://bma-report.vercel.app`

5. **Update Supabase URLs**
   - Go back to Supabase → Authentication → Settings
   - Update Site URL to your Vercel URL
   - Update Redirect URLs to include your Vercel URL

## Step 4: Create Users (2 minutes)

1. **Invite Team Members**
   - In Supabase, go to **Authentication → Users**
   - Click "Invite user"
   - Enter email addresses for your team
   - They'll receive emails to set passwords

2. **First User Setup**
   - The first user to sign up will automatically be created in the database
   - You can manually set admin role in Supabase:
     - Go to **Table Editor → users**
     - Find the user and change `role` to `admin`

## Step 5: Test Your Deployment

1. **Visit Your App**
   - Go to your Vercel URL
   - Try logging in with invited user credentials
   - Create a test report

2. **Verify Multi-User Access**
   - Have a colleague log in
   - They should see their own reports
   - Admins can see all reports

## Troubleshooting

### "No authorization token" error
- Make sure you're logged in
- Check browser console for errors
- Verify environment variables in Vercel

### Can't see reports
- Check Row Level Security policies in Supabase
- Verify user has correct role in users table

### Database connection issues
- Verify all environment variables are set correctly
- Check Supabase project is not paused (free tier pauses after 1 week of inactivity)

## Local Development

1. **Create `.env` file**
   ```env
   SUPABASE_URL=https://xxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   VITE_SUPABASE_URL=https://xxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. **Run locally**
   ```bash
   npm install
   npm run dev
   ```

## Maintenance

### Weekly Tasks
- Free Supabase projects pause after 1 week of inactivity
- Just visit the Supabase dashboard weekly to keep it active

### Adding Features
1. Make changes locally
2. Test with `npm run dev`
3. Push to GitHub
4. Vercel auto-deploys within minutes

### Database Changes
1. Make schema changes in Supabase SQL Editor
2. Update corresponding API endpoints if needed
3. Deploy new code

## Cost Summary
- **Supabase Free Tier**: $0/month
  - 500MB database
  - 2GB bandwidth
  - 50K monthly active users
- **Vercel Free Tier**: $0/month
  - Unlimited deployments
  - 100GB bandwidth
  - SSL included

## Next Steps
1. Customize the report format
2. Add email notifications
3. Create dashboard visualizations
4. Export reports as PDF

## Support
- Supabase Discord: discord.supabase.com
- Vercel Support: vercel.com/support
- Your deployment URL: [Will be shown after deployment]

---

**Deployment Checklist:**
- [ ] Supabase project created
- [ ] Database schema initialized
- [ ] API keys copied
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Users invited
- [ ] Test report created