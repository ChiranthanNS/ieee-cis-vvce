// =====================
// SUPABASE CONFIG
// =====================
const SUPABASE_URL = "https://msyblaohdkpztytpbszp.supabase.co"
const SUPABASE_KEY = "sb_publishable_ZtFIWz7_rwHov2Me1cWsHQ_qTw9rH56"

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)


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
    db.from("registrations").select("*", { count: "exact", head: true }),
    db.from("resources").select("*", { count: "exact", head: true }),
    db.from("projects").select("*", { count: "exact", head: true }),
  ]);

  animateCount(elEvents,       eventsRes.count    ?? 0);
  animateCount(elParticipants, regRes.count        ?? 0);
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
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 90}"
           class="relative backdrop-blur-xl bg-white/10 border border-white/20
                  rounded-2xl p-6 shadow-xl transition duration-300
                  hover:bg-white/15 hover:-translate-y-1">
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0
                    via-cyan-400/10 to-indigo-500/0 opacity-0 hover:opacity-100 transition"></div>
        <div class="relative z-10">
          <h3 class="text-xl font-semibold text-white">${e.title}</h3>
          <p class="mt-4 text-slate-300 leading-relaxed">${e.content || e.description || ""}</p>
          <p class="text-xs text-slate-500 mt-3">${new Date(e.created_at).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</p>
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
    const title  = e.title || "Untitled Event";
    const desc   = e.description || "";
    const venue  = e.venue || "";
    const date   = e.event_date || "";
    const stage  = e.lifecycle_stage || "upcoming";
    const mode   = e.event_mode || "individual";
    const poster = e.poster_url || "";
    const fee    = e.registration_fee ?? "";

    let actionUI = "";
    if (stage === "upcoming") {
      actionUI = `<a href="event.html?id=${e.id}" class="miniBtn">View &amp; Register →</a>`;
    } else if (stage === "stop") {
      actionUI = `<span class="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">Registration Closed</span>`;
    } else {
      actionUI = `<span class="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Event Completed</span>`;
    }

    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 70}"
           class="backdrop-blur-xl bg-white/10 border border-white/20
                  rounded-2xl p-6 shadow-xl flex flex-col">
        ${poster ? `<img src="${poster}" class="rounded-xl mb-4 w-full h-48 object-cover" loading="lazy">` : ""}
        <h3 class="text-xl font-semibold text-cyan-300">
          <a href="event.html?id=${e.id}" class="hover:underline">${title}</a>
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

  const id = new URLSearchParams(location.search).get("id");
  if (!id) { box.innerHTML = `<p class="text-red-400">No event ID specified.</p>`; return; }

  box.innerHTML = `<div class="text-slate-400 animate-pulse">Loading event details...</div>`;

  const { data } = await db.from("events").select("*").eq("id", id).single();

  if (!data) {
    box.innerHTML = `<p class="text-red-400">Event not found.</p>`;
    return;
  }

  const mode     = data.event_mode || "individual";
  const teamSize = data.team_size || 1;

  box.innerHTML = `
    ${data.poster_url ? `
      <img src="${data.poster_url}"
           onclick="openImgModal('${data.poster_url}')"
           class="rounded-2xl mb-6 w-full h-auto object-contain cursor-zoom-in
                  hover:opacity-90 transition max-h-[500px]">` : ""}
    <h2 class="text-3xl font-bold text-cyan-300">${data.title}</h2>
    <p class="mt-4 text-slate-300 leading-relaxed">${data.description || ""}</p>
    <div class="mt-6 grid md:grid-cols-2 gap-4">
      <div class="glassCard space-y-2 text-slate-300">
        <p>📅 <span class="text-white">${data.event_date || "TBA"}</span></p>
        <p>📍 <span class="text-white">${data.venue || "TBA"}</span></p>
        <p>💰 Fee: <span class="text-white">${data.registration_fee ? "₹" + data.registration_fee : "Free"}</span></p>
        <p>👥 Mode: <span class="text-white">${mode === "team" ? `Team (${teamSize} members)` : "Individual"}</span></p>
      </div>
    </div>
    ${data.lifecycle_stage === "upcoming" ? `
      <a href="register.html?event=${data.id}" class="proBtn inline-block mt-8">Register Now →</a>
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
  const id = new URLSearchParams(location.search).get("id");
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
    btn.disabled = true;
    btn.textContent = "Submitting...";

    const eventId = new URLSearchParams(location.search).get("event");
    if (!eventId) { alert("Invalid event link."); btn.disabled = false; return; }

    const memberNames = [...document.querySelectorAll(".memberName")].map(x => x.value.trim()).filter(Boolean);
    const memberUsns  = [...document.querySelectorAll(".memberUsn")].map(x => x.value.trim()).filter(Boolean);

    const payload = {
      event_id:          Number(eventId),
      leader_name:       document.getElementById("name").value,
      leader_usn:        document.getElementById("usn").value,
      leader_branch:     document.getElementById("branch").value,
      leader_year:       document.getElementById("year").value,
      leader_email:      document.getElementById("email").value,
      leader_phone:      document.getElementById("phone").value,
      team_member_names: memberNames,
      team_member_usns:  memberUsns,
      is_paid_event:     !!document.getElementById("utr"),
      amount:            null,
      utr_number:        document.getElementById("utr")?.value || null,
      payment_status:    "pending"
    };

    const { error } = await db.from("registrations").insert([payload]);

    btn.disabled = false;
    btn.textContent = "Submit Registration";

    if (error) {
      console.error("Registration error:", error);
      showToast("Registration failed. Please try again.", false);
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
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 80}" class="glassCard flex flex-col">
        <h3 class="text-xl font-semibold text-cyan-300">${p.title}</h3>
        <p class="mt-3 text-slate-300 flex-1">${p.description}</p>
        <div class="mt-5 flex gap-3 flex-wrap">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="miniBtn">GitHub</a>` : ""}
          ${p.demo_url   ? `<a href="${p.demo_url}"   target="_blank" class="miniBtn">Live Demo</a>` : ""}
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
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 80}" class="glassCard">
        <h3 class="text-xl font-semibold text-cyan-300">${p.title}</h3>
        <p class="mt-4 text-slate-300 leading-relaxed">${p.summary}</p>
        <div class="mt-5 flex justify-between items-center flex-wrap gap-3">
          <span class="text-slate-500 text-sm">By ${p.author}</span>
          ${p.link ? `<a href="${p.link}" target="_blank" class="miniBtn">Read Paper →</a>` : ""}
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
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i * 70}"
           class="glassCard flex justify-between items-start gap-6">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-cyan-300">${r.title}</h3>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs">${r.type}</span>
          <p class="text-slate-300 mt-3">${r.description || ""}</p>
        </div>
        <a href="${r.url}" target="_blank" class="miniBtn shrink-0">Open →</a>
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
async function loadCommittee() {
  const box = document.getElementById("committeeGrid");
  if (!box) return;

  const { data } = await db.from("committee").select("*").order("display_order", { ascending: true });

  if (!data || data.length === 0) {
    box.innerHTML = `<p class="text-slate-400">No committee members yet.</p>`;
    return;
  }

  box.innerHTML = "";
  data.forEach((m, i) => {
    box.innerHTML += `
      <div data-aos="zoom-in" data-aos-delay="${i * 80}"
           class="memberCard cursor-pointer"
           onclick='openMemberModal(${JSON.stringify(m)})'>
        <img src="${m.image_url || 'https://i.pravatar.cc/300?u=' + encodeURIComponent(m.name)}"
             class="avatar" alt="${m.name}" loading="lazy">
        <h3 class="mt-4 font-semibold text-lg">${m.name}</h3>
        <p class="text-cyan-300 text-sm mt-1">${m.role}</p>
        <p class="text-slate-400 text-sm mt-3">${m.bio || ""}</p>
        ${m.linkedin ? `<a href="${m.linkedin}" target="_blank" onclick="event.stopPropagation()"
           class="inline-block mt-4 text-cyan-400 hover:underline text-sm">LinkedIn →</a>` : ""}
      </div>`;
  });
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
      box.innerHTML += `
        <div data-aos="fade-up" data-aos-delay="${i * 50}" class="overflow-hidden rounded-2xl">
          <img src="${urlData.publicUrl}" class="galImg" alt="${img.name}" loading="lazy">
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
    btn.disabled = true;
    btn.textContent = "Sending...";

    const { error } = await db.from("contact_messages").insert([{
      name:         document.getElementById("name").value.trim(),
      email:        document.getElementById("cemail").value.trim(),
      affiliation:  document.getElementById("caffiliation").value,
      inquiry_type: document.getElementById("ctype").value,
      message:      document.getElementById("cmessage").value.trim()
    }]);

    btn.disabled = false;
    btn.textContent = "Send Message";

    if (error) {
      if (status) status.textContent = "❌ Failed to send. Please try again.";
      console.error("Contact error:", error);
    } else {
      if (status) status.textContent = "✅ Message sent! We'll respond within 24–48 hours.";
      contactForm.reset();
    }
  });
}


// =====================
// COMMITTEE MODAL
// =====================
function openMemberModal(m) {
  const modal = document.getElementById("memberModal");
  if (!modal) return;

  document.getElementById("modalImg").src = m.image_url || `https://i.pravatar.cc/300?u=${encodeURIComponent(m.name)}`;
  document.getElementById("modalName").textContent = m.name || "";
  document.getElementById("modalRole").textContent = m.role || "";
  document.getElementById("modalBio").textContent  = m.bio  || "";

  const link = document.getElementById("modalLinkedin");
  if (m.linkedin) { link.href = m.linkedin; link.classList.remove("hidden"); }
  else            { link.classList.add("hidden"); }

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
function openImgModal(src) {
  const m = document.getElementById("imgModal");
  const i = document.getElementById("imgModalSrc");
  if (!m || !i) return;
  i.src = src;
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
