/* ============================================================
   Storage
   ============================================================ */
const STORE = "homepage.config.v1";

/* ============================================================
   Settings
   ============================================================ */
const DEFAULT_SETTINGS = {
  theme: "dark",
  alignment: "centered",
  layout: "horizontal",
};

let appliedCustomVars = [];

function applySettings(settings = {}) {
  const s = Object.assign({}, DEFAULT_SETTINGS, settings);

  document.body.dataset.alignment = s.alignment;
  document.body.dataset.layout = s.layout;
  
  const pct = Number(s.linkScale);
  document.body.style.setProperty("--link-scale", (pct > 0 ? pct / 100 : 1));

  const w = Number(s.linkWidth);
  if (w > 0) {
    document.body.style.setProperty("--link-width", w + "px");
  } else {
    document.body.style.removeProperty("--link-width");
  }


  if (s.theme === "custom" && s.customTheme && typeof s.customTheme === "object") {
    document.body.dataset.theme = "custom";
    applyCustomTheme(s.customTheme);
  } else {
    document.body.dataset.theme = s.theme || "dark";
    clearCustomTheme();
  }

  applyBackground(s.background);
}

/* ============================================================
   Background
   ============================================================ */
let currentBgVideo = null;

function normalizeBgImage(v) {
  if (!v) return "";
  const trimmed = String(v).trim();
  if (/^(url|linear-gradient|radial-gradient|conic-gradient|image-set)\(/i.test(trimmed)) {
    return trimmed;
  }
  return 'url("' + trimmed.replace(/"/g, '\\"') + '")';
}

function applyBackground(bg) {
  document.body.classList.remove("has-bg");
  ["--bg-image", "--bg-blur", "--bg-dim", "--bg-size", "--bg-position", "--bg-object-fit"]
    .forEach(function (v) { document.body.style.removeProperty(v); });

  if (currentBgVideo) {
    currentBgVideo.pause();
    currentBgVideo.removeAttribute("src");
    currentBgVideo.load();
    currentBgVideo.remove();
    currentBgVideo = null;
  }

  if (!bg || (!bg.image && !bg.video)) return;

  document.body.classList.add("has-bg");

  if (bg.image) {
    document.body.style.setProperty("--bg-image", normalizeBgImage(bg.image));
  }
  document.body.style.setProperty("--bg-blur",       (Number(bg.blur) || 0) + "px");
  document.body.style.setProperty("--bg-dim",        Number(bg.dim)  || 0);
  document.body.style.setProperty("--bg-size",       bg.size     || "cover");
  document.body.style.setProperty("--bg-position",   bg.position || "center");
  document.body.style.setProperty("--bg-object-fit", bg.size     || "cover");

  if (bg.video) injectBgVideo(bg.video);
}

function injectBgVideo(src) {
  const v = document.createElement("video");
  v.id = "bg-video";
  v.src = src;
  v.muted = true;
  v.loop = true;
  v.autoplay = true;
  v.playsInline = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("preload", "auto");

  document.body.appendChild(v);
  currentBgVideo = v;

  const p = v.play();
  if (p && p.catch) p.catch(function () {});
}


function applyCustomTheme(theme) {
  clearCustomTheme();
  Object.keys(theme).forEach(function (key) {
    const varName = key.indexOf("--") === 0 ? key : "--" + key;
    document.body.style.setProperty(varName, theme[key]);
    appliedCustomVars.push(varName);
  });
}

function clearCustomTheme() {
  appliedCustomVars.forEach(function (v) {
    document.body.style.removeProperty(v);
  });
  appliedCustomVars = [];
}

/* ============================================================
   Helpers
   ============================================================ */
function initial(n) { return (n[0] || "?").toUpperCase(); }

function safeHost(url) {
  try { return new URL(url).hostname; } catch (e) { return ""; }
}

/* ============================================================
   Render
   ============================================================ */
function render(bookmarks = {}) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const groups = Object.entries(bookmarks);
  if (!groups.length) return showEmptyState();

  groups.forEach(function (entry) {
    const groupName = entry[0];
    const items = entry[1];

    const section = document.createElement("section");
    section.className = "group";

    const h2 = document.createElement("h2");
    h2.textContent = groupName;
    section.appendChild(h2);

    const row = document.createElement("div");
    row.className = "group-links";

    Object.entries(items).forEach(function (pair) {
      row.appendChild(makeBookmark(pair[0], pair[1]));
    });

    section.appendChild(row);
    app.appendChild(section);
  });
}

function makeBookmark(name, data) {
  const a = document.createElement("a");
  a.className = "bookmark";
  a.href = data.link || "#";
  a.target = "_blank";
  a.rel = "noopener";

  const icon = document.createElement("div");
  icon.className = "icon";

  function fallback() {
    icon.innerHTML = "";
    icon.textContent = initial(name);
  }

  if (data.favicons && data.link) {
    const img = document.createElement("img");
    img.alt = "";
    img.src = "https://www.google.com/s2/favicons?sz=64&domain=" + safeHost(data.link);
    img.onerror = fallback;
    icon.appendChild(img);
  } else if (data.icon) {
    const img = document.createElement("img");
    img.alt = "";
    img.src = data.icon;
    img.onerror = fallback;
    icon.appendChild(img);
  } else {
    icon.textContent = initial(name);
  }

  const label = document.createElement("span");
  label.className = "name";
  label.textContent = name;

  a.append(icon, label);

  if (data.description) {
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = data.description;
    a.appendChild(desc);
  }

  return a;
}

/* ============================================================
   Empty state
   ============================================================ */
function showEmptyState() {
  const app = document.getElementById("app");
  app.innerHTML =
    '<div class="empty">' +
      '<p>No bookmarks loaded yet.</p>' +
      '<button id="loadBtn">Load bookmarks.json</button>' +
      '<p class="hint">or drop the file anywhere on this page.</p>' +
    '</div>';
  document.getElementById("loadBtn").onclick = pickFile;
}

/* ============================================================
   Loading
   ============================================================ */
function loadConfig() {
  return new Promise(function (resolve) {
    try {
      const cached = localStorage.getItem(STORE);
      if (cached) return resolve(JSON.parse(cached));
    } catch (e) {}

    fetch("bookmarks.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) return resolve(null);
        return res.json().then(function (data) {
          localStorage.setItem(STORE, JSON.stringify(data));
          resolve(data);
        });
      })
      .catch(function () { resolve(null); });
  });
}

function boot(config) {
  if (!config) {
    applySettings();
    setupSearch(null);
    return showEmptyState();
  }
  applySettings(config.settings);
  setupSearch(config.search);
  render(config.bookmarks);
}

/* ============================================================
   Import via file picker
   ============================================================ */
function pickFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = function () {
    if (input.files[0]) readFile(input.files[0]);
  };
  input.click();
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      localStorage.setItem(STORE, JSON.stringify(data));
      boot(data);
    } catch (e) {
      alert("Invalid JSON:\n" + e.message);
    }
  };
  reader.readAsText(file);
}

/* ============================================================
   Drag & drop
   ============================================================ */
const dropzone = document.getElementById("dropzone");
let dragDepth = 0;

window.addEventListener("dragenter", function (e) {
  e.preventDefault();
  dragDepth++;
  if (dragDepth === 1) dropzone.classList.add("active");
});
window.addEventListener("dragover", function (e) { e.preventDefault(); });
window.addEventListener("dragleave", function (e) {
  e.preventDefault();
  dragDepth--;
  if (dragDepth === 0) dropzone.classList.remove("active");
});
window.addEventListener("drop", function (e) {
  e.preventDefault();
  dragDepth = 0;
  dropzone.classList.remove("active");
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
});

/* ============================================================
   Top-left load button
   ============================================================ */
document.getElementById("loadBtnTop").addEventListener("click", pickFile);

/* ============================================================
   Search bar
   ============================================================ */
const DEFAULT_SEARCH = {
  enabled: true,
  default: "Google",
  providers: {
    "Google":    "https://www.google.com/search?q=",
    "Brave":     "https://search.brave.com/search?q=",
    "DuckDuckGo":"https://duckduckgo.com/?q=",
  },
};

const PROVIDER_STORE = "homepage.search.provider";

function setupSearch(cfg) {
  const searchCfg = Object.assign({}, DEFAULT_SEARCH, cfg || {});
  const form = document.getElementById("searchForm");

  if (searchCfg.enabled === false) {
    form.hidden = true;
    return;
  }

  const providers = searchCfg.providers || {};
  const names = Object.keys(providers);
  if (!names.length) { form.hidden = true; return; }

  const select = document.getElementById("searchProvider");
  const input  = document.getElementById("searchInput");

  // populate
  select.innerHTML = "";
  names.forEach(function (name) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  // pick active: last-used (if still valid) → default → first
  const stored = localStorage.getItem(PROVIDER_STORE);
  if (stored && providers[stored])       select.value = stored;
  else if (providers[searchCfg.default]) select.value = searchCfg.default;
  else                                    select.value = names[0];

  // remember choice
  select.addEventListener("change", function () {
    localStorage.setItem(PROVIDER_STORE, select.value);
  });

  // submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    const looksLikeUrl = /^https?:\/\//i.test(q) ||
                         /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q);

    if (looksLikeUrl) {
      window.location.href = /^https?:/i.test(q) ? q : "https://" + q;
      return;
    }

    const engine = providers[select.value];
    if (!engine) return;
    window.top.location.href = engine + encodeURIComponent(q);
  });

  // show now that it's populated
  form.hidden = false;
}

// "/" focuses the search bar
document.addEventListener("keydown", function (e) {
  const input = document.getElementById("searchInput");
  const form  = document.getElementById("searchForm");
  if (!input || !form || form.hidden) return;
  if (e.key === "/" && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
    input.select();
  }
});

/* ============================================================
   Go
   ============================================================ */
loadConfig().then(boot);
