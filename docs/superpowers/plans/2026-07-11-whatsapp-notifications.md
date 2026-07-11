# WhatsApp Notifications Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send real-time WhatsApp notifications to customers when their orders are placed and when their order status changes (e.g. preparing, out for delivery, completed).

**Architecture:** Create a utility service that interfaces with the UltraMsg API. Hook this service into the order creation and order status update backend endpoints to dispatch messages with Yemeni phone number normalization.

**Tech Stack:** Node.js, Express, Prisma ORM, UltraMsg REST API.

## Global Constraints
- Must handle Yemen local phone numbers by normalizing them to international format (prepending `967`).
- Credentials should be configurable via environment variables (`ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN`).
- Graceful fallback: If env variables are missing, log the WhatsApp text to the server console instead of throwing errors.

---

### Task 1: Create WhatsApp Notification Service

**Files:**
- Create: [whatsapp.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/whatsapp.ts)

**Interfaces:**
- Produces: `sendWhatsAppNotification(customerName: string, customerPhone: string, orderId: string, status: string): Promise<void>`

- [ ] **Step 1: Write helper function for WhatsApp dispatch**

Create the file `server/src/whatsapp.ts` with the following implementation:

```typescript
export async function sendWhatsAppNotification(
  customerName: string,
  customerPhone: string,
  orderId: string,
  status: string
): Promise<void> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  // Determine message content based on status
  let message = '';
  switch (status) {
    case 'PENDING':
      message = `مرحباً ${customerName}، تم استلام طلبك رقم *${orderId}* بنجاح وهو قيد المراجعة الآن. سنقوم بإشعارك عند بدء التحضير! 🍗❤️`;
      break;
    case 'PREPARING':
      message = `مرحباً ${customerName}، بدأنا في تحضير طلبك رقم *${orderId}* بشغف وعناية! 🍳🔥`;
      break;
    case 'OUT_FOR_DELIVERY':
      message = `مرحباً ${customerName}، طلبك رقم *${orderId}* في طريقه إليك الآن مع المندوب! 🛵💨`;
      break;
    case 'COMPLETED':
      message = `مرحباً ${customerName}، تم تسليم طلبك رقم *${orderId}* بالهناء والعافية! شكراً لتعاملك مع Ashoospy ❤️`;
      break;
    default:
      return;
  }

  if (!instanceId || !token) {
    console.log(`⚠️ [WHATSAPP MOCK]: No UltraMsg credentials configured. Message to ${customerPhone} for order ${orderId} (${status}): "${message}"`);
    return;
  }

  // Format phone number to international format (prepending 967 for Yemen if needed)
  let cleanedPhone = customerPhone.replace(/\D/g, '');
  if (cleanedPhone.startsWith('00')) {
    cleanedPhone = cleanedPhone.slice(2);
  }
  if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
    cleanedPhone = '967' + cleanedPhone;
  } else if (cleanedPhone.length === 10 && cleanedPhone.startsWith('07')) {
    cleanedPhone = '967' + cleanedPhone.slice(1);
  }

  try {
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        to: cleanedPhone,
        body: message
      })
    });

    const result = await response.json();
    console.log(`✉️ [WHATSAPP SENT]: Sent to ${cleanedPhone} for order ${orderId}. Response:`, result);
  } catch (error) {
    console.error(`❌ [WHATSAPP ERROR]: Failed to send to ${cleanedPhone} for order ${orderId}:`, error);
  }
}
```

- [ ] **Step 2: Commit file**

```bash
git add server/src/whatsapp.ts
git commit -m "feat: add whatsapp notification utility service"
```

---

### Task 2: Hook Service into Express Routes

**Files:**
- Modify: [routes.ts](file:///c:/Users/asqu2/Desktop/caaar/server/src/routes.ts)

**Interfaces:**
- Consumes: `sendWhatsAppNotification` from `./whatsapp`

- [ ] **Step 1: Import WhatsApp utility at top of routes.ts**

Import the helper function in `server/src/routes.ts`:

```typescript
import { sendWhatsAppNotification } from './whatsapp';
```

- [ ] **Step 2: Integrate notification in Order Creation (`POST /orders`)**

Find the `POST /orders` handler and invoke `sendWhatsAppNotification` after a successful order is created.

Modify `server/src/routes.ts` around line 110:

```typescript
    const order = await prisma.order.create({
      // ...
    });
    
    // Send WhatsApp notification for PENDING order status
    sendWhatsAppNotification(order.customerName, order.customerPhone, order.id, 'PENDING').catch(err => {
      console.error('Error sending order placement WhatsApp:', err);
    });

    res.json({ success: true, orderId: order.id });
```

- [ ] **Step 3: Integrate notification in Status Update (`PATCH /orders/:id/status`)**

Find the `PATCH /orders/:id/status` handler and invoke `sendWhatsAppNotification` after the status is successfully updated in the database.

Modify `server/src/routes.ts` around line 154:

```typescript
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Send WhatsApp notification for status change
    sendWhatsAppNotification(updatedOrder.customerName, updatedOrder.customerPhone, updatedOrder.id, status).catch(err => {
      console.error('Error sending order status change WhatsApp:', err);
    });

    res.json(updatedOrder);
```

- [ ] **Step 4: Commit routes changes**

```bash
git add server/src/routes.ts
git commit -m "feat: hook whatsapp notifications into order creation and status update routes"
```

---

### Task 3: Build Verification

- [ ] **Step 1: Verify compile and build**

Run the build script to ensure no TypeScript compilation issues:
Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 2: Commit any final cleanup**

```bash
git commit -am "chore: final build and validation of whatsapp integration"
```

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no TypeScript or compilation errors.

### Manual Verification
- Place a new order on the site using a Yemen phone number (e.g. `774923557`).
- Check the backend console logs to verify that the message is logged as a mock send.
- Once configured with real `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN` variables on Vercel, verify that actual WhatsApp messages arrive on the phone on order placement and when changing order statuses from the Admin dashboard.
