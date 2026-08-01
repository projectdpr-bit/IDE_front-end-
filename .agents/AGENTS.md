# Senior Frontend Design System & ERP Architecture Rules (AGENTS Standard)

## Objective
Design and implement the Frontend of our Project-Based ERP System (Site Contracting Business). The system must be scalable, high-performance, accessible, and enterprise-grade. It is calculation-intensive, API-heavy, and deeply driven by complex Authentication and Hierarchical Role-Based Access Control (RBAC). The application spans 25-30 core pages across multiple functional modules.

---

# 1. System Overview & Core Principles

This system is a **project-based ERP** for a site contracting business (handling power distribution / infrastructure work).
Two structures sit on top of each other:
1. **Organizational Hierarchy**: Defines where work happens.
2. **Functional Modules**: HRMS, Procurement, Store, Analytics, Finance.

Field roles (Engineer, Senior Manager) generate raw data (attendance, GPS location, inventory movement, work done) against a specific feeder or location. This data rolls up through Store, Procurement, and HRMS, gets summarized in Analytics, and ultimately becomes the basis for client, labour, and machine billing.

* **Enterprise Architecture First**: Maintain a clean, scalable, and highly modular architecture to support heavy API interactions, complex data tables, and dynamic forms.
* **Calculation & Precision Priority**: Frontend calculations (billing, inventory aging, advances) must be precise, memoized, and synced with the backend truth.
* **API-Heavy Design**: The frontend will heavily rely on server state. Caching, pagination, virtualization, and complex mutation flows using TanStack Query are mandatory.
* **Component-Driven System**: All UI elements stem from predefined Tailwind CSS tokens and atomic components.

---

# 1.5. Global Theme & Color System Rules

## 1.5.1 Single Source of Truth — `src/config/theme.js`

**THE MOST CRITICAL RULE**: All colors, gradients, shadows, and brand tokens MUST be defined ONLY in `src/config/theme.js`. This file is the **single source of truth** for every color decision in the entire application.

```
src/config/theme.js  ──>  CSS Variables in index.css  ──>  Tailwind tokens  ──>  Components
```

**Why**: When the user changes a color (e.g., from red to green), updating `theme.js` ALONE must cascade automatically to every component, page, button, and sidebar through CSS variables.

## 1.5.2 Current Theme Tokens (defined in `src/config/theme.js`)

```js
// src/config/theme.js — SINGLE SOURCE OF TRUTH
export const themeColors = {
  primary: {
    gradientTop:         '#e53e1e',           // Top of primary gradient
    gradientBottom:      '#b81f03',           // Bottom of primary gradient
    hoverGradientTop:    '#f04e30',           // Hover top
    hoverGradientBottom: '#c92405',           // Hover bottom
    shadowGlow:          'rgba(220,38,4,0.3)',// Glow/shadow
    border:              '#b81f03'            // Solid border
  },
  layout: {
    background:           '#f4f6fa',          // App/page background
    border:               '#e2e8f0',          // Dividers, card borders
    activeNavCard:        '#ffffff',          // Active nav highlight
    activeNavCardBorder:  'rgba(226,232,240,0.4)'
  },
  secondary: {
    gradientTop:         '#ffffff',
    gradientBottom:      '#f8fafc',
    hoverGradientTop:    '#f8fafc',
    hoverGradientBottom: '#f1f5f9',
    text:   '#334155',                        // Slate 700 — body text
    border: '#cbd5e1'                         // Slate 300 — input/card border
  }
};
```

## 1.5.3 CSS Variable Wiring in `src/index.css`

Every token from `theme.js` MUST be mirrored as a CSS custom property inside the `@theme {}` block. This is what makes Tailwind and plain CSS components honor the theme.

```css
/* src/index.css — mirrors theme.js tokens as CSS variables */
@theme {
  /* Primary */
  --color-primary-top:           <theme.primary.gradientTop>;
  --color-primary-bottom:        <theme.primary.gradientBottom>;
  --color-primary-hover-top:     <theme.primary.hoverGradientTop>;
  --color-primary-hover-bottom:  <theme.primary.hoverGradientBottom>;
  --color-primary-shadow:        <theme.primary.shadowGlow>;
  --color-primary-border:        <theme.primary.border>;

  /* Layout */
  --color-layout-bg:                <theme.layout.background>;
  --color-layout-border:            <theme.layout.border>;
  --color-layout-active-nav-bg:     <theme.layout.activeNavCard>;
  --color-layout-active-nav-border: <theme.layout.activeNavCardBorder>;

  /* Secondary */
  --color-secondary-top:          <theme.secondary.gradientTop>;
  --color-secondary-bottom:       <theme.secondary.gradientBottom>;
  --color-secondary-hover-top:    <theme.secondary.hoverGradientTop>;
  --color-secondary-hover-bottom: <theme.secondary.hoverGradientBottom>;
  --color-secondary-text:         <theme.secondary.text>;
  --color-secondary-border:       <theme.secondary.border>;
}
```

**Color Change Workflow — MUST follow this every time**:
1. User says "change primary color to green"
2. ONLY update `src/config/theme.js` → update `primary.gradientTop/Bottom` etc.
3. ONLY update matching values in `src/index.css` `@theme {}` block
4. Every component that uses `btn-3d-primary`, `var(--color-primary-*)`, or `bg-primary-*` automatically reflects the change
5. NEVER hardcode `#e53e1e` or any hex value directly inside a component file

## 1.5.4 Usage Rules for Components

| Scenario | Correct Usage | Wrong Usage |
| :--- | :--- | :--- |
| Primary button | `btn-3d-primary` class or `var(--color-primary-top)` | `bg-[#e53e1e]` |
| Layout background | `bg-layout-bg` | `bg-[#f4f6fa]` |
| Body text | `text-secondary-text` or `text-slate-700` | `text-[#334155]` |
| Card border | `border-layout-border` | `border-[#e2e8f0]` |
| Glow shadow | `var(--color-primary-shadow)` | `shadow-red-500/30` |

---

# 2. Global Responsive UI System — Fluid Design with `clamp()`

## 2.1 Philosophy: Fluid-First, Not Breakpoint-First

The UI MUST work perfectly across **300px to 2560px** with zero pixel cramping or excessive stretching. Achieve this by using `clamp()` for EVERY size property — typography, spacing, radius, width, height, padding, gap, and more.

**Formula**: `clamp(MIN, PREFERRED, MAX)`
- `MIN` = smallest comfortable size (at ~300px viewport)
- `PREFERRED` = fluid calc value like `0.8rem + 1vw`
- `MAX` = largest sensible size (at ~2560px viewport)

Use media queries ONLY when clamp() cannot handle the behavior alone (e.g., hiding columns on mobile, switching layout from row to column).

## 2.2 Screen Breakdown — How UI Should Look at Each Width

| Screen Range | Category | Expected UI Behavior |
| :--- | :--- | :--- |
| **300px – 480px** | Mobile XS | Single column. Sidebar hidden (hamburger). Tables card-stacked or horizontal scroll. Right panel = full-screen modal. Min touch target: 44px. |
| **481px – 767px** | Mobile | Single column. Sidebar = collapsible overlay. Tables = horizontal scroll with sticky first column. Right panel = slide-up bottom sheet or full modal. |
| **768px – 1023px** | Tablet | Two-column layouts emerge. Sidebar = icon-only rail or collapsible. Tables = horizontal scroll, key columns visible. Right panel = overlay drawer (50% width). |
| **1024px – 1279px** | Small Desktop | Sidebar visible compact (~220px). Tables full-width all columns. Right panel = side drawer (360px) that pushes content. |
| **1280px – 1919px** | Desktop (Primary Target) | Full layout. Sidebar ~240px. Tables paginated full-column. Right panel = persistent inline panel (380px–420px). |
| **1920px – 2559px** | Large Desktop / FHD | Extra whitespace via max-width container. Tables gain detail columns. Right panel fixed ~420px. |
| **2560px+** | 2K / Ultra-Wide | Content centered, max-width ~1800px. Side panel ~440px. Table MUST NOT stretch to full 2560px. |

## 2.3 Fluid Typography Scale (in `src/index.css @theme`)

All text sizes use `clamp()`. These MUST NOT be overridden with fixed `px` sizes in components:

```css
--text-2xs: clamp(0.65rem,  0.6rem  + 0.2vw,  0.85rem);  /* ~10px to 14px */
--text-xs:  clamp(0.725rem, 0.675rem + 0.25vw, 0.825rem); /* ~11px to 13px */
--text-sm:  clamp(0.825rem, 0.775rem + 0.3vw,  0.95rem);  /* ~13px to 15px */
--text-base:clamp(0.9rem,   0.85rem  + 0.35vw, 1.05rem);  /* ~14px to 17px */
--text-lg:  clamp(1.05rem,  0.975rem + 0.45vw, 1.25rem);  /* ~17px to 20px */
--text-xl:  clamp(1.2rem,   1.1rem   + 0.6vw,  1.5rem);   /* ~19px to 24px */
--text-2xl: clamp(1.4rem,   1.25rem  + 0.85vw, 1.85rem);  /* ~22px to 30px */
--text-3xl: clamp(1.7rem,   1.45rem  + 1.2vw,  2.35rem);  /* ~27px to 38px */
```

## 2.4 Fluid Spacing Scale — `clamp()` for All Spacings

Define these in `src/index.css @theme`. Use them for ALL margin, padding, and gap. Never use raw `px` values in JSX:

```css
/* 8px base grid, fluid from 300px to 2560px */
--space-1:  clamp(0.25rem,  0.2rem  + 0.2vw,  0.5rem);   /* ~4px  to 8px  */
--space-2:  clamp(0.375rem, 0.3rem  + 0.3vw,  0.625rem); /* ~6px  to 10px */
--space-3:  clamp(0.5rem,   0.4rem  + 0.4vw,  0.75rem);  /* ~8px  to 12px */
--space-4:  clamp(0.75rem,  0.6rem  + 0.6vw,  1rem);     /* ~12px to 16px */
--space-5:  clamp(1rem,     0.8rem  + 0.8vw,  1.25rem);  /* ~16px to 20px */
--space-6:  clamp(1.25rem,  1rem    + 1vw,    1.5rem);   /* ~20px to 24px */
--space-8:  clamp(1.5rem,   1.2rem  + 1.2vw,  2rem);     /* ~24px to 32px */
--space-10: clamp(2rem,     1.5rem  + 1.5vw,  2.5rem);   /* ~32px to 40px */
--space-12: clamp(2.5rem,   2rem    + 1.8vw,  3rem);     /* ~40px to 48px */
--space-16: clamp(3rem,     2.5rem  + 2vw,    4rem);     /* ~48px to 64px */
```

## 2.5 Fluid Border Radius Scale

```css
--radius-sm:   clamp(0.25rem,  0.2rem + 0.2vw,  0.375rem); /* 4px  to 6px  */
--radius-md:   clamp(0.375rem, 0.3rem + 0.3vw,  0.5rem);   /* 6px  to 8px  */
--radius-lg:   clamp(0.5rem,   0.4rem + 0.4vw,  0.75rem);  /* 8px  to 12px */
--radius-xl:   clamp(0.75rem,  0.6rem + 0.6vw,  1rem);     /* 12px to 16px */
--radius-2xl:  clamp(1rem,     0.8rem + 0.8vw,  1.5rem);   /* 16px to 24px */
--radius-full: 9999px;
```

## 2.6 Fluid Layout Dimensions

```css
/* Sidebar widths */
--sidebar-width-full:    clamp(200px, 15vw + 120px, 260px);  /* 200px to 260px */
--sidebar-width-compact: clamp(56px,  4vw + 40px,   72px);   /* 56px  to 72px  */

/* Right panel / drawer width */
--panel-width: clamp(280px, 20vw + 140px, 440px);            /* 280px to 440px */

/* Page content max-width (prevents 2560px stretching) */
--content-max-width: 1800px;

/* Card padding */
--card-padding: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);        /* 12px to 24px */

/* Table cell padding */
--table-cell-px: clamp(0.5rem,  0.4rem + 0.5vw, 1rem);      /* 8px  to 16px */
--table-cell-py: clamp(0.5rem,  0.35rem + 0.4vw, 0.875rem); /* 8px  to 14px */

/* Input height */
--input-height: clamp(2.25rem, 2rem + 1vw, 2.75rem);         /* 36px to 44px */

/* Button heights */
--btn-height-sm: clamp(1.75rem, 1.5rem + 0.8vw, 2.25rem);   /* 28px to 36px */
--btn-height-md: clamp(2.25rem, 2rem   + 0.8vw, 2.75rem);   /* 36px to 44px */
--btn-height-lg: clamp(2.75rem, 2.5rem + 0.8vw, 3.25rem);   /* 44px to 52px */

/* Icon sizes */
--icon-sm: clamp(0.875rem, 0.8rem + 0.3vw, 1.125rem);       /* 14px to 18px */
--icon-md: clamp(1rem,     0.9rem + 0.4vw, 1.25rem);        /* 16px to 20px */
--icon-lg: clamp(1.25rem,  1.1rem + 0.5vw, 1.5rem);         /* 20px to 24px */
```

---

# 3. Responsive UI Rules — Per Component

## 3.1 Page Layout Shell

Every page MUST follow this structural pattern:

```jsx
<DashboardLayout>
  {/* Page container */}
  <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">

    {/* Page Header Row */}
    <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
      <h1 className="text-[var(--text-xl)] font-semibold text-slate-800">Page Title</h1>
      <div className="flex flex-wrap gap-[var(--space-3)]">
        {/* Action buttons */}
      </div>
    </div>

    {/* Filters / Search Bar Row */}
    <div className="flex flex-wrap gap-[var(--space-3)]">
      {/* Search input, filter dropdowns */}
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
      {/* Table Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Table */}
      </div>
      {/* Right Panel (conditional, see 3.3) */}
    </div>

  </div>
</DashboardLayout>
```

## 3.2 Data Table — Responsive Rules (CRITICAL)

Tables are the most complex responsive component in this ERP. Follow all rules strictly.

### Table Container
```jsx
<div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
  <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
    ...
  </table>
</div>
```
- ALWAYS wrap table in `overflow-x: auto` container
- Set `min-w-[600px]` or `min-w-[700px]` — never let columns collapse below readable width
- Use `scrollbar-thin` for polished scrollbar on large screens

### Table Header `<th>`
```jsx
<th className="
  sticky top-0 z-10
  px-[var(--table-cell-px)] py-[var(--table-cell-py)]
  text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider
  bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)]
  whitespace-nowrap text-left
">
```

### Table Cell `<td>`
```jsx
<td className="
  px-[var(--table-cell-px)] py-[var(--table-cell-py)]
  text-[var(--text-sm)] text-slate-700
  border-b border-[var(--color-layout-border)]
  whitespace-nowrap
">
```

### Column Visibility Strategy
- **Always show**: SN, primary identifier (name / PO number), status, key amount, actions
- **Hide on tablet** (`hidden md:table-cell`): secondary amounts, date columns, vendor detail
- **Show only on desktop** (`hidden lg:table-cell`): notes, reference, approval columns
- Use `truncate max-w-[Xpx]` on long text cells — never let text break layout

### Sticky First Column
```jsx
<td className="sticky left-0 bg-white z-10 border-r border-[var(--color-layout-border)]">
```

## 3.3 Right Side Panel / Drawer

### Behavior per screen size:
- **< 768px**: Full-screen modal or bottom sheet. Use `fixed inset-0 z-50`
- **768px – 1023px**: Overlay drawer, slides from right. `fixed inset-y-0 right-0 w-[70vw] max-w-[420px]`
- **>= 1024px**: Inline side panel next to the table. Width = `w-[var(--panel-width)]`

### Side Panel Structure (Desktop Inline)
```jsx
<div className={`
  hidden md:flex flex-col
  w-[var(--panel-width)] shrink-0
  bg-white border border-[var(--color-layout-border)]
  rounded-[var(--radius-xl)] shadow-sm
  overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200
  transition-all duration-300
  ${showPanel ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden pointer-events-none'}
`}>
  {/* Sticky panel header */}
  <div className="flex items-center justify-between p-[var(--card-padding)] border-b border-[var(--color-layout-border)] sticky top-0 bg-white z-10">
    <h2 className="text-[var(--text-base)] font-semibold text-slate-800">Detail</h2>
    <button className="p-[var(--space-2)] rounded-[var(--radius-md)] hover:bg-slate-100">✕</button>
  </div>
  {/* Scrollable body */}
  <div className="flex-1 p-[var(--card-padding)] space-y-[var(--space-4)]">
    {/* Content */}
  </div>
</div>

{/* Mobile: backdrop + drawer */}
<div className="md:hidden fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={close}>
  <div className="w-[85vw] max-w-[380px] bg-white h-full shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
    {/* Same header + body structure */}
  </div>
</div>
```

## 3.4 Cards

```jsx
<div className="
  bg-white
  rounded-[var(--radius-xl)]
  border border-[var(--color-layout-border)]
  p-[var(--card-padding)]
  shadow-sm
">
```
- Padding = ALWAYS `var(--card-padding)` — never `p-4` or `p-6`
- Radius = ALWAYS `var(--radius-xl)` — never `rounded-xl`
- Background = `bg-white` for card surface, `bg-layout-bg` for page background only

## 3.5 Buttons

```jsx
{/* Primary */}
<button className="
  btn-3d-primary
  px-[var(--space-5)] h-[var(--btn-height-md)]
  rounded-[var(--radius-lg)]
  text-[var(--text-sm)] font-medium
  flex items-center gap-[var(--space-2)]
  cursor-pointer
">

{/* Secondary */}
<button className="
  btn-3d-secondary
  px-[var(--space-5)] h-[var(--btn-height-md)]
  rounded-[var(--radius-lg)]
  text-[var(--text-sm)] font-medium
  flex items-center gap-[var(--space-2)]
">

{/* Icon-only (table row action) */}
<button className="
  p-[var(--space-2)]
  rounded-[var(--radius-md)]
  text-slate-500 hover:text-[var(--color-primary-bottom)] hover:bg-red-50
  transition-colors duration-150
  min-w-[44px] min-h-[44px] flex items-center justify-center
">
```

**Button height rules**:
- `h-[var(--btn-height-sm)]` for compact / table actions
- `h-[var(--btn-height-md)]` for standard page-level buttons (default)
- `h-[var(--btn-height-lg)]` for prominent CTA / form submit

## 3.6 Form Inputs

```jsx
<label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block" />

<input className="
  w-full h-[var(--input-height)]
  px-[var(--space-4)]
  rounded-[var(--radius-lg)]
  border border-[var(--color-secondary-border)]
  bg-white text-[var(--text-sm)] text-slate-800
  placeholder:text-slate-400
  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
  transition-colors duration-150
  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
" />

<select className="
  w-full h-[var(--input-height)]
  px-[var(--space-4)]
  rounded-[var(--radius-lg)]
  border border-[var(--color-secondary-border)]
  bg-white text-[var(--text-sm)] text-slate-800
  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
  transition-colors duration-150
" />
```
- Every input/select MUST use `h-[var(--input-height)]` — never `h-9`, `h-10`, or `py-2 px-3`

## 3.7 Search Bar

```jsx
<div className="relative flex-1 min-w-[180px] max-w-sm">
  <SearchIcon className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
  <input
    className="
      w-full h-[var(--input-height)]
      pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)]
      rounded-[var(--radius-xl)]
      border border-[var(--color-secondary-border)]
      bg-white text-[var(--text-sm)] text-slate-800
      placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
      transition-colors duration-150
    "
    placeholder="Search..."
  />
</div>
```

## 3.8 Badges / Status Pills

```jsx
<span className="
  inline-flex items-center
  px-[var(--space-3)] py-[var(--space-1)]
  rounded-[var(--radius-full)]
  text-[var(--text-2xs)] font-semibold uppercase tracking-wide
  bg-green-100 text-green-700
">Active</span>
```

Status color map (consistent across all pages):
- `active` / `approved` → `bg-green-100 text-green-700`
- `pending` / `draft` → `bg-yellow-100 text-yellow-700`
- `rejected` / `cancelled` → `bg-red-100 text-red-700`
- `dispatched` / `completed` → `bg-blue-100 text-blue-700`

## 3.9 Page Header Section

```jsx
<div className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
  {/* Left: Icon + Title + Subtitle */}
  <div className="flex items-center gap-[var(--space-3)]">
    <div className="
      w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)]
      rounded-[var(--radius-lg)]
      bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)]
      flex items-center justify-center
      shadow-[0_4px_12px_var(--color-primary-shadow)]
    ">
      <PageIcon className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
    </div>
    <div>
      <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Title</h1>
      <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">Subtitle / count</p>
    </div>
  </div>

  {/* Right: Action buttons */}
  <div className="flex flex-wrap gap-[var(--space-3)]">
    <button className="btn-3d-secondary ...">Secondary</button>
    <button className="btn-3d-primary ...">Primary CTA</button>
  </div>
</div>
```

## 3.10 Sidebar

- Width switches between `var(--sidebar-width-full)` (expanded) and `var(--sidebar-width-compact)` (collapsed)
- **< 768px**: Hidden entirely, toggled via hamburger → full overlay
- **>= 768px**: Persistent rail, toggleable full/compact
- All sidebar icons = `w-[var(--icon-md)] h-[var(--icon-md)]`
- Sidebar nav text = `text-[var(--text-sm)]`
- Uses `var(--color-layout-bg)` for background, `var(--color-layout-border)` for borders

## 3.11 KPI / Stat Cards Grid

```jsx
<div className="
  grid gap-[var(--space-4)]
  grid-cols-[repeat(auto-fit,minmax(clamp(160px,15%+80px,240px),1fr))]
">
  <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)]">
    <p className="text-[var(--text-xs)] text-slate-500 font-medium uppercase tracking-wide">Metric Label</p>
    <p className="text-[var(--text-2xl)] font-bold text-slate-800 mt-[var(--space-1)]">₹2,40,000</p>
    <p className="text-[var(--text-xs)] text-slate-400 mt-[var(--space-1)]">Sub-label</p>
  </div>
</div>
```

---

# 4. New Page / Existing Page Responsive Checklist

When building any new page OR updating an existing page, follow this 8-step checklist:

## Step 1: Layout Structure
- [ ] Wrap in `<DashboardLayout>`
- [ ] Page container: `flex flex-col h-full gap-[var(--space-4)]`
- [ ] Add `max-w-[var(--content-max-width)] w-full mx-auto` to prevent 2560px stretching
- [ ] No hardcoded `px-4`, `py-6`, `gap-4` etc. — use CSS variable spacing

## Step 2: Typography
- [ ] Page title = `text-[var(--text-xl)]`
- [ ] Section label / table header = `text-[var(--text-xs)]`
- [ ] Table body = `text-[var(--text-sm)]`
- [ ] Badge = `text-[var(--text-2xs)]`
- [ ] NEVER use Tailwind's fixed scale: `text-sm`, `text-lg`, `text-base` etc.

## Step 3: Spacing
- [ ] All `padding` = `p-[var(--space-N)]` variants
- [ ] All `margin` = `m-[var(--space-N)]` variants
- [ ] All `gap` = `gap-[var(--space-N)]`
- [ ] NEVER use `p-4`, `mt-2`, `gap-3` etc. directly

## Step 4: Colors
- [ ] Primary actions = `btn-3d-primary`
- [ ] Secondary actions = `btn-3d-secondary`
- [ ] Borders = `var(--color-layout-border)` or `var(--color-secondary-border)`
- [ ] NEVER hardcode hex colors in JSX (`bg-[#e53e1e]` etc.)

## Step 5: Tables
- [ ] Wrapped in `overflow-x: auto` container with `rounded-[var(--radius-xl)] border`
- [ ] `min-w-[600px]` on `<table>`
- [ ] Headers: sticky top, `text-[var(--text-xs)]`, `bg-slate-50/80 backdrop-blur-sm`
- [ ] Cells: `px-[var(--table-cell-px)] py-[var(--table-cell-py)]`
- [ ] Sticky first column on long tables
- [ ] Secondary columns: `hidden md:table-cell`

## Step 6: Right Panel (if exists)
- [ ] Mobile < 768px: `fixed inset-0 z-50` full overlay drawer
- [ ] Desktop >= 1024px: inline `w-[var(--panel-width)]` beside the table
- [ ] Panel header sticky, panel body scrollable with `scrollbar-thin`

## Step 7: Buttons & Inputs
- [ ] Buttons: `h-[var(--btn-height-md)]`, `px-[var(--space-5)]`, `rounded-[var(--radius-lg)]`
- [ ] Inputs/selects: `h-[var(--input-height)]`, `rounded-[var(--radius-lg)]`
- [ ] Minimum touch target: `min-w-[44px] min-h-[44px]` on icon buttons

## Step 8: Final Responsive Verification
- [ ] 320px: no horizontal overflow, all content accessible, tap targets 44px+
- [ ] 768px: sidebar collapses, table scrolls, right panel becomes drawer
- [ ] 1280px: full layout with panel side-by-side table
- [ ] 1920px+: max-width applies, no ugly content stretching

---

# 5. Organizational Hierarchy & Role Access Rules

## 5.1 Organizational Hierarchy (Top-Down)
Every project drills down through five levels, set up top-down by the Admin:
1. **Admin**: Top-level role. Sets up the foundational structure everyone else operates within. 
   - Has access to everything in the system.
   - Adds designations/roles, projects, and locations.
   - Creates sub-projects and assigns vendors to them.
   - Creates sub-divisions and assigns labour contractors to them.
2. **Sub Project**: Vendor addition happens here.
3. **Sub Division**: Labour contractor addition happens here.
4. **Feeder**: Assigned to a Senior Manager.
5. **Location Name**: Ground-level work unit where field work is actually logged.

## 5.2 Role Access & Data Ownership (Strict RBAC)

| Role | Primary Modules | Key Data Owned |
| :--- | :--- | :--- |
| **Admin** | All Modules | Projects, locations, vendors, contractors |
| **Procurement Manager**| Procurement | BOQ, PO / PI / DI |
| **Store Manager** | Store, Procurement | Inventory in/out, debit/credit notes, aging |
| **Senior Manager** | HRMS, Analytics, Store (outward) | Feeder-level attendance, approvals, advances |
| **Engineer** | HRMS, Store (inward) | Location-level attendance, work entries, reimbursements |
| **Billing Executive** | Finance & Accounting | Client / labour / machine agency bills |

* **Auth Implementation Rule**: Every route, sidebar item, API hook, and UI action MUST verify user role and hierarchy-level context before rendering or executing.

---

# 6. Tech Stack Priority & Decision Matrix

* **Framework**: React + Vite (Strict TypeScript) or Next.js.
* **Routing**: React Router (or Next Router) with deeply nested protected routes based on RBAC guards.
* **State Management**:
  * **Server State**: TanStack Query (React Query) for heavy API data synchronization.
  * **Client / App State**: Zustand for global auth session, UI state, and active hierarchy selection.
  * **Form State**: React Hook Form + Zod for robust validation of large, dynamic ERP forms.
* **Styling**: Tailwind CSS + Shadcn UI / Radix UI primitives.
* **Calculations**: Use safe math libraries/utilities to avoid JavaScript floating-point errors for financial and billing calculations.

---

# 7. Standard Project Directory Structure (ERP Domain-Driven)

```text
src/
├── app/                  # App initialization, global providers (QueryClient, Auth, Theme)
├── assets/               # Static assets, images, icons
├── components/
│   ├── ui/               # Base primitives (Button, Input, Table, Modal, Toast, DatePicker)
│   └── common/           # Shared components (Sidebar, Navbar, ProtectedRoute, RoleGuard)
│
├── config/
│   └── theme.js          # SINGLE SOURCE OF TRUTH for all colors and theme tokens
│
├── features/             # DOMAIN-DRIVEN MODULES (Core ERP Logic)
│   ├── admin/            # Project, Sub-Project, Sub-Division setup & hierarchy
│   ├── auth/             # Login, Token management, Session persistence
│   ├── hrms/             # Attendance, Advances, Reimbursements, Payroll inputs
│   ├── procurement/      # BOQ, PO, PI, DI generation and tracking
│   ├── store/            # Inventory In/Out, Debit/Credit notes, Stock Aging
│   ├── finance/          # Billing (Client, Labour, Machine)
│   └── analytics/        # Dashboards, rollup summaries, charts
│
├── hooks/                # Custom reusable hooks (useAuth, usePermissions, useHierarchy)
├── layouts/              # Main layout shells (AdminLayout, FieldLayout)
├── lib/                  # Third-party wrappers (axios interceptors, tailwind cn)
├── routes/               # Route definitions, Lazy loading maps, and RBAC mapping
├── services/             # API endpoint definitions (e.g., hrms.api.ts)
├── store/                # Zustand global state (AuthStore, ContextStore)
├── types/                # Global TS types, API Request/Response DTOs, Role Enums
└── utils/                # Pure helper functions (calculations, formatters, validation logic)
```

---

# 8. Data Fetching & API Workflow (High-Volume Data)

1. **API Interceptors**: Axios or Fetch interceptors MUST handle JWT tokens (injection, automatic refresh) and catch 401/403 responses to trigger logout or redirect.
2. **TanStack Query Strategy**:
   - Use `useQuery` for lists. Always include pagination, sorting, search, and hierarchy context in the QueryKey.
   - Use `useMutation` for form submissions. Implement `onSuccess` invalidation to automatically refresh related data tables.
3. **Data Grids**: Use virtualized tables (TanStack Table with `@tanstack/react-virtual`) for 60fps scrolling on large datasets.

---

# 9. Authentication & RBAC Workflow

1. **Login & Session Flow**: User logs in -> API returns JWT + Role Scope + Hierarchy Context.
2. **State Storage**: Store Auth profile safely (HttpOnly cookies preferred, or Zustand store synced securely).
3. **Route Guards**: Implement `<ProtectedRoute allowedRoles={['Admin', 'Procurement Manager']} />` at the routing layer.
4. **Action-Level Guards**: Use `const { canApprove } = usePermissions('Procurement')` to selectively render action buttons.

---

# 10. Forms, Calculations & Validation Workflow

1. **Dynamic Field Arrays**: Use `useFieldArray` from React Hook Form for adding/removing line items.
2. **Strict Schema (Zod)**: Coerce data types properly (`z.coerce.number()`) before dispatching to API.
3. **Client-Side Calculations**: Line-item totals, taxes, aging MUST use pure utility functions in `src/utils/calculations.ts`. Backend is ultimate truth for financial data.

---

# 11. Performance & Code Splitting Optimization

* **Module Code Splitting**: Lazy load feature modules (`React.lazy`).
* **Component Rendering**: Prevent unnecessary re-renders using uncontrolled inputs via React Hook Form.
* **UX during Loading**: Use Skeleton UI loaders, not global blocking spinners.

---

# 12. End-to-End Feature Development Workflow

1. **Hierarchy & Access Audit**: Determine CRUD permissions per role.
2. **Types & API Layer**: Scaffold DTOs in `/types`, fetchers in `/services`.
3. **Query Hooks**: Build TanStack Query hooks in `/features/<module>/api`.
4. **UI & Forms Construction**: Follow **Responsive Checklist (Section 4)**. Build Zod schemas, React Hook Form, and use `/components/ui`.
5. **Contextual UI Adjustments**: Filter dropdowns and data by user's hierarchy level.
6. **QA**: Verify calculations, table scrolling, route guards, and run the **8-step Responsive Check (Section 4, Step 8)**.

---

# 13. Global Theme Color Change Procedure

When the user requests a **color change**, follow this exact procedure:

```
STEP 1: Edit  src/config/theme.js      → Update the color values
STEP 2: Edit  src/index.css @theme {}  → Mirror the same values as CSS variables
STEP 3: DONE. All components using btn-3d-primary, var(--color-primary-*),
         bg-layout-bg etc. automatically update via the CSS variable cascade.
STEP 4: NEVER search-and-replace hex values in individual component files.
STEP 5: Commit: "chore(theme): update primary color to [new color]"
```

> **Architecture Rule**: If changing a theme color requires editing more than 2 files, the system architecture is broken. The cascade MUST work automatically through CSS variables.
