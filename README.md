# Strapi Click Frame - Photorium

A modern photography community platform built with **Strapi 5** and **Astro 6**. This project showcases a full-stack architecture featuring a headless CMS, a high-performance frontend with Astro Islands, and integrated AI assistant workflows.

## 🚀 Overview

Photorium is a social platform for artists and photographers to share their work, manage categories, and engage with a social feed. 

### Key Tech Stack
- **Backend:** [Strapi 5](https://strapi.io/) (Headless CMS)
- **Frontend:** [Astro 6](https://astro.build/) with React
- **Integration:** `strapi-community-astro-loader` for seamless data fetching
- **Deployment Ready:** Configured for high-performance static and dynamic delivery

## 📂 Project Structure

- `photorium/`: Strapi 5 Backend.
- `react/`: Astro 6 Frontend.
- `schema-types/`: Shared TypeScript types and Strapi schemas.
- `docs/`: Project documentation and architecture plans.

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Backend (Strapi)
```bash
cd photorium
npm install
# Configure .env based on .env.example
npm run dev
```

### 2. Frontend (Astro)
```bash
cd react
npm install
# Configure .env (STRAPI_URL, PUBLIC_STRAPI_URL)
npm run dev
```

## 🧠 Project Memory & AI Assistants

This project is optimized for AI-assisted development, featuring configurations for four major AI coding environments:

- **Gemini CLI:** (`GEMINI.md`) Specialized in codebase orchestration and strategic planning.
- **Claude (Cline/Roo-Code):** (`CLAUDE.md`) Focuses on high-signal technical rationale and architectural mapping.
- **Cline:** (`.clinerules`) Provides specific rules for Strapi and Astro integration patterns.
- **ChatGPT/Custom Assistants:** Generalist support and creative problem-solving.

*Note: AI-specific configuration folders (`.gemini`, `.claude`, `.cline`, `.vscode`) are excluded from the repository to maintain a clean environment.*

## 🔒 Security & Environment

- **Strict Policy Management:** Strapi roles and policies (e.g., `is-editor`) are used to secure sensitive operations like category merging.
- **Credential Protection:** API keys, JWT secrets, and tokens are strictly managed via `.env` files and are **excluded** from source control via `.gitignore`.
- **Image Hosting:** Integrated with ImageKit.io for optimized media delivery.

## 🗺 Roadmap

- [x] Social notification feed (rolling 5 items)
- [x] Role-based Category management
- [ ] Comment Notifications
- [ ] Weekly "Most Munchable" leaderboard

---
*Created and maintained with the help of AI coding assistants.*
