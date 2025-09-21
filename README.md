# Mindspace App

Made by AgentXcel Team

A Next.js 14 + React 18 application focused on mental wellness for Indian youth. It offers a gentle, privacy-first space to check in with yourself, track mood, chat with an empathetic AI companion, and read curated resources. After a short Mental Wellness Check‑in, the app generates a culturally grounded, metaphorical story to offer comfort and small coping steps.

## Table of Contents
- [Project Title and Description](#mindspace-app)
- [Screenshots](#screenshots)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Clone and Install](#clone-and-install)
  - [Environment Variables](#environment-variables)
  - [Google Cloud Setup](#google-cloud-setup)
- [Usage](#usage)
- [Features](#features)
- [Google Cloud Services Used](#google-cloud-services-used)
- [Contributing](#contributing)
- [License](#license)
- [Credits and Acknowledgements](#credits-and-acknowledgements)
- [Project Status](#project-status)
- [Links](#links)

## Screenshots
(Add your screenshots/GIFs here from the public/ folder)

- Dashboard with Daily Check‑in
- Know Yourself page with latest insights and story
- AI Companion chat

## Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm or npm

### Clone and Install
```bash
# clone
git clone <repository_url>
cd "Mindspace App"

# install deps (choose one)
pnpm install
# or
npm install
```

### Environment Variables
Create a .env.local file in the project root and set the following:

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key
# Optional (defaults to gemini-1.5-flash-002)
# GEMINI_MODEL=gemini-1.5-flash-002

# Firestore / GCP project for server-side writes
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
# or GCLOUD_PROJECT=your_gcp_project_id
# For local dev, prefer ADC. Otherwise, point to a service account JSON:
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

### Google Cloud Setup
1. Create or select a GCP project.
2. Enable APIs: Firestore API (required). Gemini uses Google AI Studio API key and does not require enabling Vertex AI for this app flow.
3. Firestore: Create a Firestore database (Native mode) in your project.
4. Credentials for local dev (choose one):
   - gcloud auth application-default login (recommended for local)
   - or download a Service Account JSON with minimal roles (Datastore User / Firestore User) and set GOOGLE_APPLICATION_CREDENTIALS.

## Usage
Start the development server:
```bash
pnpm dev
# or
npm run dev
```
Then open http://localhost:3000

Key flows to try:
- On first visit to Dashboard, complete the Mental Wellness Check‑in (12 questions). A personalized story is generated and saved locally; insights appear on the Know Yourself page.
- Use AI Companion chat to talk through feelings; type a message and the AI will respond.
- Explore Articles and Activities; try the Breathing Meditation.

Build and run production locally:
```bash
pnpm build && pnpm start
# or
npm run build && npm start
```

## Features
- Navbar and Footer across main pages
- Know Yourself page with Interactive Wellbeing Explorer and latest Check‑in insights + story
- First‑time onboarding quiz on Dashboard (12 Qs, options A–D) with empathetic observations and suggestions
- AI‑generated metaphorical story (300–400 words) tailored to your current state
- Mood tracking with daily check‑ins and simple history
- AI Companion chat for supportive, stigma‑free conversations
- Curated Articles, Stories, and Activities (including guided breathing)
- Emergency support modal with key helpline numbers
- Clean, responsive UI with Tailwind CSS and shadcn‑style components

## Google Cloud Services Used
- Google AI (Gemini) via @google/generative-ai
  - Where: app/api/story/route.ts
  - How: Generates a short, metaphorical story from a scenario prompt. Requires GEMINI_API_KEY. The API is invoked server-side with responseMimeType set to application/json for structured output.
- Google Cloud Firestore (@google-cloud/firestore)
  - Where: lib/firestore (helper) and app/api/story/route.ts
  - How: If the user is signed in, each generated story is saved to the stories collection with userId, title, story, scenarioPrompt, and createdAt (server timestamp). Requires GOOGLE_CLOUD_PROJECT and credentials (ADC or service account) on the server.

## Contributing
We welcome contributions!
- Fork the repo and create a feature branch.
- Follow the existing code style and component patterns.
- Open a pull request with a clear description and screenshots where applicable.

Bug Reports and Feature Requests:
- Please open an issue with steps to reproduce or a concise proposal.

## License
MIT (recommended). If a LICENSE file is not present, please add one before public distribution.

## Credits and Acknowledgements
- Authors: AgentXcel Team
- Major Libraries: Next.js, React, Tailwind CSS, Radix/shadcn‑inspired UI, NextAuth, @google/generative-ai, @google-cloud/firestore
- Thanks to the open‑source community for tools and inspiration.

## Project Status
Active development (beta). Core flows are functional; UI and content continue to evolve.

## Links
- Live Demo: (add url if deployed)
- Documentation: This README
- Support: Open a GitHub issue
