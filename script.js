/* ============================================================
   Pokémon Portfolio — behaviour
   ============================================================ */

/* ---------- 1. Experience: company switcher ---------- */
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

/* ---------- 2. "Drop a Pokémon" footer (shared store) ---------- */
(function pokeFooter() {
  const stage = document.getElementById("pfootStage");
  const btn = document.getElementById("pfootBtn");
  const count = document.getElementById("pfootCount");
  if (!stage) return;

  // All mons live in an inner track that scales to fit the footer width, so the
  // whole crowd stays visible (no cut-off faces/names) however many there are.
  const track = document.createElement("div");
  track.className = "pfoot-track";
  stage.appendChild(track);
  function fit() {
    const avail = stage.clientWidth;
    const w = track.scrollWidth;
    const s = (w > avail && avail > 0) ? avail / w : 1;
    track.style.transform = "scale(" + s + ")";
    track.style.setProperty("--inv", (1 / s).toFixed(3));
  }
  window.addEventListener("resize", fit);

  const ART = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  let dropped = false;
  const DROP_KEY = "pokedrop:done";
  function alreadyDropped() {
    try { return localStorage.getItem(DROP_KEY) === "1"; } catch (e) { return false; }
  }
  function markDropped() {
    try { localStorage.setItem(DROP_KEY, "1"); } catch (e) {}
  }

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
  const pretty = (name) =>
    name ? name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Pokémon";

  let globalCount = null;
  function refreshCount() {
    if (!count) return;
    const total = (globalCount != null) ? globalCount : track.children.length;
    count.textContent = total === 0
      ? "Be the first to drop a Pokémon"
      : `${total.toLocaleString()} trainer${total === 1 ? "" : "s"} stopped by`;
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
      const name = pretty(list && list[id - 1]);
      tag.textContent = name;
      img.alt = name;
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
      const response = await fetch("/api/pokedrops", { cache: "no-store" });
      if (!response.ok) throw 0;
      const data = await response.json();
      if (typeof data.count === "number") globalCount = data.count;
      (data.recent || []).forEach((id) => render(id, false));
    } catch (e) {
      // No backend (opened as a file / offline): just start empty.
    }
    fit();
    refreshCount();
  }

  async function drop() {
    if (dropped) return;
    try {
      const response = await fetch("/api/pokedrops", { method: "POST" });
      if (!response.ok) throw 0;
      const data = await response.json();
      if (typeof data.count === "number") globalCount = data.count;
      render(data.added, true);
    } catch (e) {
      if (globalCount != null) globalCount += 1;
      render(1 + Math.floor(Math.random() * 1025), true);
    }
    fit();
    refreshCount();
    lock("✓ You dropped one");
  }

  if (alreadyDropped()) lock("✓ You dropped one");
  load();
  if (btn) btn.addEventListener("click", drop);
})();
