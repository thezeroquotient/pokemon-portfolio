/* ============================================================
   Pokémon Portfolio — behaviour
   ============================================================ */

const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* shared list of roaming Pokémon so the catch sequence can grab one */
let roamingMons = [];

/* seeded RNG so the scene is stable */
function makeRng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/* clearing = the lighter area of the field where things roam */
function clearing() {
  const w = window.innerWidth, h = window.innerHeight;
  return { w, h, cx: w / 2, cy: h / 2, rx: w * 0.45, ry: h * 0.46 };
}

/* ---------- 1. Smooth grass clumps + drifting motes ---------- */
(function decor() {
  return; // grass photo supplies the field texture — CSS clumps/motes disabled
  const field = document.getElementById("field");
  const { w, h } = clearing();
  const rnd = makeRng(9111);

  // a soft vector grass clump (fan of curved blades)
  function clumpSVG() {
    return `
      <svg width="72" height="46" viewBox="0 0 72 46" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 46 C26 34 20 22 20 6 C28 20 34 30 38 46 Z" fill="#4f9a3a"/>
        <path d="M36 46 C30 32 28 20 30 4 C34 20 38 30 40 46 Z" fill="#5cae44"/>
        <path d="M36 46 C36 32 38 18 44 6 C44 22 42 34 42 46 Z" fill="#67bd4d"/>
        <path d="M36 46 C40 34 46 24 54 14 C50 28 46 36 44 46 Z" fill="#57a63f"/>
        <path d="M36 46 C32 34 26 26 16 18 C24 30 30 38 34 46 Z" fill="#5cae44"/>
      </svg>`;
  }

  if (!reduceMotion) {
    const count = Math.min(16, Math.round(w / 95));
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "clump";
      el.innerHTML = clumpSVG();
      const scale = 0.7 + rnd() * 0.9;
      const x = rnd() * w;
      const y = h * (0.32 + rnd() * 0.62);
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.transform = `scale(${scale.toFixed(2)})`;
      el.style.setProperty("--amp", (3 + rnd() * 5).toFixed(1) + "deg");
      el.style.setProperty("--dur", (2.8 + rnd() * 2.6).toFixed(2) + "s");
      el.style.setProperty("--delay", (-rnd() * 3).toFixed(2) + "s");
      el.style.opacity = (0.8 + rnd() * 0.2).toFixed(2);
      field.appendChild(el);
    }

    // drifting pollen motes
    const motes = Math.min(14, Math.round(w / 110));
    for (let i = 0; i < motes; i++) {
      const m = document.createElement("div");
      m.className = "mote";
      m.style.left = (rnd() * w) + "px";
      m.style.top = (h * (0.35 + rnd() * 0.5)) + "px";
      m.style.setProperty("--dx", ((rnd() - 0.3) * 80).toFixed(0) + "px");
      m.style.setProperty("--dy", (-80 - rnd() * 120).toFixed(0) + "px");
      m.style.setProperty("--dur", (9 + rnd() * 8).toFixed(1) + "s");
      m.style.setProperty("--delay", (-rnd() * 10).toFixed(1) + "s");
      const s = (0.6 + rnd() * 1).toFixed(2);
      m.style.width = m.style.height = (s * 7).toFixed(1) + "px";
      field.appendChild(m);
    }
  }
})();

/* ---------- smooth vector Pokémon sprites ---------- */
/* All drawn facing forward in a 0 0 100 100 viewBox, feet near y=94 */
const SPECIES = {
  pikachu: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- tail -->
      <path d="M66 66 L84 40 L74 42 L88 22 L70 34 L76 20 L58 52 Z"
            fill="#f6c915" stroke="#c98a10" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- ears -->
      <path d="M35 40 L20 5 Q19 1 24 4 L44 34 Z" fill="#f6c915"/>
      <path d="M65 40 L80 5 Q81 1 76 4 L56 34 Z" fill="#f6c915"/>
      <path d="M22 12 L20 5 Q19 1 24 4 L28 16 Z" fill="#3a3a3a"/>
      <path d="M78 12 L80 5 Q81 1 76 4 L72 16 Z" fill="#3a3a3a"/>
      <!-- body/head -->
      <ellipse cx="50" cy="60" rx="28" ry="30" fill="#f6c915"/>
      <!-- feet -->
      <ellipse cx="37" cy="90" rx="10" ry="6.5" fill="#e6b400"/>
      <ellipse cx="63" cy="90" rx="10" ry="6.5" fill="#e6b400"/>
      <!-- cheeks -->
      <circle cx="29" cy="65" r="7.5" fill="#e23b2e"/>
      <circle cx="71" cy="65" r="7.5" fill="#e23b2e"/>
      <!-- eyes -->
      <circle cx="39" cy="55" r="6" fill="#2a2a2a"/>
      <circle cx="61" cy="55" r="6" fill="#2a2a2a"/>
      <circle cx="41" cy="53" r="2" fill="#fff"/>
      <circle cx="63" cy="53" r="2" fill="#fff"/>
      <!-- nose + mouth -->
      <circle cx="50" cy="63" r="1.8" fill="#2a2a2a"/>
      <path d="M44 68 Q50 74 56 68" fill="none" stroke="#2a2a2a" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  bulbasaur: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- bulb -->
      <ellipse cx="50" cy="30" rx="25" ry="20" fill="#7ec96a"/>
      <path d="M31 34 Q50 22 69 34 Q50 30 31 34 Z" fill="#5aa84e"/>
      <ellipse cx="40" cy="26" rx="5" ry="4" fill="#5aa84e"/>
      <ellipse cx="60" cy="27" rx="5" ry="4" fill="#5aa84e"/>
      <!-- ears -->
      <path d="M30 46 L23 35 L35 42 Z" fill="#7ecac2"/>
      <path d="M70 46 L77 35 L65 42 Z" fill="#7ecac2"/>
      <!-- body -->
      <ellipse cx="50" cy="62" rx="29" ry="26" fill="#84cfc6"/>
      <ellipse cx="34" cy="70" rx="6" ry="4.5" fill="#4f9a94"/>
      <ellipse cx="66" cy="70" rx="6" ry="4.5" fill="#4f9a94"/>
      <ellipse cx="50" cy="78" rx="7" ry="5" fill="#4f9a94"/>
      <!-- feet -->
      <ellipse cx="35" cy="87" rx="9" ry="6" fill="#5fb0a8"/>
      <ellipse cx="65" cy="87" rx="9" ry="6" fill="#5fb0a8"/>
      <!-- eyes -->
      <ellipse cx="40" cy="58" rx="5" ry="6.5" fill="#c0322b"/>
      <ellipse cx="60" cy="58" rx="5" ry="6.5" fill="#c0322b"/>
      <circle cx="41" cy="55" r="1.6" fill="#fff"/>
      <circle cx="61" cy="55" r="1.6" fill="#fff"/>
      <!-- mouth -->
      <path d="M42 70 Q50 76 58 70" fill="none" stroke="#3a6b64" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  charmander: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- tail + flame -->
      <path d="M70 74 Q86 70 84 54" fill="none" stroke="#ef9a4d" stroke-width="8" stroke-linecap="round"/>
      <path d="M84 58 Q78 50 82 40 Q86 48 85 52 Q89 46 88 40 Q95 52 88 62 Q84 66 84 58 Z" fill="#ff7a1a"/>
      <path d="M84 57 Q81 51 84 45 Q87 51 86 54 Q88 62 84 62 Z" fill="#ffd23e"/>
      <!-- body -->
      <ellipse cx="46" cy="62" rx="24" ry="26" fill="#f4a24d"/>
      <ellipse cx="46" cy="70" rx="14" ry="15" fill="#f7d6a2"/>
      <!-- feet -->
      <ellipse cx="34" cy="89" rx="9" ry="6" fill="#e08a34"/>
      <ellipse cx="58" cy="89" rx="9" ry="6" fill="#e08a34"/>
      <!-- head -->
      <ellipse cx="46" cy="38" rx="21" ry="19" fill="#f6a850"/>
      <!-- eyes -->
      <ellipse cx="38" cy="37" rx="4.5" ry="6" fill="#2a2a2a"/>
      <ellipse cx="54" cy="37" rx="4.5" ry="6" fill="#2a2a2a"/>
      <circle cx="39" cy="35" r="1.5" fill="#fff"/>
      <circle cx="55" cy="35" r="1.5" fill="#fff"/>
      <!-- smile -->
      <path d="M40 46 Q46 51 52 46" fill="none" stroke="#b56a24" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,

  squirtle: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- tail -->
      <path d="M70 72 Q86 74 82 88 Q74 84 68 78 Z" fill="#e0a05a"/>
      <!-- shell -->
      <ellipse cx="50" cy="66" rx="30" ry="25" fill="#caa15a"/>
      <path d="M50 41 A30 25 0 0 1 50 91" fill="#b98a3f" opacity="0.5"/>
      <ellipse cx="50" cy="66" rx="30" ry="25" fill="none" stroke="#9c7431" stroke-width="3"/>
      <!-- limbs -->
      <ellipse cx="30" cy="84" rx="9" ry="6.5" fill="#5db4d6"/>
      <ellipse cx="70" cy="84" rx="9" ry="6.5" fill="#5db4d6"/>
      <!-- body front -->
      <ellipse cx="50" cy="56" rx="22" ry="22" fill="#8ed3ec"/>
      <!-- head -->
      <ellipse cx="50" cy="36" rx="19" ry="17" fill="#9ad9ef"/>
      <!-- eyes -->
      <ellipse cx="43" cy="35" rx="4.5" ry="6" fill="#2a2a2a"/>
      <ellipse cx="57" cy="35" rx="4.5" ry="6" fill="#2a2a2a"/>
      <circle cx="44" cy="33" r="1.5" fill="#fff"/>
      <circle cx="58" cy="33" r="1.5" fill="#fff"/>
      <!-- mouth -->
      <path d="M44 44 Q50 49 56 44" fill="none" stroke="#3a7a8f" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,
};

/* ---------- 2. Roaming Pokémon ---------- */
(function roamers() {
  return; // roaming Pokémon removed — the home is now a clean grass field for the trainer entrance
  const field = document.getElementById("field");
  const order = ["pikachu", "bulbasaur", "charmander", "squirtle"];
  const SIZE = window.innerWidth < 560 ? 62 : 86;
  const rnd = makeRng(4242);
  const mons = [];

  order.forEach((name) => {
    const wrap = document.createElement("div");
    wrap.className = "sprite";

    const shadow = document.createElement("div");
    shadow.className = "shadow";

    const flip = document.createElement("div");
    flip.innerHTML = SPECIES[name];
    const svg = flip.firstElementChild;
    svg.setAttribute("width", SIZE);
    svg.setAttribute("height", SIZE);
    svg.classList.add("hop");
    svg.style.setProperty("--hop", (0.5 + rnd() * 0.25).toFixed(2) + "s");

    wrap.appendChild(shadow);
    wrap.appendChild(flip);
    field.appendChild(wrap);

    const b = clearing();
    mons.push({
      wrap, flip, size: SIZE,
      x: b.cx + (rnd() - 0.5) * b.rx * 1.4,
      y: b.cy + (rnd() - 0.5) * b.ry * 1.4,
      ang: rnd() * Math.PI * 2,
      speed: 16 + rnd() * 20,
      turnAt: rnd() * 3,
      pause: 0,
    });
  });

  roamingMons = mons;

  if (reduceMotion) {
    mons.forEach((m) => {
      m.wrap.style.transform =
        `translate(${m.x - m.size / 2}px, ${m.y - m.size}px)`;
    });
    return;
  }

  let last = performance.now();
  function tick(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    const b = clearing();

    for (const m of mons) {
      if (m.captured) continue; // being caught — hands off
      if (m.pause > 0) {
        m.pause -= dt;
      } else {
        m.turnAt -= dt;
        if (m.turnAt <= 0) {
          m.ang = Math.random() * Math.PI * 2;
          m.turnAt = 1.6 + Math.random() * 2.6;
          if (Math.random() < 0.28) m.pause = 0.6 + Math.random() * 1.4;
        }
        const vx = Math.cos(m.ang) * m.speed;
        const vy = Math.sin(m.ang) * m.speed;
        m.x += vx * dt;
        m.y += vy * dt;

        // keep inside the clearing ellipse
        const nx = (m.x - b.cx) / (b.rx - 30);
        const ny = (m.y - b.cy) / (b.ry - 30);
        if (nx * nx + ny * ny > 1) {
          m.ang = Math.atan2(b.cy - m.y, b.cx - m.x) + (Math.random() - 0.5);
          m.x = Math.max(b.cx - b.rx + 30, Math.min(b.cx + b.rx - 30, m.x));
          m.y = Math.max(b.cy - b.ry + 30, Math.min(b.cy + b.ry - 30, m.y));
        }
        m.flip.style.transform = vx < 0 ? "scaleX(-1)" : "scaleX(1)";
      }

      m.wrap.style.transform =
        `translate(${(m.x - m.size / 2).toFixed(1)}px, ${(m.y - m.size).toFixed(1)}px)`;
      m.wrap.style.zIndex = 3 + Math.round(m.y / 12);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- 3. Info page: reveal-on-scroll + evolution ---------- */
let startInfoReveals = () => {};
(function infoReveals() {
  const info = document.getElementById("info");
  const items = Array.from(info.querySelectorAll(".reveal"));
  let started = false;

  function runEvolution(panel) {
    const stages = panel.querySelectorAll(".evo-stage");
    stages.forEach((s, i) => {
      setTimeout(() => {
        s.classList.add("evolving", "evolved");
      }, 250 + i * 450);
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        if (e.target.classList.contains("evo")) runEvolution(e.target);
        io.unobserve(e.target);
      });
    },
    { root: info, threshold: 0.2 }
  );

  // called the first time the info view is shown
  startInfoReveals = function () {
    if (started) return;
    started = true;
    if (reduceMotion) {
      items.forEach((el) => el.classList.add("in-view"));
      info.querySelectorAll(".evo-stage").forEach((s) => s.classList.add("evolved"));
      return;
    }
    items.forEach((el) => io.observe(el));
  };
})();

/* ---------- 3b. Pokédex tabs ---------- */
(function tabs() {
  const nav = document.getElementById("pdxTabs");
  if (!nav) return;
  const panels = document.querySelectorAll(".pdx-panel");
  nav.addEventListener("click", (e) => {
    const btn = e.target.closest(".pdx-tab");
    if (!btn) return;
    nav.querySelectorAll(".pdx-tab").forEach((t) => t.classList.remove("is-active"));
    btn.classList.add("is-active");
    const key = btn.dataset.tab;
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
  });
})();

/* ---------- 3c. Experience: company switcher ---------- */
(function xpTabs() {
  const wrap = document.getElementById("xp");
  if (!wrap) return;
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".xp-co");
    if (!btn) return;
    const i = btn.dataset.co;
    wrap.querySelectorAll(".xp-co").forEach((x) => x.classList.toggle("is-active", x === btn));
    wrap.querySelectorAll(".xp-detail").forEach((d) => d.classList.toggle("is-active", d.dataset.co === i));
  });
})();

/* ---------- 3d. "Drop a Pokémon" footer (shared store) ---------- */
(function pokeFooter() {
  const stage = document.getElementById("pfootStage");
  const btn = document.getElementById("pfootBtn");
  const count = document.getElementById("pfootCount");
  if (!stage) return;

  // all mons live in an inner track that scales to fit the footer width, so the
  // whole crowd stays visible (no cut-off faces/names) however many there are
  const track = document.createElement("div");
  track.className = "pfoot-track";
  stage.appendChild(track);
  function fit() {
    const avail = stage.clientWidth;
    const w = track.scrollWidth;
    const s = (w > avail && avail > 0) ? avail / w : 1;
    track.style.transform = "scale(" + s + ")";
    track.style.setProperty("--inv", (1 / s).toFixed(3)); // keeps hover names full-size
  }
  window.addEventListener("resize", fit);

  const ART = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  let dropped = false;
  var DROP_KEY = "pokedrop:done"; // one drop per browser, remembered across refreshes
  function alreadyDropped() { try { return localStorage.getItem(DROP_KEY) === "1"; } catch (e) { return false; } }
  function markDropped() { try { localStorage.setItem(DROP_KEY, "1"); } catch (e) {} }

  // fetch every Pokémon name once (in id order) so hovering a mon shows its name
  let namesPromise = null;
  function loadNames() {
    if (!namesPromise) {
      namesPromise = fetch("https://pokeapi.co/api/v2/pokemon?limit=1025", { cache: "force-cache" })
        .then((r) => r.json())
        .then((d) => d.results.map((x) => x.name))
        .catch(() => null);
    }
    return namesPromise;
  }
  const pretty = (n) =>
    n ? n.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Pokémon";

  // the crowd on screen is capped, but the number shows the true global total
  let globalCount = null;
  function refreshCount() {
    if (!count) return;
    const n = (globalCount != null) ? globalCount : track.children.length;
    count.textContent = n === 0
      ? "Be the first to drop a Pokémon"
      : `${n.toLocaleString()} trainer${n === 1 ? "" : "s"} stopped by`;
  }

  function render(id, animated) {
    const wrap = document.createElement("div");
    wrap.className = "pfoot-mon";
    const size = 70 + Math.floor(Math.random() * 30);
    wrap.style.width = wrap.style.height = size + "px";
    wrap.style.setProperty("--rot", (Math.random() * 10 - 5).toFixed(1) + "deg");
    if (!animated) wrap.style.animation = "none";

    const img = new Image();
    img.className = "pfoot-sprite";
    img.alt = "Pokémon";
    img.onerror = () => { wrap.remove(); refreshCount(); fit(); };
    img.src = ART(id);

    const tag = document.createElement("span");
    tag.className = "pfoot-name";
    tag.textContent = "…";

    wrap.appendChild(img);
    wrap.appendChild(tag);
    track.appendChild(wrap);

    loadNames().then((list) => {
      const n = pretty(list && list[id - 1]);
      tag.textContent = n;
      img.alt = n;
    });
  }

  function lock(label) {
    dropped = true;
    markDropped();
    if (btn) {
      btn.disabled = true;
      btn.textContent = label;
    }
  }

  async function load() {
    try {
      const r = await fetch("/api/pokedrops", { cache: "no-store" });
      if (!r.ok) throw 0;
      const d = await r.json();
      if (typeof d.count === "number") globalCount = d.count;
      (d.recent || []).forEach((id) => render(id, false));
    } catch (e) {
      // no backend (opened as a file / offline): just start empty
    }
    fit();
    refreshCount();
  }

  async function drop() {
    if (dropped) return;
    try {
      const r = await fetch("/api/pokedrops", { method: "POST" });
      if (!r.ok) throw 0;
      const d = await r.json();
      if (typeof d.count === "number") globalCount = d.count;
      render(d.added, true);
    } catch (e) {
      // graceful fallback: still give the visitor their moment (client-only)
      if (globalCount != null) globalCount += 1;
      render(1 + Math.floor(Math.random() * 1025), true);
    }
    fit();
    refreshCount();
    lock("✓ You dropped one");
  }

  if (alreadyDropped()) lock("✓ You dropped one"); // stay locked after a refresh
  load();
  if (btn) btn.addEventListener("click", drop);
})();

/* ---------- 4. Page is shown directly (no landing page) ---------- */
startInfoReveals();
