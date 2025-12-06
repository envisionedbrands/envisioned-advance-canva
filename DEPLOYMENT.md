# Vercel Deployment Guide

This guide will help you deploy the Canvas AI Workspace to Vercel.

## Prerequisites

- Vercel account (free tier works)
- Supabase project (free tier works)
- Google OAuth credentials (for authentication)

## Step 1: Prepare Supabase

### 1.1 Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (starts with `https://xxx.supabase.co`)
   - **anon/public key** (for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - **service_role key** (for `SUPABASE_SECRET_KEY`)

### 1.2 Run Database Migration

You need to run the canvas schema migration in Supabase:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_canvas_schema.sql`
4. Paste and click **Run**
5. Verify tables were created: `boards`, `nodes`, `edges`, etc.

### 1.3 Configure Google OAuth in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need:
   - **Client ID** from Google Console
   - **Client Secret** from Google Console
4. Note the **Callback URL** shown (e.g., `https://xxx.supabase.co/auth/v1/callback`)

## Step 2: Setup Google OAuth

### 2.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (Replace with your actual Supabase project URL)

7. Copy the **Client ID** and **Client Secret**
8. Add these to Supabase (see Step 1.3)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration

### 3.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:

```bash
# Supabase (from Step 1.1)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

# App URL (your Vercel domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional Variables (can add later):

```bash
# LemonSqueezy (for payments - optional)
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

## Step 4: Post-Deployment Configuration

### 4.1 Update OAuth Callback URLs

Once deployed, you need to update the callback URL:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to **Google Cloud Console** → **Credentials**
3. Edit your OAuth client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```
5. Save

### 4.2 Test Authentication

1. Visit your deployed app
2. Click **Sign In with Google**
3. Complete OAuth flow
4. You should be redirected back and logged in

## Step 5: Verify Canvas Functionality

1. After logging in, navigate to `/boards`
2. Click **Create New Board**
3. Give it a title and create
4. You should see the canvas workspace
5. Try adding nodes using the toolbar buttons
6. Drag nodes around to test positioning

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure no TypeScript errors: `npm run build` locally

### OAuth Not Working

- Verify callback URLs match exactly (no trailing slashes)
- Check Google OAuth consent screen is configured
- Verify Supabase has correct Google credentials

### Database Errors

- Ensure migration was run in Supabase SQL Editor
- Check RLS policies are enabled
- Verify user is authenticated before accessing boards

### Canvas Not Loading

- Check browser console for errors
- Verify React Flow assets are loading
- Check network tab for failed API requests

## Environment Variables Reference

| Variable | Required | Where to Get It | Purpose |
|----------|----------|-----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard → Settings → API | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Yes | Supabase Dashboard → Settings → API | Public anon key |
| `SUPABASE_SECRET_KEY` | ✅ Yes | Supabase Dashboard → Settings → API | Service role key (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your Vercel domain | App's public URL |
| `LEMONSQUEEZY_API_KEY` | ❌ Optional | LemonSqueezy → Settings → API | Payment processing |
| `LEMONSQUEEZY_STORE_ID` | ❌ Optional | LemonSqueezy Dashboard | Your store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ❌ Optional | LemonSqueezy → Webhooks | Webhook verification |

## Security Checklist

Before going live with real users:

- [ ] Environment variables are set in Vercel (never commit .env.local)
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Google OAuth is restricted to authorized domains
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Service role key is never exposed in client code
- [ ] OAuth callback URLs are whitelisted properly

## Performance Optimization

- Vercel automatically optimizes:
  - Edge caching for static assets
  - Image optimization
  - API route caching
  - Serverless function cold starts

- For production at scale, consider:
  - Adding CDN caching headers
  - Implementing database query optimization
  - Adding Redis for session storage
  - Setting up monitoring (Vercel Analytics)

## Next Steps

After successful deployment:

1. **Add Custom Domain** (optional)
   - Vercel → Project Settings → Domains
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update OAuth callback URLs

2. **Setup Monitoring**
   - Enable Vercel Analytics
   - Setup error tracking (Sentry)
   - Monitor Supabase usage

3. **Implement Phase 2 Features**
   - Asset upload and processing
   - AI content generation
   - Real-time collaboration
   - Background jobs

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
