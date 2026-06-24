# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IEEE CIS VVCE Student Chapter website - a static HTML/CSS/JS website for managing and displaying student chapter events, projects, research papers, committee members, and registrations.

## Architecture

**Type**: Static website (no build tools or frameworks)

**Stack**:
- Vanilla JavaScript (single `app.js` file)
- Tailwind CSS via CDN
- Supabase for backend (database, storage, auth)
- AOS (Animate On Scroll) for animations

**Structure**:
- `index.html` - Homepage with hero, stats, about sections
- `events.html` - Event listings
- `event.html?id={id}` - Individual event detail page
- `register.html?event={id}` - Event registration form (supports individual/team registrations)
- `projects.html` - Student projects showcase
- `research.html` - Research papers
- `resources.html` - Learning resources
- `gallery.html` - Event gallery
- `committee.html` - Committee members with modal popups
- `contact.html` - Contact form
- `admin.html` - Admin dashboard (requires auth)
- `admin-login.html` - Admin authentication
- `app.js` - All JavaScript logic (data loading, forms, auth, etc.)

## Supabase Schema

**Database Tables**:
- `events` - Event listings with lifecycle_stage (upcoming/stop/completed)
- `updates` - Chapter updates/announcements
- `registrations` - Event registrations (individual + team support)
- `projects` - Student project showcases
- `papers` - Research papers
- `resources` - Learning resources
- `committee` - Committee member profiles
- `contact_messages` - Contact form submissions

**Storage Buckets**:
- `event-posters` - Event poster images
- `event-qr` - Payment QR codes
- `gallery` - Gallery images

## Development

**No build process required** - this is a static site.

**To run locally**:
```bash
# Use any static server, e.g.:
python -m http.server 8000
# or
npx serve .
```

**Code Organization in app.js**:
- Database configuration at top (Supabase client)
- `showToast()` - Toast notification helper
- `loadEvents()`, `loadUpdates()`, `loadProjects()`, `loadPapers()`, `loadResources()`, `loadCommittee()` - Data loading functions
- `loadEventDetail()` - Single event page loader
- Form handlers for registration, contact, admin login
- `uploadPoster()`, `uploadQR()` - File upload functions
- Page fade transitions and particle animation

**Design Patterns**:
- Glassmorphism UI: `backdrop-blur-xl bg-white/10 border border-white/20`
- Primary accent: cyan-400/cyan-300
- Dark theme with slate-950 background
- All pages use `pageRoot` div with fade-in transition

**Important Implementation Details**:
- Event lifecycle stages: `upcoming` (registration open), `stop` (registration closed), `completed`
- Events support both individual and team registration modes
- Team registration uses arrays: `team_member_names` and `team_member_usns`
- Paid events support UTR number tracking and payment QR upload
- Admin stats auto-load counts from all tables
- Committee modal uses `openMemberModal()` with member JSON data
