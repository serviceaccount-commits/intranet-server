# Paricus Intranet — Backend

Node.js + Express REST API for the Paricus Intranet platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| PostgreSQL ORM | TypeORM |
| MongoDB | Native Driver (Knowledge Base) |
| Auth | JWT RS256 + Google OAuth 2.0 |
| File Storage | AWS S3 |
| AI | Google Gemini 2.5 Flash |
| DI Container | InversifyJS |
| Realtime | Socket.IO |

---

## Prerequisites

- Node.js 20+
- Docker (for MongoDB)
- PostgreSQL 14+
- AWS account with S3 access
- Google Cloud project (OAuth + service account)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values. See the [Environment Variables](#environment-variables) section.

### 3. Generate JWT keys (RS256)

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

openssl genrsa -out verify_email_private.pem 2048
```

### 4. Start MongoDB (Docker)

```bash
npm run db:up
```

### 5. Run PostgreSQL migrations

```bash
npm run m:run
```

### 6. Start the server

```bash
npm run dev
```

API available at `http://localhost:3000`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled build (production) |
| `npm run db:up` | Start MongoDB via Docker |
| `npm run db:down` | Stop MongoDB container |
| `npm run db:logs` | Tail MongoDB logs |
| `npm run m:run` | Run pending migrations |
| `npm run m:generate` | Generate migration from entity changes |
| `npm run m:revert` | Revert last migration |
| `npm run seed:permissions` | Seed default permissions |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

---

## Environment Variables

Copy `.env.example` to `.env` and complete all values.

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_*` | PostgreSQL connection |
| `MONGODB_URI` | MongoDB URI (Docker: `mongodb://localhost:27017`) |
| `MONGODB_DB_NAME` | MongoDB database name (`paricus_kb`) |
| `AWS_*` | AWS credentials and S3 bucket name |
| `GEMINI_AI_API_KEY` | Google Gemini API key |
| `GOOGLE_OAUTH_*` | Google OAuth 2.0 credentials |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google service account JSON |
| `JWT_PRIVATE_KEY_PATH` | Path to RS256 private key (`./private.pem`) |
| `JWT_PUBLIC_KEY_PATH` | Path to RS256 public key (`./public.pem`) |
| `COOKIE_SECRET` | Secret for cookie signing |
| `INTERNAL_API_KEY` | Key for internal service-to-service calls |
| `FRONTEND_URL` | Frontend origin for CORS |

---

## Project Structure

```
src/
├── api-layer/              # Main router — mounts all module routers
├── app.ts                  # Express app (middleware, CORS)
├── server.ts               # HTTP server, Socket.IO, startup sequence
├── modules/
│   ├── internal/
│   │   ├── auth/           # JWT, Google OAuth, middleware
│   │   ├── users/          # Users, roles, permissions, assignments
│   │   └── documents/      # S3 file storage
│   └── external/
│       ├── knowledgeBase/  # Articles, topics, clients (MongoDB + PostgreSQL)
│       ├── announcements/  # Announcements, inbox, engagement reports
│       ├── training/       # Courses, classes, exams, attempts
│       └── humanResources/ # Staff directory
└── shared/
    ├── config/             # App config, InversifyJS DI container
    ├── database/           # TypeORM data source, MongoDB connection, migrations
    ├── errors/             # Custom error classes
    ├── types/              # Shared TypeScript types
    └── utils/              # Logger, AI service, CSV export
```

---

## Architecture Notes

**Dependency Injection**
All services and repositories are bound in `src/shared/config/inversify.config.ts`. Adding a new service requires: interface → implementation → binding → injection.

**Knowledge Base (MongoDB)**
Articles and tags are stored in MongoDB (native driver, no Mongoose). Clients and topics remain in PostgreSQL due to the user-client relationship managed by the users module.

**Authentication**
RS256 JWT via HTTP-only cookies. Access token expires in 20 min, refresh token in 1 day. The `authenticateJWT` middleware handles silent token renewal on every request.

**Migrations**
Always generate migrations with `npm run m:generate` after changing entities. Never use `synchronize: true` in production.

---

## Database

### PostgreSQL
Users, roles, announcements, training, HR data.

### MongoDB — Knowledge Base
```bash
npm run db:up     # Start (Docker)
npm run db:down   # Stop
```
Connects to `mongodb://localhost:27017/paricus_kb`

---

## API

Base URL: `http://localhost:3000/api/v1/`

All routes require a valid JWT cookie except:
- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/google`
- `GET  /api/v1/external/*` (requires `x-api-key` header instead)
