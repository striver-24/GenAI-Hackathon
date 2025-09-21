# Mindspace App

A Next.js 14 + React 18 application focused on mental wellness. It provides mood tracking, daily check-ins, guided breathing, an AI chat companion, and curated articles — designed to help users build healthier habits.

## Features
- Welcome and Auth flow (Sign in / Sign up)
- Dashboard with:
  - Daily mood/energy/stress check-in
  - Mood history overview
  - Quick actions and insights
- AI Chat companion to support wellness conversations
- Guided Breathing Meditation component
- Articles, Stories, and Activities sections
- Emergency resources modal with important contacts
- Modern UI built with Tailwind CSS and Radix UI components

## Tech Stack
- Next.js 14 (App Router)
- React 18, TypeScript
- Tailwind CSS 4
- Radix UI, shadcn-inspired components

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm (comes with Node) or pnpm

### Installation
Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### Development
Start the dev server at http://localhost:3000
```bash
npm run dev
# or
pnpm dev
```

### Lint
```bash
npm run lint
# or
pnpm lint
```

### Build & Run
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## Project Structure
```
/ (repo root)
├─ app/                # Next.js app router pages and layout
├─ components/         # Reusable UI components (buttons, cards, etc.)
├─ hooks/              # Custom React hooks
├─ lib/                # Utilities and shared libraries
├─ public/             # Static assets
├─ styles/             # Global styles
├─ next.config.mjs     # Next.js configuration
├─ package.json        # Scripts and dependencies
└─ tsconfig.json       # TypeScript configuration
```

## Configuration
This app now integrates Google OAuth (NextAuth), Gemini (Direct API), and Firestore.

Required environment variables (create .env.local):

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
# or GCLOUD_PROJECT=your_gcp_project_id
VERTEX_LOCATION=us-central1
# Use Application Default Credentials in local/dev, or set a service account JSON:
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json

Setup steps:
1) Create a GCP project; enable APIs: Vertex AI API, Firestore API, IAM, Cloud Logging.
2) Create OAuth 2.0 credentials in Google Cloud Console (or Google Cloud Platform > APIs & Services) and set authorized redirect URI: http://localhost:3000/api/auth/callback/google
3) Firestore: in the same project, create a Firestore database (Native mode).
4) Local dev credentials:
   - EITHER run `gcloud auth application-default login` to set ADC (recommended),
   - OR download a service account key with Firestore User/Client and Vertex AI User roles, and set GOOGLE_APPLICATION_CREDENTIALS.
5) Install deps and run the app:
   npm install
   npm run dev

Notes:
- The “Know Yourself” page derives a scenario from your check-in and calls /api/story.
- The /api/story endpoint prompts Gemini 1.5 Flash with a strict system prompt and returns {title, story}.
- If signed in with Google, generated stories are stored in Firestore (collection: stories).

## Scripts (from package.json)
- dev: `next dev`
- build: `next build`
- start: `next start`
- lint: `next lint`

## License
This project currently has no explicit license. Add one if you plan to share or open-source the project.

## Acknowledgements
- Next.js team for the framework
- Radix UI and shadcn/ui for component patterns
- Open-source community for libraries used in this project


## Gemini Setup (Direct API)
You can generate stories with Gemini without using VertexAI server SDK.

1. Create a Gemini API key:
   - Visit https://ai.google.dev and create an API key (Google AI Studio).
2. Configure environment:
   - In your .env.local, set:
     GEMINI_API_KEY=your_api_key
     # Optional to override default model
     # GEMINI_MODEL=gemini-1.5-flash-002
3. Usage in this app:
   - The /api/story endpoint now uses the Google Generative AI SDK (@google/generative-ai).
   - Default model: gemini-1.5-flash-002
   - If you are signed in, generated stories are stored in Firestore.

Notes:
- VertexAI project/location variables are no longer required for story generation, but Firestore still needs your GCP project set (GOOGLE_CLOUD_PROJECT or GCLOUD_PROJECT) and credentials for server-side access.
- If GEMINI_API_KEY is missing, the endpoint returns HTTP 500 with a clear error message.
