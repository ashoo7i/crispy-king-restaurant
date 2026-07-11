# Order Notifications & Synthesized Audio Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement synthesized audio chimes for client order status updates, a post-delivery thank-you card, and periodic push/audio reminders for pending admin orders.

**Architecture:** Use the Web Audio API for offline, lightweight, and custom audio synthesis. Use React useEffect hooks to observe order status changes and manage pending order intervals.

**Tech Stack:** React, TypeScript, Web Audio API, browser Push Notifications API.

## Global Constraints

- Preserve all existing styles and layouts unless explicitly modified.
- Synthesize all sounds programmatically to avoid requiring audio assets.

---

### Task 1: Synthesize Stage and Reminder Alert Audio Effects

**Files:**
- Modify: [src/utils/audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts)

**Interfaces:**
- Consumes: Nothing.
- Produces: 
  - `playPreparingChime: () => void`
  - `playDeliveryChime: () => void`
  - `playCompletedChime: () => void`
  - `playPendingOrderReminder: () => void`

- [ ] **Step 1: Implement the audio synthesizers**
  Add the four functions to [audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts):
  ```typescript
  export const playPreparingChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (error) {
      console.warn('Audio synthesis failed:', error);
    }
  };

  export const playDeliveryChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playHonk = (time: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(349.23, time); // F4
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(0.1, time + 0.03);
        gainNode.gain.linearRampToValueAtTime(0.001, time + 0.15);
        osc.start(time);
        osc.stop(time + 0.15);
      };
      playHonk(now);
      playHonk(now + 0.18);
    } catch (error) {
      console.warn('Audio synthesis failed:', error);
    }
  };

  export const playCompletedChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playNote = (freq: number, time: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.exponentialRampToValueAtTime(0.2, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      playNote(523.25, now, 0.15);
      playNote(659.25, now + 0.12, 0.15);
      playNote(783.99, now + 0.24, 0.15);
      playNote(1046.50, now + 0.36, 0.4);
    } catch (error) {
      console.warn('Audio synthesis failed:', error);
    }
  };

  export const playPendingOrderReminder = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playBeep = (time: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, time); // A5
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.exponentialRampToValueAtTime(0.15, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
      };
      playBeep(now);
      playBeep(now + 0.25);
    } catch (error) {
      console.warn('Audio synthesis failed:', error);
    }
  };
  ```

- [ ] **Step 2: Commit the audio updates**
  ```bash
  git add src/utils/audio.ts
  git commit -m "feat: implement synthesized stage audio alerts and admin reminders"
  ```

---

### Task 2: Order Tracker Status Detection, Alerts & Thank-You Card

**Files:**
- Modify: [src/components/OrderTracker.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/OrderTracker.tsx)

**Interfaces:**
- Consumes: 
  - `playPreparingChime`
  - `playDeliveryChime`
  - `playCompletedChime` from [audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts).

- [ ] **Step 1: Add state and status observers**
  Import the audio utils:
  ```typescript
  import { playPreparingChime, playDeliveryChime, playCompletedChime } from '../utils/audio';
  ```
  Add `prevStatus` state:
  ```typescript
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  ```
  Add status-watching useEffect hook:
  ```typescript
  useEffect(() => {
    if (order) {
      if (prevStatus && order.status !== prevStatus) {
        if (order.status === 'PREPARING') {
          playPreparingChime();
        } else if (order.status === 'OUT_FOR_DELIVERY') {
          playDeliveryChime();
        } else if (order.status === 'COMPLETED') {
          playCompletedChime();
        }

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          let bodyText = '';
          if (order.status === 'PREPARING') bodyText = 'بدأنا في تحضير طلبك بشغف 🍳';
          else if (order.status === 'OUT_FOR_DELIVERY') bodyText = 'المندوب في طريقه إليك الآن 🛵';
          else if (order.status === 'COMPLETED') bodyText = 'تم تسليم طلبك بالهناء والشفاء! شكراً لك ❤️';
          
          if (bodyText) {
            new Notification('🔔 تحديث حالة طلبك!', {
              body: bodyText,
              icon: '/logo.png'
            });
          }
        }
      }
      setPrevStatus(order.status);
    }
  }, [order?.status, prevStatus]);
  ```

- [ ] **Step 2: Add thank-you card rendering**
  Insert the thank-you block at the top of the timeline component container (before the timeline map list):
  ```typescript
  {order.status === 'COMPLETED' && (
    <div className="bg-gradient-to-r from-red-900/40 via-red-950/20 to-red-900/40 p-8 rounded-3xl border border-red-800/40 text-center space-y-3">
      <span className="text-4xl block">🍗❤️</span>
      <h3 className="text-xl font-black text-white">شكراً لطلبك من Ashoospy!</h3>
      <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
        نأمل أن تكون وجبتك مقرمشة ولذيذة وتصنع يومك. نحن فخورون بخدمتك ونتطلع لطلبك القادم!
      </p>
    </div>
  )}
  ```

- [ ] **Step 3: Commit tracker changes**
  ```bash
  git add src/components/OrderTracker.tsx
  git commit -m "feat: implement stage sound/push alerts and thank-you card in OrderTracker"
  ```

---

### Task 3: Admin Dashboard Pending Order Alarm

**Files:**
- Modify: [src/components/AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx)

**Interfaces:**
- Consumes: `playPendingOrderReminder` from [audio.ts](file:///c:/Users/asqu2/Desktop/caaar/src/utils/audio.ts).

- [ ] **Step 1: Add periodic warning alert hook**
  Import the reminder function:
  ```typescript
  import { playPendingOrderReminder } from '../utils/audio';
  ```
  Add a warning alert hook under the authentication check:
  ```typescript
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const hasPending = orders.some(o => o.status === 'PENDING');
    
    if (hasPending) {
      const interval = setInterval(() => {
        playPendingOrderReminder();
        
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('⚠️ تنبيه: طلبات قيد الانتظار!', {
            body: 'يوجد طلب معلق يحتاج للمراجعة والقبول في لوحة التحكم.',
            icon: '/logo.png'
          });
        }
      }, 60000); // 1 minute
      
      return () => clearInterval(interval);
    }
  }, [orders, isAuthenticated]);
  ```

- [ ] **Step 2: Commit admin updates**
  ```bash
  git add src/components/AdminDashboard.tsx
  git commit -m "feat: implement periodic alarm alert for unread pending admin orders"
  ```
