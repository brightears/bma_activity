# Supabase Setup Guide for BMA Activity Report

This guide will help you set up the BMA Activity Report system using Supabase's free tier.

## Prerequisites
- A GitHub account (for Vercel deployment)
- Node.js installed locally

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Fill in:
   - Project name: `bma-activity-report`
   - Database Password: (save this securely!)
   - Region: Choose the closest to your team
   - Pricing Plan: Free tier

## Step 2: Set Up Database Schema

1. Once your project is created, go to the SQL Editor
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and run the SQL in the editor
4. This will create all necessary tables with proper security policies

## Step 3: Configure Authentication

1. Go to Authentication → Settings
2. Under "Auth Providers", enable Email
3. Under "Email Templates", customize if needed
4. Under "URL Configuration", set:
   - Site URL: `https://your-app.vercel.app` (we'll update this later)
   - Redirect URLs: Add `https://your-app.vercel.app/*`

## Step 4: Get Your API Keys

1. Go to Settings → API
2. Copy these values (you'll need them for deployment):
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 5: Create Initial Users

1. Go to Authentication → Users
2. Click "Invite User"
3. Add email addresses for your team members
4. They'll receive invite emails to set their passwords

## Step 6: Environment Variables

Create a `.env` file with:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For local development
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 7: Deploy to Vercel

### Backend API (Serverless Functions)
1. Create a new directory `api/` in your project root
2. We'll create serverless functions here
3. Push to GitHub
4. Connect to Vercel and deploy

### Frontend
1. The React app will be deployed as a static site
2. Configure environment variables in Vercel dashboard

## Database Limits (Free Tier)
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests
- Pauses after 1 week of inactivity (can be reactivated)

## Security Notes
- Row Level Security (RLS) is enabled
- Users can only see/edit their own reports
- Admins can view all reports
- Authentication is required for all operations

## Next Steps
1. Set up the Vercel deployment
2. Update API endpoints to use Supabase
3. Test with your team!