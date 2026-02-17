console.log("APP_JS_STARTED")


const SUPABASE_URL = "https://msyblaohdkpztytpbszp.supabase.co"
const SUPABASE_KEY = "sb_publishable_ZtFIWz7_rwHov2Me1cWsHQ_qTw9rH56"

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)

console.log("APP_JS_STARTED_SAFE")

if (true) {





// =====================
// TOAST POPUP HELPER
// =====================
function showToast(text, ok=true){
  const t = document.getElementById("toast");
  if(!t) return;

  t.textContent = text;
  t.className =
    "fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white transition " +
    (ok ? "bg-green-600" : "bg-red-600");

  t.classList.remove("hidden");
  setTimeout(()=> t.classList.add("hidden"), 2500);
}



// =====================
// LOAD UPDATES (UI UPGRADED)
// =====================
async function loadUpdates() {
  const { data } = await db
    .from("updates")
    .select("*")
    .order("created_at", { ascending: false });

  const box = document.getElementById("updates");
  if (!box || !data) return;

  box.innerHTML = "";

  data.forEach((e,i) => {
  box.innerHTML += `
    <div data-aos="fade-up" data-aos-delay="${i*90}"
         class="relative backdrop-blur-xl bg-white/10
                border border-white/20
                rounded-2xl p-6
                shadow-xl transition duration-300
                hover:bg-white/15 hover:-translate-y-1">

      <!-- glow layer -->
      <div class="absolute inset-0 rounded-2xl
                  bg-gradient-to-r from-blue-500/0
                  via-cyan-400/10 to-indigo-500/0
                  opacity-0 hover:opacity-100
                  transition"></div>

      <div class="relative z-10">

        <h3 class="text-xl font-semibold text-white">
          ${e.title}
        </h3>

        <p class="text-sm text-cyan-300 mt-2">
          ${e.event_date} • ${e.venue}
        </p>

        <p class="mt-4 text-slate-300 leading-relaxed">
          ${e.description}
        </p>

        <div class="mt-5 flex items-center justify-between">

          <span class="text-xs px-3 py-1 rounded-full
                       bg-cyan-400/20 text-cyan-300">
            ${e.status}
          </span>

          <a href="register.html?event=${e.id}"
             class="px-4 py-2 rounded-lg
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white text-sm font-semibold
                    shadow-lg transition
                    hover:scale-105 active:scale-95">
            Register →
          </a>

        </div>

      </div>
    </div>
  `;
});

}




// =====================
// LOAD EVENTS — FINAL SAFE VERSION
// =====================
async function loadEvents() {

  const { data, error } = await db
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  console.log("events:", data, error);

  const box = document.getElementById("eventsList");
  if (!box || !data) return;

  box.innerHTML = "";

  data.forEach((e,i) => {

    // ✅ SAFE DEFAULTS (prevents crashes on new columns)
    const title  = e.title || "Untitled Event";
    const desc   = e.description || "";
    const venue  = e.venue || "";
    const date   = e.event_date || "";
    const stage  = e.lifecycle_stage || "upcoming";
    const mode   = e.event_mode || "individual";
    const poster = e.poster_url || "";
    const fee    = e.registration_fee ?? "";

    // =====================
    // LIFECYCLE ACTION BADGE
    // =====================
    let actionUI = "";

    if(stage === "upcoming"){
      actionUI = `
        <a href="event.html?id=${e.id}"
           class="miniBtn">
           View & Register →
        </a>`;
    }

    if(stage === "live"){
      actionUI = `
        <span class="px-3 py-1 rounded-full
              bg-red-500/20 text-red-400">
          LIVE NOW
        </span>`;
    }

    if(stage === "completed"){
      actionUI = `
        <span class="px-3 py-1 rounded-full
              bg-green-500/20 text-green-400">
          Completed
        </span>`;
    }

    // =====================
    // CARD RENDER
    // =====================
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i*70}"
           class="backdrop-blur-xl bg-white/10
                  border border-white/20
                  rounded-2xl p-6 shadow-xl">

        ${poster ? `
          <img src="${poster}"
               class="rounded-xl mb-4 w-full h-48 object-cover">
        ` : ""}

        <h3 class="text-xl font-semibold text-cyan-300">
          <a href="event.html?id=${e.id}"
             class="hover:underline">
            ${title}
          </a>
        </h3>

        <p class="text-slate-400 text-sm mt-2">
          📅 ${date} • 📍 ${venue}
        </p>

        <p class="mt-4 text-slate-300">
          ${desc}
        </p>

        <div class="mt-4 flex gap-3 flex-wrap">

          <span class="px-3 py-1 rounded-full
                       bg-cyan-400/20 text-cyan-300 text-xs">
            ${mode === "team" ? "Team Event" : "Individual"}
          </span>

          ${fee !== "" ? `
            <span class="px-3 py-1 rounded-full
                         bg-indigo-400/20 text-indigo-300 text-xs">
              Fee: ₹${fee}
            </span>` : ""}

        </div>

        <div class="mt-5">
          ${actionUI}
        </div>

      </div>
    `;
  });
}

// run
loadEvents();


loadUpdates();


// =====================
// REGISTRATION SUBMIT — TEAM + PAID READY
// =====================

const regForm = document.getElementById("regForm");

if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = regForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    const eventId = new URLSearchParams(location.search).get("event");
    if (!eventId) {
      alert("Invalid event");
      return;
    }

    // ===== TEAM MEMBERS =====
    const memberNames = [...document.querySelectorAll(".memberName")]
      .map(x => x.value.trim())
      .filter(Boolean);

    const memberUsns = [...document.querySelectorAll(".memberUsn")]
      .map(x => x.value.trim())
      .filter(Boolean);


    // ===== INSERT =====
    // build team json
const members = []

document.querySelectorAll(".memberName").forEach((el, i) => {
  members.push({
    name: el.value,
    usn: document.querySelectorAll(".memberUsn")[i].value
  })
})

const payload = {
  event_id: Number(eventId),

  leader_name: document.getElementById("name").value,
  leader_usn: document.getElementById("usn").value,
  leader_branch: document.getElementById("branch").value,
  leader_year: document.getElementById("year").value,
  leader_email: document.getElementById("email").value,
  leader_phone: document.getElementById("phone").value,

  team_member: members,   // ✅ matches your jsonb column

  is_paid_event: !!document.getElementById("utr"),
  amount: null,
  utr_number: document.getElementById("utr")?.value || null,
  payment_status: "pending"
};


    const { error } = await db
      .from("registrations")
      .insert([payload]);

    btn.disabled = false;
    btn.textContent = "Submit Registration";

    if (error) {
      console.error(error);
      alert("Registration failed");
    } else {
      alert("Registration successful");
      regForm.reset();
    }
  });
}





// =====================
// ADMIN — ADD EVENT (FULL FIX)
// =====================
const eventForm = document.getElementById("eventForm");

if (eventForm) {
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: document.getElementById("etitle").value,
      description: document.getElementById("edesc").value,
      event_date: document.getElementById("edate").value,
      venue: document.getElementById("evenue").value,

      event_mode: document.getElementById("eventMode")?.value || "individual",
      team_size: document.getElementById("teamSize")?.value || null,
      is_paid: document.getElementById("isPaid")?.checked || false,
      registration_fee: document.getElementById("regFee")?.value || 0,

      status: "upcoming",
      lifecycle_stage: "upcoming",
      registration_open: true
    };

    const { error } = await db.from("events").insert([payload]);

    if (error) {
      console.error(error);
      showToast("Event add failed", false);
    } else {
      showToast("Event added");
      eventForm.reset();
    }
  });
}




// =====================
// ADMIN — ADD UPDATE (UI UPGRADED)
// =====================
const updateForm = document.getElementById("updateForm");

if (updateForm) {
  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = updateForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Posting...";

    const payload = {
      title: document.getElementById("utitle").value,
      content: document.getElementById("ucontent").value
    };

    const { error } = await db.from("updates").insert([payload]);

    btn.disabled = false;
    btn.textContent = "Post Update";

    if (error) {
      console.error(error);
      showToast("Update post failed", false);
    } else {
      showToast("Update posted");
      updateForm.reset();
    }
  });
}


// =====================
// PAGE FADE TRANSITIONS
// =====================
document.addEventListener("click", e => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("http")) return;

  e.preventDefault();

  const root = document.getElementById("pageRoot");
  if (root) root.classList.add("opacity-0");

  setTimeout(() => {
    window.location = href;
  }, 350);
});





// =====================
// EVENT DETAIL — PRO VERSION
// =====================
async function loadEventDetail(){

  const box = document.getElementById("eventBox");
  if(!box) return;

  const id = new URLSearchParams(location.search).get("id");
  if(!id) return;

  const { data, error } = await db
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  console.log("event detail:", data, error);
  if(!data) return;

  const mode = data.event_mode || "individual";
  const teamSize = data.team_size || 1;

  box.innerHTML = `
    ${data.poster_url ? `
  <img src="${data.poster_url}"
       onclick="openImgModal('${data.poster_url}')"
       class="rounded-2xl mb-6 w-full h-64 object-cover cursor-zoom-in hover:opacity-90 transition">
` : ""}


    <h2 class="text-3xl font-bold text-cyan-300">
      ${data.title}
    </h2>

    <p class="mt-4 text-slate-300 leading-relaxed">
      ${data.description || ""}
    </p>

    <div class="mt-6 grid md:grid-cols-2 gap-6">

      <div class="glassCard">
        <p>📅 ${data.event_date}</p>
        <p>📍 ${data.venue}</p>
        <p>💰 Fee: ₹${data.registration_fee ?? "Free"}</p>
        <p>👥 Mode: ${mode === "team" ? `Team (${teamSize})` : "Individual"}</p>
      </div>


    </div>

    <a href="register.html?event=${data.id}"
       class="proBtn inline-block mt-8">
       Register Now →
    </a>
  `;
}

loadEventDetail();


// =====================
// LOAD PROJECTS
// =====================
async function loadProjects(){
  const box = document.getElementById("projectsList");
  if(!box) return;

  const { data } = await db
    .from("projects")
    .select("*")
    .order("created_at",{ascending:false});

  box.innerHTML="";

  data?.forEach((p,i)=>{
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i*80}"
           class="glassCard">

        <h3 class="text-xl font-semibold text-cyan-300">
          ${p.title}
        </h3>

        <p class="mt-3 text-slate-300">
          ${p.description}
        </p>

        <div class="mt-5 flex gap-3">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="miniBtn">GitHub</a>`:""}
          ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" class="miniBtn">Demo</a>`:""}
        </div>

      </div>`;
  });
}

loadProjects();

// =====================
// LOAD PAPERS
// =====================
async function loadPapers(){

  const box = document.getElementById("papersList");
  if(!box) return;

  const { data, error } = await db
    .from("papers")
    .select("*")
    .order("created_at",{ascending:false});

  console.log("papers:", data, error);

  box.innerHTML = "";

  data?.forEach((p,i)=>{
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i*80}"
           class="glassCard">

        <h3 class="text-xl font-semibold text-cyan-300">
          ${p.title}
        </h3>

        <p class="mt-4 text-slate-300 leading-relaxed">
          ${p.summary}
        </p>

        <div class="mt-5 flex justify-between items-center">

          <span class="text-slate-500 text-sm">
            By ${p.author}
          </span>

          ${p.link ? `
            <a href="${p.link}" target="_blank"
               class="miniBtn">
              Read Paper
            </a>` : ""}

        </div>

      </div>`;
  });

}

loadPapers();

// =====================
// LOAD RESOURCES
// =====================
async function loadResources(){

  const box = document.getElementById("resourcesList");
  if(!box) return;

  const { data, error } = await db
    .from("resources")
    .select("*")
    .order("created_at",{ascending:false});

  console.log("resources:", data, error);

  box.innerHTML = "";

  data?.forEach((r,i)=>{
    box.innerHTML += `
      <div data-aos="fade-up" data-aos-delay="${i*70}"
           class="glassCard flex justify-between items-start gap-6">

        <div>
          <h3 class="text-lg font-semibold text-cyan-300">
            ${r.title}
          </h3>

          <p class="text-slate-400 text-sm mt-1">
            ${r.type}
          </p>

          <p class="text-slate-300 mt-3">
            ${r.description || ""}
          </p>
        </div>

        <a href="${r.url}" target="_blank"
           class="miniBtn shrink-0">
          Open →
        </a>

      </div>`;
  });

}

loadResources();

// =====================
// LOAD COMMITTEE
// =====================
async function loadCommittee(){

  const box = document.getElementById("committeeGrid");
  if(!box) return;

  const { data, error } = await db
    .from("committee")
    .select("*")
    .order("display_order",{ascending:true});

  console.log("committee:", data, error);

  box.innerHTML = "";

  data?.forEach((m,i)=>{
    box.innerHTML += `
      <div data-aos="zoom-in" data-aos-delay="${i*80}"
     class="memberCard cursor-pointer"
     onclick='openMemberModal(${JSON.stringify(m)})'>


        <img src="${m.image_url || 'https://i.pravatar.cc/300'}"
             class="avatar">

        <h3 class="mt-4 font-semibold text-lg">
          ${m.name}
        </h3>

        <p class="text-cyan-300 text-sm mt-1">
          ${m.role}
        </p>

        <p class="text-slate-400 text-sm mt-3">
          ${m.bio || ""}
        </p>

        ${m.linkedin ? `
          <a href="${m.linkedin}" target="_blank"
             class="inline-block mt-4 text-cyan-400 hover:underline">
             LinkedIn →
          </a>` : ""}

      </div>`;
  });

}

loadCommittee();


// =====================
// ADMIN LOGIN
// =====================
const loginForm = document.getElementById("loginForm");

if(loginForm){
 loginForm.addEventListener("submit", async e=>{
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await db.auth.signInWithPassword({
    email, password
  });

  if(error){
    msg.textContent = "Login failed";
    msg.className = "text-red-500";
  } else {
    window.location = "admin.html";
  }
 });
}


// =====================
// ADMIN ANALYTICS
// =====================
async function loadAdminStats(){

 const e = await db.from("events")
   .select("*",{count:"exact", head:true});

 const r = await db.from("registrations")
   .select("*",{count:"exact", head:true});

 const p = await db.from("projects")
   .select("*",{count:"exact", head:true});

 const pa = await db.from("papers")
   .select("*",{count:"exact", head:true});

 if(statEvents) statEvents.textContent = e.count ?? 0;
 if(statRegs) statRegs.textContent = r.count ?? 0;
 if(window.statProjects) statProjects.textContent = p.count ?? 0;
 if(window.statPapers) statPapers.textContent = pa.count ?? 0;
}

async function uploadPoster(eventId) {

  const fileInput = document.getElementById("posterFile")
  if (!fileInput.files.length) return alert("No poster selected")

  const file = fileInput.files[0]
  const filePath = `${eventId}_${file.name}`

  const { error } = await db.storage
    .from("event-posters")
    .upload(filePath, file, { upsert: true })

  if (error) return console.error(error)

  const { data } = db.storage
    .from("event-posters")
    .getPublicUrl(filePath)

  await db.from("events")
    .update({ poster_url: data.publicUrl })
    .eq("id", eventId)

  alert("Poster uploaded successfully")
}

async function uploadQR(eventId) {

  const fileInput = document.getElementById("qrFile")
  if (!fileInput.files.length) return alert("No QR selected")

  const file = fileInput.files[0]
  const filePath = `${eventId}_${file.name}`

  const { error } = await db.storage
    .from("event-qr")
    .upload(filePath, file, { upsert: true })

  if (error) return console.error(error)

  const { data } = db.storage
    .from("event-qr")
    .getPublicUrl(filePath)

  await db.from("events")
    .update({ payment_qr_url: data.publicUrl })
    .eq("id", eventId)

  alert("QR uploaded successfully")
}


loadAdminStats();


// ===== CONTACT FORM SUBMIT =====

const contactForm = document.getElementById("contactForm")

if (contactForm) {

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const status = document.getElementById("contactStatus")

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("cemail").value.trim()
    const affiliation = document.getElementById("caffiliation").value
    const type = document.getElementById("ctype").value
    const message = document.getElementById("cmessage").value.trim()

    status.textContent = "Sending..."
    
    const { error } = await db
      .from("contact_messages")
      .insert({
        name: name,
        email: email,
        affiliation: affiliation,
        inquiry_type: type,
        message: message
      })

    if (error) {
      status.textContent = "❌ Failed to send message"
      console.error(error)
      return
    }

    status.textContent = "✅ Message sent successfully"
    contactForm.reset()

  })

}
}

// ===== COMMITTEE MODAL =====

function openMemberModal(m){

  const modal = document.getElementById("memberModal")
  if(!modal) {
    console.error("memberModal not found")
    return
  }

  document.getElementById("modalImg").src =
    m.image_url || "https://i.pravatar.cc/300"

  document.getElementById("modalName").textContent = m.name || ""
  document.getElementById("modalRole").textContent = m.role || ""
  document.getElementById("modalBio").textContent  = m.bio  || ""

  const link = document.getElementById("modalLinkedin")

  if(m.linkedin){
    link.href = m.linkedin
    link.classList.remove("hidden")
  } else {
    link.classList.add("hidden")
  }

  modal.classList.remove("hidden")
  modal.classList.add("flex")
}


// close button
const modalCloseBtn = document.getElementById("modalClose")
if(modalCloseBtn){
  modalCloseBtn.onclick = () => {
    const modal = document.getElementById("memberModal")
    modal.classList.add("hidden")
    modal.classList.remove("flex")
  }
}


// click outside to close
const memberModal = document.getElementById("memberModal")
if(memberModal){
  memberModal.addEventListener("click", (e)=>{
    if(e.target.id === "memberModal"){
      memberModal.classList.add("hidden")
      memberModal.classList.remove("flex")
    }
  })
}


// ===== FIX BACK BUTTON BLANK PAGE =====
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});
