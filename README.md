# IEEE CIS VVCE Student Chapter Platform

Official web portal for the **IEEE Computational Intelligence Society (CIS) Student Chapter** at **Vidyavardhaka College of Engineering (VVCE), Mysuru**.

Built with **React 18, Vite, TypeScript, Tailwind CSS**, and **Supabase Realtime (WebSockets)**, architected with strict enterprise-grade security hardening and an ultra-simple 3-folder structure.

---

## 📁 Simple 3-Folder Structure

All the website source code lives in `src/`, organized into just **3 clean folders**:

```text
ieee-cis-site/
│
├── 📂 src/
│   │
│   ├── 📂 pages/                  <-- 1. EVERY WEB PAGE (Directly matches the site!)
│   │   ├── HomePage.tsx           <-- Home page (Hero, Live Stats, About, Updates feed)
│   │   ├── EventsPage.tsx         <-- Events catalog & filter (upcoming / closed / completed)
│   │   ├── EventDetailPage.tsx    <-- Single event view, guidelines & poster
│   │   ├── RegisterPage.tsx       <-- Event registration (individual/team, fee calc, payment QR)
│   │   ├── ProjectsPage.tsx       <-- Student AI/ML projects showcase
│   │   ├── ResearchPage.tsx       <-- Research papers & publications
│   │   ├── ResourcesPage.tsx      <-- Study materials, cheat sheets & roadmaps
│   │   ├── GalleryPage.tsx        <-- Photo gallery with image zoom modal
│   │   ├── CommitteePage.tsx      <-- Executive committee team & modal bio popups
│   │   ├── ContactPage.tsx        <-- Contact form with anti-bot defense
│   │   ├── AdminLoginPage.tsx     <-- Admin login screen
│   │   └── AdminDashboardPage.tsx <-- Full organizer control center & CSV export
│   │
│   ├── 📂 components/             <-- 2. REUSABLE HTML BUILDING BLOCKS
│   │   ├── Navbar.tsx             <-- Header navigation with pulsing live WebSocket beacon
│   │   ├── Footer.tsx             <-- Bottom footer with contact info & address
│   │   ├── EventCard.tsx          <-- Event card design
│   │   ├── StatCard.tsx           <-- Animated live counter card
│   │   ├── Honeypot.tsx           <-- Invisible security trap that catches bots & hackers
│   │   ├── RealtimeIndicator.tsx  <-- Live sync health status indicator
│   │   ├── ParticleBackground.tsx <-- Ambient animated glowing particles
│   │   ├── SocialFloat.tsx        <-- Floating LinkedIn & Instagram links
│   │   ├── BrandIcons.tsx         <-- Crisp SVG icons (LinkedIn, Instagram, GitHub)
│   │   ├── ImageModal.tsx         <-- Lightbox popup for posters and photos
│   │   ├── MemberModal.tsx        <-- Popup modal for committee member profiles
│   │   └── Toast.tsx              <-- Popup notifications (success/error alerts)
│   │
│   ├── 📂 lib/                    <-- 3. CORE LOGIC & SECURITY TOOLS
│   │   ├── supabase.ts            <-- Database & Realtime WebSocket connection
│   │   ├── security.ts            <-- Anti-hack shields (XSS filter, safeUrl, Rate limiter)
│   │   ├── hooks.ts               <-- Live auto-refresh hooks & admin session manager
│   │   └── types.ts               <-- TypeScript data shapes for events, papers, etc.
│   │
│   ├── App.tsx                    <-- Website router (HashRouter: zero 404s on refresh)
│   ├── index.css                  <-- Global styling (Tailwind CSS utility classes)
│   └── main.tsx                   <-- Application bootstrap
│
├── 📂 public/                     <-- Clean public static folder (Only 2 files!)
│   ├── 404.html                   <-- SPA fallback for GitHub Pages / static hosting
│   └── _headers                   <-- Enterprise security headers (CSP, Anti-Clickjacking)
│
├── index.html                     <-- HTML entry point
├── package.json                   <-- Dependencies (0 vulnerabilities)
├── README.md                      <-- Project documentation & guide
├── tailwind.config.js             <-- Tailwind CSS colors, fonts & theme config
├── tsconfig.json                  <-- TypeScript compiler settings
└── vite.config.ts                 <-- Vite build setup
```

---

## 🛠️ "Where Do I Edit...?" Cheat Sheet

| To change... | Open this file: | What you will see: |
|---|---|---|
| **Home page title, hero, or intro** | [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) | `<h1>`, `<p>`, buttons and hero section |
| **Top Navigation Menu items** | [`src/components/Navbar.tsx`](src/components/Navbar.tsx) | Array of links (`navLinks`) with names and paths |
| **Footer email or address** | [`src/components/Footer.tsx`](src/components/Footer.tsx) | Address text and `mailto:ieee-cis@vvce.ac.in` |
| **Colors, fonts, or styling** | [`src/index.css`](src/index.css) | Standard CSS rules and Tailwind glassmorphism styles |
| **Events page header or text** | [`src/pages/EventsPage.tsx`](src/pages/EventsPage.tsx) | Filter bar and event list layout |
| **Registration form fields** | [`src/pages/RegisterPage.tsx`](src/pages/RegisterPage.tsx) | Form `<input>` elements for USN, branch, phone, etc. |
| **Social media links** | [`src/components/SocialFloat.tsx`](src/components/SocialFloat.tsx) | LinkedIn and Instagram URL links |

---

## ⚡ Real-Time Auto-Updates (Zero-Reload)

- **Supabase Realtime Engine**: All 8 content tables (`events`, `updates`, `projects`, `papers`, `resources`, `committee`, `registrations`, `contact_messages`) are bound to Supabase Realtime WebSocket publications.
- **Instant Synchronization**: When organizers add/edit/delete an event, publish an announcement, or modify a registration, all active browser sessions update instantaneously without page reloads.
- **Animated Live Counters**: Homepage metric cards smoothly count up to exact database statistics in real-time.
- **Live Sync Beacon**: Pulsing real-time connection badge confirms active WebSocket health to users.

---

## 🛡️ Anti-Hack & Security Hardening

- **XSS Immunity**: React JSX strictly escapes all data by default. Custom `safeUrl()` protocol validators block `javascript:`, `data:`, and `vbscript:` vectors across all hyperlinks, poster images, and payment QR codes.
- **Row-Level Security (RLS)**: Active across all 8 PostgreSQL tables. Public anonymous visitors can only read public tables and insert registrations/messages. Private registrant details (USNs, phone numbers, emails, UTRs) are protected and only accessible to authenticated organizers.
- **Database Function Hardening**: `public.get_registration_count()` function has its `search_path` strictly locked to `public`, mitigating mutable search path hijacking.
- **Anti-Bot Honeypot Defense**: Forms feature invisible honeypot trap fields (`tabindex="-1"`, hidden off-screen) alongside a minimum human submission speed timer (1.2s minimum) to discard automated scraper spam.
- **Client-Side Rate Limiting**: Throttles registration and contact form submissions to prevent denial-of-service spam floods.
- **HTTP Security Headers**: Complete Content-Security-Policy (CSP), `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff` (anti-MIME-sniffing), and `Referrer-Policy: strict-origin-when-cross-origin`.
- **0 Vulnerabilities**: All npm dependencies audited with **0 vulnerabilities**.

---

## 🚀 Running & Deploying

### Development Mode
```bash
npm run dev
```
Opens `http://localhost:3000` with instant hot-reloading.

### Production Build
```bash
npm run build
```
Creates the optimized static distribution in `dist/`.

### Automated GitHub Pages Deployment
Every push to `main` automatically triggers the included GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) to build and publish your website live to GitHub Pages.

---

## 📜 License
Licensed under the [MIT License](LICENSE). &copy; 2026 IEEE CIS VVCE Student Chapter.
