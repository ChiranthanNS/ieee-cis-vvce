# IEEE CIS VVCE Student Chapter — Enhanced React Platform

Official web portal for the **IEEE Computational Intelligence Society (CIS) Student Chapter** at **Vidyavardhaka College of Engineering (VVCE), Mysuru**.

Modernized with **React 18, Vite, TypeScript, Tailwind CSS**, and **Supabase Realtime (WebSockets)**, architected with strict enterprise-grade security hardening against all common web vulnerabilities.

> 💡 **New to React or prefer simple HTML/CSS?**
> Read our beginner-friendly [**Project Guide & File Structure (PROJECT_STRUCTURE.md)**](PROJECT_STRUCTURE.md) to easily find and edit any page, understand the directory map, and learn how the live auto-updates and anti-hack systems work!

---

## 🚀 Key Enhancements & Features

### 1. ⚡ Real-Time Auto-Updates (Zero-Reload WebSockets)
- **Supabase Realtime Engine**: All content tables (`events`, `updates`, `projects`, `papers`, `resources`, `committee`, `registrations`, `contact_messages`) are bound to Supabase Realtime WebSocket publications.
- **Instant Client Synchronization**: When organizers add an event, publish an announcement, or modify a registration, all active browser sessions update instantaneously without page reloads.
- **Animated Live Counters**: Homepage metric cards smoothly count up to exact database statistics in real-time.
- **Live Sync Beacon**: Pulsing real-time connection badge confirms active WebSocket health to users.

### 2. 🛡️ Comprehensive Security Hardening & Zero-Vulnerability Architecture
- **XSS Immunity**: React JSX strictly escapes all data by default. Custom `safeUrl()` protocol validators block `javascript:`, `data:`, and `vbscript:` vectors across all hyperlinks, poster images, and payment QR codes.
- **Row-Level Security (RLS)**: Active across all 8 PostgreSQL tables. Public anonymous visitors can only read public tables and insert registrations/messages. Private registrant details (USNs, phone numbers, emails, UTRs) are protected and only accessible to authenticated organizers.
- **Database Function Hardening**: `public.get_registration_count()` function has its `search_path` strictly locked to `public`, mitigating mutable search path hijacking.
- **Anti-Bot Honeypot Defense**: Forms feature invisible honeypot trap fields (`tabindex="-1"`, hidden off-screen) alongside a minimum human submission speed timer (1.2s minimum) to discard automated scraper spam.
- **Client-Side Rate Limiting**: Throttles registration and contact form submissions to prevent denial-of-service spam floods.
- **HTTP Security Headers**: Complete Content-Security-Policy (CSP), `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff` (anti-MIME-sniffing), and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Patched Dependency Tree**: All npm dependencies audited with **0 vulnerabilities**.

### 3. 📱 Modern Glassmorphic Dark-Tech UI
- Tailored for IEEE CIS branding with glowing cyan accents (`#22d3ee`), ambient blurred indigo spheres, and an interactive HTML5 particle canvas.
- Fully responsive across mobile, tablet, laptop, and ultra-wide displays with accessible mobile drawer navigation.
- Accessible modal lightboxes for committee leadership profiles and high-resolution event posters.

### 4. 🎛️ Protected Administrator Console (`/#/admin`)
- Secure authentication via Supabase Auth.
- **Event Lifecycle Manager**: Toggle events between `Upcoming` (open), `Closed`, and `Completed` in real-time.
- **Live Announcement Broadcaster**: Publish notices and hackathon updates directly to the homepage feed.
- **Registrations Manager**: Search, review, and toggle payment status for participants.
- **One-Click CSV Export**: Instant spreadsheet download for on-ground event desk check-ins.
- **Security Health Auditor**: Visual verification of active RLS policies and connection health.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool & Bundler** | Vite 6 (Code-split vendor chunks) |
| **Styling & Effects** | Tailwind CSS + Canvas Particles + Confetti |
| **Routing** | React Router v7 (HashRouter for GitHub Pages/Vercel zero-404 compatibility) |
| **Backend & Database** | Supabase PostgreSQL + Row-Level Security (RLS) |
| **Realtime Engine** | Supabase WebSockets (`supabase_realtime`) |
| **Icons** | Lucide React + Custom Brand SVGs |

---

## 📦 Getting Started Locally

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24)
- npm `v9+` or `v11+`

### Installation
```bash
# Clone the repository
git clone https://github.com/ChiranthanNS/ieee-cis-vvce.git
cd ieee-cis-vvce

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build for Production
```bash
npm run build
```
Compiled production-ready assets will be created in the `dist/` directory.

---

## 🚀 Deployment

### GitHub Pages
1. In repository settings, navigate to **Pages**.
2. Select **GitHub Actions** or set source to deploy from the `dist/` branch/directory.
3. Because the platform uses `HashRouter` and includes `public/404.html`, deep links and browser refreshes work with zero 404 errors.

### Vercel / Netlify
- Configuration files `vercel.json` and `public/_headers` are already included with pre-configured CSP and security headers.
- Build command: `npm run build`
- Output directory: `dist`

---

## 🔒 Security Policy

If you discover a potential vulnerability, please report it privately to `ieee-cis@vvce.ac.in`. All reports are reviewed promptly by the chapter technical committee.

---

## 📜 License
Licensed under the [MIT License](LICENSE). &copy; 2026 IEEE CIS VVCE Student Chapter.
