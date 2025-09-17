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
No environment variables are required to run the app in development by default. If you introduce APIs or external services later, document the variables here.

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
