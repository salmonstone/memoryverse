/* ═══════════════════════════════════════════════════════════
   MemoryVerse — Frontend JavaScript
   Features: Particles · Mood Detection · Timeline · Music
════════════════════════════════════════════════════════════ */

// ── Global State ──────────────────────────────────────────────
let currentMood    = "neutral";
let allMemories    = [];
let activeFilter   = "all";
let imageBase64    = "";
let moodDebounceTimer;

// ── Mood Config ───────────────────────────────────────────────
const MOOD_CONFIG = {
  happy:     { emoji: "☀️",  label: "Happy",     desc: "Joy fills the air — the world feels bright and warm.",     color: "#fbbf24" },
  sad:       { emoji: "🌧️", label: "Sad",       desc: "A gentle melancholy drifts through the memory stream.",    color: "#60a5fa" },
  angry:     { emoji: "🔥",  label: "Angry",     desc: "Fierce energy crackles through the atmosphere.",           color: "#f87171" },
  excited:   { emoji: "⚡",  label: "Excited",   desc: "Electric energy — something incredible is unfolding.",     color: "#34d399" },
  peaceful:  { emoji: "🌊",  label: "Peaceful",  desc: "A serene calm washes over everything. Breathe deep.",      color: "#67e8f9" },
  nostalgic: { emoji: "🌙",  label: "Nostalgic", desc: "A soft glow of the past illuminates your present.",        color: "#f9a8d4" },
  neutral:   { emoji: "◈",   label: "Neutral",   desc: "Write a memory to reveal your mood palette…",             color: "#a78bfa" },
};

// ── Music Recommendations per Mood ────────────────────────────
const MUSIC_DB = {
  happy: [
    { track: "Pehli Nazar Mein",   artist: "Atif Aslam", emoji: "✨", url: "" },
    { track: "Jeena Jeena",        artist: "Atif Aslam", emoji: "💛", url: "" },
    { track: "Tu Jaane Na",        artist: "Atif Aslam", emoji: "🌟", url: "" },
    { track: "Bol Do Na Zara",     artist: "Atif Aslam", emoji: "💃", url: "" },
    { track: "Doorie",             artist: "Atif Aslam", emoji: "🎶", url: "" },
    { track: "Chan Kitthan",       artist: "Atif Aslam", emoji: "🎵", url: "" },
  ],
  sad: [
    { track: "Tere Bin",           artist: "Atif Aslam", emoji: "💙", url: "" },
    { track: "Woh Lamhe",          artist: "Atif Aslam", emoji: "🌙", url: "" },
    { track: "Aadat",              artist: "Atif Aslam", emoji: "🍂", url: "" },
    { track: "Dil Diyan Gallan",   artist: "Atif Aslam", emoji: "💔", url: "" },
    { track: "Bakhuda Tumhi Ho",   artist: "Atif Aslam", emoji: "🌧️", url: "" },
    { track: "Jeeay Kyun",         artist: "Atif Aslam", emoji: "😢", url: "" },
  ],
  angry: [
    { track: "Tu Meri",            artist: "Atif Aslam", emoji: "🔥", url: "" },
    { track: "Doorie",             artist: "Atif Aslam", emoji: "💢", url: "" },
    { track: "O Saathi",           artist: "Atif Aslam", emoji: "⚡", url: "" },
    { track: "Dildaara",           artist: "Atif Aslam", emoji: "😤", url: "" },
    { track: "Tera Hone Laga Hoon","artist": "Atif Aslam", emoji: "🤘", url: "" },
    { track: "Main Agar Kahoon",   artist: "Atif Aslam", emoji: "🎸", url: "" },
  ],
  excited: [
    { track: "O Saathi",           artist: "Atif Aslam", emoji: "🚀", url: "" },
    { track: "Dildaara",           artist: "Atif Aslam", emoji: "🏆", url: "" },
    { track: "Tu Meri",            artist: "Atif Aslam", emoji: "⛈️", url: "" },
    { track: "Bol Do Na Zara",     artist: "Atif Aslam", emoji: "✨", url: "" },
    { track: "Pehli Nazar Mein",   artist: "Atif Aslam", emoji: "🔱", url: "" },
    { track: "Tera Hone Laga Hoon","artist": "Atif Aslam", emoji: "🌠", url: "" },
  ],
  peaceful: [
    { track: "Kabhi Jo Baadal Barse", artist: "Atif Aslam", emoji: "🌊", url: "" },
    { track: "Tu Chahiye",         artist: "Atif Aslam", emoji: "🌙", url: "" },
    { track: "Tum Se Hi",          artist: "Atif Aslam", emoji: "🍃", url: "" },
    { track: "Teri Aankhon Mein",  artist: "Atif Aslam", emoji: "🌬️", url: "" },
    { track: "Aadat",              artist: "Atif Aslam", emoji: "🕊️", url: "" },
    { track: "Tu Hi Haqeeqat",     artist: "Atif Aslam", emoji: "🎹", url: "" },
  ],
  nostalgic: [
    { track: "Woh Lamhe",          artist: "Atif Aslam", emoji: "🌙", url: "" },
    { track: "Aadat",              artist: "Atif Aslam", emoji: "🎠", url: "" },
    { track: "Piya O Re Piya",     artist: "Atif Aslam", emoji: "🚗", url: "" },
    { track: "Tum Se Hi",          artist: "Atif Aslam", emoji: "🍂", url: "" },
    { track: "Bakhuda Tumhi Ho",   artist: "Atif Aslam", emoji: "📷", url: "" },
    { track: "Tera Hone Laga Hoon","artist": "Atif Aslam", emoji: "⏳", url: "" },
  ],
  neutral: [
    { track: "Tum Se Hi",          artist: "Atif Aslam", emoji: "◈", url: "" },
    { track: "Kabhi Jo Baadal Barse", artist: "Atif Aslam", emoji: "🎬", url: "" },
    { track: "Tu Chahiye",         artist: "Atif Aslam", emoji: "🌅", url: "" },
    { track: "Teri Aankhon Mein",  artist: "Atif Aslam", emoji: "🌸", url: "" },
    { track: "Jeena Jeena",        artist: "Atif Aslam", emoji: "🎵", url: "" },
    { track: "Tu Hi Haqeeqat",     artist: "Atif Aslam", emoji: "🌙", url: "" },
  ],
};

/* ═══════════════════════════════════════════════════
   1. PARTICLE SYSTEM
════════════════════════════════════════════════════ */
const canvas  = document.getElementById("particleCanvas");
const ctx     = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.8 + 0.4,
    vx:    (Math.random() - 0.5) * 0.25,
    vy:    -Math.random() * 0.4 - 0.1,
    alpha: Math.random() * 0.5 + 0.1,
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 120; i++) particles.push(createParticle());
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Get current mood color
  const moodColor = MOOD_CONFIG[currentMood]?.color || "#a78bfa";

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = moodColor + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();

    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.0004;

    // Reset if faded or out of bounds
    if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
      Object.assign(p, createParticle());
    }
  });

  requestAnimationFrame(drawParticles);
}

/* ═══════════════════════════════════════════════════
   2. MOOD MANAGEMENT
════════════════════════════════════════════════════ */
function applyMood(mood) {
  currentMood = mood;
  const cfg   = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;

  // Update body attribute (triggers CSS variable change)
  document.body.setAttribute("data-mood", mood);

  // Update UI elements
  document.getElementById("moodEmoji").textContent       = cfg.emoji;
  document.getElementById("moodBannerValue").textContent = cfg.label;
  document.getElementById("moodDesc").textContent        = cfg.desc;
  document.getElementById("currentMoodLabel").textContent = cfg.label;
  document.getElementById("statMood").textContent        = cfg.emoji + " " + cfg.label;

  // Update music section
  renderMusic(mood);
}

/* ═══════════════════════════════════════════════════
   3. MUSIC RENDERER
════════════════════════════════════════════════════ */
function renderMusic(mood) {
  const grid  = document.getElementById("musicGrid");
  const songs = MUSIC_DB[mood] || MUSIC_DB.neutral;

  grid.innerHTML = songs.map(song => `
    <a href="${song.url}" target="_blank" rel="noopener" class="music-card">
      <div class="music-art">${song.emoji}</div>
      <div class="music-info">
        <div class="music-track">${escapeHTML(song.track)}</div>
        <div class="music-artist">${escapeHTML(song.artist)}</div>
      </div>
      <div class="music-play-btn">▶</div>
    </a>
  `).join("");
}

/* ═══════════════════════════════════════════════════
   4. API HELPERS
════════════════════════════════════════════════════ */
async function fetchMemories() {
  try {
    const res  = await fetch("/api/memories");
    const data = await res.json();
    allMemories = data;
    updateStats();
    renderTimeline(activeFilter);
  } catch (e) {
    console.error("Failed to load memories:", e);
  }
}

async function detectMoodAPI(text) {
  try {
    const res  = await fetch("/api/detect-mood", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.mood || "neutral";
  } catch {
    return "neutral";
  }
}

async function saveMemory(payload) {
  const res  = await fetch("/api/memories", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Save failed");
  }
  return await res.json();
}

async function deleteMemory(id) {
  const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

/* ═══════════════════════════════════════════════════
   5. TIMELINE RENDERER
════════════════════════════════════════════════════ */
function renderTimeline(filter) {
  activeFilter = filter;
  const container = document.getElementById("timelineContainer");
  const emptyEl   = document.getElementById("timelineEmpty");

  let mems = filter === "all"
    ? [...allMemories]
    : allMemories.filter(m => m.mood === filter);

  // Remove old cards (keep the empty div)
  container.querySelectorAll(".tl-item").forEach(el => el.remove());

  if (mems.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  mems.forEach((mem, i) => {
    const item = document.createElement("div");
    item.className = "tl-item";
    item.style.animationDelay = `${i * 0.08}s`;

    const dateStr = mem.date
      ? new Date(mem.date + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric"
        })
      : "Unknown date";

    const moodCfg = MOOD_CONFIG[mem.mood] || MOOD_CONFIG.neutral;

    const imgHTML = mem.image
      ? `<img src="${mem.image}" class="tl-card-img" alt="${escapeHTML(mem.title)}" loading="lazy">`
      : "";

    item.innerHTML = `
      <div class="tl-card" onclick="openModal('${mem.id}')">
        ${imgHTML}
        <div class="tl-card-body">
          <div class="tl-card-meta">
            <span class="tl-date">${dateStr}</span>
            <span class="tl-mood-tag">${moodCfg.emoji} ${mem.mood}</span>
          </div>
          <div class="tl-card-title">${escapeHTML(mem.title)}</div>
          <div class="tl-card-desc">${escapeHTML(mem.description)}</div>
          <div class="tl-card-actions" onclick="event.stopPropagation()">
            <button class="tl-btn" onclick="openModal('${mem.id}')">Expand</button>
            <button class="tl-btn delete" onclick="confirmDelete('${mem.id}')">Delete</button>
          </div>
        </div>
      </div>
      <div class="tl-connector">
        <div class="tl-dot"></div>
      </div>
      <div class="tl-spacer"></div>
    `;

    container.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════
   6. MODAL (Memory Detail View)
════════════════════════════════════════════════════ */
function openModal(id) {
  const mem    = allMemories.find(m => m.id === id);
  if (!mem) return;

  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");

  const dateStr = mem.date
    ? new Date(mem.date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      })
    : "Unknown date";

  const moodCfg = MOOD_CONFIG[mem.mood] || MOOD_CONFIG.neutral;

  content.innerHTML = `
    ${mem.image ? `<img src="${mem.image}" class="modal-img" alt="${escapeHTML(mem.title)}">` : ""}
    <div class="modal-date">${dateStr.toUpperCase()}</div>
    <div class="modal-title">${escapeHTML(mem.title)}</div>
    <div class="modal-desc">${escapeHTML(mem.description).replace(/\n/g, "<br>")}</div>
    <div class="modal-mood-row">
      <span class="modal-mood-label">MOOD DETECTED</span>
      <span class="modal-mood-val">${moodCfg.emoji} ${mem.mood}</span>
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

/* ═══════════════════════════════════════════════════
   7. DELETE CONFIRM
════════════════════════════════════════════════════ */
function confirmDelete(id) {
  showToast("🗑️ Deleting memory…");
  deleteMemory(id)
    .then(() => {
      allMemories = allMemories.filter(m => m.id !== id);
      updateStats();
      renderTimeline(activeFilter);
      showToast("✓ Memory deleted.");
    })
    .catch(() => showToast("❌ Delete failed."));
}

/* ═══════════════════════════════════════════════════
   8. TOAST NOTIFICATION
════════════════════════════════════════════════════ */
function showToast(msg, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

/* ═══════════════════════════════════════════════════
   9. STATS UPDATE
════════════════════════════════════════════════════ */
function updateStats() {
  document.getElementById("statCount").textContent = allMemories.length;
}

/* ═══════════════════════════════════════════════════
   10. FORM HANDLING
════════════════════════════════════════════════════ */
function setupForm() {
  const descTA  = document.getElementById("memDesc");
  const preview = document.getElementById("moodPreviewLabel");
  const dot     = document.querySelector(".mood-preview-dot");
  const fb      = document.getElementById("formFeedback");
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitBtnText");
  const loader    = document.getElementById("btnLoader");

  // Live mood detection (debounced 600ms)
  descTA.addEventListener("input", () => {
    clearTimeout(moodDebounceTimer);
    moodDebounceTimer = setTimeout(async () => {
      const text = descTA.value.trim();
      if (!text) {
        preview.textContent = "Start writing to detect mood…";
        return;
      }
      const mood = await detectMoodAPI(text);
      const cfg  = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;
      preview.textContent = `Mood detected: ${cfg.emoji} ${cfg.label}`;
      dot.style.background = cfg.color;
      dot.style.boxShadow  = `0 0 8px ${cfg.color}`;
    }, 600);
  });

  // Image upload via click
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("memImage");
  const previewWrap = document.getElementById("imagePreviewWrap");
  const previewImg  = document.getElementById("imagePreview");
  const removeBtn   = document.getElementById("imageRemoveBtn");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadImageFile(file);
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) loadImageFile(fileInput.files[0]);
  });

  function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      imageBase64 = e.target.result;
      previewImg.src = imageBase64;
      dropZone.style.display = "none";
      previewWrap.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener("click", () => {
    imageBase64 = "";
    previewImg.src = "";
    fileInput.value = "";
    previewWrap.style.display = "none";
    dropZone.style.display = "block";
  });

  // Form submit
  submitBtn.addEventListener("click", async () => {
    fb.className = "form-feedback";
    fb.textContent = "";

    const title = document.getElementById("memTitle").value.trim();
    const date  = document.getElementById("memDate").value;
    const desc  = document.getElementById("memDesc").value.trim();

    // Validation
    if (!title) { showFeedback("error", "Please enter a title."); return; }
    if (!desc)  { showFeedback("error", "Please describe your memory."); return; }

    // Detect mood from description
    const mood = await detectMoodAPI(desc);

    // Show loading state
    submitText.style.display = "none";
    loader.style.display     = "flex";
    submitBtn.disabled       = true;

    try {
      await saveMemory({ title, date, description: desc, image: imageBase64, mood });
      showFeedback("success", `✓ Memory crystallized! Mood: ${MOOD_CONFIG[mood].emoji} ${mood}`);

      // Apply mood to the page
      applyMood(mood);

      // Reset form
      document.getElementById("memTitle").value = "";
      document.getElementById("memDate").value  = "";
      document.getElementById("memDesc").value  = "";
      imageBase64 = "";
      previewImg.src = "";
      previewWrap.style.display = "none";
      dropZone.style.display    = "block";
      preview.textContent = "Start writing to detect mood…";
      dot.style.background = "";
      dot.style.boxShadow  = "";

      // Reload timeline
      await fetchMemories();

      // Scroll to timeline
      setTimeout(() => {
        document.getElementById("timeline").scrollIntoView({ behavior: "smooth" });
      }, 600);

    } catch (err) {
      showFeedback("error", "❌ " + err.message);
    } finally {
      submitText.style.display = "";
      loader.style.display     = "none";
      submitBtn.disabled       = false;
    }
  });

  function showFeedback(type, msg) {
    fb.className = "form-feedback " + type;
    fb.textContent = msg;
  }

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("memDate").value = today;
}

/* ═══════════════════════════════════════════════════
   11. FILTER BUTTONS
════════════════════════════════════════════════════ */
function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTimeline(btn.dataset.mood);
    });
  });
}

/* ═══════════════════════════════════════════════════
   12. NAV SCROLL EFFECT
════════════════════════════════════════════════════ */
function setupNav() {
  window.addEventListener("scroll", () => {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60);
  });
}

/* ═══════════════════════════════════════════════════
   13. CURSOR TRACKER
════════════════════════════════════════════════════ */
function setupCursor() {
  document.addEventListener("mousemove", e => {
    document.body.style.setProperty("--cx", e.clientX + "px");
    document.body.style.setProperty("--cy", e.clientY + "px");
  });
}

/* ═══════════════════════════════════════════════════
   14. INTERSECTION OBSERVER (scroll reveal)
════════════════════════════════════════════════════ */
function setupScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".stat-badge, .music-card, .form-glass, .section-header").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

/* ═══════════════════════════════════════════════════
   15. MODAL CLOSE EVENTS
════════════════════════════════════════════════════ */
function setupModal() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

/* ═══════════════════════════════════════════════════
   UTILITY: HTML escape
════════════════════════════════════════════════════ */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

/* ═══════════════════════════════════════════════════
   INIT — Run everything on DOM ready
════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  // Canvas particles
  resizeCanvas();
  initParticles();
  drawParticles();
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });

  // Apply default mood
  applyMood("neutral");

  // Wire up UI
  setupForm();
  setupFilters();
  setupNav();
  setupCursor();
  setupModal();

  // Load memories from server
  await fetchMemories();

  // Delayed scroll reveal
  setTimeout(setupScrollReveal, 300);
});
