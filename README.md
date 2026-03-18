# Placement Management System (Next.js)

A full-stack placement management platform built with Next.js 16, TypeScript, Prisma, and MySQL.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MySQL via Prisma ORM
- **Auth**: NextAuth.js v5 (student + admin roles)
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI primitives, custom components
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Notifications**: Nodemailer (email), Twilio (WhatsApp)
- **PDF**: pdf-parse for resume analysis

## Setup

1. **Install dependencies** (use pnpm or npm with `--legacy-peer-deps`):

   ```bash
   npm install --legacy-peer-deps
   # or: pnpm install
   ```

2. **Configure environment**:

   Copy `.env.example` to `.env.local` and fill in:

   - `DATABASE_URL`: MySQL connection string (e.g. `mysql://root:password@localhost:3306/placement_db`)
   - `NEXTAUTH_SECRET`: Random string for JWT signing
   - `NEXTAUTH_URL`: `http://localhost:3000` (or your URL)
   - Optional: `GMAIL_USER`, `GMAIL_APP_PASSWORD` for email; `TWILIO_*` for WhatsApp

3. **Database**:

   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

   This creates tables and a default admin: **username**: `admin`, **password**: `admin123`.

4. **Run dev server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Routes

- **Public**: `/` (home with stats)
- **Auth**: `/student/register`, `/student/login`, `/admin/login`
- **Student**: `/student/profile`, `/student/companies`, `/student/applications`, `/student/interviews`, `/student/feedback`, `/student/notifications`, `/student/messages`, `/student/resume-analyzer`, `/student/explore`
- **Admin**: `/admin/overview`, `/admin/add-company`, `/admin/manage-applications`, `/admin/schedule-interview`, `/admin/panel-slots`, `/admin/interview-management`, `/admin/interview-feedback`, `/admin/notifications`, `/admin/messages`, `/admin/reports`

## Features

- Student registration, login, profile, resume upload
- Browse companies, check eligibility, apply
- Application status tracking (applied → shortlisted → selected/rejected)
- Interview scheduling (manual + auto panel/slots)
- Interview feedback with scores
- In-app notifications
- Student–admin messaging
- Resume analyzer (keyword matching, role recommendations)
- Reports (branch-wise, company-wise, full placement CSV export)
- Email & WhatsApp notifications (when configured)
