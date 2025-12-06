# Quick Deployment Checklist

Use this checklist to deploy to Vercel in under 10 minutes.

## Before You Deploy

### ✅ 1. Supabase Setup (5 minutes)

- [ ] Create Supabase project at https://supabase.com
- [ ] Copy these from Settings → API:
  - [ ] Project URL
  - [ ] anon/public key
  - [ ] service_role key
- [ ] Run database migration:
  - [ ] Open SQL Editor in Supabase
  - [ ] Copy/paste `supabase/migrations/001_canvas_schema.sql`
  - [ ] Click "Run"
  - [ ] Verify tables exist (boards, nodes, edges, etc.)

### ✅ 2. Google OAuth Setup (3 minutes)

- [ ] Go to https://console.cloud.google.com
- [ ] Create OAuth credentials (Web application type)
- [ ] Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- [ ] Copy Client ID and Client Secret
- [ ] In Supabase:
  - [ ] Go to Authentication → Providers
  - [ ] Enable Google
  - [ ] Paste Client ID and Secret

## Deploy to Vercel

### ✅ 3. Vercel Deployment (2 minutes)

- [ ] Go to https://vercel.com/new
- [ ] Import your Git repository
- [ ] Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
SUPABASE_SECRET_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

- [ ] Click **Deploy**
- [ ] Wait 2-3 minutes for build

## After Deployment

### ✅ 4. Update OAuth Callbacks (1 minute)

- [ ] Copy your Vercel URL (e.g., `https://your-app-xxx.vercel.app`)
- [ ] Update Google OAuth:
  - [ ] Google Console → Credentials → Edit
  - [ ] Add redirect URI: `https://your-app-xxx.vercel.app/auth/callback`
  - [ ] Save

### ✅ 5. Test the App (2 minutes)

- [ ] Visit your Vercel URL
- [ ] Click "Sign In with Google"
- [ ] Complete OAuth flow
- [ ] Navigate to `/boards`
- [ ] Click "Create New Board"
- [ ] Test adding nodes to canvas
- [ ] Drag nodes around
- [ ] ✨ You're live!

## Required Environment Variables

Only 4 variables needed to start:

| Variable | Example Value |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SECRET_KEY` | `eyJhbGciOiJIUzI1...` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

## Optional Variables (Add Later)

These are for payments and can be skipped initially:

```bash
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
```

## Troubleshooting

### Build Fails
- Run `npm run build` locally first
- Check build logs in Vercel dashboard

### OAuth Error
- Verify callback URLs match exactly
- Check Google OAuth consent screen is configured

### Database Error
- Ensure migration was run in Supabase
- Check RLS policies are enabled

### Canvas Doesn't Load
- Check browser console for errors
- Verify all environment variables are set

## What You Get

After deployment, users can:

1. **Sign in with Google** → OAuth authentication
2. **Create boards** → Visual canvas workspaces
3. **Add nodes** → Text, Source, Insight, Output nodes
4. **Drag & drop** → Position nodes (auto-saved)
5. **Connect nodes** → Visual relationships (edges)

## Next Steps

- Add custom domain in Vercel
- Implement Phase 2: Asset upload
- Add AI content generation
- Enable real-time collaboration
- Setup monitoring and analytics

---

**Estimated Total Time: 10-15 minutes** ⚡
