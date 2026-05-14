# Pawntree

A full-stack, open-source chess opening trainer with Anki-style spaced repetition. Build opening trees from PGN files, drill them with depth-first practice, and reinforce weak positions with a daily SM-2 review session.

Licensed under **AGPL-3.0** — self-host for free, forever.

---

## Features

- **Opening library** — import PGN files or build trees manually move by move
- **Practice mode** — depth-first traversal quizzes you on every position in the tree
- **Daily review** — SM-2 spaced repetition surfaces positions you struggle with
- **Transposition detection** — warns when a position already exists in another opening
- **Web-first** — runs in the browser; also targets iOS and Android from the same codebase

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Expo (React Native Web), Expo Router, NativeWind / Tailwind CSS |
| Backend | Go, chi router, pgx/v5 |
| Database | PostgreSQL 16 |
| Auth | Google OAuth 2.0, JWT |
| Deployment | Docker Compose + nginx on a single VPS |

---

## Self-Hosting

### Prerequisites

- Docker + Docker Compose
- A domain with DNS pointed at your server
- A Google OAuth app ([instructions](#google-oauth-setup))
- `golang-migrate` CLI (`go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`)

### 1. Clone and configure

```bash
git clone https://github.com/eggplannt/Pawntree.git
cd Pawntree
cp .env.example .env
```

Edit `.env` and fill in every value. Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

### 2. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add to **Authorized redirect URIs**:
   - Production: `https://yourdomain.com/api/auth/google/callback`
   - Local dev: `http://localhost:8080/api/auth/google/callback`
4. Copy the Client ID and Secret into your `.env`

### 3. Run migrations

```bash
make migrate-up DB_URL="postgres://chess:<password>@localhost:5432/chess_trainer?sslmode=disable"
```

### 4. Deploy

```bash
make deploy
```

This builds the Go API, exports the Expo web app, and starts all services via Docker Compose.

---

## Local Development

```bash
# Start PostgreSQL + Go API with hot reload
make dev

# In a separate terminal — run the Expo web dev server
cd apps/expo
npm install
npx expo start --web
```

The API runs at `http://localhost:8080` and the frontend at `http://localhost:8081`.

### Makefile targets

| Command | Description |
|---|---|
| `make dev` | Start dev stack (Postgres + Go API with air hot reload) |
| `make migrate-up` | Apply all pending migrations |
| `make migrate-down` | Roll back the last migration |
| `make build-web` | Export Expo web app to `apps/expo/dist/` |
| `make deploy` | Build + export + restart production Docker Compose |
| `make test` | Run Go tests |

---

## Project Structure

```
/
├── apps/expo/          # Expo app — iOS, Android, Web
│   ├── app/            # Expo Router file-based routes
│   ├── components/     # Shared UI components
│   ├── hooks/          # useAuth, useAppTheme
│   ├── lib/            # API client, chess helpers, SM-2, PGN parser
│   └── types/          # TypeScript types mirroring DB schema
├── server/
│   ├── cmd/api/        # Entry point
│   ├── internal/
│   │   ├── auth/       # JWT issuance + validation
│   │   ├── db/         # pgx pool + query helpers
│   │   ├── handlers/   # HTTP handlers
│   │   ├── middleware/ # Auth, logging
│   │   └── models/     # Go structs
│   └── migrations/     # golang-migrate SQL files
├── nginx/              # nginx config (production)
├── docker-compose.yml
├── docker-compose.dev.yml
└── Makefile
```

---

## Monetization

The AGPL-3.0 license means anyone can self-host for free but must release modifications. A managed cloud-hosted version (where users pay for convenience) is offered separately. The billing and subscription layer is intentionally kept out of this repository.

---

## Roadmap

- [x] Phase 1 — Repo, database schema, Go API skeleton
- [x] Phase 2 — Google OAuth, JWT auth, Expo login + auth context
- [ ] Phase 3 — Opening CRUD, PGN import, transposition detection
- [ ] Phase 4 — Tree builder (board interaction)
- [ ] Phase 5 — Practice mode (DFS drill)
- [ ] Phase 6 — Daily review (SM-2 Anki)
- [ ] Phase 7 — Polish, settings, production deployment

---

## Contributing

PRs welcome. Please open an issue first for non-trivial changes.
