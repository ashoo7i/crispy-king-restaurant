# Permanent Backend Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the backend permanently on Vercel as serverless functions and connect it to an online PostgreSQL database, enabling the website to work 24/7 globally.

**Architecture:** Update Prisma to use PostgreSQL, merge backend dependencies into the root project, route api calls relatively to `/api` on the same domain, and build unified serverless functions via Vercel.

**Tech Stack:** React, Express, Prisma, PostgreSQL (Supabase/Neon), Vercel.

---

## User Review Required

> [!IMPORTANT]
> * **Hosted Database Connection String:** We need an online PostgreSQL database. Please create a free database on [Supabase](https://supabase.com) or [Neon](https://neon.tech) (it takes 1 minute and is completely free) and provide us with the connection string (usually starts with `postgresql://...` or `postgres://...`).
> * **Vercel Env Variable:** You will need to add the `DATABASE_URL` environment variable in your Vercel project dashboard so the online backend can connect to it.

---

## Open Questions

> [!IMPORTANT]
> * **اسم قاعدة البيانات ورابطها:** هل يمكنك إنشاء قاعدة بيانات مجانية على Supabase أو Neon وإعطائي رابط الاتصال الخاص بها (Connection String) لتثبيته في المشروع؟
> * **رابط المتجر الحالي:** بمجرد الانتهاء، سيتصل الموقع تلقائياً بالخلفية بدون الحاجة لـ localtunnel.

---

## Proposed Changes

### Prisma Schema Update

#### [MODIFY] [schema.prisma](file:///c:/Users/asqu2/Desktop/caaar/server/prisma/schema.prisma)
Change the database provider from `sqlite` to `postgresql`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### Root Configuration

#### [MODIFY] [package.json](file:///c:/Users/asqu2/Desktop/caaar/package.json)
Add Express, Cors, Prisma client, and backend types, and update the build script to run Prisma client generation before building.

```json
  "scripts": {
    "dev": "vite",
    "server": "npm --prefix server run dev",
    "build": "prisma generate --schema=server/prisma/schema.prisma && tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    ...
    "@prisma/client": "^5.10.0",
    "cors": "^2.8.5",
    "express": "^4.18.3"
  },
  "devDependencies": {
    ...
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "prisma": "^5.10.0"
  }
```

#### [NEW] [vercel.json](file:///c:/Users/asqu2/Desktop/caaar/vercel.json)
Configure Vercel to route frontend requests normally and backend requests starting with `/api` to the serverless function.

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    }
  ]
}
```

#### [NEW] [index.ts](file:///c:/Users/asqu2/Desktop/caaar/api/index.ts)
Create the serverless entrypoint for Express in the `api/` root directory.

```typescript
import express from 'express';
import cors from 'cors';
import router from '../server/src/routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

export default app;
```

#### [MODIFY] [config.ts](file:///c:/Users/asqu2/Desktop/caaar/src/config.ts)
Configure the app to use relative URLs `/api` for production, eliminating the need to hardcode dynamic tunnel URLs.

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

#### [DELETE] [.env.production](file:///c:/Users/asqu2/Desktop/caaar/.env.production)
Remove the obsolete `.env.production` file since we are using relative API paths now.

---

## Verification Plan

### Automated Tests
- Type checking & generation: `npm run build`

### Manual Verification
1. Create database and push schemas: `npx prisma db push --schema=server/prisma/schema.prisma`
2. Push commits to GitHub.
3. Check the Vercel dashboard: ensure `DATABASE_URL` is set, and the build compiles successfully.
4. Open `https://crispy-king-restaurant.vercel.app/` on different devices. Verify that placing orders works permanently, updates the database, and loads inside the admin panel.
