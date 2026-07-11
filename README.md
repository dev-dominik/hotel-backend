# Hotel Backend

NestJS REST API for the Hotel Booking application.

**Stack:** NestJS · TypeORM · PostgreSQL · Redis (sessions) · Resend (email) · Passport (local, Google, Facebook)

---

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 15+
- Redis 7+

---

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` — the required variables are described below.

3. **Start infrastructure** (PostgreSQL + Redis via Docker)

   ```bash
   docker-compose up -d postgres redis
   ```

4. **Run migrations**

   ```bash
   pnpm db:migration:run
   ```

5. **Start the server**

   ```bash
   pnpm start:dev
   ```

   API is available at `http://localhost:3000`.

---

## Environment Variables

### Server

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `3000`) |
| `DOMAIN` | Yes | Frontend origin, e.g. `http://localhost:5173`. Used in CORS and email links. |

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_SSL` | No | Enable SSL for DB connection (default: `false`) |
| `DATABASE_POOL_SIZE` | No | Connection pool size (default: `10`) |

### Redis

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | Yes | Redis connection string |

### Session

| Variable | Required | Description |
|---|---|---|
| `SESSION_NAME` | Yes | Cookie name |
| `SESSION_SECRET` | Yes | Cookie signing secret (min 32 chars) |
| `SESSION_SECURE` | Yes | Set `true` in production (HTTPS only) |
| `SESSION_SAME_SITE` | No | `lax` / `strict` / `none` (default: `lax`) |
| `SESSION_MAX_AGE` | No | Session TTL in ms (default: `604800000` — 7 days) |

### Email

| Variable | Required | Description |
|---|---|---|
| `MAIL_RESEND_DISABLED` | No | Set `true` to skip sending emails (default: `false`) |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) API key (required if mail is enabled) |
| `MAIL_FROM` | No | Sender address. Use `delivered@resend.dev` for local testing. |

### Security

| Variable | Required | Description |
|---|---|---|
| `HCAPTCHA_SECRET` | Yes | hCaptcha secret key. Use `0x0000000000000000000000000000000000000000` for testing. |

### OAuth

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_DISABLED` | No | Set `false` to enable Google OAuth (default: `true`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `FACEBOOK_DISABLED` | No | Set `false` to enable Facebook OAuth (default: `true`) |
| `FACEBOOK_APP_ID` | No | Facebook App ID |
| `FACEBOOK_APP_SECRET` | No | Facebook App secret |

### Media Storage

| Variable | Required | Description |
|---|---|---|
| `MEDIA_STORAGE` | No | Storage backend: `local` or `cloudinary` (default: `cloudinary`) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (required if `MEDIA_STORAGE=cloudinary`) |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key (required if `MEDIA_STORAGE=cloudinary`) |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret (required if `MEDIA_STORAGE=cloudinary`) |
| `MEDIA_LOCAL_UPLOAD_DIR` | No | Local upload directory (default: `./uploads`) — used when `MEDIA_STORAGE=local` |
| `MEDIA_LOCAL_BASE_URL` | No | Base URL for serving local files (default: `http://localhost:3000`) — used when `MEDIA_STORAGE=local` |

---

## Scripts

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm build
pnpm start:prod

# Linting
pnpm lint

# Tests
pnpm test
pnpm test:e2e
pnpm test:cov
```

---

## Database Migrations

```bash
# Generate a migration from entity changes
pnpm db:migration:generate src/database/migrations/<MigrationName>

# Run all pending migrations
pnpm db:migration:run

# Revert the last migration
pnpm db:migration:revert

# List all migrations and their status
pnpm db:migration:show
```

---

## Running with Docker

To run the full stack (API + PostgreSQL + Redis) in Docker:

```bash
docker-compose up --build
```
