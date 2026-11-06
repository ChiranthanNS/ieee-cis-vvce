// =====================
// SUPABASE CONFIG
// =====================
const SUPABASE_URL = "https://msyblaohdkpztytpbszp.supabase.co"
const SUPABASE_KEY = "sb_publishable_ZtFIWz7_rwHov2Me1cWsHQ_qTw9rH56"

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)


// =====================
// SECURITY: XSS SANITIZER
// Escapes all HTML special characters before injecting any
// database-sourced content into innerHTML. This prevents
// stored XSS attacks where an attacker stores malicious
// <script> or <img onerror=...> payloads in the database.
// =====================
function sanitize(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Safe URL validator — only allow http/https URLs for external links
function safeUrl(url) {
  if (!url) return "#";
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (_) {}
  return "#";
}


// =====================
// TOAST HELPER
// =====================
function showToast(text, ok = true) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = text;
  t.className =
    "fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white transition z-50 " +
    (ok ? "bg-green-600" : "bg-red-600");
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}


// =====================
// MOBILE NAV TOGGLE
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const btn   = document.getElementById("mobileMenuBtn");
  const menu  = document.getElementById("mobileMenu");
  const close = document.getElementById("mobileMenuClose");

  if (btn && menu) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("translate-x-full");
    });
  }
  if (close && menu) {
    close.addEventListener("click", () => {
      menu.classList.add("translate-x-full");
    });
  }
  if (menu) {
    menu.addEventListener("click", (e) => {
      if (e.target === menu) menu.classList.add("translate-x-full");
    });
  }
});


// =====================
// COUNT-UP ANIMATION HELPER
// =====================
function animateCount(el, target) {
  if (!el) return;
  const duration = 1200; // ms
  const start    = parseInt(el.textContent) || 0;
  const diff     = target - start;
  if (diff === 0) return;
  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


// =====================
// HOMEPAGE STATS  (live from Supabase)
// =====================
async function loadStats() {
  const elEvents       = document.getElementById("statEvents");
  const elParticipants = document.getElementById("statParticipants");
  const elResources    = document.getElementById("statResources");
  const elProjects     = document.getElementById("statProjects");

  // Only run on pages that have these elements
  if (!elEvents && !elParticipants && !elResources && !elProjects) return;

  // Fetch all counts in parallel
  const [eventsRes, regRes, resourcesRes, projectsRes] = await Promise.all([
    db.from("events").select("*", { count: "exact", head: true }),
    db.rpc("get_registration_count"),
    db.from("resources").select("*", { count: "exact", head: true }),
    db.from("projects").select("*", { count: "exact", head: true }),
  ]);

  animateCount(elEvents,       eventsRes.count    ?? 0);
  animateCount(elParticipants, Number(regRes.data  ?? 0));
  animateCount(elResources,    resourcesRes.count  ?? 0);
  animateCount(elProjects,     projectsRes.count   ?? 0);
}

loadStats();

// Realtime subscription — re-run loadStats on any table change
const statsChannel = db.channel("stats-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "events" },       () => loadStats())
  .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => loadStats())
  .on("postgres_changes", { event: "*", schema: "public", table: "resources" },    () => loadStats())
  .on("postgres_changes", { event: "*", schema: "public", table: "projects" },     () => loadStats())
  .subscribe();


// =====================
// LOAD UPDATES (homepage)
// =====================
async function loadUpdates() {
  const box = document.getElementById("updates");
  if (!box) return;

  const { data } = await db
    .from("updates")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No updates yet.</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((e, i) => {
    // sanitize() all DB values before inserting into innerHTML
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 90}"
           class="relative backdrop-blur-xl bg-white/10 border border-white/20
                  rounded-2xl p-6 shadow-xl transition duration-300
                  hover:bg-white/15 hover:-translate-y-1">
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0
                    via-cyan-400/10 to-indigo-500/0 opacity-0 hover:opacity-100 transition"></div>
        <div class="relative z-10">
          <h3 class="text-xl font-semibold text-white">${sanitize(e.title)}</h3>
          <p class="mt-4 text-slate-300 leading-relaxed">${sanitize(e.content || e.description || "")}</p>
          <p class="text-xs text-slate-500 mt-3">${sanitize(new Date(e.created_at).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"}))}</p>
        </div>
      </div>`;
  });
}

loadUpdates();

// Realtime — re-render updates when they change
db.channel("updates-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, () => loadUpdates())
  .subscribe();


// =====================
// LOAD EVENTS
// =====================
async function loadEvents() {
  const box = document.getElementById("eventsList");
  if (!box) return;

  // Show a loading skeleton while fetching
  if (box.innerHTML === "") {
    box.innerHTML = `
      <div class="col-span-3 flex justify-center items-center py-16">
        <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>`;
  }

  const { data, error } = await db
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error || !data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400 col-span-3">No events found.</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((e, i) => {
    const title   = sanitize(e.title || "Untitled Event");
    const desc    = sanitize(e.description || "");
    const venue   = sanitize(e.venue || "");
    const date    = sanitize(e.event_date || "");
    const stage   = sanitize(e.lifecycle_stage || "upcoming");
    const mode    = sanitize(e.event_mode || "individual");
    const poster  = safeUrl(e.poster_url);
    const fee     = e.registration_fee != null ? sanitize(String(e.registration_fee)) : "";
    const eventId = sanitize(String(e.id));

    let actionUI = "";
    if (stage === "upcoming") {
      actionUI = `<a href="event.html?id=${eventId}" class="miniBtn">View &amp; Register →</a>`;
    } else if (stage === "stop") {
      actionUI = `<span class="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">Registration Closed</span>`;
    } else {
      actionUI = `<span class="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Event Completed</span>`;
    }

    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 70}"
           class="backdrop-blur-xl bg-white/10 border border-white/20
                  rounded-2xl p-6 shadow-xl flex flex-col">
        ${poster !== "#" ? `<img src="${poster}" class="rounded-xl mb-4 w-full h-48 object-cover" loading="lazy">` : ""}
        <h3 class="text-xl font-semibold text-cyan-300">
          <a href="event.html?id=${eventId}" class="hover:underline">${title}</a>
        </h3>
        <p class="text-slate-400 text-sm mt-2">📅 ${date} • 📍 ${venue}</p>
        <p class="mt-4 text-slate-300 flex-1 line-clamp-3">${desc}</p>
        <div class="mt-4 flex gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs">
            ${mode === "team" ? "Team Event" : "Individual"}
          </span>
          ${fee !== "" ? `<span class="px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-300 text-xs">₹${fee}</span>` : ""}
        </div>
        <div class="mt-5">${actionUI}</div>
      </div>`;
  });
}

loadEvents();

// Realtime — re-render events on any change
db.channel("events-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => loadEvents())
  .subscribe();


// =====================
// EVENT DETAIL PAGE
// =====================
async function loadEventDetail() {
  const box = document.getElementById("eventBox");
  if (!box) return;

  // Validate the ?id= parameter — must be a numeric integer
  const rawId = new URLSearchParams(location.search).get("id");
  const id = rawId && /^\d+$/.test(rawId) ? rawId : null;
  if (!id) { box.innerHTML = `<p class="text-red-400">No valid event ID specified.</p>`; return; }

  box.innerHTML = `<div class="text-slate-400 animate-pulse">Loading event details...</div>`;

  const { data } = await db.from("events").select("*").eq("id", id).single();

  if (!data) {
    box.innerHTML = `<p class="text-red-400">Event not found.</p>`;
    return;
  }

  const mode     = sanitize(data.event_mode || "individual");
  const teamSize = data.team_size || 1;
  const poster   = safeUrl(data.poster_url);
  const eventId  = sanitize(String(data.id));

  box.innerHTML = `
    ${poster !== "#" ? `
      <img src="${poster}"
           onclick="openImgModal('${poster}')"
           class="rounded-2xl mb-6 w-full h-auto object-contain cursor-zoom-in
                  hover:opacity-90 transition max-h-[500px]">` : ""}
    <h2 class="text-3xl font-bold text-cyan-300">${sanitize(data.title)}</h2>
    <p class="mt-4 text-slate-300 leading-relaxed">${sanitize(data.description || "")}</p>
    <div class="mt-6 grid md:grid-cols-2 gap-4">
      <div class="glassCard space-y-2 text-slate-300">
        <p>📅 <span class="text-white">${sanitize(data.event_date || "TBA")}</span></p>
        <p>📍 <span class="text-white">${sanitize(data.venue || "TBA")}</span></p>
        <p>💰 Fee: <span class="text-white">${data.registration_fee ? "₹" + sanitize(String(data.registration_fee)) : "Free"}</span></p>
        <p>👥 Mode: <span class="text-white">${mode === "team" ? `Team (${sanitize(String(teamSize))} members)` : "Individual"}</span></p>
      </div>
    </div>
    ${data.lifecycle_stage === "upcoming" ? `
      <a href="register.html?event=${eventId}" class="proBtn inline-block mt-8">Register Now →</a>
    ` : data.lifecycle_stage === "stop" ? `
      <div class="mt-8 px-6 py-4 rounded-xl bg-yellow-500/20 text-yellow-400 text-center font-semibold">
        ⏸ Registration Closed
      </div>
    ` : `
      <div class="mt-8 px-6 py-4 rounded-xl bg-green-500/20 text-green-400 text-center font-semibold">
        ✅ Event Completed
      </div>
    `}`;  
}

loadEventDetail();

// Realtime — auto-refresh event detail if this event is updated
(async () => {
  const rawId = new URLSearchParams(location.search).get("id");
  const id = rawId && /^\d+$/.test(rawId) ? rawId : null;
  if (!id || !document.getElementById("eventBox")) return;
  db.channel("event-detail-realtime")
    .on("postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `id=eq.${id}` },
        () => loadEventDetail())
    .subscribe();
})();


// =====================
// REGISTRATION FORM SUBMIT
// =====================
const regForm = document.getElementById("regForm");

if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = regForm.querySelector("button");

    // --- HONEYPOT CHECK ---
    // The #hp_website field is hidden via CSS; humans never fill it.
    // If it has a value, this is almost certainly a bot.
    const honeypot = document.getElementById("hp_website");
    if (honeypot && honeypot.value.trim() !== "") {
      showToast("Registration successful! 🎉");  // fool the bot
      regForm.reset();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting...";

    // --- EVENT ID VALIDATION ---
    const rawEventId = new URLSearchParams(location.search).get("event");
    if (!rawEventId || !/^\d+$/.test(rawEventId)) {
      showToast("Invalid event link.", false);
      btn.disabled = false;
      btn.textContent = "Submit Registration";
      return;
    }
    const eventId = Number(rawEventId);

    // --- FIELD COLLECTION ---
    const nameVal   = document.getElementById("name").value.trim();
    const usnVal    = document.getElementById("usn").value.trim();
    const branchVal = document.getElementById("branch").value.trim();
    const yearVal   = document.getElementById("year").value.trim();
    const emailVal  = document.getElementById("email").value.trim();
    const phoneVal  = document.getElementById("phone").value.trim();
    const utrVal    = document.getElementById("utr")?.value.trim() || null;

    // --- FIELD VALIDATION ---
    const emailRegex = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^[+\d\s\-()]{7,20}$/;

    if (nameVal.length < 2 || nameVal.length > 100) {
      showToast("Name must be 2–100 characters.", false);
      btn.disabled = false; btn.textContent = "Submit Registration"; return;
    }
    if (usnVal.length < 2 || usnVal.length > 30) {
      showToast("USN must be 2–30 characters.", false);
      btn.disabled = false; btn.textContent = "Submit Registration"; return;
    }
    if (!emailRegex.test(emailVal)) {
      showToast("Please enter a valid email address.", false);
      btn.disabled = false; btn.textContent = "Submit Registration"; return;
    }
    if (!phoneRegex.test(phoneVal)) {
      showToast("Please enter a valid phone number (7–20 digits).", false);
      btn.disabled = false; btn.textContent = "Submit Registration"; return;
    }
    if (utrVal && (utrVal.length < 5 || utrVal.length > 50)) {
      showToast("UTR/Transaction ID must be 5–50 characters.", false);
      btn.disabled = false; btn.textContent = "Submit Registration"; return;
    }

    // --- BUILD PAYLOAD ---
    const memberNames = [...document.querySelectorAll(".memberName")].map(x => x.value.trim()).filter(Boolean);
    const memberUsns  = [...document.querySelectorAll(".memberUsn")].map(x => x.value.trim()).filter(Boolean);

    const payload = {
      event_id:          eventId,
      leader_name:       nameVal,
      leader_usn:        usnVal,
      leader_branch:     branchVal,
      leader_year:       yearVal,
      leader_email:      emailVal,
      leader_phone:      phoneVal,
      team_member_names: memberNames,
      team_member_usns:  memberUsns,
      is_paid_event:     !!document.getElementById("utr"),
      amount:            null,
      utr_number:        utrVal,
      payment_status:    "pending"
    };

    const { error } = await db.from("registrations").insert([payload]);

    btn.disabled = false;
    btn.textContent = "Submit Registration";

    if (error) {
      if (error.code === "23505") {
        showToast("You have already registered for this event.", false);
      } else {
        showToast("Registration failed. Please check your details and try again.", false);
      }
    } else {
      showToast("Registration successful! 🎉");
      regForm.reset();
    }
  });
}


// =====================
// LOAD PROJECTS
// =====================
async function loadProjects() {
  const box = document.getElementById("projectsList");
  if (!box) return;

  const { data } = await db.from("projects").select("*").order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No projects yet. Check back soon!</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((p, i) => {
    const ghUrl   = safeUrl(p.github_url);
    const demoUrl = safeUrl(p.demo_url);
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 80}" class="glassCard flex flex-col">
        <h3 class="text-xl font-semibold text-cyan-300">${sanitize(p.title)}</h3>
        <p class="mt-3 text-slate-300 flex-1">${sanitize(p.description)}</p>
        <div class="mt-5 flex gap-3 flex-wrap">
          ${ghUrl !== "#" ? `<a href="${ghUrl}" target="_blank" rel="noopener noreferrer" class="miniBtn">GitHub</a>` : ""}
          ${demoUrl !== "#" ? `<a href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="miniBtn">Live Demo</a>` : ""}
        </div>
      </div>`;
  });
}

loadProjects();

// Realtime — auto-refresh projects list
db.channel("projects-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => loadProjects())
  .subscribe();


// =====================
// LOAD PAPERS
// =====================
async function loadPapers() {
  const box = document.getElementById("papersList");
  if (!box) return;

  const { data } = await db.from("papers").select("*").order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No papers yet. Check back soon!</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((p, i) => {
    const paperUrl = safeUrl(p.link);
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 80}" class="glassCard">
        <h3 class="text-xl font-semibold text-cyan-300">${sanitize(p.title)}</h3>
        <p class="mt-4 text-slate-300 leading-relaxed">${sanitize(p.summary)}</p>
        <div class="mt-5 flex justify-between items-center flex-wrap gap-3">
          <span class="text-slate-500 text-sm">By ${sanitize(p.author)}</span>
          ${paperUrl !== "#" ? `<a href="${paperUrl}" target="_blank" rel="noopener noreferrer" class="miniBtn">Read Paper →</a>` : ""}
        </div>
      </div>`;
  });
}

loadPapers();

// Realtime — auto-refresh research papers
db.channel("papers-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "papers" }, () => loadPapers())
  .subscribe();


// =====================
// LOAD RESOURCES
// =====================
async function loadResources() {
  const box = document.getElementById("resourcesList");
  if (!box) return;

  const { data } = await db.from("resources").select("*").order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No resources yet. Check back soon!</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((r, i) => {
    const resUrl = safeUrl(r.url);
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 70}"
           class="glassCard flex justify-between items-start gap-6">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-cyan-300">${sanitize(r.title)}</h3>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs">${sanitize(r.type)}</span>
          <p class="text-slate-300 mt-3">${sanitize(r.description || "")}</p>
        </div>
        ${resUrl !== "#" ? `<a href="${resUrl}" target="_blank" rel="noopener noreferrer" class="miniBtn shrink-0">Open →</a>` : ""}
      </div>`;
  });
}

loadResources();

// Realtime — auto-refresh resources
db.channel("resources-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => loadResources())
  .subscribe();


// =====================
// LOAD COMMITTEE
// =====================
// Member data store — avoids embedding JSON in onclick attributes (XSS risk)
const _memberStore = new Map();

async function loadCommittee() {
  const box = document.getElementById("committeeGrid");
  if (!box) return;

  const { data } = await db.from("committee").select("*").order("display_order", { ascending: true });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No committee members yet.</p>`;
    return;
  }

  _memberStore.clear();
  box.innerHTML = "";
  data.forEach((m, i) => {
    _memberStore.set(i, m);  // store object safely, not in DOM
    const imgUrl = safeUrl(m.image_url) !== "#"
      ? safeUrl(m.image_url)
      : `https://i.pravatar.cc/300?u=${encodeURIComponent(m.name || "member")}`;
    const linkedinUrl = safeUrl(m.linkedin);
    box.innerHTML += `
      <div data-aos="zoom-in" data-aos-delay="${i * 80}"
           class="memberCard cursor-pointer"
           data-member-idx="${i}">
        <img src="${imgUrl}"
             class="avatar" alt="${sanitize(m.name)}" loading="lazy">
        <h3 class="mt-4 font-semibold text-lg">${sanitize(m.name)}</h3>
        <p class="text-cyan-300 text-sm mt-1">${sanitize(m.role)}</p>
        <p class="text-slate-400 text-sm mt-3">${sanitize(m.bio || "")}</p>
        ${linkedinUrl !== "#" ? `<a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"
           class="inline-block mt-4 text-cyan-400 hover:underline text-sm">LinkedIn →</a>` : ""}
      </div>`;
  });

  // Event delegation — no inline onclick with user data
  if (!box.dataset.listenerAdded) {
    box.addEventListener("click", (e) => {
      const card = e.target.closest("[data-member-idx]");
      if (!card) return;
      const idx = parseInt(card.dataset.memberIdx, 10);
      const member = _memberStore.get(idx);
      if (member) openMemberModal(member);
    });
    box.dataset.listenerAdded = "true";
  }
}

loadCommittee();

// Realtime — auto-refresh committee
db.channel("committee-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "committee" }, () => loadCommittee())
  .subscribe();



// =====================
// LOAD GALLERY (from Supabase storage)
// =====================
async function loadGallery() {
  const box = document.getElementById("galleryGrid");
  if (!box) return;

  box.innerHTML = `
    <div class="col-span-3 flex justify-center items-center py-16">
      <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>`;

  const { data, error } = await db.storage.from("gallery").list("", {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" }
  });

  const imageExts = ["jpg","jpeg","png","gif","webp","avif","svg"];

  const images = (data || []).filter(f =>
    imageExts.includes(f.name.split(".").pop().toLowerCase()) &&
    !f.name.startsWith(".")
  );

  if (error || images.length === 0) {
    // fallback static images
    box.innerHTML = `
      <div data-aos="fade-up" class="overflow-hidden rounded-2xl">
        <img src="https://assets.allegiance-educare.com/colleges/1524308583DJI_0170_1024.JPG" class="galImg" alt="VVCE Campus">
      </div>
      <div data-aos="fade-up" data-aos-delay="60" class="overflow-hidden rounded-2xl">
        <img src="https://vvce.ac.in/wp-content/uploads/2025/11/AIoT-2.jpg" class="galImg" alt="AIoT Event">
      </div>
      <div data-aos="fade-up" data-aos-delay="120" class="overflow-hidden rounded-2xl">
        <img src="https://edu.ieee.org/in-reva/wp-content/uploads/sites/33/IEEE-CIS-logo-RGB-300ppi.png" class="galImg" alt="IEEE CIS Logo">
      </div>`;
  } else {
    box.innerHTML = "";
    images.forEach((img, i) => {
      const { data: urlData } = db.storage.from("gallery").getPublicUrl(img.name);
      const pubUrl = safeUrl(urlData.publicUrl);
      if (pubUrl === "#") return;
      box.innerHTML += `
        <div data-aos="fade-up" data-aos-delay="${i * 50}" class="overflow-hidden rounded-2xl">
          <img src="${pubUrl}" class="galImg" alt="${sanitize(img.name)}" loading="lazy">
        </div>`;
    });
  }

  // attach click-to-zoom
  document.querySelectorAll(".galImg").forEach(img => {
    img.onclick = () => openImgModal(img.src);
  });
}

loadGallery();


// =====================
// CONTACT FORM SUBMIT
// =====================
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("contactStatus");
    const btn = contactForm.querySelector("button[type='submit']");

    // --- HONEYPOT CHECK ---
    const honeypot = document.getElementById("hp_website");
    if (honeypot && honeypot.value.trim() !== "") {
      if (status) status.textContent = "✅ Message sent! We'll respond within 24–48 hours.";
      contactForm.reset();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";

    // --- FIELD VALIDATION ---
    const nameVal    = document.getElementById("name").value.trim();
    const emailVal   = document.getElementById("cemail").value.trim();
    const messageVal = document.getElementById("cmessage").value.trim();
    const emailRegex = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

    if (nameVal.length < 2 || nameVal.length > 100) {
      if (status) status.textContent = "❌ Name must be 2–100 characters.";
      btn.disabled = false; btn.textContent = "Send Message"; return;
    }
    if (!emailRegex.test(emailVal)) {
      if (status) status.textContent = "❌ Please enter a valid email address.";
      btn.disabled = false; btn.textContent = "Send Message"; return;
    }
    if (messageVal.length < 10 || messageVal.length > 2000) {
      if (status) status.textContent = "❌ Message must be 10–2000 characters.";
      btn.disabled = false; btn.textContent = "Send Message"; return;
    }

    const { error } = await db.from("contact_messages").insert([{
      name:         nameVal,
      email:        emailVal,
      affiliation:  document.getElementById("caffiliation").value,
      inquiry_type: document.getElementById("ctype").value,
      message:      messageVal
    }]);

    btn.disabled = false;
    btn.textContent = "Send Message";

    if (error) {
      if (status) status.textContent = "❌ Failed to send. Please try again.";
    } else {
      if (status) status.textContent = "✅ Message sent! We'll respond within 24–48 hours.";
      contactForm.reset();
    }
  });
}


// =====================
// COMMITTEE MODAL
// =====================
// Uses textContent (not innerHTML) for all member data to prevent XSS
function openMemberModal(m) {
  const modal = document.getElementById("memberModal");
  if (!modal) return;

  const imgUrl = safeUrl(m.image_url) !== "#"
    ? safeUrl(m.image_url)
    : `https://i.pravatar.cc/300?u=${encodeURIComponent(m.name || "member")}`;

  document.getElementById("modalImg").src = imgUrl;
  // textContent is safe — no HTML parsing, no XSS risk
  document.getElementById("modalName").textContent = m.name || "";
  document.getElementById("modalRole").textContent = m.role || "";
  document.getElementById("modalBio").textContent  = m.bio  || "";

  const link = document.getElementById("modalLinkedin");
  const liUrl = safeUrl(m.linkedin);
  if (liUrl !== "#") {
    link.href = liUrl;
    link.setAttribute("rel", "noopener noreferrer");
    link.classList.remove("hidden");
  } else {
    link.classList.add("hidden");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

const modalCloseBtn = document.getElementById("modalClose");
if (modalCloseBtn) {
  modalCloseBtn.onclick = () => {
    const modal = document.getElementById("memberModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
}

const memberModal = document.getElementById("memberModal");
if (memberModal) {
  memberModal.addEventListener("click", (e) => {
    if (e.target.id === "memberModal") {
      memberModal.classList.add("hidden");
      memberModal.classList.remove("flex");
    }
  });
}


// =====================
// IMAGE ZOOM MODAL
// =====================
// Only allow safe https:// URLs to be set as image src
function openImgModal(src) {
  const m = document.getElementById("imgModal");
  const i = document.getElementById("imgModalSrc");
  if (!m || !i) return;
  const safe = safeUrl(src);
  if (safe === "#") return;
  i.src = safe;
  m.classList.remove("hidden");
  m.classList.add("flex");
}

document.getElementById("imgModal")?.addEventListener("click", () => {
  document.getElementById("imgModal").classList.add("hidden");
  document.getElementById("imgModal").classList.remove("flex");
});


// =====================
// PAGE FADE TRANSITIONS
// =====================
document.addEventListener("click", e => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
  e.preventDefault();
  const root = document.getElementById("pageRoot");
  if (root) root.classList.add("opacity-0");
  setTimeout(() => { window.location = href; }, 300);
});


// =====================
// FIX BACK BUTTON BLANK PAGE
// =====================
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.location.reload();
});


// =====================
// ADMIN AUTH & DASHBOARD LOGIC
// =====================

// Admin Login Form Handler
const adminLoginForm = document.getElementById("loginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");
    const msgEl = document.getElementById("msg");
    const btn = document.getElementById("loginBtn");

    if (!emailEl || !passEl) return;
    if (btn) { btn.disabled = true; btn.textContent = "Authenticating..."; }

    const { data, error } = await db.auth.signInWithPassword({
      email: emailEl.value.trim(),
      password: passEl.value,
    });

    if (btn) { btn.disabled = false; btn.textContent = "Sign In to Console"; }

    if (error) {
      if (msgEl) {
        msgEl.textContent = "❌ " + (error.message || "Invalid credentials.");
        msgEl.className = "mt-4 text-xs text-center font-medium text-red-400";
      }
    } else if (data.session) {
      if (msgEl) {
        msgEl.textContent = "✅ Success! Redirecting...";
        msgEl.className = "mt-4 text-xs text-center font-medium text-green-400";
      }
      setTimeout(() => { window.location.href = "admin.html"; }, 500);
    }
  });
}

// Master Admin Dashboard Loader
async function loadAdminDashboard() {
  const statEventsEl = document.getElementById("statEvents");
  const statRegsEl   = document.getElementById("statRegs");
  const statUpEl     = document.getElementById("statUpdates");
  const statContactEl= document.getElementById("statContact");
  const eventsListEl = document.getElementById("adminEventsList");
  const upListEl     = document.getElementById("adminUpdatesList");
  const regsTableEl  = document.getElementById("adminRegsTable");

  if (!statEventsEl && !regsTableEl) return; // not on admin page

  // 1. Fetch live metrics
  const [eventsRes, regsRes, updatesRes, contactRes] = await Promise.all([
    db.from("events").select("*", { count: "exact" }).order("event_date", { ascending: false }),
    db.from("registrations").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    db.from("updates").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    db.from("contact_messages").select("*", { count: "exact" }),
  ]);

  if (statEventsEl)  statEventsEl.textContent  = eventsRes.count  ?? 0;
  if (statRegsEl)    statRegsEl.textContent    = regsRes.count    ?? 0;
  if (statUpEl)      statUpEl.textContent      = updatesRes.count ?? 0;
  if (statContactEl) statContactEl.textContent = contactRes.count ?? 0;

  // 2. Render Existing Events List
  if (eventsListEl) {
    const events = eventsRes.data || [];
    if (events.length === 0) {
      eventsListEl.innerHTML = `<p class="text-slate-400 text-xs">No events published yet.</p>`;
    } else {
      eventsListEl.innerHTML = "";
      events.forEach((evt) => {
        const stage = evt.lifecycle_stage || "upcoming";
        const stageBadge = stage === "upcoming"
          ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300">Open</span>`
          : stage === "stop"
          ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">Closed</span>`
          : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">Completed</span>`;

        eventsListEl.innerHTML += `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-white text-sm">${sanitize(evt.title)}</h4>
                ${stageBadge}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">📅 ${sanitize(evt.event_date || "TBA")} • 📍 ${sanitize(evt.venue || "VVCE")} • Fee: ₹${evt.registration_fee ?? 0}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="updateEventStage(${evt.id}, 'upcoming')" class="px-2.5 py-1 rounded text-xs bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition">Open</button>
              <button onclick="updateEventStage(${evt.id}, 'stop')" class="px-2.5 py-1 rounded text-xs bg-white/5 hover:bg-yellow-500/20 text-slate-300 hover:text-yellow-300 transition">Close</button>
              <button onclick="updateEventStage(${evt.id}, 'completed')" class="px-2.5 py-1 rounded text-xs bg-white/5 hover:bg-green-500/20 text-slate-300 hover:text-green-300 transition">Complete</button>
              <button onclick="deleteEvent(${evt.id}, '${sanitize(evt.title)}')" class="px-2.5 py-1 rounded text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 transition">Delete</button>
            </div>
          </div>`;
      });
    }
  }

  // 3. Render Updates List
  if (upListEl) {
    const updates = updatesRes.data || [];
    if (updates.length === 0) {
      upListEl.innerHTML = `<p class="text-slate-400 text-xs">No active notices.</p>`;
    } else {
      upListEl.innerHTML = "";
      updates.forEach((u) => {
        upListEl.innerHTML += `
          <div class="flex items-start justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
            <div>
              <h5 class="font-bold text-white">${sanitize(u.title)}</h5>
              <p class="text-slate-300 text-[11px] mt-0.5 line-clamp-2">${sanitize(u.content || u.description || "")}</p>
            </div>
            <button onclick="deleteUpdate(${u.id})" class="text-red-400 hover:text-red-300 p-1">✕</button>
          </div>`;
      });
    }
  }

  // 4. Render Registrations Table
  if (regsTableEl) {
    const regs = regsRes.data || [];
    window._adminRegistrationsCache = regs; // cache for CSV export
    if (regs.length === 0) {
      regsTableEl.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-500">No participant registrations recorded yet.</td></tr>`;
    } else {
      regsTableEl.innerHTML = "";
      regs.forEach((r) => {
        const teamInfo = r.team_member_names && r.team_member_names.length > 0
          ? r.team_member_names.map((n, i) => `${sanitize(n)} (${sanitize(r.team_member_usns?.[i] || '')})`).join("<br>")
          : `<span class="text-slate-500">Solo</span>`;

        const feeInfo = r.is_paid_event
          ? `<span class="text-green-400 font-semibold">₹${r.amount ?? 0}</span><br><span class="text-slate-400 font-mono text-[10px]">UTR: ${sanitize(r.utr_number || "Pending")}</span>`
          : `<span class="text-slate-500">Free</span>`;

        regsTableEl.innerHTML += `
          <tr class="hover:bg-white/5 transition">
            <td class="p-3 font-mono text-cyan-400 font-bold">#${r.event_id}</td>
            <td class="p-3 font-semibold text-white">${sanitize(r.leader_name)}</td>
            <td class="p-3 font-mono text-cyan-300">${sanitize(r.leader_usn)}</td>
            <td class="p-3">${sanitize(r.leader_branch || "")} (${sanitize(r.leader_year || "")})</td>
            <td class="p-3">${sanitize(r.leader_email || "")}<br><span class="text-slate-500 text-[11px]">${sanitize(r.leader_phone || "")}</span></td>
            <td class="p-3 text-[11px] leading-tight">${teamInfo}</td>
            <td class="p-3">${feeInfo}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.payment_status === 'confirmed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}">
                ${sanitize(r.payment_status || "pending")}
              </span>
            </td>
          </tr>`;
      });
    }
  }
}

// Admin Stage Switcher
window.updateEventStage = async function (id, stage) {
  const { error } = await db.from("events").update({ lifecycle_stage: stage, registration_open: stage === "upcoming" }).eq("id", id);
  if (error) showToast("Failed to update status", false);
  else { showToast(`Event marked as ${stage}`); loadAdminDashboard(); }
};

// Admin Delete Event
window.deleteEvent = async function (id, title) {
  if (!confirm(`Delete event "${title}"?`)) return;
  const { error } = await db.from("events").delete().eq("id", id);
  if (error) showToast("Failed to delete event", false);
  else { showToast("Event deleted"); loadAdminDashboard(); }
};

// Admin Delete Update
window.deleteUpdate = async function (id) {
  const { error } = await db.from("updates").delete().eq("id", id);
  if (error) showToast("Failed to delete update", false);
  else { showToast("Update deleted"); loadAdminDashboard(); }
};

// Admin Create Event Form Submit
const adminEventForm = document.getElementById("adminEventForm");
if (adminEventForm) {
  adminEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = adminEventForm.querySelector("button[type='submit']");
    if (btn) { btn.disabled = true; btn.textContent = "Publishing Event..."; }

    const title = document.getElementById("etitle").value.trim();
    const description = document.getElementById("edesc").value.trim();
    const date = document.getElementById("edate").value;
    const venue = document.getElementById("evenue").value.trim();
    const mode = document.getElementById("eventMode").value;
    const teamSize = mode === "team" ? Number(document.getElementById("teamSize")?.value || 2) : null;
    const fee = Number(document.getElementById("regFee")?.value || 0);
    const posterUrl = document.getElementById("posterUrl")?.value.trim() || null;
    const qrUrl = document.getElementById("qrUrl")?.value.trim() || null;

    const payload = {
      title,
      description,
      event_date: date,
      venue,
      event_mode: mode,
      team_size: teamSize,
      registration_fee: fee,
      poster_url: posterUrl,
      payment_qr_url: qrUrl,
      lifecycle_stage: "upcoming",
      registration_open: true,
    };

    const { error } = await db.from("events").insert([payload]);

    if (btn) { btn.disabled = false; btn.textContent = "Publish Event"; }

    if (error) {
      showToast("Error creating event: " + error.message, false);
    } else {
      showToast("Event published successfully! 🎉");
      adminEventForm.reset();
      loadAdminDashboard();
    }
  });
}

// Admin Publish Update Form Submit
const adminUpdateForm = document.getElementById("adminUpdateForm");
if (adminUpdateForm) {
  adminUpdateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("utitle").value.trim();
    const content = document.getElementById("ucontent").value.trim();
    if (!title || !content) return;

    const { error } = await db.from("updates").insert([{ title, content }]);
    if (error) {
      showToast("Failed to publish notice", false);
    } else {
      showToast("Notice broadcast to homepage!");
      adminUpdateForm.reset();
      loadAdminDashboard();
    }
  });
}

// 1-Click Export Registrations to CSV
const exportCsvBtn = document.getElementById("exportCsvBtn");
if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    const list = window._adminRegistrationsCache || [];
    if (list.length === 0) {
      showToast("No registrations to export", false);
      return;
    }

    const headers = ["Registration ID", "Event ID", "Leader Name", "USN", "Branch", "Year", "Email", "Phone", "Team Members", "Team USNs", "Paid Event", "Amount", "UTR", "Payment Status", "Date"];
    const rows = list.map(r => [
      r.id,
      r.event_id,
      `"${(r.leader_name || '').replace(/"/g, '""')}"`,
      r.leader_usn || '',
      `"${(r.leader_branch || '').replace(/"/g, '""')}"`,
      r.leader_year || '',
      r.leader_email || '',
      r.leader_phone || '',
      `"${(r.team_member_names || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.team_member_usns || []).join('; ').replace(/"/g, '""')}"`,
      r.is_paid_event ? "Yes" : "No",
      r.amount ?? 0,
      r.utr_number || '',
      r.payment_status || 'pending',
      r.created_at || ''
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ieee-cis-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast("Downloaded registrations CSV! 📥");
  });
}
