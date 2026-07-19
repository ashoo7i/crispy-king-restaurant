# Hero Video and Merged Menu Design Specification

This specification documents the changes required to convert the Ashoospy homepage hero section into a video background, integrate the menu directly onto the homepage, remove the marquee scroller, and establish smooth scrolling navigation to the menu section.

## 1. Background Video Hero Section
- **Component:** `HeroSection`
- **Behavior:** Replace the static image element with a full-bleed `<video>` element.
- **Attributes:**
  - `autoPlay`: True
  - `loop`: True
  - `muted`: True
  - `playsInline`: True
  - `src`: Fallback to `/hero-video.mp4` or a live placeholder URL if the video does not exist locally.
- **Responsiveness:** Maintain absolute coverage with CSS `object-cover object-center w-full h-full`.

## 2. Integrated Menu Layout
- **Page layout:** The homepage will render the `HeroSection`, followed by the promotional/introductory text, and finally the `MenuSection` component.
- **Smooth Scroll:** Add a scroll target element `#menu-section`.
- **Marquee Removal:** Eliminate the `<MarqueeScroller />` component to simplify the visual layout.

## 3. Navigation Adaptations
- Navbar links ("قائمة الطعام", "اطلب الآن") will trigger a smooth scroll to `#menu-section`.
- If the user is on a different page (such as Admin or Checkout) when navigating, the application will change the page state to `home` and automatically trigger a scroll operation on mount.

## 4. Admin Dashboard Updates
- The settings panel in `AdminDashboard` will allow configuring the hero background video path/URL (`hero_video`) alongside the standard text items.
