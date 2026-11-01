# AI Trade Master

A paper-trading ("virtual money") platform built with Next.js 16, React 19, Tailwind CSS 4, Drizzle ORM and PostgreSQL.

It ships two interfaces:

- **Trader app** (`/`) — 30-agent scan panel, charts, watchlists, virtual wallet, demo bots, backtests, subscriptions, notifications.
- **Admin console** (`/admin`) — 19 modules: users, roles, wallet ledger, bots, strategies, market data, orders, portfolio, P&L, KYC, tickets, audit logs, platform config, plans, branding/languages, risk engine.

> ⚠️ **This is a simulation/demo project.** Market prices, AI signals, open-interest scans, backtests and P&L are generated locally with random/hardcoded values. It does **not** connect to any broker or exchange and must not be presented as real investment advice or performance.

---

## Requirements

- Node.js **20.9+** (22 recommended)
- PostgreSQL **14+**
- npm 10+

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # Windows: copy .env.example .env
#    then edit DATABASE_URL, AUTH_SECRET and SETUP_SECRET

# 3. Create the database tables
npm run db:push

# 4. Start the app
npm run dev
```

Open http://localhost:3000.

> **Windows note:** the database must be UTF-8. A cluster initialised with the
> default Windows locale (`WIN1252`) rejects the app's Hindi text with
> `error 22P05`. Create it with `initdb -E UTF8 --locale=C` (or use a Docker/`postgres:16`
> image) before running `npm run db:push`.

### Seed the demo data (admin, demo trader, plans, bots, compliance records)

The seeder is exposed through a protected endpoint so it can also be triggered on a hosted environment:

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "x-setup-secret: $SETUP_SECRET"
```

It is idempotent — safe to call more than once.

### Default accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `ADMIN_EMAIL` (default `admin@autotrading.ai`) | `ADMIN_PASSWORD` env value |
| Demo Trader | `demo@autotrading.ai` | `DEMO_PASSWORD` env value (default `demo1234`) |

There is also a **1-click demo login** on the home page which signs into the demo trader account only. Set `DEMO_LOGIN_ENABLED=false` to disable it.

> Change `ADMIN_PASSWORD` **before** the first seed. The seeder only creates the account if it does not exist, so changing the env var later does not update the stored password.

---

## Deploying on Render

Render does **not** accept a ZIP upload. It deploys from a Git repository (or a Docker image), so the project must be in GitHub/GitLab/Bitbucket first.

### Option A — Blueprint (recommended)

1. Push this folder to a Git repository.
2. In the Render Dashboard open **New → Blueprint** and select the repo.
3. Render reads `render.yaml` and creates:
   - a Postgres database (`ai-trade-db`), and
   - a Node web service (`ai-trade-master`) with `AUTH_SECRET` and `SETUP_SECRET` auto-generated.
4. Set the `ADMIN_PASSWORD` and `DEMO_PASSWORD` values when prompted (marked `sync: false`).
5. Create the tables **once** from your machine using the database's **External** connection string:
   ```bash
   DATABASE_URL="postgresql://...external..." npm run db:push
   ```
6. Seed the data:
   ```bash
   curl -X POST https://<your-service>.onrender.com/api/setup \
     -H "x-setup-secret: <SETUP_SECRET from the Render dashboard>"
   ```
7. Open the service URL. Admin console: `https://<your-service>.onrender.com/admin`.

### Option B — Manual web service

1. **New → Postgres**, copy the **Internal** connection string.
2. **New → Web Service** → connect the repo, then set:
   - Runtime: Node
   - Build command: `npm ci --include=dev && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
3. Add environment variables: `DATABASE_URL` (internal URL), `AUTH_SECRET`, `SETUP_SECRET`, `NODE_VERSION=22`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_PASSWORD`.
   Do **not** set `NODE_ENV=production` — `npm ci` would then skip devDependencies and `next build` would fail (Tailwind/PostCSS live there).
4. Push the schema (`db:push` against the External URL) and call `/api/setup` as above.

### Notes for Render

- Free web services sleep after ~15 minutes of inactivity (cold start on the next request).
- Free Postgres instances expire after their trial window — check the current Render policy. If you need a longer-lived free database, create one at **Neon** or **Supabase** and paste its connection string into `DATABASE_URL` instead of using the blueprint's database.
- Hosted databases that require TLS are detected automatically; override with `DATABASE_SSL=true` / `DATABASE_SSL=false` if needed.
- If you upgrade the web service to a paid plan you can automate schema pushes with a **Pre-Deploy Command**: `npm run db:push:ci`.
- **Known issue:** `drizzle-kit push` can exit silently when run against a Render *external* Postgres URL (TLS + Node 24). Workaround: `npm run db:generate` to emit `drizzle/*.sql`, then apply that SQL with a small `pg` client script (or over psql). The generated migration is committed in `drizzle/` so a fresh database can be created from it.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | HMAC key for session cookies (32+ random chars) |
| `SETUP_SECRET` | yes | Protects `POST /api/setup` |
| `ADMIN_EMAIL` | no | Seeded admin email (default `admin@autotrading.ai`) |
| `ADMIN_PASSWORD` | no | Seeded admin password (default `admin123` — change it) |
| `DEMO_PASSWORD` | no | Seeded demo trader password (default `demo1234`) |
| `DEMO_LOGIN_ENABLED` | no | `false` disables the 1-click demo login |
| `DATABASE_SSL` | no | Force TLS on/off (`true`/`false`); auto-detected otherwise |
| `DATABASE_POOL_MAX` | no | Postgres pool size (default `10`) |
| `AUTH_COOKIE_SECURE` | no | `false` disables the `Secure` cookie flag (plain-HTTP local builds) |
| `OPENAI_API_KEY` | no | Enables real LLM verdicts via OpenAI (or any OpenAI-compatible API) |
| `OPENAI_BASE_URL` | no | OpenAI-compatible base URL (default `https://api.openai.com/v1`) |
| `AI_MODEL` | no | Model name for the OpenAI-compatible provider (default `gpt-4o-mini`) |
| `GEMINI_API_KEY` | no | Enables real LLM verdicts via Google Gemini (used only if no OpenAI key) |
| `GEMINI_MODEL` | no | Gemini model name (default `gemini-2.0-flash`) |

### Live market data & AI signals

- **Prices and candles** come from Yahoo Finance's public chart endpoint
  (`src/lib/marketData.ts`): 60s quote cache, 5-minute candle cache, and automatic
  fallback to simulated data when the feed is unreachable. Endpoints:
  `GET /api/market/quotes?symbols=RELIANCE,NIFTY50` and
  `GET /api/market/history?symbol=RELIANCE&count=28&interval=5m`
  (`interval` = `1m` / `5m` / `15m` / `1h` / `1D`).
- **Real-time chart:** the UI polls a fast quote (`/api/market/quotes?...&fast=1`,
  10s TTL) for the symbol on screen, folds each tick into the last candle, and
  reloads candles on a timer (30s for `1m`, 60s otherwise). Polls pause while the
  tab is hidden.
- **Charting:** candles are rendered with [TradingView Lightweight
  Charts](https://github.com/tradingview/lightweight-charts) in
  `src/components/TradingChart.tsx` — pan/zoom, crosshair OHLC, volume, EMA20/50,
  VWAP, Bollinger Bands, entry/target/stop price lines and 1m–1D timeframes.
- **AI verdicts** (`src/lib/aiSignals.ts`) are optional. Set `OPENAI_API_KEY`
  (optionally with `OPENAI_BASE_URL`/`AI_MODEL`) or `GEMINI_API_KEY`
  (optionally `GEMINI_MODEL`). Without a key the scan uses the built-in
  deterministic 30-agent engine, so the demo works offline.
- The scan endpoint resolves the live price **server-side**; the client's
  `currentPrice` is only a fallback, so a stale or forged value cannot move
  entry/target/stop levels used by auto-trading.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security model

- Sessions are signed, `httpOnly`, `SameSite=Lax` cookies (`AUTH_SECRET`), valid for 7 days.
- Passwords use scrypt with per-password salts. Legacy SHA-256 hashes are verified once and upgraded on login.
- `/api/admin/*` is guarded by `src/proxy.ts` (admin roles only) and the mutating handlers re-check the session; audit records use the session email, not a client-supplied one.
- Wallet and trade mutations run inside transactions with row locks (`SELECT … FOR UPDATE`).
- Users can only read/modify their own wallet, trades, notifications, backtests and AI tasks — `userId` is taken from the session, never from the request body.
- Client-supplied prices are bounded on trade close; starting balance and order values are server-controlled.

Still recommended before a public launch: rate limiting on `/api/auth/*`, email verification, CSRF tokens for browser forms, and a real payment gateway instead of the simulated one.

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / start |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:push` | Create/update tables from `src/db/schema.ts` |
| `npm run db:push:ci` | Same, without confirmation prompts (automation) |
| `npm run db:generate` | Generate SQL migrations into `drizzle/` |
| `npm run db:studio` | Drizzle Studio |

---

## Project structure

```
src/
  app/
    page.tsx              # Trader dashboard (client)
    admin/page.tsx        # Admin console (client, 19 modules)
    api/                  # Route handlers (auth, wallet, trades, agents, admin, …)
  components/             # UI components (trader + admin modules)
  db/
    index.ts              # Drizzle client
    schema.ts             # 39 tables
  lib/
    agents/               # 30-agent simulation engine
    auth.ts               # Password hashing
    session.ts            # Signed cookie sessions
    adminSeed.ts          # Idempotent demo seeding
  proxy.ts                # Admin API guard (edge)
```

## Known limitations

- All market data and AI output is simulated — no external provider is integrated.
- Subscription invoices are created in `PAID` state by a simulated gateway.
- No automated test suite is included.
