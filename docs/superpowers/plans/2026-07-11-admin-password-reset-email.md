# Admin Password Reset Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a "Forgot Password" feature on the Admin Login page that sends a reset link to the administrator's email. Clicking the link allows resetting the password.

**Architecture:** 
1. Use the existing `Setting` table (key-value schema) to store `admin_email`, `admin_reset_token`, and `admin_reset_token_expiry`. This avoids database migrations.
2. The backend sends emails using the Resend API (via simple HTTP fetch with an API Key fallback, or logging to console/terminal in local development).
3. The frontend captures the reset token from URL query parameters, shows a passcode reset form, and updates the passcode.
4. Add an "Admin Email" input field under the Settings tab in the Admin panel to make it configurable.

**Tech Stack:** React, Express, Prisma, PostgreSQL (Neon/Supabase), Vercel Serverless.

## Global Constraints
- Write clear user-facing messages in Arabic.
- Do not add new database migrations (use `Setting` model for storage).
- Maintain local development fallback when `RESEND_API_KEY` is not present (log reset URL to console).

---

## Proposed Changes

### Database & Backend Components

#### [MODIFY] [seed.ts](file:///c:/Users/asqu2/Desktop/caaar/server/prisma/seed.ts)
Seed a default `admin_email` key in the `Setting` table.

```typescript
  // Seed default admin email if it doesn't exist
  const existingEmail = await prisma.setting.findUnique({
    where: { key: 'admin_email' }
  });
  if (!existingEmail) {
    await prisma.setting.create({
      data: {
        key: 'admin_email',
        value: 'admin@crispyking.com'
      }
    });
  }
```

#### [MODIFY] [routes.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/routes.ts)
Add the forgot-password and reset-password endpoints. Add support for sending emails via Resend API or falling back to printing to the console in local environment.

Add these routes:
1. `POST /api/admin/forgot-password`:
   - Validates if the email provided matches the `admin_email` database setting.
   - Generates a cryptographically secure random token (e.g. 32-character hex).
   - Stores `admin_reset_token` and `admin_reset_token_expiry` (now + 1 hour) in the database using `Setting` table.
   - Sends email via Resend API. If `RESEND_API_KEY` environment variable is not defined, prints the link to the console for testing.
2. `POST /api/admin/reset-password`:
   - Validates the token and checks if it's expired.
   - Updates `admin_passcode` in `Setting` table.
   - Clears `admin_reset_token` and `admin_reset_token_expiry`.

---

### Frontend Components

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx)
Update the Admin Dashboard page to handle forgot password state, URL parsing for reset tokens, password reset form, and saving the admin email setting.

1. **State variables:**
   - `isForgotPasswordMode`: boolean
   - `forgotEmail`: string
   - `forgotSuccess`: string
   - `forgotError`: string
   - `resetToken`: string | null
   - `newPasscodeForReset`: string
   - `confirmPasscodeForReset`: string
   - `resetSuccess`: string
   - `resetError`: string
   - `adminEmailSetting`: string (for configuration)

2. **Parsing token on mount:**
   - In `useEffect`, parse URL search parameters for `reset_token`. If present, set `resetToken` state.

3. **Forgot/Reset Password Render Blocks:**
   - Under `!isAuthenticated` render logic:
     - If `resetToken` is set, render the "إعادة تعيين كلمة المرور" form (New Password, Confirm Password).
     - If `isForgotPasswordMode` is true, render the "نسيت كلمة المرور" form (Email input, Back to login link).
     - Otherwise, render the standard login form with a "نسيت كلمة المرور؟" link.

4. **Settings view update:**
   - Add a field under the Homepage settings section to view and update the admin email address (`admin_email`).

---

## Verification Plan

### Automated Tests
- Build verification: `npm run build`

### Manual Verification
1. Run `npm run server` and `npm run dev`.
2. Open the Admin Login screen. Click the "نسيت كلمة المرور؟" link.
3. Enter a wrong email. Confirm it shows an error message.
4. Enter the correct default email: `admin@crispyking.com`. Submit.
5. In the backend server logs, copy the printed reset URL: `http://localhost:5173/admin?reset_token=...`
6. Open the URL in a browser tab. Verify it shows the "إعادة تعيين كلمة المرور" screen.
7. Enter a new password (e.g. `774923557`) and click reset.
8. Verify it redirects to the login screen and you can successfully log in using `774923557`.
