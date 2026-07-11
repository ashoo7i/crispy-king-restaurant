# API Caching and Admin Security Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CDN-level caching for public GET endpoints (menu, categories, settings) to improve page speed and protect the database under load, secure all write/admin backend endpoints with passcode header verification, and provide a secure admin passcode reset script.

**Architecture:** Use HTTP Cache-Control headers on Express API GET responses for public endpoints to leverage Vercel's global CDN caching. Define a custom `checkAdminAuth` Express middleware on the backend to verify the admin passcode against database records, and update the client-side Admin Dashboard to store and send the passcode in the `x-admin-passcode` request header. Build a command-line script for database passcode resets.

**Tech Stack:** React, Express, Prisma, HTTP headers.

## Global Constraints

- No external npm package installations are required.
- Do not restrict GET `/api/menu`, GET `/api/categories`, or GET `/api/settings` endpoints from client-side public consumption.

---

### Task 1: Express Caching and Authorization Middleware

**Files:**
- Modify: [server/src/routes.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/routes.ts)

**Interfaces:**
- Consumes: Nothing.
- Produces: `checkAdminAuth` middleware and Vercel CDN Cache-Control headers on public API endpoints.

- [ ] **Step 1: Define `checkAdminAuth` middleware and add Cache-Control headers**
  Add the `checkAdminAuth` middleware at the top of the routes file (after `prisma` definition) and add cache headers to public GET endpoints in [server/src/routes.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/routes.ts):

  ```typescript
  const checkAdminAuth = async (req: Request, res: Response, next: () => void) => {
    const passcode = req.headers['x-admin-passcode'];
    if (!passcode) {
      return res.status(401).json({ error: 'غير مصرح بالوصول. يرجى تقديم رمز مرور الإدارة.' });
    }

    try {
      const dbPasscode = await prisma.setting.findUnique({
        where: { key: 'admin_passcode' }
      });
      const validPasscode = dbPasscode?.value || 'admin123';
      if (passcode === validPasscode) {
        next();
      } else {
        res.status(401).json({ error: 'رمز المرور غير صحيح!' });
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      res.status(500).json({ error: 'فشل التحقق من صلاحيات الإدارة' });
    }
  };
  ```

  Inject the Cache-Control header in the public API routes:
  - Inside `GET /categories` (around line 31):
    ```typescript
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
    ```
  - Inside `GET /menu` (around line 42):
    ```typescript
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
    ```
  - Inside `GET /settings` (around line 287):
    ```typescript
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
    ```

  Apply `checkAdminAuth` as a middleware to the following routes:
  - `GET /orders` (around line 12)
  - `PATCH /orders/:id/status` (around line 116)
  - `POST /menu` (around line 179)
  - `PUT /menu/:id` (around line 213)
  - `DELETE /menu/:id` (around line 254)
  - `POST /settings` (around line 302)
  - `POST /admin/change-password` (around line 156)

- [ ] **Step 2: Commit backend modifications**
  ```bash
  git add server/src/routes.ts
  git commit -m "feat: implement CDN caching and admin authorization API security middleware"
  ```

---

### Task 2: Command-Line Passcode Reset Utility

**Files:**
- [NEW] [server/src/reset-passcode.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/reset-passcode.ts)
- Modify: [server/package.json](file:///c:/Users/asqu2/Desktop/caaar/server/package.json)

- [ ] **Step 1: Create reset-passcode script**
  Create `server/src/reset-passcode.ts` with the following content:
  ```typescript
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();

  async function main() {
    const newPasscode = process.argv[2];
    if (!newPasscode) {
      console.error('⚠️ يرجى تحديد رمز المرور الجديد! مثال:');
      console.error('npm run reset-passcode newPassword123');
      process.exit(1);
    }

    await prisma.setting.upsert({
      where: { key: 'admin_passcode' },
      update: { value: newPasscode },
      create: { key: 'admin_passcode', value: newPasscode }
    });

    console.log(`\n✅ تم إعادة تعيين رمز مرور الإدارة بنجاح إلى: ${newPasscode}\n`);
  }

  main()
    .catch((e) => {
      console.error('❌ حدث خطأ أثناء إعادة التعيين:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- [ ] **Step 2: Add script command to server/package.json**
  Inside `"scripts"` block in `server/package.json`, add:
  ```json
  "reset-passcode": "tsx src/reset-passcode.ts"
  ```

- [ ] **Step 3: Commit passcode reset script changes**
  ```bash
  git add server/src/reset-passcode.ts server/package.json
  git commit -m "feat: add secure command-line admin passcode reset script"
  ```

---

### Task 3: Admin Dashboard Credentials Sync & Request Headers

**Files:**
- Modify: [src/components/AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx)

**Interfaces:**
- Consumes: `sessionStorage.getItem('admin_passcode')`
- Produces: `x-admin-passcode` headers in admin fetch requests.

- [ ] **Step 1: Create header helper and save passcode to session storage**
  In [src/components/AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx):
  - In `handleLogin` (both online and offline branches), save the typed passcode to `sessionStorage` alongside the login status:
    ```typescript
    sessionStorage.setItem('admin_passcode', passcode);
    ```
  - In `handleLogout`, delete the passcode from `sessionStorage`:
    ```typescript
    sessionStorage.removeItem('admin_passcode');
    ```
  - Create a helper `getAdminHeaders()` function:
    ```typescript
    const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
      const passcode = sessionStorage.getItem('admin_passcode') || '';
      return {
        'Content-Type': 'application/json',
        'x-admin-passcode': passcode,
        ...extraHeaders
      };
    };
    ```

- [ ] **Step 2: Attach security headers to admin requests**
  Modify all admin fetch calls to include `x-admin-passcode` header:
  - `fetchOrders` (around line 137):
    ```typescript
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        'x-admin-passcode': sessionStorage.getItem('admin_passcode') || ''
      }
    });
    ```
  - `handleSaveHomepage` (around line 249):
    Pass headers via `getAdminHeaders()` instead of standard content-type.
  - `toggleAvailability` (around line 346):
    Pass headers via `getAdminHeaders()`.
  - `handleDeleteMenuItem` (around line 371):
    Pass headers via `getAdminHeaders()`.
  - `handleFormSubmit` (around lines 414, 420):
    Pass headers via `getAdminHeaders()`.
  - `handleChangePassword` (around line 549):
    Pass headers via `getAdminHeaders()`, and on successful change update `sessionStorage.setItem('admin_passcode', newPasscode);`.
  - `updateOrderStatus` (around line 595):
    Pass headers via `getAdminHeaders()`.

- [ ] **Step 3: Add forgot password guide on Login Page**
  Add a descriptive message beneath the login button explaining how to reset the password via command line:
  ```tsx
  <p className="text-[10px] text-gray-500 text-center mt-4">
    نسيت رمز الدخول؟ لإعادة تعيينه، يرجى تشغيل الأمر التالي في سيرفر الباك إند: <br />
    <code className="text-red-400 bg-gray-950 px-1.5 py-0.5 rounded select-all font-mono">npm run reset-passcode &lt;الرمز الجديد&gt;</code>
  </p>
  ```

- [ ] **Step 4: Commit client dashboard modifications**
  ```bash
  git add src/components/AdminDashboard.tsx
  git commit -m "feat: attach admin passcode headers to admin panel requests"
  ```
