# Amanah Admin Panel

Next.js admin panel for managing **corporates** and **members**, styled with the Amanah Insurance brand colors from `logo-amanaha.png`.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** + **Prisma**
- **Tailwind CSS v4**

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Maroon | `#70103b` | Primary actions, active nav |
| Gray Medium | `#7a8282` | Secondary text |
| Gray Light | `#a0a5a5` | Muted text, labels |
| Background | `#0a0a0a` | Page background |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

With Docker:

```bash
docker compose up -d
```

Or point `DATABASE_URL` in `.env` to your own PostgreSQL instance.

### 4. Run migrations

```bash
npm run db:migrate
```

When prompted for a migration name, use something like `init`.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/admin`.

## Features

- **Dashboard** — overview stats across all modules
- **Corporates & Members** — core account management
- **Claims** — submit, review, approve, and track claims
- **Preauthorizations** — manage pre-approval requests
- **Premiums** — track invoices and payments per corporate/member
- **Commissions** — agent commission records with auto-calculated amounts
- **Reinsurance** — treaty management (quota share, surplus, excess of loss)
- **Administration** — admin users, roles, and system settings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
