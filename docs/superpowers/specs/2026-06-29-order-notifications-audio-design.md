# Order Notifications & Synthesized Audio Alerts Design Spec

This document details the system design for order stage audio notifications, periodic admin reminders for unhandled pending orders, and post-delivery customer thank-you overlays.

## Requirements

1. **Client Stage Audio & Browser Notifications:**
   - Play distinct synthesized sound alerts when order status changes.
   - Support browser notifications for active status updates.
   - Statuses and chimes:
     - `PREPARING`: Soft warm rising chime.
     - `OUT_FOR_DELIVERY`: Double honk-like tone.
     - `COMPLETED`: Celebratory success chime.

2. **Customer Thank-You Card:**
   - Display a highly polished thank-you card in the [OrderTracker](file:///c:/Users/asqu2/Desktop/caaar/src/components/OrderTracker.tsx) view when status is `COMPLETED`.

3. **Admin / Employee Unread Order Warning:**
   - Run a periodic reminder (every 60 seconds) in the [AdminDashboard](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx) if any order is `PENDING`.
   - Play a warning beep sound and dispatch native push notifications every minute until all pending orders are accepted or updated.

---

## Technical Details

### 1. Synthesized Audio Utilities
Update [audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts) with the following programmatic audio synthesizers:
- `playPreparingChime()`: Web Audio API sine-wave arpeggio slide (C5 -> E5 -> G5 -> C6).
- `playDeliveryChime()`: Biquad-filtered sawtooth double honk (F4 twice).
- `playCompletedChime()`: Celebratory arpeggio success chord.
- `playPendingOrderReminder()`: Softer triangle-wave double beep at 880Hz.

### 2. Client Order Status Tracker
Update [OrderTracker.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/OrderTracker.tsx):
- Introduce a state variable `prevStatus` to compare status updates on poll intervals (every 4s).
- When a status change is detected:
  - Play the respective sound effect.
  - Create a browser push notification with local status localization.
- Render a beautiful animated thank-you card at the top of the timeline when `order.status === 'COMPLETED'`.

### 3. Admin Dashboard Reminder
Update [AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx):
- Add a react `useEffect` hook tracking `orders` and `isAuthenticated`.
- Identify if `orders.some(o => o.status === 'PENDING')` is true.
- If true, establish a `setInterval` that fires every 60,000ms:
  - Invokes `playPendingOrderReminder()`.
  - Sends a push notification warning about unhandled pending orders.
- Clear the interval automatically when `orders` changes and no longer has pending entries, or when the component unmounts.

---

## Verification Plan

### Manual Verification
1. Open the Admin Dashboard at `http://localhost:8081` (under the hidden logo Easter Egg) and trigger a new test order.
2. Verify that:
   - The Admin dashboard plays a sound and notification on new order creation.
   - While the order is `PENDING`, a double-beep sound/push notification triggers every 60 seconds.
   - Changing the status to `PREPARING` halts the 60s reminder immediately.
3. Open `http://localhost:8081` in a separate user tab.
4. Advance the order status in the admin dashboard:
   - To `PREPARING`: Verify client hears preparing chime and sees state move.
   - To `OUT_FOR_DELIVERY`: Verify client hears delivery chime.
   - To `COMPLETED`: Verify client hears completed chime and a beautiful thank-you message displays.
