# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

## 2. Run Database Migrations

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `schema.sql`
3. Execute the SQL to create all tables, indexes, and RLS policies

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Configure Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Email provider
3. Configure email templates if needed
4. Set up redirect URLs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`

## 5. Configure OAuth (Optional)

If you want to enable social login:

1. Go to Authentication > Providers
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials for each provider
4. Update redirect URLs accordingly

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| profiles | User profile data (extends auth.users) |
| saved_datasets | User-saved datasets with columns and data |
| charts | Saved chart configurations |
| analysis_reports | Cached AI analysis reports |
| subscriptions | User subscription status |
| usage_logs | Usage tracking for limits |

## Row Level Security

All tables have RLS enabled with policies ensuring users can only access their own data.

## Trigger Functions

- `handle_new_user()`: Automatically creates profile and free subscription on signup
- `update_updated_at_column()`: Automatically updates timestamps