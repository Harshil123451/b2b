# B2B Price Comparison Web App

A simple, clean B2B price comparison platform where clients can post service requests and providers can submit offers. Built with Next.js, TypeScript, TailwindCSS, and Supabase.

## Features

### For Clients
- Create service requests (service type, description)
- View all their requests
- View and compare all offers submitted for each request
- Filter offers by price, delivery time, or provider name
- Contact providers (simple message button)

### For Providers
- View open requests from clients
- Submit offers (price, delivery time, message)
- Manage their submitted offers

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (Authentication + Database)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish initializing
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy and paste the contents of `database/schema.sql` into the SQL Editor
5. Run the SQL script (click "Run" or press Ctrl+Enter)
6. Go to **Settings** > **API** in your Supabase dashboard
7. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project.supabase.co` and `your-anon-key-here` with your actual Supabase values.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses three main tables:

1. **users** - Stores user profiles (id, name, role)
2. **requests** - Stores service requests (id, user_id, service_type, description, status)
3. **offers** - Stores provider offers (id, request_id, provider_id, price, delivery_time, message, status)

Row Level Security (RLS) is enabled to ensure users can only access their own data or appropriate shared data.

## Deployment to Vercel

### Quick Start

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - Click **"Deploy"**

3. **Get Your Keys from Supabase**
   - Supabase Dashboard → Settings → API
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Wait for Deployment** (2-3 minutes)

Your app will be live at `https://your-project.vercel.app`! 🚀

📖 **Detailed instructions**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## Project Structure

```
b2b/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ClientDashboard.tsx
│   ├── Navigation.tsx
│   └── ProviderDashboard.tsx
├── database/
│   └── schema.sql
├── lib/
│   └── supabase.ts
├── .env.local.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Usage

1. **Sign Up**: Create an account and choose your role (Client or Provider)
2. **Clients**: Create service requests and compare offers
3. **Providers**: Browse open requests and submit offers
4. **Contact**: Use the contact button to reach out to providers/clients

## Notes

- The app uses Supabase's built-in authentication
- All database queries use Row Level Security (RLS) for security
- The design is intentionally minimal and focused on usability
- No complex admin features - just the core flow as specified

## Troubleshooting

**Issue**: "Missing Supabase environment variables"
- Make sure your `.env.local` file exists and has the correct variable names

**Issue**: "Error loading requests/offers"
- Check that you've run the SQL schema in Supabase
- Verify RLS policies are set up correctly
- Check browser console for specific error messages

**Issue**: Authentication not working
- Verify your Supabase project URL and anon key are correct
- Check that email authentication is enabled in Supabase (Settings > Authentication)

## License

This project is open source and available for personal and commercial use.

