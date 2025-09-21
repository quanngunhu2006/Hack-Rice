## CitizenVoice (Hack-Rice)

A straightforward civic engagement web app for Houston residents to propose ideas, vote on initiatives, and report road issues. Built with React, TypeScript, Vite, and Supabase.

- **App location**: the application lives in `hackathon/`

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Data**: Supabase (PostgreSQL)
- **Maps**: React-Leaflet
- **State**: TanStack Query

### Quick Start
1. Navigate to the app folder:
   ```bash
   cd hackathon
   ```
2. Create an environment file `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Optional backend API for KYC/classification
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173`

### Database (Supabase)
In your Supabase project (SQL Editor), run the SQL files in `hackathon/`:
- `supabase-schema.sql` (tables, policies, functions)
- `seed-data.sql` (sample data)
- Optional: additional SQL in `database/` for voting/report features

### Available Scripts (from `hackathon/`)
- `npm run dev`: start the Vite dev server
- `npm run build`: type-check and build for production
- `npm run preview`: preview the production build
- `npm run lint`: run ESLint

### Project Structure (abridged)
```
hackathon/
├─ src/
│  ├─ components/      # Reusable UI & feature components
│  ├─ pages/           # Routes (Home, Explore, Map, Admin, etc.)
│  ├─ hooks/           # Data fetching and helpers
│  ├─ contexts/        # Auth context
│  └─ lib/             # Supabase client, API helpers, utils
└─ public/             # Static assets
```

### Notes
- Requires Node.js 20+
- Set `VITE_API_BASE_URL` if you have a separate backend for KYC/classification; otherwise features will be mocked/disabled as applicable.

### License
Built for Hack Rice; intended for demo purposes.