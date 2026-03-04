# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

TableAnalysis is a table data analysis platform. All core features are implemented and the build passes.

## Build & Development Commands

```bash
# Development (requires Node.js 18+)
npm run dev

# Build (production)
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Cloudflare development
npm run cf:dev

# Deploy to Cloudflare
npm run deploy
```

## Environment Variables Required

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for AI analysis)
OPENAI_API_KEY=your_openai_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id

# Site
NEXT_PUBLIC_SITE_URL=https://tableanalysis.com
```

## Architecture

- **Frontend**: Next.js 14 App Router with next-intl for i18n
- **Database**: Supabase (PostgreSQL with RLS)
- **Payments**: Stripe subscriptions
- **AI**: OpenAI GPT-4o for data analysis
- **Table/Charts**: TanStack Table + Recharts (client-side)
- **Deployment**: Cloudflare Workers (standalone output)

## Key Entry Points

- `app/[locale]/page.tsx` - Landing page
- `app/[locale]/dashboard/tables/import/page.tsx` - Table import
- `app/[locale]/api/analyze/route.ts` - AI analysis API
- `app/[locale]/api/stripe/` - Stripe integration
- `app/[locale]/api/usage/route.ts` - Usage tracking API

## Completed Features

### Phase 1: Foundation ✅
- Next.js project setup
- Tailwind CSS configuration
- Supabase integration
- Authentication flow
- i18n (English/Chinese)

### Phase 2: Core Features ✅
- Table editor (TanStack Table)
- CSV/Excel import (Papa Parse + SheetJS)
- Statistics panel
- Charts (Recharts)

### Phase 3: Advanced Features ✅
- Pivot tables
- AI analysis integration
- Data export (CSV/Excel)

### Phase 4: Commercialization ✅
- Stripe integration (Checkout/Portal/Webhook)
- Subscription management
- Usage limits enforcement

### Phase 5: Optimization ✅
- SEO (meta tags, sitemap, robots.txt, JSON-LD)
- Build fixes for environment variables
- Cloudflare deployment config

## Deployment

### Cloudflare Pages (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables in Cloudflare dashboard

### Manual Cloudflare Workers

```bash
# Install wrangler if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

## Database Schema

See `types/database.ts` for full TypeScript types.

Key tables:
- `profiles` - User profiles
- `saved_datasets` - User saved datasets
- `subscriptions` - Stripe subscriptions
- `usage_logs` - Usage tracking for limits

## Usage Limits

| Plan | Datasets | Rows | AI Analyses |
|------|----------|------|-------------|
| Free | 3 | 100 | 5/month |
| Pro | Unlimited | 10,000 | Unlimited |
| Enterprise | Unlimited | 100,000 | Unlimited |