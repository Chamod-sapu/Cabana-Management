# Setup Guide - Cabana Management System

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and copy the Project URL and anon key.

3. Create a `.env` file based on `.env.example` and paste your Supabase credentials.

4. In Supabase, run the SQL from `supabase-schema.sql` (SQL editor) to create tables and seed cabanas.

5. Create a SUPER_USER in Supabase Auth, then add a matching row in the `profiles` table with role `SUPER_USER`.

6. Start the dev server:

```bash
npm run dev
```

7. Login at `http://localhost:3000` with your SUPER_USER credentials and verify:

- Dashboard loads
- Navigation works
- System Settings toggle is visible
- Activity Logs page loads (will be empty until you wire logging triggers)

