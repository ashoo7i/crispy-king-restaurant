# Premium Fiery Menu Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the menu page to have a stunning dark red and gold theme (Pure Pitch Black background, radial glowing lights, glassmorphic cards, capsule category buttons with glow, and a custom promotional hero banner) matching the KFC Turkey aesthetic.

**Architecture:** Update styling in `src/index.css` to add global color tokens, glows, and keyframe animations. Implement components inside `src/components/MenuSection.tsx` and `src/components/CustomizationModal.tsx` utilizing Tailwind CSS v4 variables.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons.

## Global Constraints

- Avoid modifying the Navbar's logo text or logo component to prevent hardcoding static logo configurations.
- Maintain RTL layout alignment (Right-to-Left) across all sections.
- Make all animations smooth and high performance (use hardware-accelerated transforms/opacity).

---

### Task 1: Core Design System Styles

**Files:**
- Modify: `src/index.css`
- Test: Build project to ensure CSS compiles without error.

**Interfaces:**
- Consumes: Tailwind CSS v4 imports.
- Produces: CSS utility classes for radial glowing background effects, customized scrollbars, and dynamic glowing shadows.

- [ ] **Step 1: Write index.css modifications**

Modify the file `src/index.css` to set the body background to absolute black (`#000000`) and define global classes for glowing animations and red/amber radial lights.

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Tajawal:wght@400;500;700;900&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Tajawal', sans-serif;
  --font-display: 'Outfit', 'Tajawal', sans-serif;
}

body {
  background-color: #000000;
  margin: 0;
  font-family: var(--font-sans);
  direction: rtl;
  color: #ffffff;
  overflow-x: hidden;
}

/* Custom Scrollbar for categories */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Premium radial backing glow lights */
.bg-glow-radial {
  background: radial-gradient(circle 400px at var(--x, 50%) var(--y, 50%), rgba(220, 38, 38, 0.12), transparent 70%);
}

.bg-glow-radial-amber {
  background: radial-gradient(circle 350px at 50% 50%, rgba(245, 158, 11, 0.08), transparent 75%);
}

/* Keyframes for soft pulse glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(220, 38, 38, 0.45);
  }
}

.animate-glow-pulse {
  animation: pulseGlow 3s infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

- [ ] **Step 2: Verify CSS build**

Run: `npm run build`
Expected: Successful build without CSS linting or parsing errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: configure pure black theme, radial gradients, and pulsing glows in index.css"
```

---

### Task 2: Fiery Menu Hero Banner

**Files:**
- Modify: `src/components/MenuSection.tsx`

**Interfaces:**
- Consumes: React component state.
- Produces: `FieryMenuHeroBanner` layout rendered inside the main menu container.

- [ ] **Step 1: Write the Hero Banner code**

In `src/components/MenuSection.tsx`, modify the component to render a premium styled promotional banner at the top of the menu page (below the category tabs or above them). We will place it above the categories filter as the welcome banner.

We will use a high quality Unsplash image of a chicken bucket with a glowing fire theme: `https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80`.

Modify `src/components/MenuSection.tsx` render function to return the banner first:
```tsx
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Radial Backing Glow Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-glow-radial rounded-full opacity-60"></div>
        <div className="absolute top-[50%] left-[5%] w-[450px] h-[450px] bg-glow-radial rounded-full opacity-40"></div>
      </div>

      {/* Fiery Menu Hero Banner */}
      <div className="relative z-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-red-950/40 via-neutral-950 to-neutral-950 border border-red-950/30 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(220,38,38,0.15),transparent_60%)] pointer-events-none"></div>
        
        <div className="space-y-4 max-w-lg text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-700/30 text-xs font-bold text-red-500">
            🔥 عرض لفترة محدودة
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-black leading-tight text-white">
            دجاج حقيقي.. <br />
            <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">قرمشة حقيقية! 🍗</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
            محضر طازجاً يومياً من أجلك لتستمتع بأقوى نكهة مقرمشة وجودة لا مثيل لها. قرمشها وعيش اللذاذة مع كرسبي كينج!
          </p>
          <div className="pt-2">
            <span className="text-xs text-gray-500 font-bold">⭐ جودة كينج مضمونة 100%</span>
          </div>
        </div>

        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center shrink-0">
          {/* Radial amber backdrop glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 to-amber-500/20 rounded-full blur-3xl opacity-60"></div>
          <img 
            src="https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80" 
            alt="Crispy Chicken Bucket" 
            className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(220,38,38,0.4)] animate-bounce-slow"
            style={{ animation: 'bounce 4s ease-in-out infinite' }}
          />
        </div>
      </div>
```

- [ ] **Step 2: Verify component rendering**

Verify the project compiles successfully: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/MenuSection.tsx
git commit -m "feat: add fiery promotional hero banner at top of menu page"
```

---

### Task 3: Capsule Categories Filter Tabs

**Files:**
- Modify: `src/components/MenuSection.tsx`

**Interfaces:**
- Consumes: categories raw list from backend database.
- Produces: Scrollable row of sleek pill capsule buttons with custom symbols and glow effects.

- [ ] **Step 1: Refactor categories render block**

Replace the existing categories tab filter block in `src/components/MenuSection.tsx` to render custom round capsule buttons with simple clean emojis/symbols. Emojis represent the items premium style:
- البرجر: 🍔
- كرسبي دجاج: 🍗
- البيتزا: 🍕
- المشروبات: 🥤
- الحلويات:  waffle/dessert 🧇

```tsx
      {/* Categories Filter Tabs */}
      <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 mb-4 border-b border-neutral-900 scrollbar-none scroll-smooth" dir="rtl">
        {categories.map(cat => {
          // Determine matching symbol/icon based on category slug
          let catSymbol = '🍔';
          if (cat.slug.includes('chicken') || cat.slug.includes('مقرمش')) catSymbol = '🍗';
          else if (cat.slug.includes('pizza')) catSymbol = '🍕';
          else if (cat.slug.includes('drink') || cat.slug.includes('مشروب')) catSymbol = '🥤';
          else if (cat.slug.includes('dessert') || cat.slug.includes('حلو')) catSymbol = '🧇';

          const isActive = activeSlug === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer hover:scale-[1.03] ${
                isActive
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.55)] scale-105 border border-red-500'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-900 hover:border-red-900/50 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <span className="text-xl">{catSymbol}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
```

- [ ] **Step 2: Verify compiler success**

Run: `npm run build`
Expected: Compile success.

- [ ] **Step 3: Commit**

```bash
git add src/components/MenuSection.tsx
git commit -m "feat: refactor categories filter tabs into sleek glowing capsules with emojis"
```

---

### Task 4: Premium Food Cards Grid

**Files:**
- Modify: `src/components/MenuSection.tsx`

**Interfaces:**
- Consumes: filtered menu items list.
- Produces: Premium grid of food cards with large images, hover scaling, red border glow, and gold/amber styling.

- [ ] **Step 1: Rewrite Menu Grid**

Rewrite the menu grid rendering loop in `src/components/MenuSection.tsx` lines 338-370 to construct the glassmorphic card design.

```tsx
      {/* Menu Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="group flex flex-col justify-between overflow-hidden rounded-[2.2rem] bg-neutral-950/80 border border-neutral-900/90 backdrop-blur-md transition-all duration-300 hover:border-red-900/40 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:-translate-y-1.5"
          >
            {/* Image Container with rounded top corners */}
            <div className="relative h-60 overflow-hidden bg-neutral-950">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60"></div>
              
              <span className="absolute bottom-4 left-4 bg-black/75 font-bold px-3.5 py-1.5 rounded-full text-xs text-neutral-300 border border-neutral-800/80 backdrop-blur-xs flex items-center gap-1">
                🔥 {item.calories} سعرة
              </span>
            </div>
            
            {/* Description & Metadata Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white group-hover:text-red-500 transition-colors duration-200">
                  {item.name}
                </h3>
                <p className="text-neutral-400 text-xs font-medium leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              
              {/* Bottom Price & Call to Action Row */}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-900/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">السعر</span>
                  <span className="text-lg font-black text-amber-500">
                    {item.price.toLocaleString('ar-YE')} <span className="text-xs font-bold text-neutral-300">ريال يمني</span>
                  </span>
                </div>
                
                <button
                  onClick={() => onSelectItem(item)}
                  className="bg-red-600 text-white font-extrabold px-6 py-2.5 rounded-full hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all text-xs hover:-translate-y-0.5"
                >
                  أضف للطلب
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
```

- [ ] **Step 2: Verify compile status**

Run: `npm run build`
Expected: Compile success.

- [ ] **Step 3: Commit**

```bash
git add src/components/MenuSection.tsx
git commit -m "feat: redesign food items grid cards to be glassmorphic with hover glow effects"
```

---

### Task 5: Customization Modal Aesthetic Refinement

**Files:**
- Modify: `src/components/CustomizationModal.tsx`

**Interfaces:**
- Consumes: selected food item customizations array.
- Produces: Revamped modal styling matching pure black and deep red theme.

- [ ] **Step 1: Write CustomizationModal styles**

In `src/components/CustomizationModal.tsx`, replace the whole file content to change modal box from gray-900 to pitch black (neutral-950) with clean layout borders (neutral-900), gold prices, and custom inputs.

```tsx
import React, { useState } from 'react';
import type { MenuItem, CustomizationOption } from '../types';
import { X, Plus, Minus } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customizations: CustomizationOption[]) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<CustomizationOption[]>([]);

  const handleOptionToggle = (option: CustomizationOption) => {
    if (option.category === 'SIZE') {
      setSelectedOptions(prev => [
        ...prev.filter(opt => opt.category !== 'SIZE'),
        option
      ]);
    } else {
      if (selectedOptions.some(opt => opt.id === option.id)) {
        setSelectedOptions(prev => prev.filter(opt => opt.id !== option.id));
      } else {
        setSelectedOptions(prev => [...prev, option]);
      }
    }
  };

  const isOptionSelected = (option: CustomizationOption) => {
    if (option.category === 'SIZE' && selectedOptions.filter(opt => opt.category === 'SIZE').length === 0) {
      return item.options.filter(opt => opt.category === 'SIZE')[0]?.id === option.id;
    }
    return selectedOptions.some(opt => opt.id === option.id);
  };

  const activeSizePrice = selectedOptions.find(opt => opt.category === 'SIZE')?.price || 0;
  const addonsPrice = selectedOptions.filter(opt => opt.category === 'ADDON').reduce((sum, opt) => sum + opt.price, 0);
  const singleUnitPrice = item.price + activeSizePrice + addonsPrice;
  const totalPrice = singleUnitPrice * quantity;

  const handleConfirm = () => {
    let finalOptions = [...selectedOptions];
    const sizeOptions = item.options.filter(opt => opt.category === 'SIZE');
    if (sizeOptions.length > 0 && !selectedOptions.some(opt => opt.category === 'SIZE')) {
      finalOptions.push(sizeOptions[0]);
    }
    onAddToCart(item, quantity, finalOptions);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 text-white border border-neutral-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Food Image */}
        <div className="relative h-60 bg-neutral-950">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/95 p-2 rounded-full text-neutral-200 hover:bg-neutral-900 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="text-2xl font-black text-white">{item.name}</h3>
            <span className="text-xl font-black text-amber-500 shrink-0">{item.price.toLocaleString('ar-YE')} ريال</span>
          </div>
          <p className="text-neutral-400 text-xs font-medium mb-6 leading-relaxed">{item.description}</p>

          {/* Options Panels */}
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
            {/* 1. Sizes selection */}
            {item.options.filter(opt => opt.category === 'SIZE').length > 0 && (
              <div>
                <h4 className="font-extrabold text-white mb-3 border-r-4 border-red-600 pr-2 text-sm">اختر الحجم:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {item.options.filter(opt => opt.category === 'SIZE').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionToggle(option)}
                      type="button"
                      className={`p-4 border-2 rounded-2xl text-right transition-all duration-200 cursor-pointer ${
                        isOptionSelected(option)
                          ? 'border-red-600 bg-red-950/20 text-red-500 font-extrabold'
                          : 'border-neutral-900 hover:border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="text-sm">{option.name}</div>
                      {option.price > 0 && <div className="text-xs mt-1 text-amber-500">+{option.price.toLocaleString('ar-YE')} ريال</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Addons checkboxes */}
            {item.options.filter(opt => opt.category === 'ADDON').length > 0 && (
              <div>
                <h4 className="font-extrabold text-white mb-3 border-r-4 border-red-600 pr-2 text-sm">إضافات مميزة:</h4>
                <div className="space-y-2">
                  {item.options.filter(opt => opt.category === 'ADDON').map(option => (
                    <label
                      key={option.id}
                      onClick={() => handleOptionToggle(option)}
                      className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        isOptionSelected(option)
                          ? 'border-red-600 bg-red-950/20'
                          : 'border-neutral-900 hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isOptionSelected(option)} onChange={() => {}} className="accent-red-600 w-4 h-4 rounded" />
                        <span className="font-extrabold text-neutral-300 text-sm">{option.name}</span>
                      </div>
                      <span className="text-sm font-black text-amber-500">+{option.price.toLocaleString('ar-YE')} ريال</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal bottom bar actions */}
          <div className="border-t border-neutral-900/80 pt-6 mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2.5 rounded-full border border-neutral-900 shadow-inner">
              <button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-neutral-200">{quantity}</span>
              <button type="button" onClick={() => setQuantity(prev => prev + 1)} className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleConfirm}
              type="button"
              className="w-full sm:w-auto bg-red-600 text-white font-extrabold px-8 py-3.5 rounded-full hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
            >
              إضافة للطلب - {totalPrice.toLocaleString('ar-YE')} ريال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify compile status**

Run: `npm run build`
Expected: Compile success.

- [ ] **Step 3: Commit**

```bash
git add src/components/CustomizationModal.tsx
git commit -m "feat: redesign CustomizationModal with pure black backdrop-blur styling"
```

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compiling.
- Run `npm run lint` to confirm eslint passes.

### Manual Verification
- Deploy to Vercel production: `npx vercel --prod --yes`
- Open the live restaurant page and test:
  1. Click 'قائمة الطعام'. Verify that the background is pitch black and backing red/amber glows are rendered properly.
  2. Verify the Top Welcome Banner shows up with high resolution image and bold "دجاج حقيقي.. قرمشة حقيقية!" text.
  3. Toggle capsule button tabs and check category switching.
  4. Hover on cards, verify they scale up, change border color to subtle red glow, and show gold prices.
  5. Select an item. Verify the modal displays a premium matching dark red style.
