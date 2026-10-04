// TorBox Lovelace card — served and auto-loaded by the torbox integration.
// Visual language from torbox.app: #04BF8A accent, dot-matrix numerals, faint grid, cube logo.
const T = {
  en: {
    ui: {
      dl: "Download", ul: "Upload", eta: "ETA", none: "No downloads in progress", queue: "Downloads in progress",
      more: "more", cooldown: "Cooldown", peak: "peak", days: "days", expired: "Expired", seeds: "seeds", peers: "peers",
      pick: "Select a TorBox account in the card editor.",
    },
    stat: {
      active_downloads: "Active", total_downloaded: "Downloaded", cloud_items: "In cloud", premium_expires: "Premium",
      plan: "Plan", cooldown_until: "Cooldown", download_speed: "Download", upload_speed: "Upload",
    },
    cfg: {
      device_id: "TorBox account", sec_look: "Appearance", sec_top: "Header, speed and chart", sec_stats: "Statistics",
      sec_dl: "Downloads", theme: "Theme", size: "Size", title: "Subtitle", plain_numbers: "Plain numbers (no dot-matrix)",
      hide_header: "Hide header", hide_plan: "Hide plan badge", hide_speed: "Hide download speed", hide_upload: "Hide upload speed",
      hide_chart: "Hide chart", chart_hours: "Chart span (hours)", hide_stats: "Hide statistics",
      stats: "Statistics shown (drag to reorder)", hide_downloads: "Hide downloads", hide_empty: "Hide section when empty",
      max_downloads: "Max downloads shown", sort: "Sort by", hide_types: "Hide types", hide_details: "Hide details",
    },
    opt: {
      auto: "Auto (follow Home Assistant)", dark: "Dark", light: "Light", small: "Small", medium: "Medium", large: "Large",
      xlarge: "Extra large", default: "TorBox order", progress: "Progress", speed: "Speed", name: "Name", eta: "ETA",
      type: "Type", state: "State", seeds: "Seeds", peers: "Peers", size: "Size", torrent: "Torrent", usenet: "Usenet", webdl: "Web",
      active_downloads: "Active downloads", total_downloaded: "Total downloads", cloud_items: "Cloud items",
      premium_expires: "Premium days left", plan: "Plan", cooldown_until: "Cooldown", download_speed: "Download speed",
      upload_speed: "Upload speed",
    },
  },
  it: {
    ui: {
      dl: "Download", ul: "Upload", eta: "ETA", none: "Nessun download in corso", queue: "Download in corso",
      more: "altri", cooldown: "Cooldown", peak: "picco", days: "giorni", expired: "Scaduto", seeds: "seed", peers: "peer",
      pick: "Seleziona un account TorBox nell'editor della card.",
    },
    stat: {
      active_downloads: "Attivi", total_downloaded: "Scaricati", cloud_items: "In cloud", premium_expires: "Premium",
      plan: "Piano", cooldown_until: "Cooldown", download_speed: "Download", upload_speed: "Upload",
    },
    cfg: {
      device_id: "Account TorBox", sec_look: "Aspetto", sec_top: "Intestazione, velocità e grafico", sec_stats: "Statistiche",
      sec_dl: "Download", theme: "Tema", size: "Dimensione", title: "Sottotitolo", plain_numbers: "Numeri normali (senza pallini)",
      hide_header: "Nascondi intestazione", hide_plan: "Nascondi badge piano", hide_speed: "Nascondi velocità download",
      hide_upload: "Nascondi velocità upload", hide_chart: "Nascondi grafico", chart_hours: "Ampiezza grafico (ore)",
      hide_stats: "Nascondi statistiche", stats: "Statistiche mostrate (trascina per riordinare)",
      hide_downloads: "Nascondi download", hide_empty: "Nascondi sezione se vuota", max_downloads: "Download massimi mostrati",
      sort: "Ordina per", hide_types: "Nascondi tipi", hide_details: "Nascondi dettagli",
    },
    opt: {
      auto: "Auto (segue Home Assistant)", dark: "Scuro", light: "Chiaro", small: "Piccola", medium: "Media", large: "Grande",
      xlarge: "Molto grande", default: "Ordine TorBox", progress: "Avanzamento", speed: "Velocità", name: "Nome", eta: "ETA",
      type: "Tipo", state: "Stato", seeds: "Seed", peers: "Peer", size: "Dimensione", torrent: "Torrent", usenet: "Usenet", webdl: "Web",
      active_downloads: "Download attivi", total_downloaded: "Download totali", cloud_items: "Elementi in cloud",
      premium_expires: "Giorni premium rimasti", plan: "Piano", cooldown_until: "Cooldown", download_speed: "Velocità download",
      upload_speed: "Velocità upload",
    },
  },
};
const dig = (lang, path) => path.split(".").reduce((o, k) => o?.[k], T[lang]);
const t = (path) => dig((document.documentElement.lang || "en").slice(0, 2), path) ?? dig("en", path) ?? path;

const STATS = ["active_downloads", "total_downloaded", "cloud_items", "premium_expires", "plan", "cooldown_until", "download_speed", "upload_speed"];
const TYPES = ["torrent", "usenet", "webdl"];
const DETAILS = ["progress", "type", "state", "seeds", "peers", "size", "speed", "eta"];
const SIZES = { small: 12, medium: 14, large: 16, xlarge: 19 }; // base font px; everything else is em
const DEFAULTS = {
  theme: "auto", size: "medium", chart_hours: 1, max_downloads: 10, sort: "default",
  stats: ["active_downloads", "total_downloaded", "cloud_items", "premium_expires"], hide_types: [], hide_details: [],
};
const SORT = {
  progress: (a, b) => b.progress - a.progress,
  speed: (a, b) => b.speed - a.speed,
  name: (a, b) => String(a.name).localeCompare(String(b.name)),
  eta: (a, b) => (a.eta > 0 ? a.eta : Infinity) - (b.eta > 0 ? b.eta : Infinity),
};

const LOGO = `<svg class="logo" viewBox="340 290 820 920" aria-hidden="true">
  <polygon points="749.99,749.99 749.99,1191.96 367.25,970.97 367.25,529.01" fill="#00444D"/>
  <polygon points="1132.75,529.01 1132.75,970.97 749.99,1191.96 749.99,749.99 872.87,679.05 956.71,630.66" fill="#34BA90"/>
  <polygon points="1132.75,529.01 749.99,749.99 367.25,529.01 749.99,308.04" fill="#52A153"/>
  <polygon points="1043.04,739.36 958.66,1057.08 952.4,851.84 839.71,915.39 872.87,679.05 956.71,630.66 931.81,799.21" fill="#fff"/>
</svg>`;
const BOLT = `<svg class="bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>`;

// 5x7 dot-matrix glyphs (one 5-bit row per entry, MSB = left column) for the brand's dotted look.
// Drawn as real dots on a grid instead of masking a font, so they stay crisp and legible.
const GLYPH = {
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31],
  3: [31, 2, 4, 2, 1, 17, 14], 4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14],
  6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8], 8: [14, 17, 17, 14, 17, 17, 14],
  9: [14, 17, 17, 15, 1, 2, 12], T: [31, 4, 4, 4, 4, 4, 4], O: [14, 17, 17, 17, 17, 17, 14],
  R: [30, 17, 17, 30, 20, 18, 17], B: [30, 17, 17, 30, 17, 17, 30], X: [17, 17, 10, 4, 10, 17, 17],
};
const NARROW = { ".": [1, [0, 0, 0, 0, 0, 0, 1]], ",": [2, [0, 0, 0, 0, 0, 1, 2]], "-": [3, [0, 0, 0, 7, 0, 0, 0]] };
NARROW["—"] = NARROW["-"]; // placeholder shown while a sensor is unavailable
const dots = (text, height) => {
  let x = 0, out = "";
  for (const ch of String(text).toUpperCase()) {
    const [w, rows] = NARROW[ch] ?? (GLYPH[ch] ? [5, GLYPH[ch]] : [2, []]); // unknown -> narrow space
    rows.forEach((bits, y) => {
      for (let c = 0; c < w; c++) if ((bits >> (w - 1 - c)) & 1) out += `<circle cx="${x + c + 0.5}" cy="${y + 0.5}" r=".42"/>`;
    });
    x += w + 1;
  }
  const cols = Math.max(1, x - 1);
  return `<svg class="dots" viewBox="0 0 ${cols} 7" width="${(cols * height) / 7}" height="${height}" role="img" aria-label="${esc(text)}">${out}</svg>`;
};

// Download names come from torrents/NZBs/URLs: always escape before innerHTML.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
let lang;
const n = (v, digits = 1) => Number(v).toLocaleString(lang, { maximumFractionDigits: digits });
// SI units (1 MB = 1000 kB), same as Home Assistant's data-rate sensors.
const bytes = (v) => {
  const u = ["B", "kB", "MB", "GB", "TB"];
  let i = 0;
  for (; v >= 1000 && i < u.length - 1; i++) v /= 1000;
  return `${n(v, i ? 1 : 0)} ${u[i]}`;
};
const duration = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : m ? `${m}m` : `${Math.floor(s)}s`;
};
const tone = (s = "") => (/error|fail/i.test(s) ? "err" : /stall|paus|queue|meta|check|wait/i.test(s) ? "warn" : "ok");
const ok = (s) => s && !["unknown", "unavailable"].includes(s.state);
const arr = (v, fallback) => (Array.isArray(v) ? v : fallback);

// Smooth SVG path through points (horizontal-tangent cubic segments: no overshoot).
const curve = (pts) =>
  pts.map(([x, y], i) => {
    if (!i) return `M${x},${y}`;
    const [px, py] = pts[i - 1], mx = (px + x) / 2;
    return `C${mx},${py} ${mx},${y} ${x},${y}`;
  }).join("");

// All text tokens meet WCAG AA (>= 4.5:1) on their background. Sizes are em so the "size" option scales everything.
const CSS = `
  :host { display: block; height: 100%; }
  ha-card {
    --bg: #0D0F13; --grid: rgba(255,255,255,.035); --glow: rgba(4,191,138,.14); --line: #212A36; --track: #1E2129;
    --text: #F5F7FA; --muted: #A7AFBB; --label: #8E97A6; --accent: #04BF8A; --accent-text: #04BF8A; --hero: #34E0A8;
    --bar: linear-gradient(90deg, #026873, #04BF8A); --ul: #8E97A6; --warn: #F5B544; --err: #F87171; --hover: rgba(255,255,255,.03);
    --pad: 1.4em;
    display: flex; flex-direction: column; height: 100%; box-sizing: border-box; position: relative; isolation: isolate;
    container-type: inline-size; overflow: hidden; padding: var(--pad); font-size: 14px;
    color: var(--text); font-family: Inter, var(--ha-font-family-body, Roboto), system-ui, sans-serif;
    background: radial-gradient(110% 50% at 0% 0%, var(--glow), transparent 60%), var(--bg);
    border: 1px solid var(--line); border-radius: var(--ha-card-border-radius, 12px);
  }
  ha-card.light {
    --bg: #FFFFFF; --grid: rgba(18,20,27,.04); --glow: rgba(4,191,138,.10); --line: #E3E8EE; --track: #E8EDF1;
    --text: #12141B; --muted: #525B69; --label: #5F6876; --accent: #03A678; --accent-text: #03805D; --hero: #027A63;
    --bar: linear-gradient(90deg, #026873, #03A678); --ul: #5F6876; --warn: #A15C00; --err: #C62828; --hover: rgba(18,20,27,.025);
  }
  /* brand grid texture, fading out below the hero so the list stays clean */
  ha-card::before {
    content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 24px 24px,
      linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 24px 24px;
    -webkit-mask: linear-gradient(#000, transparent 18em); mask: linear-gradient(#000, transparent 18em);
  }
  ha-card.s-small { font-size: 12px; } ha-card.s-large { font-size: 16px; } ha-card.s-xlarge { font-size: 19px; }
  .block + .block { margin-top: 1.6em; }
  .label { font-size: .78em; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--label); }
  .num { font-variant-numeric: tabular-nums; }
  [data-entity] { cursor: pointer; }

  .head { display: flex; align-items: center; gap: .7em; }
  .logo { width: 1.85em; height: 1.85em; flex: none; }
  .dots { display: block; flex: none; fill: var(--text); }
  .word { font-weight: 700; letter-spacing: .16em; }
  .sub { min-width: 0; color: var(--muted); font-size: .93em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .spacer { flex: 1; }
  .pill { padding: .3em .75em; border-radius: 999px; font-size: .78em; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    white-space: nowrap; color: #fff; background: linear-gradient(90deg, #026873, #04BF8A 60%, #025940); }
  .pill.warn { color: var(--warn); background: none; box-shadow: inset 0 0 0 1px currentColor; }

  .hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.1em; }
  .big { display: flex; align-items: baseline; gap: .55em; margin-top: .7em; }
  .big .dots { fill: var(--hero); }
  .big .plain { font-size: 2.6em; font-weight: 600; line-height: 1; letter-spacing: -.02em; color: var(--hero); }
  .unit { font-weight: 600; color: var(--muted); }
  .up { margin-left: auto; text-align: right; }
  .up .v { margin-top: .7em; font-size: 1.3em; font-weight: 600; white-space: nowrap; }
  .live { display: inline-block; width: .5em; height: .5em; margin-right: .55em; border-radius: 50%; background: var(--line); }
  .live.on { background: var(--accent); animation: pulse 2s ease-out infinite; }

  .chart { margin: 1.15em calc(-1 * var(--pad)) 0; }
  .chart svg { display: block; width: 100%; height: 4em; }
  .chart path { vector-effect: non-scaling-stroke; }
  .chart .cap { display: flex; justify-content: space-between; padding: .45em var(--pad) 0; }

  .stats { display: grid; gap: .9em 1em; padding: 1em 0; border-block: 1px solid var(--line); }
  .stat { min-width: 0; }
  .stat .v { font-size: 1.43em; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat .label { display: block; margin-top: .3em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .downloads { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
  .section { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: .4em; }
  .count { font-size: .93em; font-weight: 700; color: var(--accent-text); }
  /* fills the card when it is given a fixed height (sections grid) and scrolls the list */
  .items { flex: 1 1 auto; min-height: 0; overflow-y: auto; margin: 0 -.7em; padding: 0 .7em;
    scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
  .item { margin: 0 -.7em; padding: .7em; border-radius: .55em; transition: background .2s; }
  .item:hover { background: var(--hover); }
  .row { display: flex; align-items: baseline; gap: .85em; min-width: 0; }
  .name { flex: 1; min-width: 0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rate { font-size: .93em; font-weight: 600; color: var(--accent-text); white-space: nowrap; }
  .bar { height: .3em; margin: .65em 0 .5em; border-radius: .15em; overflow: hidden; background: var(--track); }
  .bar i { display: block; height: 100%; border-radius: .15em; background: var(--bar); transition: width .8s ease; }
  .meta { font-size: .86em; color: var(--muted); }
  .meta .sp { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta b { color: var(--text); font-weight: 600; }
  .ok { color: var(--accent-text); } .warn { color: var(--warn); } .err { color: var(--err); }
  .more { padding-top: .45em; text-align: center; font-size: .86em; color: var(--muted); }
  .empty { display: flex; flex-direction: column; align-items: center; gap: .7em; padding: 1.3em 0 .45em; font-size: .93em; color: var(--muted); }
  .bolt { width: 2.3em; height: 2.3em; fill: none; stroke: var(--accent); stroke-width: 1.2; stroke-linejoin: round; }

  /* em in container queries = the card's own font size, so breakpoints follow the "size" option */
  @container (max-width: 30em) { .stats { grid-template-columns: repeat(2, 1fr) !important; } }
  @container (max-width: 20em) { .hero { flex-direction: column; align-items: flex-start; } .up { margin-left: 0; text-align: left; } }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(4,191,138,.5); } 80%, 100% { box-shadow: 0 0 0 .5em rgba(4,191,138,0); } }
  @media (prefers-reduced-motion: reduce) { .live.on { animation: none; } .bar i { transition: none; } }
`;

class TorBoxCard extends HTMLElement {
  constructor() {
    super();
    this._series = { download_speed: [], upload_speed: [] };
    this._widths = {};
    this.attachShadow({ mode: "open" }).addEventListener("click", (ev) => {
      const entityId = ev.target.closest("[data-entity]")?.dataset.entity;
      if (entityId)
        this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
    });
  }

  static getStubConfig(hass) {
    const e = Object.values(hass.entities).find((e) => e.platform === "torbox" && e.device_id);
    return { device_id: e?.device_id ?? "", stats: [...DEFAULTS.stats] };
  }

  // Toggles are all "hide_*" / "plain_*": an unset key (shown as off in the editor) is the default look.
  static getConfigForm() {
    const select = (options, extra = {}) => ({
      select: { mode: "dropdown", options: options.map((v) => ({ value: v, label: t(`opt.${v}`) })), ...extra },
    });
    const bool = { boolean: {} };
    const grid = (...schema) => ({ type: "grid", name: "", flatten: true, schema });
    const section = (name, ...schema) => ({ type: "expandable", name, title: t(`cfg.${name}`), flatten: true, schema });
    return {
      schema: [
        { name: "device_id", required: true, selector: { device: { integration: "torbox" } } },
        section("sec_look",
          grid(
            { name: "theme", default: DEFAULTS.theme, selector: select(["auto", "dark", "light"]) },
            { name: "size", default: DEFAULTS.size, selector: select(Object.keys(SIZES)) },
          ),
          { name: "title", selector: { text: {} } },
          { name: "plain_numbers", selector: bool },
        ),
        section("sec_top",
          grid(
            { name: "hide_header", selector: bool },
            { name: "hide_plan", selector: bool },
            { name: "hide_speed", selector: bool },
            { name: "hide_upload", selector: bool },
            { name: "hide_chart", selector: bool },
          ),
          { name: "chart_hours", default: DEFAULTS.chart_hours, selector: { number: { min: 1, max: 24, step: 1, mode: "slider" } } },
        ),
        section("sec_stats",
          { name: "hide_stats", selector: bool },
          { name: "stats", selector: select(STATS, { multiple: true, reorder: true }) },
        ),
        section("sec_dl",
          grid(
            { name: "hide_downloads", selector: bool },
            { name: "hide_empty", selector: bool },
            { name: "max_downloads", default: DEFAULTS.max_downloads, selector: { number: { min: 1, max: 50, mode: "box" } } },
            { name: "sort", default: DEFAULTS.sort, selector: select(["default", "progress", "speed", "name", "eta"]) },
          ),
          { name: "hide_types", selector: select(TYPES, { multiple: true, mode: "list" }) },
          { name: "hide_details", selector: select(DETAILS, { multiple: true, mode: "list" }) },
        ),
      ],
      computeLabel: (s) => t(`cfg.${s.name}`),
    };
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...config };
    this._last = this._ids = this._histFor = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    const c = this._config ?? DEFAULTS;
    return 1 + (c.hide_speed && c.hide_upload ? 0 : 2) + (c.hide_chart ? 0 : 1) + (c.hide_stats ? 0 : 1) +
      (c.hide_downloads ? 0 : 1 + Math.min(c.max_downloads, 3));
  }

  getGridOptions() {
    return { columns: 12, min_columns: 3, rows: "auto", min_rows: 2 };
  }

  // translation_key -> entity_id of this device's torbox sensors; recomputed only when the registry changes
  _entityIds() {
    if (this._idsSrc !== this._hass.entities || !this._ids) {
      this._idsSrc = this._hass.entities;
      this._ids = {};
      for (const e of Object.values(this._hass.entities))
        if (e.platform === "torbox" && e.device_id === this._config.device_id && e.translation_key)
          this._ids[e.translation_key] = e.entity_id;
    }
    return this._ids;
  }

  // Seed the speed chart from recorder history once per span, then extend it from live state updates.
  async _loadHistory(ids, span) {
    const keys = Object.keys(this._series).filter((k) => ids[k]);
    this._histFor = ids.download_speed + span;
    try {
      const res = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(Date.now() - span).toISOString(),
        entity_ids: keys.map((k) => ids[k]),
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      for (const k of keys) {
        const hist = (res[ids[k]] ?? []).map((p) => ({ t: p.lu * 1000, v: Number(p.s) })).filter((p) => isFinite(p.v));
        const live = this._series[k];
        this._series[k] = [...hist.filter((p) => !live.length || p.t < live[0].t), ...live];
      }
      this._last = null;
      this._render();
    } catch (err) {
      // recorder disabled/excluded: chart just fills up live
    }
  }

  _track(st, span) {
    const cutoff = Date.now() - span - 600e3;
    for (const k of Object.keys(this._series)) {
      const s = st[k];
      if (!ok(s)) continue;
      const pts = this._series[k], p = { t: Date.parse(s.last_updated), v: Number(s.state) };
      if (!pts.length || pts.at(-1).t < p.t) pts.push(p);
      while (pts.length > 2 && pts[1].t < cutoff) pts.shift();
    }
  }

  _chart(unit, span) {
    const W = 300, H = 56, t0 = Date.now() - span;
    const all = [...this._series.download_speed, ...this._series.upload_speed].filter((p) => p.t >= t0);
    if (!all.length) return "";
    const peak = Math.max(...all.map((p) => p.v));
    const max = peak || 1; // vertical scale only; a flat zero line stays at the bottom
    const line = (pts) => {
      const from = Math.max(0, pts.findLastIndex((p) => p.t < t0));
      const xy = pts.slice(from).map((p) => [Math.max(0, ((p.t - t0) / span) * W), H - 2 - (p.v / max) * (H - 6)]);
      if (xy.length) xy.push([W, xy.at(-1)[1]]);
      return xy;
    };
    const dl = line(this._series.download_speed);
    const ul = this._config.hide_upload ? [] : line(this._series.upload_speed);
    const area = dl.length ? `${curve(dl)}L${W},${H}L${dl[0][0]},${H}Z` : "";
    const hours = span / 3600e3;
    return `
      <div class="chart" data-entity="${this._ids.download_speed}">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#04BF8A" stop-opacity=".28"/><stop offset="1" stop-color="#04BF8A" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="${area}" fill="url(#fill)"/>
          <path d="${curve(ul)}" fill="none" style="stroke: var(--ul)" stroke-width="1" stroke-dasharray="2 3"/>
          <path d="${curve(dl)}" fill="none" style="stroke: var(--accent)" stroke-width="1.75"/>
        </svg>
        <div class="cap">
          <span class="label num">${hours === 1 ? "60 min" : `${hours} h`}</span>
          <span class="label num">${t("ui.peak")} ${esc(n(peak, 2))} ${esc(unit)}</span>
        </div>
      </div>`;
  }

  _item(d, i, ids, hide) {
    const pct = Math.min(100, Math.max(0, Number(d.progress) || 0));
    const state = d.state ? d.state[0].toUpperCase() + d.state.slice(1) : "";
    const meta = [
      !hide.has("progress") && `<b class="num">${esc(n(pct))}%</b>`,
      !hide.has("type") && esc(t(`opt.${d.type}`)),
      !hide.has("state") && state && `<span class="${tone(d.state)}">${esc(state)}</span>`,
      !hide.has("seeds") && d.seeds != null && `${n(d.seeds, 0)} ${t("ui.seeds")}`,
      !hide.has("peers") && d.peers != null && `${n(d.peers, 0)} ${t("ui.peers")}`,
      !hide.has("size") && d.size && esc(bytes(d.size)),
    ].filter(Boolean).join(" · ");
    const eta = !hide.has("eta") && d.eta > 0 ? `<span class="num">${t("ui.eta")} ${esc(duration(d.eta))}</span>` : "";
    return `
      <div class="item" data-entity="${ids.active_downloads}">
        <div class="row">
          <span class="name" title="${esc(d.name)}">${esc(d.name)}</span>
          ${!hide.has("speed") && d.speed ? `<span class="rate num">${esc(bytes(d.speed))}/s</span>` : ""}
        </div>
        <div class="bar"><i data-i="${i}" style="width:${this._widths[`${d.type}:${d.name}`] ?? 0}%"></i></div>
        ${meta || eta ? `<div class="row meta"><span class="sp">${meta}</span>${eta}</div>` : ""}
      </div>`;
  }

  _render() {
    const c = this._config, hass = this._hass;
    if (!c || !hass) return;
    const ids = this._entityIds();
    const st = Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, hass.states[id]]));
    const light = c.theme === "light" || (c.theme === "auto" && hass.themes?.darkMode === false);
    // hass is set on every HA state change: skip unless one of our states (or the theme) changed
    const cur = [...Object.values(st), light];
    if (this._last && cur.length === this._last.length && cur.every((s, i) => s === this._last[i])) return;
    this._last = cur;
    lang = hass.locale?.language ?? hass.language;

    const size = SIZES[c.size] ? c.size : DEFAULTS.size;
    const card = (body) => `<style>${CSS}</style><ha-card class="s-${size} ${light ? "light" : ""}">${body}</ha-card>`;
    if (cur.length === 1) {
      this.shadowRoot.innerHTML = card(`<div class="empty">${BOLT}${t("ui.pick")}</div>`);
      return;
    }
    const base = SIZES[size];
    const span = Math.min(24, Math.max(1, Math.round(Number(c.chart_hours) || 1))) * 3600e3;
    const showChart = !c.hide_chart && ids.download_speed;
    if (showChart && this._histFor !== ids.download_speed + span) this._loadHistory(ids, span);
    this._track(st, span);

    const fmt = (k) => (ok(st[k]) ? hass.formatEntityState(st[k]) : "—");
    const num = (k) => (ok(st[k]) ? fmt(k).replace(st[k].attributes.unit_of_measurement ?? "", "").trim() : "—");
    const unit = st.download_speed?.attributes.unit_of_measurement ?? "";
    const all = st.active_downloads?.attributes.downloads ?? [];
    const hiddenTypes = arr(c.hide_types, []);
    let downloads = all.filter((d) => !hiddenTypes.includes(d.type));
    if (SORT[c.sort]) downloads = [...downloads].sort(SORT[c.sort]);
    const cooldown = ok(st.cooldown_until) ? Date.parse(st.cooldown_until.state) - Date.now() : 0;
    const blocks = [];

    if (!c.hide_header)
      blocks.push(`
        <div class="block head">
          ${LOGO}${c.plain_numbers ? `<span class="word">TORBOX</span>` : dots("TORBOX", base)}
          ${c.title ? `<span class="sub">${esc(c.title)}</span>` : ""}
          <span class="spacer"></span>
          ${cooldown > 0 ? `<span class="pill warn" data-entity="${ids.cooldown_until}">${t("ui.cooldown")} ${duration(cooldown / 1000)}</span>` : ""}
          ${!c.hide_plan && ok(st.plan) ? `<span class="pill" data-entity="${ids.plan}">${esc(fmt("plan"))}</span>` : ""}
        </div>`);

    const speed = c.plain_numbers
      ? `<span class="plain num">${esc(num("download_speed"))}</span>`
      : dots(num("download_speed"), base * 2.6);
    if (!c.hide_speed || !c.hide_upload || showChart)
      blocks.push(`
        <div class="block">
          ${c.hide_speed && c.hide_upload ? "" : `
            <div class="hero">
              ${c.hide_speed ? "" : `
                <div data-entity="${ids.download_speed}">
                  <div class="label"><span class="live ${all.length ? "on" : ""}"></span>${t("ui.dl")}</div>
                  <div class="big">${speed}<span class="unit">${esc(unit)}</span></div>
                </div>`}
              ${c.hide_upload ? "" : `
                <div class="up" data-entity="${ids.upload_speed}">
                  <div class="label">${t("ui.ul")}</div>
                  <div class="v num">${esc(fmt("upload_speed"))}</div>
                </div>`}
            </div>`}
          ${showChart ? this._chart(unit, span) : ""}
        </div>`);

    const statValue = (k) => {
      if (k === "plan" || k === "download_speed" || k === "upload_speed") return fmt(k);
      if (k === "cooldown_until") return cooldown > 0 ? duration(cooldown / 1000) : "—";
      if (k === "premium_expires") {
        if (!ok(st[k])) return "—";
        const days = Math.ceil((Date.parse(st[k].state) - Date.now()) / 864e5);
        return days > 0 ? `${days} ${t("ui.days")}` : t("ui.expired");
      }
      return num(k);
    };
    const stats = arr(c.stats, DEFAULTS.stats).filter((k) => STATS.includes(k) && ids[k]);
    if (!c.hide_stats && stats.length)
      blocks.push(`
        <div class="block stats" style="grid-template-columns: repeat(${Math.min(stats.length, 4)}, 1fr)">
          ${stats.map((k) => `
            <div class="stat" data-entity="${ids[k]}">
              <div class="v num">${esc(statValue(k))}</div><span class="label">${t(`stat.${k}`)}</span>
            </div>`).join("")}
        </div>`);

    const shown = downloads.slice(0, Math.max(1, Math.round(Number(c.max_downloads)) || DEFAULTS.max_downloads));
    const hide = new Set(arr(c.hide_details, []));
    if (!c.hide_downloads && !(c.hide_empty && !downloads.length))
      blocks.push(`
        <div class="block downloads">
          <div class="section"><span class="label">${t("ui.queue")}</span><span class="count num">${downloads.length}</span></div>
          ${shown.length
            ? `<div class="items">
                ${shown.map((d, i) => this._item(d, i, ids, hide)).join("")}
                ${downloads.length > shown.length ? `<div class="more">+${downloads.length - shown.length} ${t("ui.more")}</div>` : ""}
              </div>`
            : `<div class="empty">${BOLT}${t("ui.none")}</div>`}
        </div>`);

    this.shadowRoot.innerHTML = card(blocks.join(""));

    // Bars render at their previous width, then animate to the new one.
    const pcts = shown.map((d) => Math.min(100, Math.max(0, Number(d.progress) || 0)));
    this._widths = Object.fromEntries(shown.map((d, i) => [`${d.type}:${d.name}`, pcts[i]]));
    requestAnimationFrame(() =>
      this.shadowRoot.querySelectorAll(".bar i").forEach((el) => (el.style.width = `${pcts[el.dataset.i]}%`))
    );
  }
}

if (!customElements.get("torbox-card")) {
  customElements.define("torbox-card", TorBoxCard);
  (window.customCards ||= []).push({
    type: "torbox-card",
    name: "TorBox",
    description: "TorBox account stats, live speed chart and downloads in progress",
    preview: true,
  });
}
