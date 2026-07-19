# Hero Video and Merged Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the homepage to feature a responsive background video instead of a static image, merge the Menu page directly into the homepage, remove the marquee scroller, and establish smooth scrolling navigation to the Menu section.

**Architecture:**
- Adjust `HeroSection.tsx` to render a responsive, muted, looping `<video>` layer.
- Integrate `MenuSection` inside the homepage view of `App.tsx` and assign it a target ID.
- Adjust `Navbar.tsx` and click listeners to perform scroll-to-element behaviors.
- Update `AdminDashboard.tsx` to allow editing of the background video path/URL (`hero_video`).

**Tech Stack:** React (Vite, TypeScript, Tailwind CSS), HTML5 video element.

## Global Constraints
- The background video must auto-play, loop, mute, and use `playsInline` to ensure it starts playing on iOS/Android devices without full-screening.
- The layout must remain 100% responsive, stretching/covering the container correctly using `object-cover`.
- Clean up any unused imports or components (like `MarqueeScroller`).

---

### Task 1: Update HeroSection with Video Rendering

**Files:**
- Modify: [HeroSection.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/HeroSection.tsx)

**Interfaces:**
- Consumes: `HeroSectionProps` with a new optional parameter `videoUrl?: string`.

- [ ] **Step 1: Update HeroSection to support background video**

Replace the contents of `src/components/HeroSection.tsx` with:

```typescript
import { motion } from 'motion/react';

interface HeroSectionProps {
  onOrderClick: () => void;
  title: string;
  subtitle: string;
  backgroundImage: string;
  videoUrl?: string;
}

export const HeroSection = ({ onOrderClick, title, subtitle, backgroundImage, videoUrl }: HeroSectionProps) => {
  const defaultVideo = "/hero-video.mp4";
  const activeVideo = videoUrl || defaultVideo;

  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[20px] sm:rounded-[36px] md:rounded-[48px] bg-gray-955 overflow-hidden h-[250px] sm:h-[380px] md:h-[600px] flex flex-col border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
      {/* Background Video/Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
          poster={backgroundImage || "/hero-bg.jpg"}
          key={activeVideo}
        >
          <source src={activeVideo} type="video/mp4" />
          <img
            src={backgroundImage || "/hero-bg.jpg"}
            alt="Background Poster"
            className="w-full h-full object-cover object-center"
          />
        </video>
        {/* Dark overlay starting from the bottom for centered text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-4 text-center w-full max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1.5 sm:gap-3.5"
        >
          {/* Headline */}
          <h1 className="font-display text-[18px] sm:text-[30px] md:text-[50px] font-black leading-[1.15] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] whitespace-pre-line">
            {title || `Crunch it &\nLive the Deliciousness!`}
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-[11px] sm:text-[15px] md:text-[20px] font-black text-red-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {subtitle || 'قرمشها وعيش اللذاذة'}
          </p>

          {/* Centered Order Button */}
          <motion.button
            onClick={onOrderClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="mt-1 sm:mt-4 bg-red-600 text-white text-[11px] sm:text-[14px] md:text-[15px] font-bold px-6 py-2 sm:px-10 sm:py-3.5 md:px-12 md:py-4 rounded-full shadow-xl hover:bg-red-700 transition-all cursor-pointer shadow-red-500/20 hover:shadow-red-500/40"
          >
            اطلب الآن
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: add video background support to HeroSection"
```

---

### Task 2: Merge Menu Section into Homepage and Adjust App.tsx Navigation

**Files:**
- Modify: [App.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/App.tsx)

- [ ] **Step 1: Incorporate hero_video state and merge views in App.tsx**

Update `src/App.tsx` imports and state logic. Remove `MarqueeScroller` component rendering and imports. Include a ref-based or direct smooth scrolling function.

Update `src/App.tsx` state loading logic (from line 22 onwards) to include `hero_video`. Replace lines 22-68 with:

```typescript
  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        const parsed = JSON.parse(local);
        return {
          hero_title: parsed.hero_title || 'Crunch it &\nLive the Deliciousness!',
          hero_subtitle: parsed.hero_subtitle || 'قرمشها وعيش اللذاذة',
          hero_image: parsed.hero_image || '/hero-bg.jpg',
          hero_video: parsed.hero_video || '/hero-video.mp4'
        };
      }
    } catch (e) {
      console.warn('Error loading settings from localStorage:', e);
    }
    return {
      hero_title: 'Crunch it &\nLive the Deliciousness!',
      hero_subtitle: 'قرمشها وعيش اللذاذة',
      hero_image: '/hero-bg.jpg',
      hero_video: '/hero-video.mp4'
    };
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          const settings = {
            hero_title: data.hero_title || 'Crunch it &\nLive the Deliciousness!',
            hero_subtitle: data.hero_subtitle || 'قرمشها وعيش اللذاذة',
            hero_image: data.hero_image || '/hero-bg.jpg',
            hero_video: data.hero_video || '/hero-video.mp4'
          };
          setHeroSettings(settings);
          localStorage.setItem('local_settings', JSON.stringify(settings));
        }
      } catch (err) {
        console.warn('Backend server offline, loading local settings:', err);
        const localSettings = JSON.parse(localStorage.getItem('local_settings') || '{}');
        setHeroSettings({
          hero_title: localSettings.hero_title || 'Crunch it &\nLive the Deliciousness!',
          hero_subtitle: localSettings.hero_subtitle || 'قرمشها وعيش اللذاذة',
          hero_image: localSettings.hero_image || '/hero-bg.jpg',
          hero_video: localSettings.hero_video || '/hero-video.mp4'
        });
      }
    };
    fetchSettings();

    // Redirect to admin dashboard if reset_token is in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset_token')) {
      setActivePage('admin');
    }
  }, []);
```

- [ ] **Step 2: Update navigation flow in App.tsx**

Replace `onNavigate` function in `src/App.tsx` (lines 78-81) to handle scrolling to `#menu-section` when `'menu'` page is requested:

```typescript
  const onNavigate = (page: string) => {
    if (page === 'menu') {
      setActivePage('home');
      setTimeout(() => {
        const element = document.getElementById('menu-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setActivePage(page);
      window.scrollTo(0, 0);
    }
  };
```

- [ ] **Step 3: Render MenuSection inside home page markup and delete MarqueeScroller**

Remove the `MarqueeScroller` import at the top of `src/App.tsx`.
Then, replace the rendering of `activePage === 'home'` view (lines 145-173) with:

```typescript
        {activePage === 'home' && (
          <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-16">
            <HeroSection 
              onOrderClick={() => onNavigate('menu')} 
              title={heroSettings.hero_title}
              subtitle={heroSettings.hero_subtitle}
              backgroundImage={heroSettings.hero_image}
              videoUrl={heroSettings.hero_video}
            />
            
            <div className="text-center py-4">
              <h2 className="text-3xl font-display font-black text-white">لماذا Ashoospy؟</h2>
              <p className="mt-4 text-gray-300 max-w-xl mx-auto">نصنع كل وجبة بشغف وعناية فائقة، باستخدام أجود صدور الدجاج الطازجة والمقرمشة يومياً!</p>
            </div>

            {/* Merged Menu Section on the homepage */}
            <div id="menu-section" className="pt-8 scroll-mt-24">
              <MenuSection onSelectItem={(item) => setSelectedItem(item)} />
            </div>
          </div>
        )}
```

- [ ] **Step 4: Commit changes**

```bash
git add src/App.tsx
git commit -m "feat: merge MenuSection onto home page and add smooth scrolling"
```

---

### Task 3: Support Video Settings Configuration in Admin Dashboard

**Files:**
- Modify: [AdminDashboard.tsx](file:///c:/Users/asqu2/Desktop/caaar/src/components/AdminDashboard.tsx)

- [ ] **Step 1: Update states and settings load in AdminDashboard**

Add `homeHeroVideo` state at top of the component (e.g. after other hero states around line 100):

```typescript
  const [homeHeroVideo, setHomeHeroVideo] = useState('');
```

Update settings retrieval functions to fetch and save `hero_video` key.

In `fetchHomepageSettings` (lines 250-268), replace with:

```typescript
  const fetchHomepageSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setHomeHeroTitle(data.hero_title || 'Crunch it &\nLive the Deliciousness!');
        setHomeHeroSubtitle(data.hero_subtitle || 'قرمشها وعيش اللذاذة');
        setHomeHeroImage(data.hero_image || '/hero-bg.jpg');
        setHomeHeroVideo(data.hero_video || '/hero-video.mp4');
        setAdminEmail(data.admin_email || 'admin@ashoospy.com');
      }
    } catch (err) {
      console.warn('Backend server offline, loading local settings:', err);
      const localSettings = JSON.parse(localStorage.getItem('local_settings') || '{}');
      setHomeHeroTitle(localSettings.hero_title || 'Crunch it &\nLive the Deliciousness!');
      setHomeHeroSubtitle(localSettings.hero_subtitle || 'قرمشها وعيش اللذاذة');
      setHomeHeroImage(localSettings.hero_image || '/hero-bg.jpg');
      setHomeHeroVideo(localSettings.hero_video || '/hero-video.mp4');
      setAdminEmail(localSettings.admin_email || 'admin@ashoospy.com');
    }
  };
```

In `handleSaveHomepage` (lines 270-305), replace with:

```typescript
  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHomepage(true);
    setHomepageError('');
    setHomepageSuccess('');

    const payload = {
      settings: {
        hero_title: homeHeroTitle,
        hero_subtitle: homeHeroSubtitle,
        hero_image: homeHeroImage,
        hero_video: homeHeroVideo,
        admin_email: adminEmail
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setHomepageSuccess('تم حفظ إعدادات الواجهة الرئيسية بنجاح!');
        localStorage.setItem('local_settings', JSON.stringify(payload.settings));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.warn('Backend server offline, saving homepage locally:', err);
      localStorage.setItem('local_settings', JSON.stringify(payload.settings));
      setHomepageSuccess('تم الحفظ محلياً بنجاح (وضع الأوفلاين)!');
    } finally {
      setIsSavingHomepage(false);
    }
  };
```

- [ ] **Step 2: Add video URL input field to settings tab UI**

Find where `homeHeroImage` is managed under the `activeTab === 'homepage'` form view, and add a setting input field for `homeHeroVideo`.

In `src/components/AdminDashboard.tsx` (right after `homeHeroImage` direct URL input, around line 1365), add:

```typescript
            <div className="border-t border-gray-800 pt-6 space-y-4">
              <span className="text-xs font-black text-gray-300 block">فيديو خلفية البانر الرئيسي</span>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">رابط أو مسار الفيديو المباشر (MP4)</label>
                  <input 
                    type="text"
                    value={homeHeroVideo}
                    onChange={(e) => setHomeHeroVideo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                    placeholder="مثال: /hero-video.mp4 أو رابط خارجي"
                  />
                </div>
              </div>
            </div>
```

- [ ] **Step 3: Commit changes**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add hero video settings config input to admin dashboard"
```

---

### Task 4: Verify and Build

- [ ] **Step 1: Check compile and bundler output**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 2: Force-push clean workspace commits to remote git repository**

Run: `git push origin master:main --force`
Expected: SUCCESS

---

## Verification Plan

### Automated Tests
- Run `npm run build` to confirm TypeScript and Vite bundler compiles successfully.

### Manual Verification
- Launch local environment (`npm run dev`) and test if the video loads and loops correctly.
- Test scroll to menu when clicking "قائمة الطعام" or "اطلب الآن" in Navbar or "اطلب الآن" in Hero Section.
- Ensure the marquee is completely gone.
- Test settings update from the Admin Dashboard for both the video link and the text values, confirming they save to database/local cache and load in the front-end layout dynamically.
