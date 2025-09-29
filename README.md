# Nucleus

A personal web-based cockpit for tasks and rituals. Designed to be fast, simple, and habit-friendly—a place to capture, prioritize, and review without the bloat of project management tools.

<!-- Build: Fixed TypeScript and Supabase errors for deployment -->

## Features

### Core Experience
- **Dashboard**: Add bar for instant capture, with Today / This Week / Backlog views
- **Tasks**: Single-line items with optional due date, priority, and project
- **Rituals**: 
  - Daily: Morning pick (2–3 focus items), evening reflection
  - Weekly: Review backlog, clean up, set anchors for the next week
- **Streaks & Stats**: Simple counters for daily/weekly consistency

### Technical Stack
- **Frontend**: Next.js (App Router, TypeScript) with Joy UI
- **Backend**: Supabase (Postgres + Auth + RLS + Realtime)
- **Deployment**: Netlify
- **Offline**: IndexedDB mirror + mutation queue for offline-first experience

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd nucleus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Set up your Supabase database with the following tables:

- `profiles` - User profiles
- `projects` - Project organization
- `tasks` - Task management
- `journal` - Daily and weekly ritual entries
- `settings` - User preferences

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── dashboard/       # Dashboard-specific components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Third-party library configurations
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Guiding Principles

- **Capture in <2 seconds**: Fast task entry without friction
- **One main surface**: Dashboard-first with Today focus
- **Habits over features**: Rituals and streaks matter more than extras
- **Polished but boring**: Minimal UI, fast interactions, no clutter

## Deployment

The app is configured for easy deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set your environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - see LICENSE file for details.