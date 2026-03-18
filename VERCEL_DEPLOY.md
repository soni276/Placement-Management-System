# Vercel Deployment Guide

## Ready for deployment ✅

- Build tested: `npm run build` passes
- Next.js 16 has [zero-config support on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

## Steps to deploy

### 1. Push to GitHub

Code is on: https://github.com/soni276/Placement-Management-System

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Log in (GitHub)
2. **Add New Project** → **Import** → Select `soni276/Placement-Management-System`
3. Vercel auto-detects Next.js (no build config needed)
4. Click **Deploy** (first deploy will run)

### 3. Set environment variables

In Vercel: **Project** → **Settings** → **Environment Variables**

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Production MySQL (PlanetScale, Railway) - localhost won't work |
| `NEXTAUTH_URL` | Yes | `https://your-project.vercel.app` (Vercel gives this URL) |
| `NEXTAUTH_SECRET` | Yes | Run `openssl rand -base64 32` to generate |
| `GMAIL_USER` | No | For email notifications |
| `GMAIL_APP_PASSWORD` | No | |
| `TWILIO_*` | No | For WhatsApp |

### 4. Production database

Serverless (Vercel) cannot use localhost MySQL. Use:

- **PlanetScale** (free tier): https://planetscale.com
- **Railway**: https://railway.app

After creating DB:
```bash
npx prisma migrate deploy
# or first setup:
npx prisma db push
```

### 5. Redeploy

After adding env vars: **Deployments** → **⋯** on latest → **Redeploy**

---

**Note:** First deploy may fail without `DATABASE_URL`. Add env vars and redeploy.
