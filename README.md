# Cabana Management System

React + Vite + Supabase implementation of the Hotel Cabana Management System as described in `PROJECT_SUMMARY.md` and `QUICK_REFERENCE.md`.

## Quick Start

```bash
npm install
cp .env.example .env   # add Supabase URL and anon key
psql < supabase-schema.sql  # or run in Supabase SQL editor
npm run dev
```

Then open `http://localhost:3000` and login with a user created in Supabase.

