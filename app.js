const DARK_PALETTE = {
  bg: "#1B1D1A", card: "#24261F", cardBorder: "#3A3B33", cream: "#E4DFC9",
  muted: "#8F8D7C", brass: "#C99A3B", brassDark: "#8A6B27", steel: "#5C8494", steelDark: "#3E5C68",
  green: "#7A9459", red: "#E8998C", clay: "#B2663E"
};
const LIGHT_PALETTE = {
  bg: "#E4DFC9", card: "#F8F5EA", cardBorder: "#D2C9AE", cream: "#22231D",
  muted: "#6E6952", brass: "#8A6B27", brassDark: "#5E4B1B", steel: "#3E5C68", steelDark: "#2B4249",
  green: "#5C7A42", red: "#B03F30", clay: "#8C4C2B"
};

let COLORS = DARK_PALETTE;

function applyTheme() {
  const isDark = !window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches;
  COLORS = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  const root = document.documentElement.style;
  Object.keys(COLORS).forEach(k => root.setProperty("--" + k, COLORS[k]));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", COLORS.bg);
}
const RINGS = [10,9,8,7,6,5,4,3,2,1,0];
const STORAGE_KEY = "shooting-sessions";
const RANGE_KEY = "shooting-range-name";
const HAND_KEY = "shooting-hand";
const CUSTOM_WEAPONS_KEY = "shooting-custom-weapons"; // legacy, nur für Migration gelesen
const WEAPONS_KEY = "shooting-weapons";
const CUSTOM_CALIBERS_KEY = "shooting-custom-calibers";

const WEAPON_CATEGORIES = [
  { key: "repetierbuechse", label: "Repetierbüchse" },
  { key: "halbautomatisch", label: "Halbautomatische Büchse" },
  { key: "kurzwaffe", label: "Kurzwaffe" }
];

const DEFAULT_WEAPONS = [
  { name: "Tikka T3x Tac", caliber: ".308 Win", category: "repetierbuechse" },
  { name: "Sauer 100 Fieldshoot", caliber: ".308 Win", category: "repetierbuechse" },
  { name: "Sig Sauer P226 LDC", caliber: "9mm Luger", category: "kurzwaffe" },
  { name: "Smith & Wesson 686", caliber: ".357 Mag", category: "kurzwaffe" }
];
const DEFAULT_CALIBERS = [".308 Win", "9mm Luger", ".357 Mag"];
const AMMO_KEY = "shooting-ammo";
const DEFAULT_AMMO = [
  { name: "S&B .308 Win FMJ 147gr (Nr. 2908)", caliber: ".308 Win", v0: 850, v100: 772, v200: 693, v300: 626, sightHeight: 4.5, zero: 100, maxChartDist: 300 },
  { name: "9mm Luger Standard", caliber: "9mm Luger", v0: 360, v100: 258, v200: 185, v300: 132, sightHeight: 3.5, zero: 25, maxChartDist: 50 },
  { name: ".357 Mag Standard", caliber: ".357 Mag", v0: 420, v100: 318, v200: 241, v300: 183, sightHeight: 3.5, zero: 25, maxChartDist: 100 }
];
let AMMO = DEFAULT_AMMO.slice();
let WEAPONS = DEFAULT_WEAPONS.slice();
let CALIBERS = DEFAULT_CALIBERS.slice();
const MODES = [
  { key: "wettkampf", label: "Wettkampf" },
  { key: "frei", label: "Frei" }
];

// Nur Disziplinnummern, die direkt aus der DSB-Sportordnung bestätigt werden konnten.
// Quelle u.a.: dsb.de Teil 1 (Gewehr) und Teil 2 (Pistole/Revolver) der Sportordnung.
const DSB_DISCIPLINES = {
  "1.92": { name: "1.92 GK-Gewehr 100m liegend, Diopter (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.18": { name: "9.18 GK-Gewehr 100m Auflage sitzend, ZF (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.19": { name: "9.19 Ordonnanzgewehr 100m Auflage sitzend, geschl. Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.20": { name: "9.20 Ordonnanzgewehr 100m Auflage sitzend, offene Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.21": { name: "9.21 GK-Freigewehr 100m Auflage sitzend (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.22": { name: "9.22 GK-Gewehr 100m liegend, Diopter o. ZF (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.23": { name: "9.23 GK-Selbstladegewehr sitzend aufgelegt, offene Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.24": { name: "9.24 GK-Selbstladegewehr sitzend aufgelegt, geschl. Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.25": { name: "9.25 GK-Selbstladegewehr sitzend aufgelegt, Zielfernrohr (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.26": { name: "9.26 GK-Selbstladegewehr stehend freihändig, offene Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.27": { name: "9.27 GK-Selbstladegewehr stehend freihändig, geschl. Visierung (30 Schuss)", shots: 30, distance: 100, discipline: null },
  "9.60": { name: "9.60 GK-Sportpistole 25m, einhändig, Zentrumswertung (30 Schuss)", shots: 30, distance: 25, discipline: "praezision" },
  "9.63": { name: "9.63 GK-Sportpistole 25m, beidhändig erlaubt, Zentrumswertung (30 Schuss)", shots: 30, distance: 25, discipline: "praezision" },
  "2.53": { name: "2.53 (national DSB) GK-Pistole 9mm Luger 25m, Präzision-Hälfte (30 v. 60)", shots: 30, distance: 25, discipline: "praezision" },
  "2.55": { name: "2.55 (national DSB) GK-Revolver .357 Mag. 25m, Präzision-Hälfte (30 v. 60)", shots: 30, distance: 25, discipline: "praezision" }
};

function weaponCategory(w) { return w.category || "kurzwaffe"; }

let state = {
  view: "new",
  sessions: [],
  distance: 100,
  weapon: WEAPONS[0].name,
  caliber: WEAPONS[0].caliber,
  mode: "frei",
  discipline: "praezision",
  range: "Schützengilde zu Jüterbog",
  shooterHand: "rechts",
  ballisticCaliber: null,
  ballisticV0: null,
  ballisticBC: null,
  ballisticSightHeight: null,
  ballisticZero: null,
  ballisticMaxDist: null,
  reticleType: "mildot",
  ballisticTargetDist: null,
  ballisticMode: "table",
  ballisticVT0: null,
  ballisticVT100: null,
  ballisticVT200: null,
  ballisticVT300: null,
  ballisticAmmo: null,
  ammoEditMode: false,
  addingAmmo: false,
  editingAmmoOriginalName: null,
  confirmDeleteAmmo: null,
  newAmmoCaliber: null,
  ballisticUseWeather: true,
  ballisticWindSpeed: 0,
  ballisticWindClock: 3,
  weather: null,
  weatherStatus: "idle",
  weatherError: "",
  shots: [],
  statsFilter: "all",
  statsModeFilter: "all",
  statsWeaponFilter: "all",
  statsCaliberFilter: "all",
  saveError: "",
  savedFlash: false,
  expandedSessionId: null,
  editingId: null,
  addingWeapon: false,
  newWeaponCategory: "repetierbuechse",
  editingWeaponOriginalName: null,
  weaponEditMode: false,
  confirmDeleteWeapon: null,
  confirmDeleteSessionId: null,
  confirmReplaceImport: false,
  pendingImportMode: "merge",
  noteText: "",
  lotNumber: "",
  ammoName: "",
  competitionPreset: null,
  dsbLookupError: null,
  printSessionId: null,
  weaponEditCleanedNotice: null,
  addingCaliber: false,
  showDayExportPicker: false,
  selectedExportDays: []
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function todayISO() { return new Date().toISOString().slice(0,10); }
function formatDate(iso) { const [y,m,d] = iso.split("-"); return `${d}.${m}.${y}`; }

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.sessions = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.sessions = [];
    state.saveError = "Gespeicherte Daten konnten nicht gelesen werden.";
  }
  try {
    const savedRange = localStorage.getItem(RANGE_KEY);
    if (savedRange) state.range = savedRange;
  } catch (e) {}
  try {
    const savedHand = localStorage.getItem(HAND_KEY);
    if (savedHand === "rechts" || savedHand === "links") state.shooterHand = savedHand;
  } catch (e) {}
  try {
    const rawFull = localStorage.getItem(WEAPONS_KEY);
    if (rawFull) {
      const parsed = JSON.parse(rawFull);
      WEAPONS = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_WEAPONS.slice();
    } else {
      let legacyCustom = [];
      try {
        const rawLegacy = localStorage.getItem(CUSTOM_WEAPONS_KEY);
        if (rawLegacy) legacyCustom = JSON.parse(rawLegacy);
      } catch (e) {}
      WEAPONS = DEFAULT_WEAPONS.concat(legacyCustom);
      persistWeapons();
    }
  } catch (e) {
    WEAPONS = DEFAULT_WEAPONS.slice();
  }
  try {
    const rawC = localStorage.getItem(CUSTOM_CALIBERS_KEY);
    const customC = rawC ? JSON.parse(rawC) : [];
    CALIBERS = DEFAULT_CALIBERS.concat(customC.filter(c => DEFAULT_CALIBERS.indexOf(c) === -1));
  } catch (e) {}
  try {
    const rawAmmo = localStorage.getItem(AMMO_KEY);
    if (rawAmmo) {
      const parsed = JSON.parse(rawAmmo);
      AMMO = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_AMMO.slice();
    } else {
      AMMO = DEFAULT_AMMO.slice();
      persistAmmo();
    }
  } catch (e) {
    AMMO = DEFAULT_AMMO.slice();
  }
}

function degToCompass(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

async function fetchWeather(query) {
  if (!query || !query.trim()) return;
  state.weatherStatus = "loading";
  state.weatherError = "";
  render();
  try {
    let geo = await geocode(query.trim());
    if (!geo) {
      const parts = query.trim().split(/\s+/);
      const lastWord = parts[parts.length - 1];
      if (lastWord && lastWord !== query.trim()) geo = await geocode(lastWord);
    }
    if (!geo) {
      state.weatherStatus = "error";
      state.weatherError = "Ort für Wetterdaten nicht gefunden. Trag ggf. den Ortsnamen mit ein, z. B. \"Jüterbog\".";
      render();
      return;
    }
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + geo.latitude +
      "&longitude=" + geo.longitude +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code" +
      "&wind_speed_unit=ms&timezone=auto";
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.current) throw new Error("Keine aktuellen Daten erhalten");
    state.weather = {
      place: geo.name,
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.surface_pressure,
      fetchedAt: new Date().toISOString()
    };
    state.weatherStatus = "done";
    render();
  } catch (e) {
    state.weatherStatus = "error";
    state.weatherError = "Wetterdaten konnten nicht geladen werden (" + (e && e.message ? e.message : "Netzwerkfehler") + ").";
    render();
  }
}

async function geocode(name) {
  const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(name) + "&count=1&language=de&format=json";
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const r = data.results[0];
  return { name: r.name, latitude: r.latitude, longitude: r.longitude };
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sessions));
    state.saveError = "";
    return true;
  } catch (e) {
    state.saveError = "Speichern auf dem Gerät fehlgeschlagen (" + (e && e.message ? e.message : "unbekannter Fehler") + ").";
    return false;
  }
}

async function checkPresetPhaseComplete() {
  if (state.mode === "wettkampf" && state.competitionPreset && state.distance === 25 &&
      state.discipline === "praezision" && state.shots.length >= state.competitionPreset.shots) {
    if (!state.competitionGroupId) state.competitionGroupId = uid();
    await saveSeries();
    state.discipline = "duell";
    render();
  }
}

function addShot(ring) {
  const profile = getProfile(state.distance, state.discipline);
  const rad = profileSvgRadius(profile, ring);
  const i = state.shots.length;
  const angleDeg = (i * 137.508 + ring * 23) % 360;
  const angle = (angleDeg * Math.PI) / 180;
  state.shots.push({ ring, x: 50 + rad * Math.cos(angle), y: 50 + rad * Math.sin(angle), exact: false });
  checkPresetPhaseComplete();
  render();
}
function addShotAtPosition(x, y) {
  const profile = getProfile(state.distance, state.discipline);
  const dx = x - 50, dy = y - 50;
  const rad = Math.sqrt(dx * dx + dy * dy);
  const ring = profileRingForSvgRadius(profile, rad);
  state.shots.push({ ring, x, y, exact: true });
  checkPresetPhaseComplete();
  render();
}
function undoShot() { state.shots.pop(); render(); }
function clearShots() { state.shots = []; state.editingId = null; render(); }
function removeShotAt(index) { state.shots.splice(index, 1); render(); }

function persistWeapons() {
  try { localStorage.setItem(WEAPONS_KEY, JSON.stringify(WEAPONS)); } catch (e) {}
}

function addCustomWeapon(name, caliber, category) {
  if (!name.trim() || !caliber.trim()) return;
  const entry = { name: name.trim(), caliber: caliber.trim(), category: category || "kurzwaffe", lastCleanedDate: null };
  WEAPONS = WEAPONS.concat([entry]);
  persistWeapons();
  state.weapon = entry.name;
  state.caliber = entry.caliber;
  state.addingWeapon = false;
  if (CALIBERS.indexOf(entry.caliber) === -1) addCustomCaliber(entry.caliber, true);
  render();
}

function updateCustomWeapon(originalName, name, caliber, category) {
  if (!name.trim() || !caliber.trim()) return;
  WEAPONS = WEAPONS.map(w =>
    w.name === originalName ? { name: name.trim(), caliber: caliber.trim(), category: category || weaponCategory(w), lastCleanedDate: w.lastCleanedDate || null } : w
  );
  persistWeapons();
  if (state.weapon === originalName) { state.weapon = name.trim(); state.caliber = caliber.trim(); }
  state.addingWeapon = false;
  state.editingWeaponOriginalName = null;
  if (CALIBERS.indexOf(caliber.trim()) === -1) addCustomCaliber(caliber.trim(), true);
  render();
}

function markWeaponCleaned(name) {
  WEAPONS = WEAPONS.map(w => w.name === name ? { ...w, lastCleanedDate: todayISO() } : w);
  persistWeapons();
  state.weaponEditCleanedNotice = name;
  render();
}

function shotsSinceCleaning(weaponName) {
  const w = WEAPONS.find(w => w.name === weaponName);
  const since = w && w.lastCleanedDate ? w.lastCleanedDate : null;
  return state.sessions
    .filter(s => s.weapon === weaponName && (!since || s.date >= since))
    .reduce((a,s) => a + s.shots.length, 0);
}

function removeCustomWeapon(name) {
  if (WEAPONS.length <= 1) {
    state.saveError = "Mindestens eine Waffe muss vorhanden bleiben.";
    render();
    return;
  }
  WEAPONS = WEAPONS.filter(w => w.name !== name);
  persistWeapons();
  if (state.weapon === name) { state.weapon = WEAPONS[0].name; state.caliber = WEAPONS[0].caliber; }
  state.addingWeapon = false;
  state.editingWeaponOriginalName = null;
  state.confirmDeleteWeapon = null;
  render();
}

function persistAmmo() {
  try { localStorage.setItem(AMMO_KEY, JSON.stringify(AMMO)); } catch (e) {}
}

function parseDeNum(v) {
  if (v === undefined || v === null) return NaN;
  return Number(String(v).trim().replace(",", "."));
}

function addAmmo(name, caliber, v0, v100, v200, v300, sightHeight, zero, maxChartDist, tempSensitivity) {
  if (!name.trim() || !caliber.trim()) return;
  const entry = {
    name: name.trim(), caliber: caliber.trim(),
    v0: parseDeNum(v0) || 0, v100: parseDeNum(v100) || 0, v200: parseDeNum(v200) || 0, v300: parseDeNum(v300) || 0,
    sightHeight: parseDeNum(sightHeight) || 4, zero: parseDeNum(zero) || 100, maxChartDist: parseDeNum(maxChartDist) || 300,
    tempSensitivity: tempSensitivity !== undefined && tempSensitivity !== "" && !isNaN(parseDeNum(tempSensitivity)) ? parseDeNum(tempSensitivity) : null
  };
  AMMO = AMMO.concat([entry]);
  persistAmmo();
  state.ballisticAmmo = entry.name;
  state.addingAmmo = false;
  resetBallisticOverrides();
  render();
}

function updateAmmo(originalName, name, caliber, v0, v100, v200, v300, sightHeight, zero, maxChartDist, tempSensitivity) {
  if (!name.trim() || !caliber.trim()) return;
  AMMO = AMMO.map(a => a.name === originalName ? {
    name: name.trim(), caliber: caliber.trim(),
    v0: parseDeNum(v0) || 0, v100: parseDeNum(v100) || 0, v200: parseDeNum(v200) || 0, v300: parseDeNum(v300) || 0,
    sightHeight: parseDeNum(sightHeight) || 4, zero: parseDeNum(zero) || 100, maxChartDist: parseDeNum(maxChartDist) || 300,
    tempSensitivity: tempSensitivity !== undefined && tempSensitivity !== "" && !isNaN(parseDeNum(tempSensitivity)) ? parseDeNum(tempSensitivity) : null
  } : a);
  persistAmmo();
  if (state.ballisticAmmo === originalName) state.ballisticAmmo = name.trim();
  state.addingAmmo = false;
  state.editingAmmoOriginalName = null;
  resetBallisticOverrides();
  render();
}

function removeAmmo(name) {
  if (AMMO.length <= 1) {
    state.saveError = "Mindestens eine Munition muss vorhanden bleiben.";
    render();
    return;
  }
  AMMO = AMMO.filter(a => a.name !== name);
  persistAmmo();
  if (state.ballisticAmmo === name) state.ballisticAmmo = AMMO[0].name;
  state.addingAmmo = false;
  state.editingAmmoOriginalName = null;
  state.confirmDeleteAmmo = null;
  resetBallisticOverrides();
  render();
}

function resetBallisticOverrides() {
  state.ballisticVT0 = null;
  state.ballisticVT100 = null;
  state.ballisticVT200 = null;
  state.ballisticVT300 = null;
  state.ballisticSightHeight = null;
  state.ballisticZero = null;
  state.ballisticMaxDist = null;
  state.ballisticTargetDist = null;
}

function addCustomCaliber(name, silent) {
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (CALIBERS.indexOf(trimmed) !== -1) { state.addingCaliber = false; render(); return; }
  const custom = CALIBERS.slice(DEFAULT_CALIBERS.length).concat([trimmed]);
  CALIBERS = DEFAULT_CALIBERS.concat(custom);
  try { localStorage.setItem(CUSTOM_CALIBERS_KEY, JSON.stringify(custom)); } catch (e) {}
  if (!silent) { state.caliber = trimmed; state.addingCaliber = false; render(); }
}

function editSession(id) {
  const s = state.sessions.find(s => s.id === id);
  if (!s) return;
  state.editingId = id;
  state.distance = s.distance;
  state.weapon = s.weapon || WEAPONS[0].name;
  state.caliber = s.caliber || WEAPONS[0].caliber;
  state.mode = s.mode || "frei";
  state.discipline = s.discipline || "praezision";
  state.range = s.range || state.range;
  state.weather = s.weather || state.weather;
  state.noteText = s.notes || "";
  state.lotNumber = s.lotNumber || "";
  state.shots = s.shots.map(sh => (typeof sh === "object" ? { ...sh } : { ring: sh, x: 50, y: 50, exact: false }));
  state.view = "new";
  state.saveError = "";
  render();
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(v) {
  if (v === null || v === undefined) return '""';
  const s = String(v);
  return '"' + s.replace(/"/g, '""') + '"';
}

function csvRow(cells) { return cells.map(csvCell).join(";"); }

function buildExportData(mode) {
  if (mode === "daily") {
    const selected = new Set(state.selectedExportDays);
    const days = computeDailyStats(state.sessions)
      .filter(d => selected.has(d.date))
      .map(d => ({
        date: d.date, serien: d.count, schuesse: d.totalShots, ringsumme: d.sum, schnitt: Number(d.avg.toFixed(2))
      }));
    const payload = { exportedAt: new Date().toISOString(), type: "daily", days };

    const seriesRows = [csvRow(["Datum", "Distanz (m)", "Disziplin", "Waffe", "Kaliber", "Modus", "Schiessplatz", "Schuesse (Ringwerte)", "Ringsumme", "Schnitt", "Temperatur (C)", "Wind (m/s)", "Windrichtung", "Luftfeuchte (%)", "Luftdruck (hPa)"])];
    state.sessions
      .filter(s => selected.has(s.date))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      .forEach(s => {
        seriesRows.push(csvRow([
          formatDate(s.date), s.distance, s.distance === 25 ? (s.discipline === "duell" ? "Duell" : "Präzision") : "",
          s.weapon || "", s.caliber || "",
          s.mode ? (MODES.find(m => m.key === s.mode) ? MODES.find(m => m.key === s.mode).label : s.mode) : "",
          s.range || "", s.shots.map(shotRing).join(" "), s.sum, String(s.avg.toFixed(2)).replace(".", ","),
          s.weather ? Math.round(s.weather.temperature) : "",
          s.weather ? s.weather.windSpeed.toFixed(1).replace(".", ",") : "",
          s.weather ? degToCompass(s.weather.windDirection) : "",
          s.weather ? Math.round(s.weather.humidity) : "",
          s.weather ? Math.round(s.weather.pressure) : ""
        ]));
      });

    const summaryRows = [csvRow(["Datum", "Serien", "Schuesse", "Ringsumme", "Schnitt"])];
    days.slice().sort((a,b) => a.date < b.date ? -1 : 1).forEach(d => {
      summaryRows.push(csvRow([formatDate(d.date), d.serien, d.schuesse, d.ringsumme, String(d.schnitt).replace(".", ",")]));
    });

    const seriesCols = 15;
    const summaryCols = 5;
    const csvContent = "\uFEFF"
      + csvRow(["SERIEN JE TAG"].concat(Array(seriesCols - 1).fill(""))) + "\r\n"
      + seriesRows.join("\r\n")
      + "\r\n\r\n"
      + csvRow(["TAGESÜBERSICHT"].concat(Array(summaryCols - 1).fill(""))) + "\r\n"
      + summaryRows.join("\r\n");

    return {
      payload,
      csvContent,
      jsonFilename: "trefferstatistik-tage-" + todayISO() + ".json",
      csvFilename: "trefferstatistik-tage-" + todayISO() + ".csv"
    };
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    sessions: state.sessions,
    weapons: WEAPONS,
    ammo: AMMO,
    customCalibers: CALIBERS.slice(DEFAULT_CALIBERS.length)
  };
  const rows = [csvRow(["Datum", "Distanz (m)", "Disziplin", "Waffe", "Kaliber", "Modus", "Schiessplatz", "Schuesse (Ringwerte)", "Ringsumme", "Schnitt", "Temperatur (C)", "Wind (m/s)", "Windrichtung", "Luftfeuchte (%)", "Luftdruck (hPa)"])];
  [...state.sessions].sort((a,b) => a.date < b.date ? -1 : 1).forEach(s => {
    rows.push(csvRow([
      formatDate(s.date), s.distance, s.distance === 25 ? (s.discipline === "duell" ? "Duell" : "Präzision") : "",
      s.weapon || "", s.caliber || "",
      s.mode ? (MODES.find(m => m.key === s.mode) ? MODES.find(m => m.key === s.mode).label : s.mode) : "",
      s.range || "", s.shots.map(shotRing).join(" "), s.sum, String(s.avg.toFixed(2)).replace(".", ","),
      s.weather ? Math.round(s.weather.temperature) : "",
      s.weather ? s.weather.windSpeed.toFixed(1).replace(".", ",") : "",
      s.weather ? degToCompass(s.weather.windDirection) : "",
      s.weather ? Math.round(s.weather.humidity) : "",
      s.weather ? Math.round(s.weather.pressure) : ""
    ]));
  });
  return {
    payload,
    csvContent: "\uFEFF" + rows.join("\r\n"),
    jsonFilename: "trefferstatistik-gesamt-" + todayISO() + ".json",
    csvFilename: "trefferstatistik-gesamt-" + todayISO() + ".csv"
  };
}

function exportJSON(mode) {
  const d = buildExportData(mode);
  downloadFile(JSON.stringify(d.payload, null, 2), d.jsonFilename, "application/json");
}

function exportCSV(mode) {
  const d = buildExportData(mode);
  downloadFile(d.csvContent, d.csvFilename, "text/csv;charset=utf-8");
}

function importDataFromFile(file, mode) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = Array.isArray(data) ? data : (data.sessions || []);
      if (mode === "replace") {
        state.sessions = incoming.filter(s => s && s.id);
        WEAPONS = Array.isArray(data.weapons) && data.weapons.length ? data.weapons : DEFAULT_WEAPONS.slice();
        AMMO = Array.isArray(data.ammo) && data.ammo.length ? data.ammo : DEFAULT_AMMO.slice();
        persistWeapons();
        persistAmmo();
        persist();
        state.saveError = "";
        state.view = "stats";
        render();
        return;
      }
      const existingIds = new Set(state.sessions.map(s => s.id));
      let added = 0;
      incoming.forEach(s => {
        if (s && s.id && !existingIds.has(s.id)) {
          state.sessions.push(s);
          existingIds.add(s.id);
          added++;
        }
      });
      const importedWeapons = Array.isArray(data.weapons) ? data.weapons : (Array.isArray(data.customWeapons) ? data.customWeapons : []);
      importedWeapons.forEach(w => {
        if (w && w.name && !WEAPONS.some(x => x.name === w.name)) {
          addCustomWeapon(w.name, w.caliber || CALIBERS[0], w.category);
        }
      });
      if (Array.isArray(data.ammo)) {
        data.ammo.forEach(a => {
          if (a && a.name && !AMMO.some(x => x.name === a.name)) {
            addAmmo(a.name, a.caliber || CALIBERS[0], a.v0, a.v100, a.v200, a.v300, a.sightHeight, a.zero, a.maxChartDist);
          }
        });
      }
      if (data.customCalibers && Array.isArray(data.customCalibers)) {
        data.customCalibers.forEach(c => addCustomCaliber(c, true));
      }
      persist();
      state.saveError = added > 0 ? "" : "Keine neuen Serien in der Datei gefunden (evtl. schon vorhanden).";
      render();
    } catch (e) {
      state.saveError = "Import fehlgeschlagen: Datei ist kein gültiges Sicherungsformat.";
      render();
    }
  };
  reader.readAsText(file);
}

async function saveSeries() {
  if (state.shots.length === 0) {
    state.saveError = "Noch keine Treffer erfasst.";
    render();
    return;
  }
  const ageMinutes = state.weather ? (Date.now() - new Date(state.weather.fetchedAt).getTime()) / 60000 : Infinity;
  if (ageMinutes > 20 && state.range) {
    await fetchWeather(state.range);
  }
  const sum = state.shots.reduce((a,s) => a + shotRing(s), 0);
  const existing = state.editingId ? state.sessions.find(s => s.id === state.editingId) : null;
  const entry = {
    id: existing ? existing.id : uid(),
    date: existing ? existing.date : todayISO(),
    distance: state.distance,
    weapon: state.weapon, caliber: state.caliber, mode: state.mode, discipline: state.discipline,
    range: state.range, weather: state.weather,
    notes: state.noteText.trim(), lotNumber: state.lotNumber.trim(), ammoName: state.ammoName || null,
    presetName: state.competitionPreset ? (state.discipline === "duell" ? state.competitionPreset.name.replace("Präzision-Hälfte", "Duell-Hälfte") : state.competitionPreset.name) : null,
    competitionGroupId: state.competitionGroupId || null,
    shots: state.shots.slice(), sum, avg: sum / state.shots.length
  };
  if (existing) {
    state.sessions = state.sessions.map(s => s.id === entry.id ? entry : s);
  } else {
    state.sessions.push(entry);
  }
  state.shots = [];
  state.noteText = "";
  state.lotNumber = "";
  if (state.discipline === "duell" && state.competitionPreset) {
    state.competitionGroupId = null; // Wettkampf-Teilnahme abgeschlossen, nächste bekommt neue Gruppe
  }
  state.editingId = null;
  state.savedFlash = true;
  persist();
  render();
  setTimeout(() => { state.savedFlash = false; render(); }, 1400);
}

function deleteSession(id) {
  state.sessions = state.sessions.filter(s => s.id !== id);
  persist();
  state.confirmDeleteSessionId = null;
  render();
}

function getFiltered() {
  let list = state.sessions;
  if (state.statsFilter !== "all") list = list.filter(s => s.distance === Number(state.statsFilter));
  if (state.statsModeFilter !== "all") list = list.filter(s => s.mode === state.statsModeFilter);
  if (state.statsWeaponFilter && state.statsWeaponFilter !== "all") list = list.filter(s => s.weapon === state.statsWeaponFilter);
  if (state.statsCaliberFilter && state.statsCaliberFilter !== "all") list = list.filter(s => s.caliber === state.statsCaliberFilter);
  return list;
}

function computeDailyStats(list) {
  const map = {};
  list.forEach(s => {
    if (!map[s.date]) map[s.date] = { date: s.date, sessions: [], totalShots: 0, sum: 0 };
    map[s.date].totalShots += s.shots.length;
    map[s.date].sum += s.sum;
    map[s.date].sessions.push(s);
  });
  return Object.values(map)
    .map(d => ({ ...d, count: d.sessions.length, avg: d.totalShots ? d.sum / d.totalShots : 0 }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getSummary(filtered) {
  if (filtered.length === 0) return { count: 0, avg: 0, best: null, worst: null };
  const avg = filtered.reduce((a,s) => a+s.avg, 0) / filtered.length;
  const best = filtered.reduce((a,b) => b.avg > a.avg ? b : a);
  const worst = filtered.reduce((a,b) => b.avg < a.avg ? b : a);
  return { count: filtered.length, avg, best, worst };
}

const TARGET_PROFILES = {
  praezision100: { minRing: 0, maxRing: 10, innerRadiusMM: 25, stepMM: 25, blackFromRing: 7, allBlack: false, hasInnenzehner: true }, // DSB SpO: Ordonnanz-/Scheibengewehr 100m, 25m Präzision, Freie Pistole 50m
  praezision300: { minRing: 0, maxRing: 10, innerRadiusMM: 50, stepMM: 50, blackFromRing: 5, allBlack: false, hasInnenzehner: true }, // DSB SpO: Großkalibergewehr 300m
  duell25: { minRing: 5, maxRing: 10, innerRadiusMM: 50, stepMM: 40, blackFromRing: 5, allBlack: true, hasInnenzehner: false } // DSB SpO: 25m Duell, wie Olympische Schnellfeuerpistole
};

function getProfile(distance, discipline) {
  if (distance === 300) return TARGET_PROFILES.praezision300;
  if (distance === 25 && discipline === "duell") return TARGET_PROFILES.duell25;
  return TARGET_PROFILES.praezision100;
}

function profileRadiusMM(profile, r) { return profile.innerRadiusMM + (10 - r) * profile.stepMM; }
function profileOuterMM(profile) { return profileRadiusMM(profile, profile.minRing); }
function profileScale(profile) { return 47 / profileOuterMM(profile); }
function profileSvgRadius(profile, r) { return profileRadiusMM(profile, r) * profileScale(profile); }

function profileRingForSvgRadius(profile, radSvg) {
  const scale = profileScale(profile);
  const radMM = radSvg / scale;
  const raw = 10 - (radMM - profile.innerRadiusMM) / profile.stepMM;
  if (raw < profile.minRing) return 0;
  return Math.max(0, Math.min(10, Math.floor(raw)));
}

function groupStats(shots, distance, discipline) {
  if (!shots || shots.length < 2) return null;
  const profile = getProfile(distance, discipline);
  const pts = shots.map((s, i) => shotXY(s, i, profile));
  let maxDist = 0;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d > maxDist) maxDist = d;
    }
  }
  const cx = pts.reduce((a,p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a,p) => a + p.y, 0) / pts.length;
  const meanRadius = pts.reduce((a,p) => a + Math.hypot(p.x - cx, p.y - cy), 0) / pts.length;
  const ref = 47; // jedes Profil hat den Scheibenrand per Konstruktion auf svg-Radius 47
  const mmPerUnit = profileOuterMM(profile) / ref;
  return {
    extremeSpreadPct: (maxDist / ref) * 100,
    meanRadiusPct: (meanRadius / ref) * 100,
    extremeSpreadCm: (maxDist * mmPerUnit) / 10,
    meanRadiusCm: (meanRadius * mmPerUnit) / 10
  };
}

const AIM_DIRECTIONS = [
  { key: "12", angle: -90, label: "12 Uhr (hoch)" },
  { key: "1-2", angle: -45, label: "1–2 Uhr (hoch rechts)" },
  { key: "3", angle: 0, label: "3 Uhr (rechts)" },
  { key: "4-5", angle: 45, label: "4–5 Uhr (tief rechts)" },
  { key: "6", angle: 90, label: "6 Uhr (tief)" },
  { key: "7-8", angle: 135, label: "7–8 Uhr (tief links)" },
  { key: "9", angle: 180, label: "9 Uhr (links)" },
  { key: "10-11", angle: -135, label: "10–11 Uhr (hoch links)" }
];

// Klassisches Trefferbild-Diagnoseschema. Rechts/Links bezieht sich auf die Abzugshand;
// bei Linksschützen werden die seitlichen Ursachen gespiegelt (Punkt 3/9 und die Diagonalen).
const AIM_TIPS = {
  "12": "Treffer liegen hoch. Meist zu fester Daumendruck oder eine inkonsistente Wangen-/Schulteranlage. Achte auf gleichbleibenden Anschlag und lass den Abzug am Ende sauber brechen, ohne nachzudrücken.",
  "6": "Treffer liegen tief – typisch für Antizipation des Schusses (kurzes Abducken oder Drücken kurz vor dem Auslösen) oder einen durchgerissenen statt sauber gebrochenen Abzug. Konzentrier dich auf einen konstanten, überraschenden Abzugsbruch und sauberes Durchhalten der Haltung nach dem Schuss (Nachhalten).",
  "rechts_3": "Treffer liegen rechts – oft zu wenig Abzugsfinger im Abzug (nur die Fingerspitze) oder seitlicher statt gerader Druck nach hinten. Prüfe die Fingerposition am Abzug.",
  "links_3": "Treffer liegen rechts – bei Linkshändern häufig zu viel Abzugsfinger im Abzug (zweites Fingerglied statt Spitze), wodurch der Lauf seitlich mitgezogen wird.",
  "rechts_9": "Treffer liegen links – häufig zu viel Abzugsfinger im Abzug (zweites Fingerglied statt Spitze), wodurch der Lauf seitlich mitgezogen wird.",
  "links_9": "Treffer liegen links – oft zu wenig Abzugsfinger im Abzug (nur die Fingerspitze) oder seitlicher statt gerader Druck nach hinten. Prüfe die Fingerposition am Abzug.",
  "rechts_1-2": "Treffer liegen hoch rechts – Kombination aus zu festem Daumendruck und zu wenig Abzugsfinger. Achte auf lockeren, gleichmäßigen Griff.",
  "links_1-2": "Treffer liegen hoch rechts – bei Linkshändern oft ein Nachfassen/Greifen während des Abzugswegs.",
  "rechts_4-5": "Treffer liegen tief rechts – meist eine Mischung aus Antizipation und seitlichem statt geradem Abzugsdruck.",
  "links_4-5": "Treffer liegen tief rechts – bei Linkshändern oft verkrampfter Griff mit zu viel seitlichem Fingerdruck.",
  "rechts_7-8": "Treffer liegen tief links – meist verkrampfter Griff mit zu viel seitlichem Fingerdruck.",
  "links_7-8": "Treffer liegen tief links – oft eine Mischung aus Antizipation und seitlichem statt geradem Abzugsdruck.",
  "rechts_10-11": "Treffer liegen hoch links – oft ein Nachfassen/Greifen während des Abzugswegs.",
  "links_10-11": "Treffer liegen hoch links – Kombination aus zu festem Daumendruck und zu wenig Abzugsfinger. Achte auf lockeren, gleichmäßigen Griff."
};

function aimTipFor(dirKey, hand) {
  if (dirKey === "12" || dirKey === "6") return AIM_TIPS[dirKey];
  return AIM_TIPS[(hand === "links" ? "links" : "rechts") + "_" + dirKey];
}

function diagnoseAim(shots, distance, discipline, hand) {
  if (!shots || shots.length < 3) return null;
  const profile = getProfile(distance, discipline);
  const pts = shots.map((s, i) => shotXY(s, i, profile));
  const cx = pts.reduce((a,p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a,p) => a + p.y, 0) / pts.length;
  const dx = cx - 50, dy = cy - 50;
  const dist = Math.hypot(dx, dy);
  const ref = 47;
  const offsetPct = (dist / ref) * 100;
  if (offsetPct < 12) return { centered: true, offsetPct };
  const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
  let best = AIM_DIRECTIONS[0];
  let bestDiff = 999;
  AIM_DIRECTIONS.forEach(d => {
    let diff = Math.abs(angleDeg - d.angle);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) { bestDiff = diff; best = d; }
  });
  return { centered: false, offsetPct, direction: best, tip: aimTipFor(best.key, hand) };
}

function shotRing(s) { return (s && typeof s === "object") ? s.ring : s; }

function shotXY(s, i, profile) {
  if (s && typeof s === "object" && typeof s.x === "number" && typeof s.y === "number") {
    return { x: s.x, y: s.y };
  }
  const p = profile || TARGET_PROFILES.praezision100;
  const ring = shotRing(s);
  const rad = profileSvgRadius(p, ring);
  const angleDeg = (i * 137.508 + ring * 23) % 360;
  const angle = (angleDeg * Math.PI) / 180;
  return { x: 50 + rad * Math.cos(angle), y: 50 + rad * Math.sin(angle) };
}

function targetSVG(shots, distance, opts) {
  opts = opts || {};
  const profile = getProfile(distance, opts.discipline);
  const size = opts.size || 220;
  const interactive = !!opts.interactive;
  const accent = distColor(distance);
  const blackFrom = profile.blackFromRing;

  let rings = "";
  for (let r = profile.minRing; r <= profile.maxRing; r++) {
    const rad = profileSvgRadius(profile, r);
    const isBlackZone = profile.allBlack || r >= blackFrom;
    rings += `<circle cx="50" cy="50" r="${rad}" fill="${isBlackZone && r === profile.maxRing ? '#111310' : 'none'}" stroke="${isBlackZone ? '#3a3d36' : COLORS.cardBorder}" stroke-width="0.35"/>`;
  }
  // solid black disc under the inner rings so it reads like the target photo
  const blackDiscFromRing = profile.allBlack ? profile.minRing : blackFrom;
  let blackDisc = `<circle cx="50" cy="50" r="${profileSvgRadius(profile, blackDiscFromRing)}" fill="#141712"/>`;
  // redraw ring strokes on top of the black disc for contrast
  let innerRings = "";
  for (let r = blackFrom; r <= profile.maxRing; r++) {
    innerRings += `<circle cx="50" cy="50" r="${profileSvgRadius(profile, r)}" fill="none" stroke="${COLORS.muted}" stroke-width="0.4"/>`;
  }
  // Innenzehner (X-Ring): DSB-Norm, halber Durchmesser der Zehn (nicht bei der Duellscheibe)
  if (profile.hasInnenzehner) {
    innerRings += `<circle cx="50" cy="50" r="${profileSvgRadius(profile, 10) / 2}" fill="none" stroke="${COLORS.muted}" stroke-width="0.4"/>`;
  }

  let labels = "";
  const labelDirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];
  const stepSvg = profile.stepMM * profileScale(profile);
  const halfStep = stepSvg / 2;
  for (let r = Math.max(profile.minRing, 1); r <= profile.maxRing - 1; r++) {
    const rad = profileSvgRadius(profile, r) - halfStep;
    const isBlackZone = profile.allBlack || r >= blackFrom;
    const fill = isBlackZone ? "#a9a798" : COLORS.muted;
    labelDirs.forEach(dir => {
      const x = 50 + dir.dx * rad;
      const y = 50 + dir.dy * rad;
      labels += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="2.7" font-weight="700" font-family="'JetBrains Mono',monospace" fill="${fill}">${r}</text>`;
    });
  }

  const points = shots.map((s, i) => {
    const { x, y } = shotXY(s, i, profile);
    return { x, y, ring: shotRing(s), order: i + 1 };
  });

  const path = points.length > 1
    ? `<polyline points="${points.map(p => `${p.x},${p.y}`).join(" ")}" fill="none" stroke="${COLORS.muted}" stroke-width="0.5" stroke-dasharray="1.2,1" opacity="0.8"/>`
    : "";

  const dots = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="0.9" fill="${accent}" stroke="${COLORS.bg}" stroke-width="0.2"/>
    <text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="1.0" font-family="'JetBrains Mono',monospace" fill="#141510" font-weight="600">${p.order}</text>
  `).join("");

  const tapAttrs = interactive
    ? `data-action="target-tap" style="width:100%;max-width:${size}px;display:block;margin:0 auto;aspect-ratio:1/1;touch-action:manipulation;cursor:crosshair;"`
    : `style="width:100%;max-width:${size}px;display:block;margin:0 auto;aspect-ratio:1/1;"`;

  return `
    <svg viewBox="0 0 100 100" ${tapAttrs} role="img" aria-label="Zielscheibe mit ${shots.length} Treffern in Schussreihenfolge">
      ${rings}
      ${blackDisc}
      ${innerRings}
      ${labels}
      ${path}
      ${dots}
    </svg>
  `;
}

function distColor(d) { return d === 300 ? COLORS.steel : d === 100 ? COLORS.brass : COLORS.clay; }


function chip(s, distance, index) {
  const r = shotRing(s);
  const filled = r >= 9;
  const action = typeof index === "number" ? ` data-action="remove-shot-at" data-value="${index}"` : "";
  return `<div${action} style="cursor:${typeof index === "number" ? "pointer" : "default"};width:26px;height:26px;border-radius:50%;background:${filled ? distColor(distance) : '#33352C'};color:${filled ? '#141510' : COLORS.cream};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;font-family:'JetBrains Mono',monospace;">${r}</div>`;
}

function renderNewView() {
  const currentSum = state.shots.reduce((a,s) => a + shotRing(s), 0);
  const currentAvg = state.shots.length ? currentSum / state.shots.length : 0;
  return `
    <div style="font-size:13px;color:${COLORS.muted};font-family:'JetBrains Mono',monospace;margin-bottom:10px;">${formatDate(todayISO())}</div>
    ${state.editingId ? `<div style="background:${COLORS.steelDark};color:${COLORS.cream};border-radius:4px;padding:10px 12px;margin-bottom:14px;font-size:13px;display:flex;justify-content:space-between;align-items:center;">Serie wird bearbeitet <span data-action="cancel-edit" style="cursor:pointer;text-decoration:underline;">Abbrechen</span></div>` : ""}
    <div style="display:flex;gap:8px;margin-bottom:18px;">
      ${[25,100,300].map(d => `
        <div class="btn-tab" data-action="set-distance" data-value="${d}" style="flex:1;text-align:center;padding:12px 0;font-size:18px;font-weight:700;border-radius:2px;background:${state.distance===d?distColor(d):'transparent'};color:${state.distance===d?'#141510':COLORS.cream};border:1px solid ${distColor(d)};">${d} m</div>
      `).join("")}
    </div>
    <div class="grid-2">
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">SCHIESSPLATZ</div>
      <input type="text" id="range-input" value="${state.range.replace(/"/g,'&quot;')}" placeholder="z. B. Schützengilde zu Jüterbog" />
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid ${COLORS.cardBorder};">
        ${state.weatherStatus === "loading" ? `<div style="font-size:13px;color:${COLORS.muted};">Lade Wetterdaten…</div>` : ""}
        ${state.weatherStatus === "error" ? `
          <div style="font-size:13px;color:${COLORS.red};margin-bottom:8px;">${state.weatherError}</div>
          <div data-action="refresh-weather" style="display:inline-block;cursor:pointer;font-size:13px;text-decoration:underline;color:${COLORS.cream};">Erneut versuchen</div>
        ` : ""}
        ${state.weatherStatus === "done" && state.weather ? `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <div style="font-size:11px;color:${COLORS.muted};">${state.weather.place} · ${new Date(state.weather.fetchedAt).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
            <div data-action="refresh-weather" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${COLORS.muted};">Aktualisieren</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
            <div><div style="font-size:11px;color:${COLORS.muted};">TEMPERATUR</div><div class="mono" style="font-size:18px;font-weight:600;">${Math.round(state.weather.temperature)}°C</div></div>
            <div><div style="font-size:11px;color:${COLORS.muted};">WIND</div><div class="mono" style="font-size:18px;font-weight:600;">${state.weather.windSpeed.toFixed(1)} m/s ${degToCompass(state.weather.windDirection)}</div></div>
            <div><div style="font-size:11px;color:${COLORS.muted};">LUFTFEUCHTE</div><div class="mono" style="font-size:18px;font-weight:600;">${Math.round(state.weather.humidity)}%</div></div>
            <div><div style="font-size:11px;color:${COLORS.muted};">LUFTDRUCK</div><div class="mono" style="font-size:18px;font-weight:600;">${Math.round(state.weather.pressure)} hPa</div></div>
          </div>
        ` : ""}
        ${state.weatherStatus === "idle" ? `<div data-action="refresh-weather" style="cursor:pointer;font-size:13px;text-decoration:underline;color:${COLORS.cream};">Wetterdaten abrufen</div>` : ""}
      </div>
    </div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">WAFFE</div>
        <span data-action="toggle-weapon-edit-mode" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${state.weaponEditMode ? COLORS.cream : COLORS.muted};">${state.weaponEditMode ? "Fertig" : "Bearbeiten"}</span>
      </div>
      ${state.weaponEditMode ? `<div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;">Waffe antippen, um sie zu bearbeiten oder zu löschen.</div>` : ""}
      ${WEAPON_CATEGORIES.map(cat => {
        const catWeapons = WEAPONS.filter(w => weaponCategory(w) === cat.key);
        if (catWeapons.length === 0) return "";
        return `
          <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;">${cat.label}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
            ${catWeapons.map(w => `
              <div class="btn-tab" data-action="${state.weaponEditMode ? "start-edit-weapon" : "set-weapon"}" data-value="${w.name}" style="text-align:center;padding:9px 4px;font-size:12px;font-weight:600;border-radius:2px;line-height:1.15;background:${!state.weaponEditMode && state.weapon===w.name?COLORS.cream:'transparent'};color:${!state.weaponEditMode && state.weapon===w.name?COLORS.bg:COLORS.cream};border:1px ${state.weaponEditMode ? "dashed" : "solid"} ${!state.weaponEditMode && state.weapon===w.name?COLORS.cream:COLORS.cardBorder};">${state.weaponEditMode ? "✎ " : ""}${w.name}</div>
            `).join("")}
          </div>
        `;
      }).join("")}
      ${state.addingWeapon ? (() => {
        const editingWeapon = state.editingWeaponOriginalName ? WEAPONS.find(w => w.name === state.editingWeaponOriginalName) : null;
        const nameVal = editingWeapon ? editingWeapon.name.replace(/"/g,'&quot;') : "";
        const calVal = editingWeapon ? editingWeapon.caliber.replace(/"/g,'&quot;') : "";
        return `
        <div style="margin-bottom:14px;padding:10px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">
          <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;">${editingWeapon ? "WAFFE BEARBEITEN" : "KATEGORIE"}</div>
          ${editingWeapon ? (() => {
            const shots = shotsSinceCleaning(editingWeapon.name);
            const warn = shots >= 300;
            return `
            <div style="margin-bottom:10px;padding:8px 10px;background:${COLORS.card};border:1px solid ${warn ? COLORS.red : COLORS.cardBorder};border-radius:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:10px;color:${COLORS.muted};">SCHUSS SEIT REINIGUNG</div>
                  <div class="mono" style="font-size:16px;font-weight:600;color:${warn ? COLORS.red : COLORS.cream};">${shots}${warn ? " – Zeit zum Reinigen" : ""}</div>
                  ${editingWeapon.lastCleanedDate ? `<div style="font-size:10px;color:${COLORS.muted};margin-top:2px;">Zuletzt gereinigt: ${formatDate(editingWeapon.lastCleanedDate)}</div>` : ""}
                </div>
                <div data-action="mark-weapon-cleaned" data-value="${editingWeapon.name}" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${COLORS.cream};white-space:nowrap;">Als gereinigt markieren</div>
              </div>
            </div>
            `;
          })() : ""}
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
            ${WEAPON_CATEGORIES.map(cat => `
              <div class="btn-tab" data-action="set-new-weapon-category" data-value="${cat.key}" style="text-align:center;padding:8px 2px;font-size:11px;font-weight:600;border-radius:2px;line-height:1.15;background:${state.newWeaponCategory===cat.key?COLORS.cream:'transparent'};color:${state.newWeaponCategory===cat.key?COLORS.bg:COLORS.cream};border:1px solid ${state.newWeaponCategory===cat.key?COLORS.cream:COLORS.cardBorder};">${cat.label}</div>
            `).join("")}
          </div>
          <input type="text" id="new-weapon-name" placeholder="Name der Waffe" value="${nameVal}" style="margin-bottom:6px;" />
          <input type="text" id="new-weapon-caliber" placeholder="Kaliber, z. B. .22 LR" value="${calVal}" style="margin-bottom:8px;" />
          <div style="display:flex;gap:6px;">
            <div class="btn-tab" data-action="save-weapon" style="flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.cream};color:${COLORS.bg};">Speichern</div>
            <div class="btn-tab" data-action="cancel-add-weapon" style="flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
          </div>
          ${editingWeapon ? (
            state.confirmDeleteWeapon === editingWeapon.name
              ? `<div style="margin-top:10px;padding:10px;background:${COLORS.bg};border:1px solid ${COLORS.red};border-radius:4px;">
                  <div style="font-size:12px;color:${COLORS.cream};margin-bottom:8px;">Diese Waffe wirklich löschen? Bereits gespeicherte Serien bleiben erhalten.</div>
                  <div style="display:flex;gap:6px;">
                    <div data-action="confirm-delete-weapon" data-value="${editingWeapon.name}" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.red};color:${COLORS.bg};">Ja, löschen</div>
                    <div data-action="cancel-delete-weapon" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
                  </div>
                </div>`
              : `<div data-action="delete-weapon" data-value="${editingWeapon.name}" style="cursor:pointer;text-align:center;margin-top:8px;font-size:12px;color:${COLORS.red};text-decoration:underline;">Waffe löschen</div>`
          ) : ""}
        </div>
      `; })() : (!state.weaponEditMode ? `<div data-action="start-add-weapon" style="cursor:pointer;font-size:12px;color:${COLORS.muted};text-decoration:underline;margin-bottom:14px;">+ Waffe hinzufügen</div>` : "")}
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">KALIBER</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:${state.addingCaliber ? '8px' : '14px'};">
        ${CALIBERS.map(c => `
          <div class="btn-tab mono" data-action="set-caliber" data-value="${c}" style="text-align:center;padding:9px 2px;font-size:12px;font-weight:600;border-radius:2px;background:${state.caliber===c?COLORS.cream:'transparent'};color:${state.caliber===c?COLORS.bg:COLORS.cream};border:1px solid ${state.caliber===c?COLORS.cream:COLORS.cardBorder};">${c}</div>
        `).join("")}
      </div>
      ${state.addingCaliber ? `
        <div style="margin-bottom:14px;padding:10px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">
          <input type="text" id="new-caliber-name" placeholder="Kaliber, z. B. .22 LR" style="margin-bottom:8px;" />
          <div style="display:flex;gap:6px;">
            <div class="btn-tab" data-action="save-caliber" style="flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.cream};color:${COLORS.bg};">Speichern</div>
            <div class="btn-tab" data-action="cancel-add-caliber" style="flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
          </div>
        </div>
      ` : `<div data-action="start-add-caliber" style="cursor:pointer;font-size:12px;color:${COLORS.muted};text-decoration:underline;margin-bottom:14px;">+ Kaliber hinzufügen</div>`}
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">MUNITION (OPTIONAL)</div>
      <select id="series-ammo-select" style="margin-bottom:14px;">
        <option value="">– keine Angabe –</option>
        ${AMMO.filter(a => a.caliber === state.caliber).map(a => `<option value="${a.name}" ${state.ammoName===a.name?"selected":""}>${a.name}</option>`).join("")}
      </select>
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">MODUS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${MODES.map(m => `
          <div class="btn-tab" data-action="set-mode" data-value="${m.key}" style="text-align:center;padding:9px 4px;font-size:13px;font-weight:600;border-radius:2px;background:${state.mode===m.key?COLORS.cream:'transparent'};color:${state.mode===m.key?COLORS.bg:COLORS.cream};border:1px solid ${state.mode===m.key?COLORS.cream:COLORS.cardBorder};">${m.label}</div>
        `).join("")}
      </div>
    </div>
    </div>
    ${state.mode === "wettkampf" ? `
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">WETTKAMPF-VORLAGE</div>
      ${state.competitionPreset ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:12px;background:${COLORS.bg};border:1px solid ${COLORS.brass};border-radius:4px;">
          <div style="font-size:12px;color:${COLORS.cream};font-weight:600;">${state.competitionPreset.name}</div>
          <div data-action="clear-competition-preset" style="cursor:pointer;font-size:11px;color:${COLORS.muted};text-decoration:underline;white-space:nowrap;margin-left:8px;">Beenden</div>
        </div>
      ` : ""}
      <div style="font-size:10px;color:${COLORS.muted};margin-bottom:6px;">DSB-DISZIPLIN</div>
      <select id="dsb-discipline-select">
        <option value="">– Disziplin wählen –</option>
        ${Object.keys(DSB_DISCIPLINES).map(num => {
          const d = DSB_DISCIPLINES[num];
          const active = state.competitionPreset && state.competitionPreset.key === "dsb-" + num;
          return `<option value="${num}" ${active ? "selected" : ""}>${d.name}</option>`;
        }).join("")}
      </select>
    </div>
    ` : ""}
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;letter-spacing:1px;">NOTIZ (OPTIONAL)</div>
      <input type="text" id="note-input" value="${state.noteText.replace(/"/g,'&quot;')}" placeholder="z. B. neue Munition, starker Wind, müde…" style="margin-bottom:10px;" />
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;letter-spacing:1px;">LOSNUMMER / CHARGE (OPTIONAL)</div>
      <input type="text" id="lot-input" value="${state.lotNumber.replace(/"/g,'&quot;')}" placeholder="z. B. Los 2908-A" />
    </div>
    ${state.distance === 25 ? `
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">DISZIPLIN (25M) · SCHEIBE ANTIPPEN</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${[{key:"praezision",label:"Präzision"},{key:"duell",label:"Duell"}].map(o => `
          <div data-action="set-discipline" data-value="${o.key}" style="cursor:pointer;text-align:center;padding:10px 8px;border-radius:4px;background:${COLORS.bg};border:2px solid ${state.discipline===o.key?COLORS.cream:COLORS.cardBorder};">
            ${targetSVG([], 25, { size: 96, discipline: o.key })}
            <div style="margin-top:8px;font-size:12px;font-weight:600;color:${state.discipline===o.key?COLORS.cream:COLORS.muted};">${o.label}</div>
          </div>
        `).join("")}
      </div>
      <div style="font-size:11px;color:${COLORS.muted};margin-top:8px;">${state.discipline === "duell" ? "Duellscheibe: komplett schwarz, nur Ringe 5–10 (wie Olympische Schnellfeuerpistole)." : "Präzisionsscheibe: wie 100m-Scheibe, Ringe 0–10, Spiegel ab Ring 7."}</div>
    </div>
    ` : ""}
    <div class="grid-2">
    <div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">AUF DIE SCHEIBE TIPPEN, WO DER SCHUSS SASS</div>
      ${targetSVG(state.shots, state.distance, { interactive: true, size: 280, discipline: state.discipline })}
    </div>
    </div>
    <div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <div><div style="font-size:11px;color:${COLORS.muted};">SCHUSSZAHL</div><div class="mono" style="font-size:22px;font-weight:600;">${state.shots.length}${state.competitionPreset ? ` / ${state.competitionPreset.shots}` : ""}</div></div>
        <div><div style="font-size:11px;color:${COLORS.muted};">RINGZAHL</div><div class="mono" style="font-size:22px;font-weight:600;color:${distColor(state.distance)};">${currentSum}</div></div>
        <div><div style="font-size:11px;color:${COLORS.muted};">SCHNITT</div><div class="mono" style="font-size:22px;font-weight:600;">${state.shots.length ? currentAvg.toFixed(1) : "–"}</div></div>
      </div>
      ${state.shots.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid ${COLORS.cardBorder};">${state.shots.map((s,i) => chip(s, state.distance, i)).join("")}</div>` : ""}
      ${state.shots.length > 0 ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:8px;">Auf einen Treffer tippen, um ihn einzeln zu entfernen.</div>` : ""}
      ${(() => { const g = groupStats(state.shots, state.distance, state.discipline); return g ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:8px;padding-top:8px;border-top:1px solid ${COLORS.cardBorder};">Streuung · ES ${g.extremeSpreadCm.toFixed(1)} cm (${g.extremeSpreadPct.toFixed(1)}%) · MR ${g.meanRadiusCm.toFixed(1)} cm (${g.meanRadiusPct.toFixed(1)}%)</div>` : ""; })()}
    </div>
    ${state.shots.length >= 3 ? (() => {
      const diag = diagnoseAim(state.shots, state.distance, state.discipline, state.shooterHand);
      if (!diag) return "";
      return `
      <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">TRAINING-TIPP</div>
          <div style="display:flex;gap:6px;">
            ${[{key:"rechts",label:"Rechts"},{key:"links",label:"Links"}].map(h => `
              <span data-action="set-shooter-hand" data-value="${h.key}" style="cursor:pointer;font-size:11px;padding:3px 8px;border-radius:2px;background:${state.shooterHand===h.key?COLORS.cream:'transparent'};color:${state.shooterHand===h.key?COLORS.bg:COLORS.muted};border:1px solid ${state.shooterHand===h.key?COLORS.cream:COLORS.cardBorder};">${h.label}</span>
            `).join("")}
          </div>
        </div>
        ${diag.centered
          ? `<div style="font-size:13px;color:${COLORS.cream};">Deine Treffer streuen zentriert um den Zielpunkt (Versatz ${diag.offsetPct.toFixed(0)}%) – kein systematischer Fehler erkennbar. Fokus jetzt auf eine engere Streuung statt Korrektur.</div>`
          : `<div style="font-size:13px;font-weight:600;color:${COLORS.cream};margin-bottom:4px;">Schwerpunkt: ${diag.direction.label}</div>
             <div style="font-size:13px;color:${COLORS.cream};line-height:1.4;">${diag.tip}</div>`
        }
      </div>
      `;
    })() : ""}
    </div>
    </div>
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">ODER RINGZAHL SCHNELL EINGEBEN (OHNE GENAUE LAGE)</div>
    <div class="ring-grid">
      ${RINGS.map(r => `<div class="ring-btn mono" data-action="add-shot" data-value="${r}" style="text-align:center;padding:16px 0;font-size:20px;font-weight:700;border-radius:4px;background:${r>=9?distColor(state.distance):COLORS.card};color:${r>=9?'#141510':COLORS.cream};border:1px solid ${r>=9?distColor(state.distance):COLORS.cardBorder};">${r}</div>`).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:10px;">
      <button data-action="undo-shot" ${state.shots.length===0?"disabled":""} style="flex:1;background:transparent;border:1px solid ${COLORS.cardBorder};color:${state.shots.length===0?COLORS.muted:COLORS.cream};border-radius:4px;padding:10px 0;font-size:14px;">Letzten löschen</button>
      <button data-action="clear-shots" ${state.shots.length===0?"disabled":""} style="flex:1;background:transparent;border:1px solid ${COLORS.cardBorder};color:${state.shots.length===0?COLORS.muted:COLORS.cream};border-radius:4px;padding:10px 0;font-size:14px;">Serie leeren</button>
    </div>
    <button data-action="save-series" style="width:100%;background:${state.savedFlash?COLORS.green:COLORS.cream};color:${COLORS.bg};border:none;border-radius:4px;padding:13px 0;font-size:16px;font-weight:700;">${state.savedFlash ? "Gespeichert" : (state.editingId ? "Änderungen speichern" : "Serie speichern")}</button>
    ${state.saveError ? `<div style="color:${COLORS.red};font-size:13px;margin-top:8px;">${state.saveError}</div>` : ""}
  `;
}

function trajectoryFromFunctions(vFn, tFn, sightHeightCm, zeroM, maxDistM) {
  const g = 9.81;
  const h = sightHeightCm / 100;
  const dropAtZero = x => { const tt = tFn(x); return 0.5 * g * tt * tt; };
  const dropAtZeroVal = dropAtZero(zeroM);
  const theta = (h + dropAtZeroVal) / zeroM;
  const y = x => (-h + x * theta - dropAtZero(x)) * 100; // cm relativ zur Ziellinie, positiv = über der Linie
  const steps = 60;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const x = (maxDistM / steps) * i;
    points.push({ x, y: y(x), v: vFn(x), t: tFn(x) });
  }
  return points;
}

function windDriftCm(windSpeedMs, windClockHour, timeOfFlightS) {
  const angleRad = (windClockHour * 30) * Math.PI / 180;
  const lateralMs = windSpeedMs * Math.sin(angleRad); // + = von links kommend, driftet nach rechts
  return lateralMs * timeOfFlightS * 100;
}

function ballisticTrajectory(v0, bc, sightHeightCm, zeroM, maxDistM) {
  const g = 9.81;
  const Z = 2000; // Tuning-Konstante des vereinfachten Modells, grob an .308-Referenztabellen kalibriert
  const decayLen = Math.max(1, bc * Z); // "Abklinglänge" der Geschwindigkeit in Metern
  const v = x => v0 * Math.exp(-x / decayLen);
  const t = x => (decayLen / v0) * (Math.exp(x / decayLen) - 1);
  return trajectoryFromFunctions(v, t, sightHeightCm, zeroM, maxDistM);
}

function airDensityRatio(tempC, pressureHPa) {
  const R = 287.05; // spez. Gaskonstante trockene Luft, J/(kg·K)
  const T = tempC + 273.15;
  const P = pressureHPa * 100; // hPa -> Pa
  const rho = P / (R * T);
  const rho0 = 101325 / (R * 288.15); // ICAO-Standardatmosphäre: 15°C, 1013,25 hPa auf Meereshöhe
  return rho / rho0;
}

function ballisticTrajectoryFromTable(vTable, sightHeightCm, zeroM, maxDistM, densityRatio) {
  densityRatio = densityRatio || 1;
  const g = 9.81;
  const xs = [0, 100, 200, 300];
  const vs = [vTable.v0, vTable.v100, vTable.v200, vTable.v300];
  const lastSlope = (vs[3] - vs[2]) / (xs[3] - xs[2]);

  // vTableAt/tTableAt arbeiten auf der unveränderten Herstellertabelle (Standardbedingungen)
  function vTableAt(x) {
    if (x <= 300) {
      for (let i = 0; i < 3; i++) {
        if (x >= xs[i] && x <= xs[i+1]) {
          const k = (vs[i+1] - vs[i]) / (xs[i+1] - xs[i]);
          return vs[i] + k * (x - xs[i]);
        }
      }
      return vs[0];
    }
    return Math.max(50, vs[3] + lastSlope * (x - 300)); // lineare Extrapolation über 300m hinaus, nach unten begrenzt
  }

  function segTime(x1, x2, v1, v2) {
    if (x2 <= x1) return 0;
    const k = (v2 - v1) / (x2 - x1);
    if (Math.abs(k) < 1e-6) return (x2 - x1) / v1;
    return (1 / k) * Math.log(v2 / v1);
  }

  function tTableAt(x) {
    let t = 0;
    for (let i = 0; i < 3; i++) {
      const segX1 = xs[i], segX2 = xs[i+1];
      const segV1 = vs[i], segV2 = vs[i+1];
      if (x >= segX2) {
        t += segTime(segX1, segX2, segV1, segV2);
      } else if (x > segX1) {
        return t + segTime(segX1, x, segV1, vTableAt(x));
      } else {
        return t;
      }
    }
    if (x > 300) t += segTime(300, x, vs[3], vTableAt(x));
    return t;
  }

  // Standortkorrektur: höhere Luftdichte am Schießplatz -> stärkerer Widerstand -> gleicher
  // Geschwindigkeitsverlust wird schon bei kürzerer physischer Distanz erreicht (und umgekehrt bei
  // dünnerer Luft, z. B. in größerer Höhe). Umsetzung über eine "effektive Distanz" x*Dichteverhältnis
  // für die Tabellen-Lookups, mit entsprechender Reskalierung der Flugzeit.
  const vAt = x => vTableAt(x * densityRatio);
  const tAt = x => tTableAt(x * densityRatio) / densityRatio;
  return trajectoryFromFunctions(vAt, tAt, sightHeightCm, zeroM, maxDistM);
}

function lineChart(chartData, avgLine) {
  const w = 260, h = 100, pad = 10;
  const n = chartData.length;
  const xStep = (w - pad*2) / (n - 1);
  const yFor = v => h - pad - (v/10) * (h - pad*2);
  const points = chartData.map((d,i) => `${pad + i*xStep},${yFor(d.avg)}`).join(" ");
  const avgY = yFor(avgLine);
  const dots = chartData.map((d,i) => `<circle cx="${pad+i*xStep}" cy="${yFor(d.avg)}" r="1.6" fill="${COLORS.brass}"/>`).join("");
  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block;aspect-ratio:${w}/${h};" role="img" aria-label="Verlauf des Ringschnitts je Serie">
      <line x1="${pad}" y1="${avgY}" x2="${w-pad}" y2="${avgY}" stroke="${COLORS.muted}" stroke-width="0.4" stroke-dasharray="1.5,1.5"/>
      <polyline points="${points}" fill="none" stroke="${COLORS.brass}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
  `;
}

function niceStep(range, targetTicks) {
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough || 1)));
  const norm = rough / mag;
  let step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return step * mag;
}

function distStep(maxDistM) {
  if (maxDistM <= 50) return 10;
  if (maxDistM <= 100) return 25;
  if (maxDistM <= 200) return 50;
  return 100;
}

function trajectoryChart(points, zeroM, maxDistM, markers) {
  markers = markers || [];
  const w = 220, h = 110, padL = 20, padR = 8, padT = 10, padB = 20;
  const ys = points.map(p => p.y);
  const yMaxRaw = Math.max(...ys, 1);
  const yMinRaw = Math.min(...ys, -1);
  const yStep = niceStep(yMaxRaw - yMinRaw, 4);
  const yMax = Math.ceil(yMaxRaw / yStep) * yStep;
  const yMin = Math.floor(yMinRaw / yStep) * yStep;
  const yRange = Math.max(yMax - yMin, yStep);
  const xFor = x => padL + (x / maxDistM) * (w - padL - padR);
  const yFor = y => padT + (1 - (y - yMin) / yRange) * (h - padT - padB);
  const zeroLineY = yFor(0);
  const path = points.map(p => `${xFor(p.x)},${yFor(p.y)}`).join(" ");
  const areaPath = `${xFor(0)},${zeroLineY} ${path} ${xFor(maxDistM)},${zeroLineY}`;
  const zeroX = xFor(zeroM);
  const xTickStep = distStep(maxDistM);
  const plotLeft = padL, plotRight = w - padR, plotTop = padT, plotBottom = h - padB;
  let xGrid = "", xTicks = "";
  for (let d = 0; d <= maxDistM + 0.01; d += xTickStep) {
    const gx = xFor(d);
    xGrid += `<line x1="${gx}" y1="${plotTop}" x2="${gx}" y2="${plotBottom}" stroke="${COLORS.cardBorder}" stroke-width="0.2" stroke-dasharray="0.6,0.8"/>`;
    xTicks += `<line x1="${gx}" y1="${plotBottom}" x2="${gx}" y2="${plotBottom+1.2}" stroke="${COLORS.muted}" stroke-width="0.3"/>`;
    xTicks += `<text x="${gx}" y="${plotBottom+4.2}" text-anchor="middle" font-size="2.6" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${d}</text>`;
  }
  let yGrid = "", yTicks = "";
  for (let yv = yMin; yv <= yMax + 0.01; yv += yStep) {
    const gy = yFor(yv);
    yGrid += `<line x1="${plotLeft}" y1="${gy}" x2="${plotRight}" y2="${gy}" stroke="${COLORS.cardBorder}" stroke-width="0.2" stroke-dasharray="0.6,0.8"/>`;
    yTicks += `<line x1="${plotLeft-1.2}" y1="${gy}" x2="${plotLeft}" y2="${gy}" stroke="${COLORS.muted}" stroke-width="0.3"/>`;
    yTicks += `<text x="${plotLeft-2}" y="${gy+1}" text-anchor="end" font-size="2.6" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${yv}</text>`;
  }
  const markerDots = markers.map(d => {
    const p = points.reduce((a,b) => Math.abs(b.x-d) < Math.abs(a.x-d) ? b : a, points[0]);
    return `<circle cx="${xFor(p.x)}" cy="${yFor(p.y)}" r="0.9" fill="${COLORS.card}" stroke="${COLORS.brass}" stroke-width="0.6"/>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block;aspect-ratio:${w}/${h};" role="img" aria-label="Flugbahn relativ zur Ziellinie">
      ${yGrid}
      ${xGrid}
      <polygon points="${areaPath}" fill="${COLORS.brass}" opacity="0.12"/>
      <line x1="${plotLeft}" y1="${zeroLineY}" x2="${plotRight}" y2="${zeroLineY}" stroke="${COLORS.cream}" stroke-width="0.4"/>
      <line x1="${zeroX}" y1="${plotTop}" x2="${zeroX}" y2="${plotBottom}" stroke="${COLORS.muted}" stroke-width="0.3" stroke-dasharray="1,1" opacity="0.7"/>
      <polyline points="${path}" fill="none" stroke="${COLORS.brass}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${markerDots}
      <rect x="${plotLeft}" y="${plotTop}" width="${plotRight-plotLeft}" height="${plotBottom-plotTop}" fill="none" stroke="${COLORS.cardBorder}" stroke-width="0.4"/>
      ${xTicks}
      ${yTicks}
      <text x="${plotLeft}" y="${zeroLineY - 2}" font-size="2.8" font-family="'JetBrains Mono',monospace" fill="${COLORS.cream}">Ziellinie</text>
      <text x="${zeroX}" y="${plotTop-1.5}" text-anchor="middle" font-size="2.6" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${zeroM}m Nullpunkt</text>
      <text x="${(plotLeft+plotRight)/2}" y="${h-2}" text-anchor="middle" font-size="2.8" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}" letter-spacing="0.3">DISTANZ (M)</text>
      <text x="${plotLeft-16}" y="${plotTop-2}" font-size="2.8" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}" letter-spacing="0.3">HÖHE (CM)</text>
    </svg>
  `;
}

function velocityChart(points, markers) {
  markers = markers || [];
  const w = 220, h = 110, padL = 20, padR = 8, padT = 10, padB = 20;
  const maxDistM = points[points.length - 1].x;
  const vMaxRaw = Math.max(...points.map(p => p.v));
  const vMinRaw = Math.min(...points.map(p => p.v));
  const vStep = niceStep(vMaxRaw - vMinRaw, 4);
  const vMax = Math.ceil(vMaxRaw / vStep) * vStep;
  const vMin = Math.max(0, Math.floor(vMinRaw / vStep) * vStep);
  const vRange = Math.max(vMax - vMin, vStep);
  const xFor = x => padL + (x / maxDistM) * (w - padL - padR);
  const yFor = v => padT + (1 - (v - vMin) / vRange) * (h - padT - padB);
  const path = points.map(p => `${xFor(p.x)},${yFor(p.v)}`).join(" ");
  const plotLeft = padL, plotRight = w - padR, plotTop = padT, plotBottom = h - padB;
  const areaPath = `${xFor(0)},${plotBottom} ${path} ${xFor(maxDistM)},${plotBottom}`;
  const xTickStep = distStep(maxDistM);
  let xGrid = "", xTicks = "";
  for (let d = 0; d <= maxDistM + 0.01; d += xTickStep) {
    const gx = xFor(d);
    xGrid += `<line x1="${gx}" y1="${plotTop}" x2="${gx}" y2="${plotBottom}" stroke="${COLORS.cardBorder}" stroke-width="0.2" stroke-dasharray="0.6,0.8"/>`;
    xTicks += `<line x1="${gx}" y1="${plotBottom}" x2="${gx}" y2="${plotBottom+1.2}" stroke="${COLORS.muted}" stroke-width="0.3"/>`;
    xTicks += `<text x="${gx}" y="${plotBottom+4.2}" text-anchor="middle" font-size="2.6" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${d}</text>`;
  }
  let yGrid = "", yTicks = "";
  for (let v = vMin; v <= vMax + 0.01; v += vStep) {
    const gy = yFor(v);
    yGrid += `<line x1="${plotLeft}" y1="${gy}" x2="${plotRight}" y2="${gy}" stroke="${COLORS.cardBorder}" stroke-width="0.2" stroke-dasharray="0.6,0.8"/>`;
    yTicks += `<line x1="${plotLeft-1.2}" y1="${gy}" x2="${plotLeft}" y2="${gy}" stroke="${COLORS.muted}" stroke-width="0.3"/>`;
    yTicks += `<text x="${plotLeft-2}" y="${gy+1}" text-anchor="end" font-size="2.6" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${v}</text>`;
  }
  const markerDots = markers.map(d => {
    const p = points.reduce((a,b) => Math.abs(b.x-d) < Math.abs(a.x-d) ? b : a, points[0]);
    return `<circle cx="${xFor(p.x)}" cy="${yFor(p.v)}" r="0.9" fill="${COLORS.card}" stroke="${COLORS.steel}" stroke-width="0.6"/>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block;aspect-ratio:${w}/${h};" role="img" aria-label="Geschwindigkeit über Distanz">
      ${yGrid}
      ${xGrid}
      <polygon points="${areaPath}" fill="${COLORS.steel}" opacity="0.12"/>
      <polyline points="${path}" fill="none" stroke="${COLORS.steel}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${markerDots}
      <rect x="${plotLeft}" y="${plotTop}" width="${plotRight-plotLeft}" height="${plotBottom-plotTop}" fill="none" stroke="${COLORS.cardBorder}" stroke-width="0.4"/>
      ${xTicks}
      ${yTicks}
      <text x="${(plotLeft+plotRight)/2}" y="${h-2}" text-anchor="middle" font-size="2.8" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}" letter-spacing="0.3">DISTANZ (M)</text>
      <text x="${plotLeft-16}" y="${plotTop-2}" font-size="2.8" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}" letter-spacing="0.3">V (M/S)</text>
    </svg>
  `;
}

const RETICLE_TYPES = [
  { key: "mildot", label: "Mil-Dot" },
  { key: "mradtree", label: "MRAD (Tannenbaum)" }
];

function reticleSVG(type, holdovers) {
  const w = 100, h = 100, cx = 50, cy = 50;
  const unitsPerMil = 5.2;
  let pattern = "";
  let milLabels = "";
  if (type === "mildot") {
    for (let m = 1; m <= 9; m++) {
      pattern += `<circle cx="${cx}" cy="${cy + m*unitsPerMil}" r="1.0" fill="${COLORS.cream}"/>`;
      if (m <= 6) pattern += `<circle cx="${cx}" cy="${cy - m*unitsPerMil}" r="1.0" fill="${COLORS.cream}"/>`;
    }
    for (let m = 1; m <= 4; m++) {
      pattern += `<circle cx="${cx + m*unitsPerMil}" cy="${cy}" r="1.0" fill="${COLORS.cream}"/>`;
      pattern += `<circle cx="${cx - m*unitsPerMil}" cy="${cy}" r="1.0" fill="${COLORS.cream}"/>`;
    }
    // halbe Mil-Strichmarken zwischen den Punkten (wie im Referenzbild)
    for (let m = 0; m <= 8; m++) {
      const yD = cy + (m+0.5)*unitsPerMil, yU = cy - (m+0.5)*unitsPerMil;
      pattern += `<line x1="${cx-0.9}" y1="${yD}" x2="${cx+0.9}" y2="${yD}" stroke="${COLORS.cream}" stroke-width="0.4"/>`;
      if (m <= 5) pattern += `<line x1="${cx-0.9}" y1="${yU}" x2="${cx+0.9}" y2="${yU}" stroke="${COLORS.cream}" stroke-width="0.4"/>`;
    }
    for (let m = 0; m <= 3; m++) {
      const xR = cx + (m+0.5)*unitsPerMil, xL = cx - (m+0.5)*unitsPerMil;
      pattern += `<line x1="${xR}" y1="${cy-0.9}" x2="${xR}" y2="${cy+0.9}" stroke="${COLORS.cream}" stroke-width="0.4"/>`;
      pattern += `<line x1="${xL}" y1="${cy-0.9}" x2="${xL}" y2="${cy+0.9}" stroke="${COLORS.cream}" stroke-width="0.4"/>`;
    }
    pattern += `<line x1="${cx}" y1="${cy+5*unitsPerMil}" x2="${cx}" y2="${h-2}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    pattern += `<line x1="${cx}" y1="2" x2="${cx}" y2="${cy-6.5*unitsPerMil}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    pattern += `<line x1="2" y1="${cy}" x2="${cx-4.5*unitsPerMil}" y2="${cy}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    pattern += `<line x1="${cx+4.5*unitsPerMil}" y1="${cy}" x2="${w-2}" y2="${cy}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    // Mil-Zahlen an geraden Mil-Werten, seitlich versetzt
    for (let m = 2; m <= 9; m += 2) {
      milLabels += `<text x="${cx+2.6}" y="${cy+m*unitsPerMil+1}" font-size="2.4" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${m}</text>`;
      if (m <= 6) milLabels += `<text x="${cx+2.6}" y="${cy-m*unitsPerMil+1}" font-size="2.4" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${m}</text>`;
    }
  } else {
    // Spec-Fakten für Meopta MRAD RD (bestätigt via Meopta-Herstellerdaten + Snipers-Hide-Test):
    // nur 1 Mil Graduierung oberhalb der Mitte ("offener Top"), Tannenbaum unterhalb kombiniert aus
    // einem 0,2-Mil-Punktraster UND zusätzlichen 0,5-Mil-Zwischenpunkten (zwei sich überlagernde Raster).
    // Rechnung in Zehntel-Mil als Ganzzahl, um Fließkomma-Rundungsfehler zu vermeiden.
    pattern += `<line x1="${cx}" y1="${cy+9.5*unitsPerMil}" x2="${cx}" y2="${h-2}" stroke="${COLORS.cream}" stroke-width="0.9"/>`;
    pattern += `<line x1="${cx}" y1="2" x2="${cx}" y2="${cy-1*unitsPerMil}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    pattern += `<line x1="2" y1="${cy}" x2="${cx-4.5*unitsPerMil}" y2="${cy}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    pattern += `<line x1="${cx+4.5*unitsPerMil}" y1="${cy}" x2="${w-2}" y2="${cy}" stroke="${COLORS.cream}" stroke-width="1.6"/>`;
    // horizontale Windmarken: 0,2-Mil-Ticks (Ganzzahl-Schritte i=2,4,6,...36 entspricht 0,2..3,6 Mil), 0,5-Mil-Vielfache länger
    for (let i = 2; i <= 36; i += 2) {
      const m = i / 10;
      const isHalfGrid = i % 5 === 0; // 5,10(=0,5,1,0)... vielfache von 0,5 Mil
      const tickLen = isHalfGrid ? 0.9 : 0.5;
      pattern += `<line x1="${cx-m*unitsPerMil}" y1="${cy}" x2="${cx-m*unitsPerMil}" y2="${cy-tickLen}" stroke="${COLORS.cream}" stroke-width="0.25"/>`;
      pattern += `<line x1="${cx+m*unitsPerMil}" y1="${cy}" x2="${cx+m*unitsPerMil}" y2="${cy-tickLen}" stroke="${COLORS.cream}" stroke-width="0.25"/>`;
    }
    // Tannenbaum unterhalb: Vereinigung aus 0,2-Mil-Raster (i%2===0, i=2..90) und 0,5-Mil-Zwischenpunkten (i%5===0)
    const positions = new Set();
    for (let i = 2; i <= 90; i += 2) positions.add(i); // 0,2 / 0,4 / 0,6 / 0,8 / 1,0 ...
    for (let i = 5; i <= 90; i += 5) positions.add(i);  // 0,5 / 1,0 / 1,5 / 2,0 ...
    [...positions].sort((a,b) => a-b).forEach(i => {
      const m = i / 10;
      const y = cy + m * unitsPerMil;
      const isWhole = i % 10 === 0;
      const isHalf = i % 5 === 0;
      const halfWidth = 1 + m * 1.1;
      if (isWhole) {
        pattern += `<line x1="${cx-halfWidth}" y1="${y}" x2="${cx+halfWidth}" y2="${y}" stroke="${COLORS.cream}" stroke-width="0.5"/>`;
        milLabels += `<text x="${cx+halfWidth+1.2}" y="${y+1}" font-size="2.2" font-family="'JetBrains Mono',monospace" fill="${COLORS.muted}">${i/10}</text>`;
      } else {
        pattern += `<circle cx="${cx}" cy="${y}" r="${isHalf ? 0.35 : 0.22}" fill="${COLORS.cream}"/>`;
      }
    });
  }
  const overlay = holdovers.map((hv) => {
    const y = cy + hv.mrad * unitsPerMil;
    const label = `${hv.d}m`;
    return `
      <circle cx="${cx}" cy="${y}" r="2.1" fill="none" stroke="${COLORS.brass}" stroke-width="0.8"/>
      <line x1="${cx-3.4}" y1="${y}" x2="${cx-2.3}" y2="${y}" stroke="${COLORS.brass}" stroke-width="0.6"/>
      <text x="${cx-4}" y="${y+1}" text-anchor="end" font-size="3.2" font-family="'JetBrains Mono',monospace" fill="${COLORS.brass}" font-weight="700">${label}</text>
    `;
  }).join("");
  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:260px;display:block;margin:0 auto;" role="img" aria-label="Absehen mit Haltepunkten">
      <circle cx="${cx}" cy="${cy}" r="48" fill="none" stroke="${COLORS.cardBorder}" stroke-width="1.5"/>
      ${pattern}
      ${milLabels}
      ${overlay}
      <circle cx="${cx}" cy="${cy}" r="0.8" fill="${COLORS.red}"/>
    </svg>
  `;
}

function renderBallisticsView() {
  const ammo = AMMO.find(a => a.name === state.ballisticAmmo) || AMMO[0];
  const sightHeight = state.ballisticSightHeight != null ? state.ballisticSightHeight : ammo.sightHeight;
  const zero = state.ballisticZero != null ? state.ballisticZero : ammo.zero;
  const configuredMaxDist = state.ballisticMaxDist != null ? state.ballisticMaxDist : Math.max(zero, ammo.maxChartDist || 200);
  const sampleDists = [25, 50, 100, 150, 200, 300].filter(d => d <= configuredMaxDist);

  const tempAdjustment = (ammo.tempSensitivity && state.weather) ? ammo.tempSensitivity * (state.weather.temperature - 21) : 0;
  const vT0 = (state.ballisticVT0 != null ? state.ballisticVT0 : ammo.v0) + tempAdjustment;
  const vT100 = (state.ballisticVT100 != null ? state.ballisticVT100 : ammo.v100) + tempAdjustment;
  const vT200 = (state.ballisticVT200 != null ? state.ballisticVT200 : ammo.v200) + tempAdjustment;
  const vT300 = (state.ballisticVT300 != null ? state.ballisticVT300 : ammo.v300) + tempAdjustment;

  const hasWeather = !!state.weather;
  const densityRatio = (hasWeather && state.ballisticUseWeather !== false)
    ? airDensityRatio(state.weather.temperature, state.weather.pressure)
    : 1;
  const computeTraj = dist => ballisticTrajectoryFromTable({ v0: vT0, v100: vT100, v200: vT200, v300: vT300 }, sightHeight, zero, dist, densityRatio);

  const targetDist = state.ballisticTargetDist != null ? state.ballisticTargetDist : (sampleDists.includes(zero) ? zero : (sampleDists[0] || zero));
  const targetClamped = Math.max(1, targetDist); // keine stille Kappung mehr auf den Chart-Bereich
  const maxDist = Math.max(configuredMaxDist, targetClamped); // Chart erweitert sich automatisch auf die Zielentfernung

  const points = computeTraj(maxDist);
  const sampleRows = sampleDists.map(d => {
    const p = computeTraj(d);
    const last = p[p.length - 1];
    const mrad = d > 0 ? (10 * Math.abs(last.y)) / d : 0;
    return { d, y: last.y, v: last.v, mrad };
  });

  const targetPoints = computeTraj(targetClamped);
  const targetLast = targetPoints[targetPoints.length - 1];
  const targetMrad = (10 * Math.abs(targetLast.y)) / targetClamped;
  const targetResult = { d: Math.round(targetClamped), y: targetLast.y, v: targetLast.v, mrad: targetMrad };
  const windDriftCmVal = windDriftCm(state.ballisticWindSpeed || 0, state.ballisticWindClock || 0, targetLast.t);
  const windMrad = targetClamped > 0 ? (10 * Math.abs(windDriftCmVal)) / targetClamped : 0;

  return `
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:12px 14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">STANDORTKORREKTUR</div>
        ${hasWeather ? `<span data-action="toggle-ballistic-weather" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${state.ballisticUseWeather !== false ? COLORS.cream : COLORS.muted};">${state.ballisticUseWeather !== false ? "An" : "Aus"}</span>` : ""}
      </div>
      ${hasWeather
        ? `<div style="font-size:12px;color:${COLORS.cream};margin-top:4px;">${state.range || "Schießplatz"} · ${Math.round(state.weather.temperature)}°C, ${Math.round(state.weather.pressure)} hPa → Luftdichte ${(densityRatio*100).toFixed(0)}% ggü. Standardatmosphäre</div>`
        : `<div style="font-size:12px;color:${COLORS.muted};margin-top:4px;">Keine Wetterdaten für den Schießplatz vorhanden – es wird mit Standardatmosphäre (15°C, 1013 hPa) gerechnet. Wetterdaten lassen sich unter „Neue Serie" beim Schießplatz abrufen.</div>`
      }
      ${hasWeather && ammo.tempSensitivity ? `<div style="font-size:12px;color:${COLORS.cream};margin-top:4px;">Pulver-Temp.empf. ${ammo.tempSensitivity} m/s/°C → V0 bei ${Math.round(state.weather.temperature)}°C (Ref. 21°C) um ${tempAdjustment >= 0 ? "+" : ""}${tempAdjustment.toFixed(1)} m/s angepasst</div>` : ""}
    </div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:12px 14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;margin-bottom:8px;">WIND</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div>
          <div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Geschwindigkeit (m/s)</div>
          <input type="text" inputmode="decimal" id="ballistic-windspeed" value="${state.ballisticWindSpeed || 0}" />
        </div>
        <div>
          <div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Richtung (Uhr, 3=voll von rechts)</div>
          <input type="text" inputmode="numeric" id="ballistic-windclock" value="${state.ballisticWindClock || 3}" />
        </div>
      </div>
    </div>
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">ZIELENTFERNUNG</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">
      ${sampleDists.map(d => `
        <div class="btn-tab mono" data-action="set-ballistic-target-dist" data-value="${d}" style="text-align:center;padding:9px 2px;font-size:13px;font-weight:700;border-radius:2px;background:${Math.round(targetClamped)===d?COLORS.cream:'transparent'};color:${Math.round(targetClamped)===d?COLORS.bg:COLORS.cream};border:1px solid ${Math.round(targetClamped)===d?COLORS.cream:COLORS.cardBorder};">${d} m</div>
      `).join("")}
    </div>
    <input type="text" inputmode="numeric" id="ballistic-target-dist-custom" placeholder="Eigene Distanz in m" value="${Math.round(targetClamped)}" style="margin-bottom:16px;" />
    <div style="background:${COLORS.card};border:2px solid ${COLORS.brass};border-radius:4px;padding:16px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;margin-bottom:6px;">AUF ${targetResult.d} M HALTEN</div>
      <div class="mono" style="font-size:32px;font-weight:700;color:${COLORS.brass};line-height:1;">${targetResult.mrad < 0.05 ? "0,0 mil" : targetResult.mrad.toFixed(1).replace(".", ",") + " mil"}</div>
      <div style="font-size:13px;color:${COLORS.cream};margin-top:4px;">${targetResult.mrad < 0.05 ? "im Nullpunkt" : (targetResult.y < 0 ? "hoch halten" : "tief halten")}</div>
      <div style="display:flex;gap:20px;margin-top:10px;">
        <div><div style="font-size:10px;color:${COLORS.muted};">TREFFPUNKT</div><div class="mono" style="font-size:14px;color:${COLORS.cream};">${targetResult.y >= 0 ? "+" : ""}${targetResult.y.toFixed(1)} cm</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};">V</div><div class="mono" style="font-size:14px;color:${COLORS.cream};">${Math.round(targetResult.v)} m/s</div></div>
        ${(state.ballisticWindSpeed || 0) > 0 ? `<div><div style="font-size:10px;color:${COLORS.muted};">WIND</div><div class="mono" style="font-size:14px;color:${COLORS.cream};">${windMrad.toFixed(2)} mil ${windDriftCmVal >= 0 ? "rechts" : "links"}</div></div>` : ""}
      </div>
    </div>

    <div class="grid-2">
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">MUNITION</div>
        <span data-action="toggle-ammo-edit-mode" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${state.ammoEditMode ? COLORS.cream : COLORS.muted};">${state.ammoEditMode ? "Fertig" : "Bearbeiten"}</span>
      </div>
      ${state.ammoEditMode ? `<div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;">Munition antippen, um sie zu bearbeiten oder zu löschen.</div>` : ""}
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:${state.addingAmmo ? "8px" : "12px"};">
        ${AMMO.map(a => `
          <div class="btn-tab" data-action="${state.ammoEditMode ? "start-edit-ammo" : "set-ballistic-ammo"}" data-value="${a.name}" style="cursor:pointer;padding:9px 10px;border-radius:2px;background:${!state.ammoEditMode && ammo.name===a.name?COLORS.cream:'transparent'};border:1px ${state.ammoEditMode ? "dashed" : "solid"} ${!state.ammoEditMode && ammo.name===a.name?COLORS.cream:COLORS.cardBorder};">
            <div style="font-size:12px;font-weight:600;color:${!state.ammoEditMode && ammo.name===a.name?COLORS.bg:COLORS.cream};">${state.ammoEditMode ? "✎ " : ""}${a.name}</div>
            <div class="mono" style="font-size:10px;color:${!state.ammoEditMode && ammo.name===a.name?COLORS.bg:COLORS.muted};">${a.caliber} · V0 ${a.v0} m/s</div>
          </div>
        `).join("")}
      </div>
      ${state.addingAmmo ? (() => {
        const editingAmmo = state.editingAmmoOriginalName ? AMMO.find(a => a.name === state.editingAmmoOriginalName) : null;
        const nameVal = editingAmmo ? editingAmmo.name.replace(/"/g,'&quot;') : "";
        const selCaliber = state.newAmmoCaliber || (editingAmmo ? editingAmmo.caliber : CALIBERS[0]);
        return `
        <div style="margin-bottom:12px;padding:10px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">
          <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;">${editingAmmo ? "MUNITION BEARBEITEN" : "NEUE MUNITION"}</div>
          <input type="text" id="new-ammo-name" placeholder="Bezeichnung, z. B. S&B FMJ 147gr" value="${nameVal}" style="margin-bottom:6px;" />
          <div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">KALIBER</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">
            ${CALIBERS.map(c => `
              <div class="btn-tab mono" data-action="set-new-ammo-caliber" data-value="${c}" style="text-align:center;padding:7px 2px;font-size:11px;font-weight:600;border-radius:2px;background:${selCaliber===c?COLORS.cream:'transparent'};color:${selCaliber===c?COLORS.bg:COLORS.cream};border:1px solid ${selCaliber===c?COLORS.cream:COLORS.cardBorder};">${c}</div>
            `).join("")}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V0 (m/s)</div><input type="text" inputmode="numeric" id="new-ammo-v0" value="${editingAmmo ? editingAmmo.v0 : ""}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V100 (m/s)</div><input type="text" inputmode="numeric" id="new-ammo-v100" value="${editingAmmo ? editingAmmo.v100 : ""}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V200 (m/s)</div><input type="text" inputmode="numeric" id="new-ammo-v200" value="${editingAmmo ? editingAmmo.v200 : ""}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V300 (m/s)</div><input type="text" inputmode="numeric" id="new-ammo-v300" value="${editingAmmo ? editingAmmo.v300 : ""}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Visierhöhe (cm)</div><input type="text" inputmode="decimal" id="new-ammo-sightheight" value="${editingAmmo ? editingAmmo.sightHeight : "4.5"}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Nullpunkt (m)</div><input type="text" inputmode="numeric" id="new-ammo-zero" value="${editingAmmo ? editingAmmo.zero : "100"}" /></div>
            <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Pulver-Temp.empf. (m/s pro °C, optional)</div><input type="text" inputmode="decimal" id="new-ammo-tempsens" value="${editingAmmo && editingAmmo.tempSensitivity != null ? editingAmmo.tempSensitivity : ""}" placeholder="z. B. 0.8" /></div>
          </div>
          <div style="display:flex;gap:6px;">
            <div class="btn-tab" data-action="save-ammo" style="flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.cream};color:${COLORS.bg};">Speichern</div>
            <div class="btn-tab" data-action="cancel-add-ammo" style="flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
          </div>
          ${editingAmmo ? (
            state.confirmDeleteAmmo === editingAmmo.name
              ? `<div style="margin-top:10px;padding:10px;background:${COLORS.card};border:1px solid ${COLORS.red};border-radius:4px;">
                  <div style="font-size:12px;color:${COLORS.cream};margin-bottom:8px;">Diese Munition wirklich löschen?</div>
                  <div style="display:flex;gap:6px;">
                    <div data-action="confirm-delete-ammo" data-value="${editingAmmo.name}" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.red};color:${COLORS.bg};">Ja, löschen</div>
                    <div data-action="cancel-delete-ammo" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
                  </div>
                </div>`
              : `<div data-action="delete-ammo" data-value="${editingAmmo.name}" style="cursor:pointer;text-align:center;margin-top:8px;font-size:12px;color:${COLORS.red};text-decoration:underline;">Munition löschen</div>`
          ) : ""}
        </div>
      `; })() : (!state.ammoEditMode ? `<div data-action="start-add-ammo" style="cursor:pointer;font-size:12px;color:${COLORS.muted};text-decoration:underline;">+ Munition hinzufügen</div>` : "")}
    </div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:10px;letter-spacing:1px;">PARAMETER · HERSTELLERDATEN</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V0 (m/s)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${vT0}</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V100 (m/s)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${vT100}</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V200 (m/s)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${vT200}</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">V300 (m/s)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${vT300}</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Visierhöhe (cm)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${sightHeight}</div></div>
        <div><div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Nullpunkt (m)</div><div class="mono" style="padding:10px 12px;background:${COLORS.bg};border:1px solid ${COLORS.cardBorder};border-radius:4px;">${zero}</div></div>
        <div>
          <div style="font-size:10px;color:${COLORS.muted};margin-bottom:4px;">Chart bis (m)</div>
          <input type="text" inputmode="numeric" id="ballistic-maxdist" value="${maxDist}" />
        </div>
      </div>
      <div data-action="reset-ballistic-params" style="cursor:pointer;font-size:11px;color:${COLORS.muted};text-decoration:underline;margin-top:10px;">Auf Kaliber-Standardwerte zurücksetzen</div>
    </div>
    </div>
    <div class="grid-2">
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:12px 8px 8px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:4px;padding-left:6px;">FLUGBAHN RELATIV ZUR ZIELLINIE (IDEALLINIE)</div>
      ${trajectoryChart(points, zero, maxDist, sampleDists)}
    </div>
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:12px 8px 8px;margin-bottom:16px;">
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:4px;padding-left:6px;">GESCHWINDIGKEIT ÜBER DISTANZ</div>
      ${velocityChart(points, sampleDists)}
    </div>
    </div>
    <div class="grid-2">
    <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">ABSEHEN</div>
        <div style="display:flex;gap:6px;">
          ${RETICLE_TYPES.map(rt => `
            <span data-action="set-reticle-type" data-value="${rt.key}" style="cursor:pointer;font-size:11px;padding:4px 8px;border-radius:2px;background:${state.reticleType===rt.key?COLORS.cream:'transparent'};color:${state.reticleType===rt.key?COLORS.bg:COLORS.muted};border:1px solid ${state.reticleType===rt.key?COLORS.cream:COLORS.cardBorder};">${rt.label}</span>
          `).join("")}
        </div>
      </div>
      ${reticleSVG(state.reticleType, targetResult.mrad >= 0.05 ? [targetResult] : [])}
      <div style="font-size:10px;color:${COLORS.muted};margin-top:8px;text-align:center;">Haltepunkte unterhalb des Zentrums – dort halten, um den Fallwert auf der jeweiligen Distanz auszugleichen.</div>
    </div>
    <div>
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">WERTE JE DISTANZ</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
      ${sampleRows.map(r => `
        <div data-action="set-ballistic-target-dist" data-value="${r.d}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${COLORS.card};border:1px solid ${r.d===Math.round(targetClamped)?COLORS.brass:COLORS.cardBorder};border-radius:4px;padding:8px 12px;">
          <div class="mono" style="font-size:13px;font-weight:600;">${r.d} m</div>
          <div style="display:flex;gap:16px;">
            <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">TREFFPUNKT</div><div class="mono" style="font-size:13px;">${r.y >= 0 ? "+" : ""}${r.y.toFixed(1)} cm</div></div>
            <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">HALTEPUNKT</div><div class="mono" style="font-size:13px;color:${COLORS.brass};">${r.mrad < 0.05 ? "–" : r.mrad.toFixed(2) + " mil " + (r.y < 0 ? "hoch" : "tief")}</div></div>
            <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">V</div><div class="mono" style="font-size:13px;">${Math.round(r.v)} m/s</div></div>
          </div>
        </div>
      `).join("")}
    </div>
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:16px;">Auf eine Zeile tippen wählt sie auch als Zielentfernung.</div>
    </div>
    </div>
    <div style="font-size:11px;color:${COLORS.muted};line-height:1.5;margin-bottom:8px;">Haltepunkt in Mil (MRAD): „hoch" = über den Zielpunkt halten (Geschoss liegt tiefer als die Ziellinie), „tief" = unter den Zielpunkt halten (Geschoss liegt noch über der Ziellinie, typischerweise vor dem Nullpunkt). Nur Höhenkorrektur, kein Windabzug.</div>
    <div style="font-size:11px;color:${COLORS.muted};line-height:1.5;">Vereinfachtes Modell (Punktmasse, exponentieller Geschwindigkeitsabfall über den ballistischen Koeffizienten, Standardatmosphäre, kein Wind). Dient der Veranschaulichung von Flugbahn und Geschwindigkeitsverlauf – ersetzt keine chronographisch validierte Ballistik-Software und keine reale Einschießprozedur.</div>
  `;
}

function computeRingHistogram(sessions) {
  const counts = Array(11).fill(0);
  sessions.forEach(s => s.shots.forEach(sh => {
    const r = shotRing(sh);
    if (r >= 0 && r <= 10) counts[r]++;
  }));
  return counts;
}

function computeTrainingStreak(sessions) {
  if (!sessions || sessions.length === 0) return null;
  const lastDate = sessions.reduce((a,s) => s.date > a ? s.date : a, sessions[0].date);
  const last = new Date(lastDate + "T00:00:00");
  const today = new Date(todayISO() + "T00:00:00");
  const days = Math.round((today - last) / 86400000);
  return { lastDate, days };
}

function computeCompetitionResults(sessions) {
  const groups = {};
  sessions.forEach(s => {
    if (!s.competitionGroupId) return;
    if (!groups[s.competitionGroupId]) groups[s.competitionGroupId] = {};
    groups[s.competitionGroupId][s.discipline] = s;
  });
  return Object.values(groups)
    .filter(g => g.praezision && g.duell)
    .map(g => ({
      date: g.praezision.date,
      presetName: g.praezision.presetName,
      weapon: g.praezision.weapon,
      praezisionSum: g.praezision.sum,
      duellSum: g.duell.sum,
      totalSum: g.praezision.sum + g.duell.sum,
      totalShots: g.praezision.shots.length + g.duell.shots.length
    }))
    .sort((a,b) => b.date < a.date ? -1 : 1);
}

function computeWindCorrelation(sessions) {
  const withWind = sessions.filter(s => s.weather && typeof s.weather.windSpeed === "number");
  if (withWind.length < 4) return null;
  const threshold = 3;
  const windy = withWind.filter(s => s.weather.windSpeed > threshold);
  const calm = withWind.filter(s => s.weather.windSpeed <= threshold);
  if (windy.length < 2 || calm.length < 2) return null;
  const avgWindy = windy.reduce((a,s) => a + s.avg, 0) / windy.length;
  const avgCalm = calm.reduce((a,s) => a + s.avg, 0) / calm.length;
  return { threshold, avgWindy, avgCalm, diff: avgCalm - avgWindy, windyCount: windy.length, calmCount: calm.length };
}

function renderStatsView() {
  const filtered = getFiltered();
  const summary = getSummary(filtered);
  const chartData = [...filtered].sort((a,b) => a.date < b.date ? -1 : 1).map(s => ({ avg: s.avg }));
  const streak = computeTrainingStreak(state.sessions);
  const histogram = computeRingHistogram(filtered);
  const windCorr = computeWindCorrelation(filtered);
  const competitionResults = computeCompetitionResults(filtered);

  let body = "";
  if (summary.count === 0) {
    body = `<div style="color:${COLORS.muted};font-size:14px;padding:24px 0;text-align:center;">Noch keine Serien für diese Auswahl. Erfasse zuerst eine Serie.</div>`;
  } else {
    body = `
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">GESAMT</div>
      <div class="stats-summary-grid">
        <div style="background:${COLORS.card};border-radius:4px;padding:12px;"><div style="font-size:11px;color:${COLORS.muted};">SERIEN</div><div class="mono" style="font-size:24px;font-weight:600;">${summary.count}</div></div>
        <div style="background:${COLORS.card};border-radius:4px;padding:12px;"><div style="font-size:11px;color:${COLORS.muted};">Ø RINGE / SCHUSS</div><div class="mono" style="font-size:24px;font-weight:600;">${summary.avg.toFixed(2)}</div></div>
        <div style="background:${COLORS.card};border-radius:4px;padding:12px;"><div style="font-size:11px;color:${COLORS.muted};">BESTE SERIE</div><div class="mono" style="font-size:18px;font-weight:600;color:${COLORS.brass};">${summary.best.sum} (${summary.best.distance}m, ${formatDate(summary.best.date)})</div></div>
        <div style="background:${COLORS.card};border-radius:4px;padding:12px;"><div style="font-size:11px;color:${COLORS.muted};">SCHWÄCHSTE SERIE</div><div class="mono" style="font-size:18px;font-weight:600;color:${COLORS.muted};">${summary.worst.sum} (${summary.worst.distance}m, ${formatDate(summary.worst.date)})</div></div>
      </div>
      ${chartData.length > 1 ? `
        <div style="background:${COLORS.card};border-radius:4px;padding:12px 8px 4px;margin-bottom:16px;">
          <div style="font-size:11px;color:${COLORS.muted};margin-bottom:4px;padding-left:6px;">ENTWICKLUNG Ø RINGE JE SERIE</div>
          ${lineChart(chartData, summary.avg)}
        </div>` : ""}
      ${competitionResults.length > 0 ? `
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">WETTKAMPF-GESAMTERGEBNISSE</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        ${competitionResults.map(r => `
          <div style="background:${COLORS.card};border:1px solid ${COLORS.brass};border-radius:4px;padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
              <div style="font-size:12px;font-weight:600;color:${COLORS.cream};">${r.presetName || "Wettkampf"}</div>
              <div class="mono" style="font-size:11px;color:${COLORS.muted};">${formatDate(r.date)}</div>
            </div>
            <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;">${r.weapon}</div>
            <div style="display:flex;gap:20px;align-items:baseline;">
              <div><div style="font-size:10px;color:${COLORS.muted};">PRÄZISION</div><div class="mono" style="font-size:14px;">${r.praezisionSum}</div></div>
              <div><div style="font-size:10px;color:${COLORS.muted};">DUELL</div><div class="mono" style="font-size:14px;">${r.duellSum}</div></div>
              <div><div style="font-size:10px;color:${COLORS.muted};">GESAMT (${r.totalShots} Schuss)</div><div class="mono" style="font-size:18px;font-weight:700;color:${COLORS.brass};">${r.totalSum}</div></div>
            </div>
          </div>
        `).join("")}
      </div>
      ` : ""}
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">RINGVERTEILUNG</div>
      <div style="background:${COLORS.card};border-radius:4px;padding:14px 8px 8px;margin-bottom:16px;">
        ${(() => {
          const maxCount = Math.max(...histogram, 1);
          return `<div style="display:flex;align-items:flex-end;gap:4px;height:100px;">
            ${histogram.map((c, r) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                <div style="font-size:9px;color:${COLORS.muted};margin-bottom:2px;">${c > 0 ? c : ""}</div>
                <div style="width:100%;background:${r>=9?COLORS.brass:COLORS.steel};height:${Math.max(2,(c/maxCount)*70)}px;border-radius:2px 2px 0 0;"></div>
                <div style="font-size:9px;color:${COLORS.muted};margin-top:3px;">${r}</div>
              </div>
            `).join("")}
          </div>`;
        })()}
      </div>
      ${windCorr ? `
      <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:14px;margin-bottom:16px;">
        <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;letter-spacing:1px;">WETTER-KORRELATION</div>
        <div style="font-size:13px;color:${COLORS.cream};line-height:1.5;">Bei über ${windCorr.threshold} m/s Wind liegt dein Schnitt bei ${windCorr.avgWindy.toFixed(2)} Ringen (${windCorr.windyCount} Serien), bei ruhigerem Wetter bei ${windCorr.avgCalm.toFixed(2)} (${windCorr.calmCount} Serien) – ${windCorr.diff > 0 ? "ein Unterschied von " + windCorr.diff.toFixed(2) + " Ringen." : "kaum ein Unterschied."}</div>
      </div>` : ""}
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">TAGESSTATISTIK</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
        ${computeDailyStats(filtered).map(d => `
          <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:13px;">${formatDate(d.date)}</div>
            <div style="display:flex;gap:16px;align-items:center;">
              <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">SERIEN</div><div class="mono" style="font-size:15px;font-weight:600;">${d.count}</div></div>
              <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">SCHÜSSE</div><div class="mono" style="font-size:15px;font-weight:600;">${d.totalShots}</div></div>
              <div style="text-align:right;"><div style="font-size:10px;color:${COLORS.muted};">Ø</div><div class="mono" style="font-size:15px;font-weight:600;">${d.avg.toFixed(1)}</div></div>
            </div>
          </div>
        `).join("")}
      </div>
      <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">ALLE SERIEN</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${[...filtered].sort((a,b) => a.date < b.date ? 1 : -1).map(s => `
          <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:10px 12px;">
            <div data-action="toggle-target" data-value="${s.id}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:13px;">${formatDate(s.date)} <span style="color:${distColor(s.distance)};font-weight:600;">· ${s.distance}m${s.distance === 25 ? " · " + (s.discipline === "duell" ? "Duell" : "Präzision") : ""}</span></div>
                <div class="mono" style="font-size:11px;color:${COLORS.muted};">${s.shots.map(shotRing).join(" ")}</div>
                ${s.weapon ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:2px;">${s.weapon} · ${s.caliber}${s.mode ? " · " + (MODES.find(m=>m.key===s.mode) ? MODES.find(m=>m.key===s.mode).label : s.mode) : ""}</div>` : ""}
                ${s.range ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:2px;">${s.range}${s.weather ? " · " + Math.round(s.weather.temperature) + "°C, " + s.weather.windSpeed.toFixed(1) + " m/s " + degToCompass(s.weather.windDirection) : ""}</div>` : ""}
                ${s.presetName ? `<div style="font-size:11px;color:${COLORS.brass};margin-top:2px;">${s.presetName}</div>` : ""}
                ${s.lotNumber ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:2px;">Los: ${s.lotNumber}</div>` : ""}
                ${s.ammoName ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:2px;">Munition: ${s.ammoName}</div>` : ""}
                ${s.notes ? `<div style="font-size:11px;color:${COLORS.cream};margin-top:2px;font-style:italic;">„${s.notes}"</div>` : ""}
                ${(() => { const g = groupStats(s.shots, s.distance, s.discipline); return g ? `<div style="font-size:11px;color:${COLORS.muted};margin-top:2px;">ES ${g.extremeSpreadCm.toFixed(1)} cm (${g.extremeSpreadPct.toFixed(1)}%) · MR ${g.meanRadiusCm.toFixed(1)} cm (${g.meanRadiusPct.toFixed(1)}%)</div>` : ""; })()}
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="text-align:right;">
                  <div class="mono" style="font-size:18px;font-weight:600;">${s.sum}</div>
                  <div style="font-size:11px;color:${COLORS.muted};">Ø ${s.avg.toFixed(1)}</div>
                </div>
                <div data-action="print-session" data-value="${s.id}" role="button" aria-label="Ergebniszettel drucken" style="cursor:pointer;color:${COLORS.muted};font-size:13px;text-decoration:underline;">Zettel</div>
                <div data-action="edit-session" data-value="${s.id}" role="button" aria-label="Serie bearbeiten" style="cursor:pointer;color:${COLORS.muted};font-size:13px;text-decoration:underline;">Bearb.</div>
                <div data-action="delete-session" data-value="${s.id}" role="button" aria-label="Serie löschen" style="cursor:pointer;color:${COLORS.muted};font-size:18px;padding:4px 6px;line-height:1;">×</div>
              </div>
            </div>
            ${state.confirmDeleteSessionId === s.id ? `
              <div style="margin-top:10px;padding:10px;background:${COLORS.bg};border:1px solid ${COLORS.red};border-radius:4px;">
                <div style="font-size:12px;color:${COLORS.cream};margin-bottom:8px;">Diese Serie wirklich löschen? Das kann nicht rückgängig gemacht werden.</div>
                <div style="display:flex;gap:6px;">
                  <div data-action="confirm-delete-session" data-value="${s.id}" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.red};color:${COLORS.bg};">Ja, löschen</div>
                  <div data-action="cancel-delete-session" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
                </div>
              </div>
            ` : ""}
            ${state.expandedSessionId === s.id ? (() => {
              const partner = s.competitionGroupId ? state.sessions.find(x => x.competitionGroupId === s.competitionGroupId && x.id !== s.id) : null;
              const targetsToShow = partner ? [s, partner].sort((a,b) => a.discipline === "praezision" ? -1 : 1) : [s];
              return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${COLORS.cardBorder};display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
                ${targetsToShow.map(t => `
                  <div style="max-width:200px;">
                    ${t.competitionGroupId ? `<div style="text-align:center;font-size:11px;color:${COLORS.muted};margin-bottom:4px;text-transform:capitalize;">${t.discipline || ""}</div>` : ""}
                    ${targetSVG(t.shots, t.distance, { size: 200, discipline: t.discipline })}
                  </div>
                `).join("")}
              </div>`;
            })() : ""}
            ${state.expandedSessionId === s.id ? (() => {
              const diag = diagnoseAim(s.shots, s.distance, s.discipline, state.shooterHand);
              if (!diag) return "";
              return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid ${COLORS.cardBorder};font-size:12px;color:${COLORS.cream};line-height:1.4;">${diag.centered ? "Zentriert um den Zielpunkt (Versatz " + diag.offsetPct.toFixed(0) + "%) – kein systematischer Fehler erkennbar." : "<strong>" + diag.direction.label + "</strong>: " + diag.tip}</div>`;
            })() : ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  return `
    ${streak && streak.days >= 7 ? `
    <div style="background:${COLORS.card};border:1px solid ${COLORS.brass};border-radius:4px;padding:12px 14px;margin-bottom:16px;">
      <div style="font-size:13px;color:${COLORS.cream};">Letztes Training vor <strong>${streak.days} Tagen</strong> (${formatDate(streak.lastDate)}) – Zeit für die nächste Serie?</div>
    </div>
    ` : ""}
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">EXPORT · GESAMT</div>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <div class="btn-tab" data-action="export-json" data-value="full" style="flex:1;text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;border:1px solid ${COLORS.cardBorder};">JSON-Sicherung</div>
      <div class="btn-tab" data-action="export-csv" data-value="full" style="flex:1;text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;border:1px solid ${COLORS.cardBorder};">CSV</div>
    </div>
    <div style="font-size:11px;color:${COLORS.muted};margin-bottom:8px;letter-spacing:1px;">EXPORT · TAGE</div>
    <div class="btn-tab" data-action="start-export-daily" style="text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;border:1px solid ${COLORS.cardBorder};margin-bottom:8px;">Tage auswählen …</div>
    ${state.showDayExportPicker ? `
      <div style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:4px;padding:12px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1px;">TAGE AUSWÄHLEN</div>
          <div style="display:flex;gap:10px;">
            <span data-action="select-all-export-days" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${COLORS.muted};">Alle</span>
            <span data-action="select-none-export-days" style="cursor:pointer;font-size:11px;text-decoration:underline;color:${COLORS.muted};">Keine</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;max-height:260px;overflow-y:auto;">
          ${computeDailyStats(state.sessions).map(d => {
            const checked = state.selectedExportDays.indexOf(d.date) !== -1;
            return `
              <div data-action="toggle-export-day" data-value="${d.date}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:${COLORS.bg};border:1px solid ${checked ? COLORS.cream : COLORS.cardBorder};border-radius:4px;">
                <div style="font-size:13px;">${formatDate(d.date)} <span style="color:${COLORS.muted};font-size:11px;">· ${d.count} Serien</span></div>
                <div style="width:16px;height:16px;border-radius:3px;border:1px solid ${checked ? COLORS.cream : COLORS.cardBorder};background:${checked ? COLORS.cream : 'transparent'};"></div>
              </div>
            `;
          }).join("")}
        </div>
        <div style="font-size:11px;color:${COLORS.muted};margin-bottom:6px;">${state.selectedExportDays.length} Tag${state.selectedExportDays.length === 1 ? "" : "e"} ausgewählt</div>
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <div class="btn-tab" data-action="export-json" data-value="daily" style="flex:1;text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.cream};color:${COLORS.bg};">JSON-Sicherung</div>
          <div class="btn-tab" data-action="export-csv" data-value="daily" style="flex:1;text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.cream};color:${COLORS.bg};">CSV</div>
        </div>
        <div class="btn-tab" data-action="cancel-export-daily" style="text-align:center;padding:9px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Schließen</div>
      </div>
    ` : ""}
    <div class="btn-tab" data-action="trigger-import" style="text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;border:1px solid ${COLORS.cardBorder};margin-bottom:8px;">Sicherung importieren (zusammenführen)</div>
    ${state.confirmReplaceImport ? `
      <div style="margin-bottom:16px;padding:10px;background:${COLORS.card};border:1px solid ${COLORS.red};border-radius:4px;">
        <div style="font-size:12px;color:${COLORS.cream};margin-bottom:8px;">Wirklich alles ersetzen? Alle aktuellen Serien, Waffen und Munition werden dabei gelöscht und durch den Inhalt der Datei ersetzt.</div>
        <div style="display:flex;gap:6px;">
          <div data-action="confirm-replace-import" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:600;border-radius:2px;background:${COLORS.red};color:${COLORS.bg};">Ja, ersetzen</div>
          <div data-action="cancel-replace-import" style="cursor:pointer;flex:1;text-align:center;padding:8px 0;font-size:13px;border:1px solid ${COLORS.cardBorder};border-radius:2px;">Abbrechen</div>
        </div>
      </div>
    ` : `<div class="btn-tab" data-action="trigger-import-replace" style="text-align:center;padding:9px 0;font-size:13px;font-weight:600;border-radius:2px;border:1px solid ${COLORS.red};color:${COLORS.red};margin-bottom:16px;">Sicherung wiederherstellen (alles ersetzen)</div>`}
    <input type="file" id="import-file-input" accept="application/json,.json" style="display:none;" />
    ${state.saveError ? `<div style="color:${COLORS.red};font-size:13px;margin-bottom:12px;">${state.saveError}</div>` : ""}
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      ${[{key:"all",label:"Alle"},{key:"25",label:"25 m"},{key:"100",label:"100 m"},{key:"300",label:"300 m"}].map(t => `
        <div class="btn-tab" data-action="set-filter" data-value="${t.key}" style="flex:1;text-align:center;padding:8px 0;font-size:14px;font-weight:600;border-radius:2px;background:${state.statsFilter===t.key?COLORS.cream:'transparent'};color:${state.statsFilter===t.key?COLORS.bg:COLORS.muted};border:1px solid ${state.statsFilter===t.key?COLORS.cream:COLORS.cardBorder};">${t.label}</div>
      `).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      ${[{key:"all",label:"Alle Modi"}].concat(MODES).map(t => `
        <div class="btn-tab" data-action="set-mode-filter" data-value="${t.key}" style="flex:1;text-align:center;padding:8px 0;font-size:14px;font-weight:600;border-radius:2px;background:${state.statsModeFilter===t.key?COLORS.cream:'transparent'};color:${state.statsModeFilter===t.key?COLORS.bg:COLORS.muted};border:1px solid ${state.statsModeFilter===t.key?COLORS.cream:COLORS.cardBorder};">${t.label}</div>
      `).join("")}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
      <select id="stats-weapon-filter">
        <option value="all">Alle Waffen</option>
        ${[...new Set(state.sessions.map(s => s.weapon).filter(Boolean))].map(w => `<option value="${w}" ${state.statsWeaponFilter===w?"selected":""}>${w}</option>`).join("")}
      </select>
      <select id="stats-caliber-filter">
        <option value="all">Alle Kaliber</option>
        ${[...new Set(state.sessions.map(s => s.caliber).filter(Boolean))].map(c => `<option value="${c}" ${state.statsCaliberFilter===c?"selected":""}>${c}</option>`).join("")}
      </select>
    </div>
    ${body}
  `;
}

function printSheetHTML(session) {
  if (!session) return "";
  const s = session;
  const modeLabel = s.mode ? (MODES.find(m => m.key === s.mode) ? MODES.find(m => m.key === s.mode).label : s.mode) : "";
  // Zielscheibe für den Druck immer mit fester, papierfreundlicher Farbpalette rendern,
  // unabhängig vom aktuell aktiven Hell-/Dunkelmodus der App (sonst evtl. helle Linien auf Weiß unsichtbar).
  const savedColors = COLORS;
  COLORS = { bg: "#ffffff", card: "#ffffff", cardBorder: "#333333", cream: "#111111", muted: "#555555", brass: "#8a6b27", brassDark: "#5e4b1b", steel: "#3e5c68", steelDark: "#2b4249", green: "#5c7a42", red: "#b03f30", clay: "#8c4c2b" };
  const targetHtmlRaw = targetSVG(s.shots, s.distance, { size: 220, discipline: s.discipline });
  // Für den Druck feste mm-Maße statt der responsiven aspect-ratio-Regel erzwingen (Safari respektiert
  // aspect-ratio beim Drucken unzuverlässig, was zu einer verzerrten, nicht-quadratischen Scheibe führte).
  const targetHtml = targetHtmlRaw.replace(
    /<svg viewBox="0 0 100 100"[^>]*style="[^"]*"/,
    `<svg viewBox="0 0 100 100" width="80mm" height="80mm" style="display:block;margin:0 auto;"`
  );
  COLORS = savedColors;
  return `
    <div style="border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px;">
      <div style="font-size:11px;letter-spacing:2px;color:#555;">SCHIESSSTAND-PROTOKOLL</div>
      <div style="font-size:26px;font-weight:700;">Ergebniszettel</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
      <tr><td style="padding:4px 0;color:#555;width:40%;">Datum</td><td class="ps-mono" style="padding:4px 0;font-weight:600;">${formatDate(s.date)}</td></tr>
      <tr><td style="padding:4px 0;color:#555;">Schießplatz</td><td style="padding:4px 0;font-weight:600;">${s.range || "–"}</td></tr>
      <tr><td style="padding:4px 0;color:#555;">Distanz</td><td class="ps-mono" style="padding:4px 0;font-weight:600;">${s.distance} m${s.distance===25?" · "+(s.discipline==="duell"?"Duell":"Präzision"):""}</td></tr>
      <tr><td style="padding:4px 0;color:#555;">Waffe</td><td style="padding:4px 0;font-weight:600;">${s.weapon || "–"} (${s.caliber || "–"})</td></tr>
      <tr><td style="padding:4px 0;color:#555;">Modus</td><td style="padding:4px 0;font-weight:600;">${modeLabel}</td></tr>
      ${s.lotNumber ? `<tr><td style="padding:4px 0;color:#555;">Losnummer</td><td class="ps-mono" style="padding:4px 0;font-weight:600;">${s.lotNumber}</td></tr>` : ""}
      ${s.ammoName ? `<tr><td style="padding:4px 0;color:#555;">Munition</td><td style="padding:4px 0;font-weight:600;">${s.ammoName}</td></tr>` : ""}
      ${s.weather ? `<tr><td style="padding:4px 0;color:#555;">Wetter</td><td style="padding:4px 0;">${Math.round(s.weather.temperature)}°C, ${s.weather.windSpeed.toFixed(1)} m/s ${degToCompass(s.weather.windDirection)}, ${Math.round(s.weather.pressure)} hPa</td></tr>` : ""}
    </table>
    <div style="font-size:12px;color:#555;margin-bottom:6px;">RINGWERTE</div>
    <div class="ps-mono" style="font-size:16px;letter-spacing:2px;margin-bottom:16px;border:1px solid #999;padding:10px;">${s.shots.map(shotRing).join("  ")}</div>
    <table style="width:100%;border-collapse:collapse;font-size:16px;margin-bottom:16px;">
      <tr><td style="padding:6px 0;color:#555;">Ringsumme</td><td class="ps-mono" style="padding:6px 0;font-weight:700;font-size:22px;text-align:right;">${s.sum}</td></tr>
      <tr><td style="padding:6px 0;color:#555;">Schnitt</td><td class="ps-mono" style="padding:6px 0;font-weight:700;font-size:22px;text-align:right;">${s.avg.toFixed(2)}</td></tr>
    </table>
    ${s.notes ? `<div style="margin-bottom:16px;"><div style="font-size:12px;color:#555;margin-bottom:4px;">NOTIZ</div><div style="font-size:13px;">${s.notes}</div></div>` : ""}
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:12px;color:#555;margin-bottom:8px;">TREFFERBILD</div>
      <div style="display:inline-block;">${targetHtml}</div>
    </div>
    <div style="margin-top:40px;display:flex;gap:40px;">
      <div style="flex:1;border-top:1px solid #111;padding-top:6px;font-size:11px;color:#555;">Unterschrift Schütze</div>
      <div style="flex:1;border-top:1px solid #111;padding-top:6px;font-size:11px;color:#555;">Unterschrift Aufsicht</div>
    </div>
  `;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="margin-bottom:18px;">
      <div class="mono" style="font-size:11px;letter-spacing:2px;color:${COLORS.muted};margin-bottom:2px;">SCHIESSSTAND-PROTOKOLL</div>
      <div style="font-size:30px;font-weight:600;line-height:1.05;">Trefferstatistik</div>
    </div>
    <div class="tabbar" style="display:flex;gap:8px;margin-bottom:20px;">
      <div class="btn-tab" data-action="set-view" data-value="new" style="flex:1;text-align:center;padding:10px 0;font-size:15px;font-weight:600;border-radius:2px;background:${state.view==='new'?COLORS.cream:'transparent'};color:${state.view==='new'?COLORS.bg:COLORS.muted};border:1px solid ${state.view==='new'?COLORS.cream:COLORS.cardBorder};">Neue Serie</div>
      <div class="btn-tab" data-action="set-view" data-value="stats" style="flex:1;text-align:center;padding:10px 0;font-size:15px;font-weight:600;border-radius:2px;background:${state.view==='stats'?COLORS.cream:'transparent'};color:${state.view==='stats'?COLORS.bg:COLORS.muted};border:1px solid ${state.view==='stats'?COLORS.cream:COLORS.cardBorder};">Statistik</div>
      <div class="btn-tab" data-action="set-view" data-value="ballistics" style="flex:1;text-align:center;padding:10px 0;font-size:15px;font-weight:600;border-radius:2px;background:${state.view==='ballistics'?COLORS.cream:'transparent'};color:${state.view==='ballistics'?COLORS.bg:COLORS.muted};border:1px solid ${state.view==='ballistics'?COLORS.cream:COLORS.cardBorder};">Ballistik</div>
    </div>
    <div id="view-body">${state.view === "new" ? renderNewView() : state.view === "stats" ? renderStatsView() : renderBallisticsView()}</div>
    <div id="print-sheet">${state.printSessionId ? printSheetHTML(state.sessions.find(s => s.id === state.printSessionId)) : ""}</div>
  `;
  attachListeners();
}

function attachListeners() {
  const rangeInput = document.getElementById("range-input");
  if (rangeInput) {
    rangeInput.addEventListener("change", (e) => {
      const val = e.target.value.trim();
      if (val && val !== state.range) {
        state.range = val;
        try { localStorage.setItem(RANGE_KEY, val); } catch (err) {}
        fetchWeather(val);
      }
    });
  }
  const noteInput = document.getElementById("note-input");
  if (noteInput) noteInput.addEventListener("change", (e) => { state.noteText = e.target.value; });
  const dsbInput = document.getElementById("dsb-number-input");
  if (dsbInput) {
    dsbInput.addEventListener("change", (e) => {
      const num = e.target.value.trim();
      if (!num) return;
      const found = DSB_DISCIPLINES[num];
      if (found) {
        state.competitionPreset = { key: "dsb-" + num, name: found.name, shots: found.shots, distance: found.distance, discipline: found.discipline };
        state.distance = found.distance;
        if (found.discipline) state.discipline = found.discipline;
        state.dsbLookupError = null;
      } else {
        state.dsbLookupError = `„${num}" ist nicht in der hinterlegten Liste bestätigter Nummern. Bitte manuell über die Buttons oben wählen oder Distanz/Disziplin direkt einstellen.`;
      }
      render();
    });
  }
  const lotInput = document.getElementById("lot-input");
  if (lotInput) lotInput.addEventListener("change", (e) => { state.lotNumber = e.target.value; });
  const seriesAmmoSelect = document.getElementById("series-ammo-select");
  if (seriesAmmoSelect) seriesAmmoSelect.addEventListener("change", (e) => { state.ammoName = e.target.value; });
  const dsbSelect = document.getElementById("dsb-discipline-select");
  if (dsbSelect) {
    dsbSelect.addEventListener("change", (e) => {
      const num = e.target.value;
      if (!num) return;
      const d = DSB_DISCIPLINES[num];
      if (d) {
        state.competitionPreset = { key: "dsb-" + num, name: d.name, shots: d.shots, distance: d.distance, discipline: d.discipline };
        state.distance = d.distance;
        if (d.discipline) state.discipline = d.discipline;
        state.shots = [];
        state.editingId = null;
      }
      render();
    });
  }
  const statsWeaponFilter = document.getElementById("stats-weapon-filter");
  if (statsWeaponFilter) statsWeaponFilter.addEventListener("change", (e) => { state.statsWeaponFilter = e.target.value; render(); });
  const statsCaliberFilter = document.getElementById("stats-caliber-filter");
  if (statsCaliberFilter) statsCaliberFilter.addEventListener("change", (e) => { state.statsCaliberFilter = e.target.value; render(); });
  const importInput = document.getElementById("import-file-input");
  if (importInput) {
    importInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importDataFromFile(file, state.pendingImportMode);
      e.target.value = "";
    });
  }
  const bindBallisticInput = (id, stateKey, parser) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", (e) => {
        const parsed = parser(e.target.value.replace(",", "."));
        if (!isNaN(parsed)) { state[stateKey] = parsed; render(); }
      });
    }
  };
  bindBallisticInput("ballistic-v0", "ballisticV0", parseFloat);
  bindBallisticInput("ballistic-bc", "ballisticBC", parseFloat);
  bindBallisticInput("ballistic-sightheight", "ballisticSightHeight", parseFloat);
  bindBallisticInput("ballistic-zero", "ballisticZero", parseFloat);
  bindBallisticInput("ballistic-maxdist", "ballisticMaxDist", parseFloat);
  bindBallisticInput("ballistic-windspeed", "ballisticWindSpeed", parseFloat);
  bindBallisticInput("ballistic-windclock", "ballisticWindClock", parseFloat);
  bindBallisticInput("ballistic-vt0", "ballisticVT0", parseFloat);
  bindBallisticInput("ballistic-vt100", "ballisticVT100", parseFloat);
  bindBallisticInput("ballistic-vt200", "ballisticVT200", parseFloat);
  bindBallisticInput("ballistic-vt300", "ballisticVT300", parseFloat);
  bindBallisticInput("ballistic-target-dist-custom", "ballisticTargetDist", parseFloat);
  document.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = el.getAttribute("data-action");
      const value = el.getAttribute("data-value");
      if (el.hasAttribute("disabled")) return;
      switch (action) {
        case "set-view": state.view = value; state.saveError = ""; render(); break;
        case "set-distance": state.distance = Number(value); render(); break;
        case "set-weapon": {
          state.weapon = value;
          const w = WEAPONS.find(w => w.name === value);
          if (w) state.caliber = w.caliber;
          render();
          break;
        }
        case "set-caliber": state.caliber = value; render(); break;
        case "set-mode": state.mode = value; render(); break;
        case "clear-competition-preset": state.competitionPreset = null; state.dsbLookupError = null; render(); break;
        case "set-dsb-discipline": {
          const d = DSB_DISCIPLINES[value];
          if (d) {
            state.competitionPreset = { key: "dsb-" + value, name: d.name, shots: d.shots, distance: d.distance, discipline: d.discipline };
            state.distance = d.distance;
            if (d.discipline) state.discipline = d.discipline;
            state.shots = [];
            state.editingId = null;
          }
          render();
          break;
        }
        case "set-discipline": {
          if (value !== state.discipline) {
            state.discipline = value;
            if (state.shots.length > 0) state.shots = [];
          }
          render();
          break;
        }
        case "set-filter": state.statsFilter = value; render(); break;
        case "set-mode-filter": state.statsModeFilter = value; render(); break;
        case "refresh-weather": fetchWeather(state.range); break;
        case "set-shooter-hand": {
          state.shooterHand = value;
          try { localStorage.setItem(HAND_KEY, value); } catch (err) {}
          render();
          break;
        }
        case "set-ballistic-ammo": {
          state.ballisticAmmo = value;
          resetBallisticOverrides();
          render();
          break;
        }
        case "toggle-ammo-edit-mode": {
          state.ammoEditMode = !state.ammoEditMode;
          state.addingAmmo = false;
          state.editingAmmoOriginalName = null;
          state.confirmDeleteAmmo = null;
          render();
          break;
        }
        case "start-add-ammo": state.addingAmmo = true; state.editingAmmoOriginalName = null; state.newAmmoCaliber = CALIBERS[0]; render(); break;
        case "cancel-add-ammo": state.addingAmmo = false; state.editingAmmoOriginalName = null; state.confirmDeleteAmmo = null; render(); break;
        case "set-new-ammo-caliber": state.newAmmoCaliber = value; render(); break;
        case "start-edit-ammo": {
          const a = AMMO.find(a => a.name === value);
          if (a) {
            state.addingAmmo = true;
            state.editingAmmoOriginalName = value;
            state.newAmmoCaliber = a.caliber;
            state.confirmDeleteAmmo = null;
          }
          render();
          break;
        }
        case "delete-ammo": state.confirmDeleteAmmo = value; render(); break;
        case "confirm-delete-ammo": removeAmmo(value); break;
        case "cancel-delete-ammo": state.confirmDeleteAmmo = null; render(); break;
        case "save-ammo": {
          const nameEl = document.getElementById("new-ammo-name");
          const v0El = document.getElementById("new-ammo-v0");
          const v100El = document.getElementById("new-ammo-v100");
          const v200El = document.getElementById("new-ammo-v200");
          const v300El = document.getElementById("new-ammo-v300");
          const shEl = document.getElementById("new-ammo-sightheight");
          const zeroEl = document.getElementById("new-ammo-zero");
          const tempSensEl = document.getElementById("new-ammo-tempsens");
          if (nameEl && v0El) {
            const cal = state.newAmmoCaliber || CALIBERS[0];
            if (state.editingAmmoOriginalName) {
              updateAmmo(state.editingAmmoOriginalName, nameEl.value, cal, v0El.value, v100El.value, v200El.value, v300El.value, shEl.value, zeroEl.value, 300, tempSensEl.value);
            } else {
              addAmmo(nameEl.value, cal, v0El.value, v100El.value, v200El.value, v300El.value, shEl.value, zeroEl.value, 300, tempSensEl.value);
            }
          }
          break;
        }
        case "reset-ballistic-params": {
          resetBallisticOverrides();
          render();
          break;
        }
        case "set-reticle-type": state.reticleType = value; render(); break;
        case "toggle-ballistic-weather": state.ballisticUseWeather = state.ballisticUseWeather === false ? true : false; render(); break;
        case "set-ballistic-target-dist": state.ballisticTargetDist = Number(value); render(); break;
        case "add-shot": addShot(Number(value)); break;
        case "remove-shot-at": removeShotAt(Number(value)); break;
        case "undo-shot": undoShot(); break;
        case "clear-shots": clearShots(); break;
        case "save-series": saveSeries(); break;
        case "delete-session": state.confirmDeleteSessionId = value; render(); break;
        case "confirm-delete-session": deleteSession(value); break;
        case "cancel-delete-session": state.confirmDeleteSessionId = null; render(); break;
        case "edit-session": editSession(value); break;
        case "print-session": {
          state.printSessionId = value;
          render();
          setTimeout(() => { window.print(); }, 50);
          break;
        }
        case "cancel-edit": state.editingId = null; state.shots = []; render(); break;
        case "toggle-target": state.expandedSessionId = state.expandedSessionId === value ? null : value; render(); break;
        case "toggle-weapon-edit-mode": {
          state.weaponEditMode = !state.weaponEditMode;
          state.addingWeapon = false;
          state.editingWeaponOriginalName = null;
          state.confirmDeleteWeapon = null;
          render();
          break;
        }
        case "start-add-weapon": state.addingWeapon = true; state.editingWeaponOriginalName = null; state.newWeaponCategory = "repetierbuechse"; render(); break;
        case "cancel-add-weapon": state.addingWeapon = false; state.editingWeaponOriginalName = null; state.confirmDeleteWeapon = null; render(); break;
        case "set-new-weapon-category": state.newWeaponCategory = value; render(); break;
        case "start-edit-weapon": {
          const w = WEAPONS.find(w => w.name === value);
          if (w) {
            state.addingWeapon = true;
            state.editingWeaponOriginalName = value;
            state.newWeaponCategory = weaponCategory(w);
            state.confirmDeleteWeapon = null;
          }
          render();
          break;
        }
        case "delete-weapon": state.confirmDeleteWeapon = value; render(); break;
        case "mark-weapon-cleaned": markWeaponCleaned(value); break;
        case "confirm-delete-weapon": removeCustomWeapon(value); break;
        case "cancel-delete-weapon": state.confirmDeleteWeapon = null; render(); break;
        case "save-weapon": {
          const nameEl = document.getElementById("new-weapon-name");
          const calEl = document.getElementById("new-weapon-caliber");
          if (nameEl && calEl) {
            if (state.editingWeaponOriginalName) {
              updateCustomWeapon(state.editingWeaponOriginalName, nameEl.value, calEl.value, state.newWeaponCategory);
            } else {
              addCustomWeapon(nameEl.value, calEl.value, state.newWeaponCategory);
            }
          }
          break;
        }
        case "start-add-caliber": state.addingCaliber = true; render(); break;
        case "cancel-add-caliber": state.addingCaliber = false; render(); break;
        case "save-caliber": {
          const calEl = document.getElementById("new-caliber-name");
          if (calEl) addCustomCaliber(calEl.value, false);
          break;
        }
        case "export-json": {
          if (value === "daily" && state.selectedExportDays.length === 0) { state.saveError = "Bitte mindestens einen Tag auswählen."; render(); break; }
          exportJSON(value);
          break;
        }
        case "export-csv": {
          if (value === "daily" && state.selectedExportDays.length === 0) { state.saveError = "Bitte mindestens einen Tag auswählen."; render(); break; }
          exportCSV(value);
          break;
        }
        case "start-export-daily": {
          state.selectedExportDays = computeDailyStats(state.sessions).map(d => d.date);
          state.showDayExportPicker = true;
          render();
          break;
        }
        case "cancel-export-daily": state.showDayExportPicker = false; render(); break;
        case "select-all-export-days": state.selectedExportDays = computeDailyStats(state.sessions).map(d => d.date); render(); break;
        case "select-none-export-days": state.selectedExportDays = []; render(); break;
        case "toggle-export-day": {
          const idx = state.selectedExportDays.indexOf(value);
          if (idx === -1) state.selectedExportDays.push(value);
          else state.selectedExportDays.splice(idx, 1);
          render();
          break;
        }
        case "trigger-import": { state.pendingImportMode = "merge"; const inp = document.getElementById("import-file-input"); if (inp) inp.click(); break; }
        case "trigger-import-replace": state.confirmReplaceImport = true; render(); break;
        case "cancel-replace-import": state.confirmReplaceImport = false; render(); break;
        case "confirm-replace-import": {
          state.confirmReplaceImport = false;
          state.pendingImportMode = "replace";
          const inp = document.getElementById("import-file-input");
          if (inp) inp.click();
          render();
          break;
        }
        case "target-tap": {
          const rect = el.getBoundingClientRect();
          const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
          const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
          const x = ((clientX - rect.left) / rect.width) * 100;
          const y = ((clientY - rect.top) / rect.height) * 100;
          addShotAtPosition(x, y);
          break;
        }
      }
    });
  });
}

applyTheme();
loadSessions();
render();
fetchWeather(state.range);
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChange = () => { applyTheme(); render(); };
  if (mq.addEventListener) mq.addEventListener("change", onThemeChange);
  else if (mq.addListener) mq.addListener(onThemeChange);
}
window.addEventListener("afterprint", () => {
  if (state.printSessionId) { state.printSessionId = null; render(); }
});
