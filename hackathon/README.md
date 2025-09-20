# CitizenVoice - Houston Civic Engagement Platform

A modern web application built with React, TypeScript, and Supabase for Houston residents to propose improvements, vote on initiatives, and report road issues.

## Features

- **Proposals**: Create and vote on city improvement proposals
- **Real-time Map**: Report and view road issues with interactive mapping
- **Resident Verification**: KYC integration to ensure only verified residents can participate
- **Live Scope Checking**: AI-powered classification to ensure proposals fall within city jurisdiction
- **Petition System**: Automatic petition creation for popular proposals
- **Admin Dashboard**: Moderation tools for reviewing submissions

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **Database**: Supabase (PostgreSQL + PostGIS for spatial data)
- **Maps**: React-Leaflet for map visualization
- **State Management**: TanStack Query for server state
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### Prerequisites

- Node.js 20+ 
- A Supabase account and project
- A backend API server for KYC/classification (optional for development)

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000  # Optional: for backend integration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the schema from `supabase-schema.sql` to create tables, RLS policies, and functions
4. Run the seed data from `seed-data.sql` to populate with sample content

### 4. Storage Setup (Optional)

If you want to enable media uploads:

1. In Supabase dashboard, go to Storage
2. The schema creates a `media` bucket automatically
3. Verify the bucket policies allow authenticated uploads

### 5. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 2-Minute Demo Flow

1. **Browse Proposals**: Visit the homepage to see sample proposals
2. **Create Account**: Click "Sign In" and create a new account
3. **Explore Map**: Navigate to `/map` to see road reports
4. **Verification Flow**: Go to `/account` to start the verification process
5. **Create Proposal**: Once verified, try creating a proposal at `/propose`
6. **Admin View**: Visit `/admin` to see the moderation interface

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProposalCard.tsx
│   ├── UpvoteButton.tsx
│   └── ...
├── pages/              # Route components
│   ├── Explore.tsx
│   ├── ProposalDetail.tsx
│   ├── Propose.tsx
│   ├── MapPage.tsx
│   ├── Account.tsx
│   └── Admin.tsx
├── hooks/              # Custom React hooks
│   ├── useProposals.ts
│   ├── useRoadReports.ts
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities
│   ├── supabase.ts
│   ├── api.ts
│   └── utils.ts
└── types/             # TypeScript definitions
    └── database.ts
```

## Key Features

### Verification System
- Residents must verify their identity to participate
- Integration with backend KYC service
- Profile management with residency status

### Proposal Management
- Create proposals with live scope checking
- Category-based filtering and search
- Upvoting system with one-vote-per-user enforcement
- Automatic petition creation for popular proposals

### Interactive Mapping
- Real-time road issue reporting
- Houston city boundary enforcement
- Media upload support for issue documentation
- Heatmap visualization for issue density

### Admin Interface
- Review pending proposals and reports
- Jurisdiction-based classification
- Approval/rejection with reasoning

## Database Schema

The platform uses several key tables:

- `profiles`: User profiles with verification status
- `proposals`: City improvement proposals
- `votes`: One-vote-per-user system with RPC enforcement
- `road_reports`: Spatial data for road issues with PostGIS

## Backend Integration

The app integrates with a separate backend for:

- **KYC Verification**: `/api/verify/kyc/start`
- **AI Classification**: `/api/classify`
- **Petition Management**: `/api/petitions/*`
- **Admin Moderation**: `/api/admin/*`

These endpoints are mocked in development but can be connected to a real backend.

## Development Notes

### Verification Flow
In development, you can toggle verification status directly in the database or use the dev banner (when implemented).

### Map Functionality
The map uses React-Leaflet with OpenStreetMap tiles. Houston boundary checking is implemented client-side with a simple bounding box.

### Real-time Updates
TanStack Query provides optimistic updates for votes and automatic cache invalidation for real-time feel.

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider
3. Ensure environment variables are set in your deployment environment
4. Configure your backend API endpoints if using custom domains

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript strictly with proper type definitions
3. Implement proper error handling and loading states
4. Add appropriate tests for new components and hooks
5. Ensure accessibility standards (ARIA labels, keyboard navigation)

## License

This project is built for the Hack Rice hackathon and is intended for demonstration purposes.