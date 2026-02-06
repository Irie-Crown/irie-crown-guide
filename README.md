# Irie Crown Hair Intelligence™

AI-powered personalized hair routine generator and ingredient compatibility tracker for textured hair (3A–4C curl patterns).

## What It Does

- **Personalized Routines** — Complete a guided hair profile questionnaire and receive an AI-generated wash day, weekly, and monthly routine tailored to your hair type, porosity, health, climate, and lifestyle.
- **Ingredient Checker** — Paste any product's ingredient list and get an instant AI analysis flagging what's safe, what needs caution, and what to avoid for textured hair.
- **Dashboard** — Save, view, and regenerate your routines. Track your hair profile over time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) — Auth, PostgreSQL, Edge Functions |
| AI | Google Gemini via Lovable AI Gateway |
| Styling | Custom design system with Playfair Display + DM Sans |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── questionnaire/   # Multi-step form components
│   └── ProtectedRoute.tsx
├── hooks/               # Custom React hooks (useAuth, etc.)
├── pages/               # Route-level page components
│   ├── Landing.tsx       # Public landing page
│   ├── Auth.tsx          # Login / Sign up
│   ├── Questionnaire.tsx # 7-step hair profile intake
│   ├── Results.tsx       # AI-generated routine display
│   ├── Dashboard.tsx     # User dashboard
│   └── IngredientChecker.tsx
├── integrations/        # Auto-generated Supabase client & types
└── assets/              # Images and static assets

supabase/
├── functions/
│   ├── generate-routine/    # AI routine generation (authenticated)
│   └── analyze-ingredients/ # AI ingredient analysis (authenticated)
└── config.toml
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (or [Bun](https://bun.sh/))
- A Lovable account (backend is managed via Lovable Cloud)

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd irie-crown-hair-intelligence

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

The `.env` file is auto-managed by Lovable Cloud and contains only **publishable** keys:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key (safe for frontend) |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

Private secrets (API keys, service role key) are stored securely in Lovable Cloud and only accessible from Edge Functions.

## Security

- **Row Level Security (RLS)** enabled on all tables — users can only access their own data
- **JWT authentication** enforced on all Edge Functions
- **Protected routes** — unauthenticated users are redirected to `/auth`
- **No private keys** in frontend code or version control
- **WCAG AA compliant** color contrast throughout

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User display name, email, avatar |
| `hair_profiles` | Complete hair questionnaire responses |
| `routines` | AI-generated personalized routines |
| `ingredient_checks` | Saved ingredient analysis results |

## Deployment

The app is deployed via Lovable's publish feature. Backend changes (Edge Functions, migrations) deploy automatically. Frontend changes require clicking **Publish → Update**.

**Live URL:** [irie-crown-ai.lovable.app](https://irie-crown-ai.lovable.app)

## License

Private project. All rights reserved.
