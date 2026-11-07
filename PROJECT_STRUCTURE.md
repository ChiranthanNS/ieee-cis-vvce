# Project Guide & Simplified File Structure

> **Welcome!** If you know basic HTML and CSS, this guide is written specifically for you. It explains how this website is organized into just **3 simple folders**, where to find and edit any page, and how the automatic live updates and anti-hack systems work.

---

## 🧭 The Streamlined 3-Folder Structure

All the website code lives in `src/`, organized into just **3 clean folders**:

```text
ieee-cis-site/
│
├── 📂 src/
│   │
│   ├── 📂 pages/                  <-- 1. EVERY WEB PAGE (Directly matches the website!)
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
│   │   └── AdminDashboardPage.tsx <-- Organizer control center & 1-click CSV export
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
├── README.md                      <-- Project documentation
└── PROJECT_STRUCTURE.md           <-- This beginner-friendly guide
```

---

## 🛠️ "Where Do I Edit...?" Cheat Sheet

| To change... | Open this file | What is inside: |
|---|---|---|
| **Home page title, hero, or intro** | [`src/pages/HomePage.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/pages/HomePage.tsx) | `<h1>`, `<p>`, buttons and hero section |
| **Top Navigation Menu items** | [`src/components/Navbar.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/components/Navbar.tsx) | Array of links (`navLinks`) with names and paths |
| **Footer email or address** | [`src/components/Footer.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/components/Footer.tsx) | Address text and `mailto:ieee-cis@vvce.ac.in` |
| **Colors, fonts, or styling** | [`src/index.css`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/index.css) | Standard CSS rules and Tailwind glassmorphism styles |
| **Events page header or text** | [`src/pages/EventsPage.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/pages/EventsPage.tsx) | Filter bar and event list layout |
| **Registration form fields** | [`src/pages/RegisterPage.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/pages/RegisterPage.tsx) | Form `<input>` elements for USN, branch, phone, etc. |
| **Social media links** | [`src/components/SocialFloat.tsx`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/components/SocialFloat.tsx) | LinkedIn and Instagram URL links |

---

## ⚡ How Automatic Real-Time Updates Work

1. When a visitor opens the website, `src/lib/hooks.ts` establishes a secure WebSocket connection to your Supabase PostgreSQL database.
2. When organizers create an event, close registration, publish an announcement, or confirm a payment in the Admin Dashboard, Supabase **broadcasts the change instantly**.
3. React catches the broadcast and updates the screen within milliseconds. **Nobody has to reload or refresh!**
4. The green pulsing badge in the top navbar confirms that live real-time synchronization is active.

---

## 🛡️ Anti-Hack & Security System Guide

Your website is fortified against all common web attacks:

1. **Row-Level Security (RLS) on Database**:
   - Hackers cannot read sensitive student registration information (USNs, phone numbers, email addresses, payment UTR numbers). Only logged-in chapter admins have permission to view them.
   - Public visitors only have permission to view public events, announcements, and submit registrations.
2. **XSS (Cross-Site Scripting) Immunity**:
   - React automatically escapes any dynamic text before rendering it.
   - All links and poster images run through `safeUrl()` in [`src/lib/security.ts`](file:///c:/Users/chira/OneDrive/Desktop/Destop%20Files/ieee-cis-site/src/lib/security.ts), blocking `javascript:`, `data:`, `vbscript:`, and protocol-relative `//` exploit payloads.
3. **Anti-Bot Honeypot Traps**:
   - The registration and contact forms contain invisible trap fields (`<Honeypot />`) that humans cannot see or click.
   - Automated hacking bots blindly fill every form field. When the honeypot field is filled, the submission is silently discarded.
   - A minimum 1.2-second human submission speed check blocks automated fast-injection scripts.
4. **Anti-Spam & DoS Rate Limiting**:
   - Rapid-fire submissions from the same browser session are throttled.
5. **Reverse Tabnabbing Defense**:
   - Every external link (`target="_blank"`) has `rel="noopener noreferrer"` attached, preventing malicious external sites from hijacking the parent window.
6. **Strict Content Security Policy (CSP)**:
   - Configured in `index.html`, `public/_headers`, and `vercel.json`.
   - Prevents clickjacking (`frame-ancestors 'none'`, `X-Frame-Options: DENY`) and MIME type sniffing (`X-Content-Type-Options: nosniff`).
7. **0 Vulnerabilities**:
   - Built on audited dependencies (`npm audit` reports **0 vulnerabilities**).

---

## 🚀 How to Run the Website

### Running on your computer (Development):
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. Any change you save in `src/` appears instantly on screen!

### Building for production (Deploying):
```bash
npm run build
```
This creates the ready-to-deploy static website in the `dist/` folder.
