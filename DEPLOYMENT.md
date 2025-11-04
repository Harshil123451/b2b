# Vercel Deployment Guide

This guide will help you deploy your B2B Price Comparison app to Vercel.

## Prerequisites

✅ Code is pushed to GitHub  
✅ Supabase project is set up  
✅ Database schema is executed in Supabase  

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. **Go to Vercel**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add the following variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   - Get these values from:
     - Supabase Dashboard → Settings → API
     - Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
     - Copy **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 2-3 minutes)

### 3. Verify Deployment

After deployment:

1. ✅ Check that the build succeeded
2. ✅ Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
3. ✅ Test the authentication flow
4. ✅ Verify dashboard access

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Home page loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads for authenticated users
- [ ] Database queries work
- [ ] Create request works (for clients)
- [ ] Submit offer works (for providers)

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Make sure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel

**Error: Cannot find module**
- Run `npm install` locally to ensure all dependencies are in `package.json`

### App Doesn't Work After Deployment

**Authentication not working**
- Verify Supabase URL and keys are correct
- Check Supabase dashboard → Authentication → Settings
- Ensure email confirmation is disabled (or users have confirmed emails)

**Database errors**
- Verify database schema is executed in Supabase SQL Editor
- Check Row Level Security (RLS) policies are in place

**404 Errors**
- Verify Next.js routes are correct
- Check Vercel build logs for any routing issues

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → anon public |

## Custom Domain (Optional)

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Updating Your Deployment

Any push to your main branch will automatically trigger a new deployment:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically:
- Build the new version
- Deploy it
- Update your live site

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review the README.md for setup instructions

