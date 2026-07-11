# [Feature Name] Implementation Plan: Order Audio Notifications

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play a premium iOS-like ping sound when a customer places an order successfully, and trigger a double-chime sound with desktop/UI notifications on the admin panel when a new order is received.

**Architecture:** Use the Web Audio API to synthesize clean, zero-dependency electronic chime sounds natively in JavaScript (no static files required). Update the checkout process to trigger the sound on success. Implement diffing inside the admin panel's order-polling loop to detect new orders and trigger sound/desktop notifications and an animated in-app toast notification.

**Tech Stack:** React, TypeScript, Web Audio API, HTML5 Notification API.

---

## User Review Required

> [!NOTE]
> * **Zero-Dependency Audio Synthesis:** The audio alerts will be generated using the browser's Web Audio API (`AudioContext`). This ensures that the sounds load instantly without requiring hosting, downloading, or caching of external MP3 files.
> * **Notification Permission:** Desktop notifications require a one-time permission grant from the user. We will show a premium button "تفعيل إشعارات المتصفح 🔔" in the admin dashboard header if permission is not yet granted.

---

## Open Questions

*لا يوجد أسئلة مفتوحة حالياً، التصميم يغطي متطلبات العميل بالكامل ويستخدم معايير تصميم الويب الحديثة.*

---

## Proposed Changes

### Audio & Notification Utils

#### [NEW] [audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts)
Create a new file `src/utils/audio.ts` to hold the sound synthesis functions.

```typescript
/**
 * Synthesizes a premium iOS-like single clean chime sound.
 */
export const playSuccessPing = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    
    // High-pitched iOS clean chime frequencies (C6 -> E6 slide)
    osc.frequency.setValueAtTime(1046.50, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};

/**
 * Synthesizes a distinct electronic double-chime (ding-dong) for new orders.
 */
export const playNewOrderAlert = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0.001, start);
      gainNode.gain.exponentialRampToValueAtTime(0.25, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = audioCtx.currentTime;
    // First high note (B5)
    playTone(987.77, now, 0.25);
    // Second higher note (E6) starting slightly later
    playTone(1318.51, now + 0.15, 0.4);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
};
```

---

### Customer Checkout

#### [MODIFY] [App.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/App.tsx)
Trigger `playSuccessPing` in `handleOrderSuccess`.

```typescript
// Add import at the top
import { playSuccessPing } from './utils/audio';

// Inside App component:
const handleOrderSuccess = (orderId: string) => {
  playSuccessPing(); // Play sound
  setActiveOrderId(orderId);
  setCart([]);
  setIsCartOpen(false);
  onNavigate('tracking');
};
```

---

### Admin Dashboard Notifications

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx)
Add checks inside `fetchOrders` to detect new orders, play `playNewOrderAlert()`, trigger browser push notifications, and show a custom slide-in UI toast. Add a notification permission banner in the admin interface.

* **Toast State:**
  ```typescript
  const [newOrderToast, setNewOrderToast] = useState<any | null>(null);
  ```
* **Order Diffing Logic inside `fetchOrders`:**
  ```typescript
  // Compare new orders list with current state
  if (orders.length > 0) {
    const currentIds = new Set(orders.map(o => o.id));
    const newOrdersList = data.filter((o: any) => !currentIds.has(o.id));
    
    if (newOrdersList.length > 0) {
      // Trigger new order alerts
      playNewOrderAlert();
      
      // Trigger desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('👑 طلب جديد وارد!', {
          body: `العميل: ${newOrdersList[0].customerName}\nالمجموع: ${newOrdersList[0].totalPrice} ريال`,
          tag: newOrdersList[0].id
        });
      }
      
      // Trigger UI Toast
      setNewOrderToast(newOrdersList[0]);
      setTimeout(() => setNewOrderToast(null), 6000);
    }
  }
  ```
* **Permission Request UI:** Show a notification bell button in the header if permission is not yet granted.
* **Arabic UI Elements:** Add premium slide-in alert box for new orders.

---

## Verification Plan

### Automated Tests
- Build verification: `npm run build`

### Manual Verification
1. Place a checkout order as a customer. Verify that the iPhone-like ping sound plays immediately when the success message appears.
2. In the Admin Dashboard:
   - Accept the desktop notification request when clicking the notification button in the header.
   - Place a new order in another browser tab (or window).
   - Verify that the Admin Dashboard plays the double-chime alert, triggers a desktop notification, and displays the UI toast on the screen.
