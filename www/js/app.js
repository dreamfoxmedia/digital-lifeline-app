/* ============ Veilige opslag ============ */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

/* ============ Element-verwijzingen ============ */
const el = {
  homeScreen:          document.getElementById("home-screen"),
  addPersonScreen:     document.getElementById("add-person-screen"),
  addFamilyScreen:     document.getElementById("add-family-screen"),
  personPreviewScreen: document.getElementById("person-preview-screen"),
  connectScreen:       document.getElementById("connect-screen"),
  dashboard:           document.getElementById("dashboard-screen"),
  personsList:         document.getElementById("persons-list"),
  addFamilyBtn:        document.getElementById("add-family-btn"),
  // Preview
  previewPhoto:             document.getElementById("preview-photo"),
  previewPhotoPlaceholder:  document.getElementById("preview-photo-placeholder"),
  previewNickname:          document.getElementById("preview-nickname"),
  previewDisplayNameRow:    document.getElementById("preview-display-name-row"),
  previewDisplayName:       document.getElementById("preview-display-name"),
  previewBirthdateRow:      document.getElementById("preview-birthdate-row"),
  previewBirthdate:         document.getElementById("preview-birthdate"),
  previewAddressRow:        document.getElementById("preview-address-row"),
  previewAddress:           document.getElementById("preview-address"),
  previewPhoneRow:          document.getElementById("preview-phone-row"),
  previewPhone:             document.getElementById("preview-phone"),
  previewEmailRow:          document.getElementById("preview-email-row"),
  previewEmail:             document.getElementById("preview-email"),
  previewTypeRow:           document.getElementById("preview-type-row"),
  previewType:              document.getElementById("preview-type"),
  previewMedicationRow:     document.getElementById("preview-medication-row"),
  previewMedication:        document.getElementById("preview-medication"),
  previewGenderRow:         document.getElementById("preview-gender-row"),
  previewGender:            document.getElementById("preview-gender"),
  previewRelationRow:       document.getElementById("preview-relation-row"),
  previewRelation:          document.getElementById("preview-relation"),
  previewNotificationsRow:  document.getElementById("preview-notifications-row"),
  previewNotifications:     document.getElementById("preview-notifications"),
  previewDoneBtn:           document.getElementById("preview-done-btn"),
  // Bewaakt persoon form
  addPersonBackBtn:    document.getElementById("add-person-back-btn"),
  personPhoto:         document.getElementById("person-photo"),
  personPhotoPreview:  document.getElementById("person-photo-preview"),
  photoIcon:           document.querySelector(".photo-icon"),
  personFirstname:     document.getElementById("person-firstname"),
  personLastname:      document.getElementById("person-lastname"),
  personBirthdate:     document.getElementById("person-birthdate"),
  personStreet:        document.getElementById("person-street"),
  personHousenumber:   document.getElementById("person-housenumber"),
  personZipcode:       document.getElementById("person-zipcode"),
  personCity:          document.getElementById("person-city"),
  personPhone:         document.getElementById("person-phone"),
  personEmail:         document.getElementById("person-email"),
  personMedication:    document.getElementById("person-medication"),
  savePersonBtn:       document.getElementById("save-person-btn"),
  personStatus:        document.getElementById("person-status"),
  // Familielid form
  addFamilyBackBtn:       document.getElementById("add-family-back-btn"),
  familyGender:           document.getElementById("family-gender"),
  familyFirstname:        document.getElementById("family-firstname"),
  familyLastname:         document.getElementById("family-lastname"),
  familyEmail:            document.getElementById("family-email"),
  familyPhone:            document.getElementById("family-phone"),
  familyRelation:         document.getElementById("family-relation"),
  familyNotifySystem:     document.getElementById("family-notify-system"),
  familyNotifyCritical:   document.getElementById("family-notify-critical"),
  familyChannelSms:       document.getElementById("family-channel-sms"),
  familyChannelEmail:     document.getElementById("family-channel-email"),
  familyChannelWhatsapp:  document.getElementById("family-channel-whatsapp"),
  saveFamilyBtn:          document.getElementById("save-family-btn"),
  familyStatus:           document.getElementById("family-status"),
  // Connect
  url:           document.getElementById("ha-url"),
  token:         document.getElementById("ha-token"),
  connectBtn:    document.getElementById("connect-btn"),
  status:        document.getElementById("connect-status"),
  entities:      document.getElementById("entities"),
  search:        document.getElementById("search"),
  emptyNote:     document.getElementById("empty-note"),
  connPill:      document.getElementById("conn-pill"),
  disconnectBtn: document.getElementById("disconnect-btn"),
  addPersonBtn:  document.getElementById("add-person-btn"),
};

let client = null;
let states = new Map();

/* ============ Labels ============ */
const RELATION_LABELS = {
  partner: "Partner", kind: "Kind", ouder: "Ouder",
  broer_zus: "Broer / Zus", vriend: "Vriend / Vriendin",
  buurman: "Buurman / Buurvrouw", mantelzorger: "Mantelzorger", anders: "Anders",
};
const GENDER_LABELS = { man: "Man", vrouw: "Vrouw", niet_zeggen: "Niet zeggen" };
const TYPE_LABELS   = { monitored: "Bewaakt persoon", family: "Familielid", caregiver: "Hulpverlener" };
const TYPE_ICONS    = { monitored: "🫀", family: "👨‍👩‍👧", caregiver: "🏥" };

/* ============ Domein-instellingen (dashboard) ============ */
const TOGGLEABLE = new Set(["light", "switch", "fan", "input_boolean", "automation", "script", "media_player"]);
const ICONS = {
  light: "💡", switch: "🔌", fan: "🌀", lock: "🔒", climate: "🌡️",
  sensor: "📊", binary_sensor: "📡", cover: "🪟", media_player: "🔊",
  input_boolean: "🎚️", automation: "⚙️", script: "📜", person: "👤",
  camera: "📷", vacuum: "🤖", scene: "🎬", weather: "⛅",
};
const ON_STATES = new Set(["on", "open", "home", "playing", "unlocked"]);
const domainOf    = (id) => id.split(".")[0];
const iconFor     = (id) => ICONS[domainOf(id)] || "▫️";
const isOn        = (s)  => ON_STATES.has(s.state);
const friendlyName = (s) => s.attributes?.friendly_name || s.entity_id;

/* ============ Verbinden ============ */
async function doConnect(url, token, opts = {}) {
  const statusEl  = opts.statusEl  || el.status;
  const btnEl     = opts.btnEl     || el.connectBtn;
  const onSuccess = opts.onSuccess || null;
  const onFailure = opts.onFailure || null;

  statusEl.textContent = "Verbinden…";
  statusEl.className = "status";
  btnEl.disabled = true;

  client = new HAClient(url, token);
  client.onStateChanged = (s) => { states.set(s.entity_id, s); updateCard(s); };
  client.onClose = () => {
    el.connPill.textContent = "verbroken";
    el.connPill.classList.add("off");
  };

  try {
    await client.connect();
    const all = await client.getStates();
    states = new Map(all.map((s) => [s.entity_id, s]));
    await client.subscribeStateChanges();

    store.set("ha_url", url);
    store.set("ha_token", token);

    syncPersonsFromHA(states);
    renderDashboard();

    if (onSuccess) {
      onSuccess();
    } else {
      el.connectScreen.classList.add("hidden");
      el.homeScreen.classList.remove("hidden");
    }
  } catch (e) {
    statusEl.textContent = e.message;
    statusEl.className = "status err";
    client = null;
    if (onFailure) onFailure();
  } finally {
    btnEl.disabled = false;
  }
}

/* ============ Personen synchroniseren vanuit HA ============ */
function syncPersonsFromHA(statesMap) {
  const synced = [];
  for (const [entityId, state] of statesMap) {
    if (!entityId.startsWith("sensor.dl_")) continue;
    const a = state.attributes || {};
    if (!a.id) continue;
    synced.push({
      id:                  a.id,
      personType:          a.person_type || "monitored",
      firstName:           a.first_name  || "",
      lastName:            a.last_name   || "",
      nickname:            a.nickname    || "",
      displayName:         a.display_name || "",
      birthdate:           a.birthdate   || "",
      street:              a.street      || "",
      housenumber:         a.housenumber || "",
      zipcode:             a.zipcode     || "",
      city:                a.city        || "",
      phone:               a.phone       || "",
      email:               a.email       || "",
      medication:          a.medication  || "",
      gender:              a.gender      || "",
      relation:            a.relation    || "",
      notificationTypes:   a.notification_types    || [],
      notificationChannels: a.notification_channels || [],
    });
  }
  if (synced.length > 0) {
    store.set("dl_persons", JSON.stringify(synced));
  }
}

/* ============ Navigatie ============ */
function showHome() {
  el.homeScreen.classList.remove("hidden");
  el.addPersonScreen.classList.add("hidden");
  el.addFamilyScreen.classList.add("hidden");
  el.personPreviewScreen.classList.add("hidden");
  el.connectScreen.classList.add("hidden");
  el.dashboard.classList.add("hidden");

  const persons = JSON.parse(store.get("dl_persons") || "[]");
  const hasMonitored = persons.some(p => p.personType === "monitored");
  el.addFamilyBtn.classList.toggle("hidden", !hasMonitored);
  renderPersonsList(persons);
}

function showAddPerson() {
  el.homeScreen.classList.add("hidden");
  el.addPersonScreen.classList.remove("hidden");
  el.addFamilyScreen.classList.add("hidden");
  el.connectScreen.classList.add("hidden");
  el.dashboard.classList.add("hidden");
}

function showAddFamily() {
  el.homeScreen.classList.add("hidden");
  el.addPersonScreen.classList.add("hidden");
  el.addFamilyScreen.classList.remove("hidden");
  el.connectScreen.classList.add("hidden");
  el.dashboard.classList.add("hidden");
}

function showConnect() {
  el.homeScreen.classList.add("hidden");
  el.addPersonScreen.classList.add("hidden");
  el.addFamilyScreen.classList.add("hidden");
  el.connectScreen.classList.remove("hidden");
  el.dashboard.classList.add("hidden");
}

function disconnect() {
  if (client) client.disconnect();
  client = null;
  el.dashboard.classList.add("hidden");
  el.connPill.textContent = "verbonden";
  el.connPill.classList.remove("off");
  el.status.textContent = "";
  el.status.className = "status";
  showHome();
}

/* ============ Personenlijst op home screen ============ */
function renderPersonsList(persons) {
  el.personsList.innerHTML = "";
  if (!persons.length) return;

  for (const p of persons) {
    const name = [p.firstName, p.lastName].filter(Boolean).join(" ")
              || p.displayName || p.nickname || "Onbekend";
    const item = document.createElement("div");
    item.className = "person-item";
    item.innerHTML = `
      <span class="person-item-icon">${TYPE_ICONS[p.personType] || "👤"}</span>
      <div class="person-item-info">
        <div class="person-item-name">${escapeHtml(name)}</div>
        <div class="person-item-type">${TYPE_LABELS[p.personType] || p.personType}</div>
      </div>
      <button class="person-item-delete" title="Verwijderen" data-id="${escapeHtml(String(p.id))}">🗑</button>
    `;
    item.querySelector(".person-item-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePerson(p.id);
    });
    el.personsList.appendChild(item);
  }
}

function deletePerson(id) {
  const persons = JSON.parse(store.get("dl_persons") || "[]");
  const updated = persons.filter(p => String(p.id) !== String(id));
  store.set("dl_persons", JSON.stringify(updated));

  if (client) {
    client.callServiceData("digital_lifeline", "remove_person", { person_id: String(id) })
      .catch((e) => console.warn("Digital Lifeline remove_person:", e.message));
  }
  showHome();
}

/* ============ Preview ============ */
function setInfoRow(row, valueEl, value) {
  if (value) { valueEl.textContent = value; row.classList.remove("hidden"); }
  else        { row.classList.add("hidden"); }
}

function showPersonPreview(person) {
  if (person.photo) {
    el.previewPhoto.src = person.photo;
    el.previewPhoto.classList.remove("hidden");
    el.previewPhotoPlaceholder.classList.add("hidden");
  } else {
    el.previewPhoto.classList.add("hidden");
    el.previewPhotoPlaceholder.classList.remove("hidden");
  }

  const fullName = [person.firstName, person.lastName].filter(Boolean).join(" ")
                || person.displayName || person.nickname || "Onbekend";
  el.previewNickname.textContent = fullName;

  // Altijd: telefoon en email
  setInfoRow(el.previewPhoneRow, el.previewPhone, person.phone);
  setInfoRow(el.previewEmailRow, el.previewEmail, person.email);

  // Bewaakt persoon
  if (person.personType === "monitored") {
    setInfoRow(el.previewBirthdateRow, el.previewBirthdate, person.birthdate);
    const line1 = [person.street, person.housenumber].filter(Boolean).join(" ");
    const line2 = [person.zipcode, person.city].filter(Boolean).join(" ");
    const addr  = [line1, line2].filter(Boolean).join("\n");
    setInfoRow(el.previewAddressRow,    el.previewAddress,    addr);
    setInfoRow(el.previewMedicationRow, el.previewMedication, person.medication);
    el.previewDisplayNameRow.classList.add("hidden");
    el.previewTypeRow.classList.add("hidden");
    el.previewGenderRow.classList.add("hidden");
    el.previewRelationRow.classList.add("hidden");
    el.previewNotificationsRow.classList.add("hidden");
  } else {
    // Familielid
    el.previewBirthdateRow.classList.add("hidden");
    el.previewAddressRow.classList.add("hidden");
    el.previewMedicationRow.classList.add("hidden");
    el.previewDisplayNameRow.classList.add("hidden");
    el.previewTypeRow.classList.add("hidden");

    setInfoRow(el.previewGenderRow,   el.previewGender,   GENDER_LABELS[person.gender] || person.gender);
    setInfoRow(el.previewRelationRow, el.previewRelation, RELATION_LABELS[person.relation] || person.relation);

    const types    = (person.notificationTypes    || []).map(t => t === "system" ? "Systeemmeldingen" : "Kritieke meldingen");
    const channels = (person.notificationChannels || []).map(c => ({ sms: "SMS", email: "E-mail", whatsapp: "WhatsApp" }[c] || c));
    let notifText = types.join(", ");
    if (channels.length) notifText += (notifText ? "\nVia: " : "Via: ") + channels.join(", ");
    setInfoRow(el.previewNotificationsRow, el.previewNotifications, notifText);
  }

  el.homeScreen.classList.add("hidden");
  el.addPersonScreen.classList.add("hidden");
  el.addFamilyScreen.classList.add("hidden");
  el.connectScreen.classList.add("hidden");
  el.dashboard.classList.add("hidden");
  el.personPreviewScreen.classList.remove("hidden");
}

/* ============ Dashboard renderen ============ */
function renderDashboard() {
  const q = el.search.value.trim().toLowerCase();
  const groups = {};

  for (const s of states.values()) {
    const d = domainOf(s.entity_id);
    if (["sun", "zone", "persistent_notification"].includes(d)) continue;
    if (q && !friendlyName(s).toLowerCase().includes(q) && !s.entity_id.includes(q)) continue;
    (groups[d] ||= []).push(s);
  }

  const domainNames = Object.keys(groups).sort();
  el.entities.innerHTML = "";
  el.emptyNote.classList.toggle("hidden", domainNames.length > 0);

  for (const d of domainNames) {
    const wrap  = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "group-title";
    title.textContent = `${d} (${groups[d].length})`;
    wrap.appendChild(title);

    const cards = document.createElement("div");
    cards.className = "cards";
    groups[d]
      .sort((a, b) => friendlyName(a).localeCompare(friendlyName(b)))
      .forEach((s) => cards.appendChild(buildCard(s)));
    wrap.appendChild(cards);
    el.entities.appendChild(wrap);
  }
}

function buildCard(s) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = s.entity_id;

  if (TOGGLEABLE.has(domainOf(s.entity_id))) {
    card.classList.add("toggleable");
    card.addEventListener("click", () => toggleEntity(s.entity_id));
  }

  card.innerHTML = `
    <div class="card-top">
      <span class="card-icon">${iconFor(s.entity_id)}</span>
      <span class="dot-state"></span>
    </div>
    <div>
      <div class="card-name">${escapeHtml(friendlyName(s))}</div>
      <div class="card-state"></div>
    </div>`;
  paintCard(card, s);
  return card;
}

function paintCard(card, s) {
  card.classList.toggle("is-on", isOn(s));
  const unit = s.attributes?.unit_of_measurement;
  card.querySelector(".card-state").textContent = unit ? `${s.state} ${unit}` : s.state;
}

function updateCard(s) {
  const card = el.entities.querySelector(`[data-id="${cssEscape(s.entity_id)}"]`);
  if (card) paintCard(card, s);
}

async function toggleEntity(id) {
  const d   = domainOf(id);
  const cur = states.get(id);
  const svc = isOn(cur) ? "turn_off" : "turn_on";
  try {
    await client.callService(d, "toggle", id);
  } catch {
    try { await client.callService(d, svc, id); } catch (e) { console.warn(e); }
  }
}

/* ============ Helpers ============ */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function cssEscape(str) {
  return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/["\\]/g, "\\$&");
}

/* ============ Events: verbinding ============ */
el.connectBtn.addEventListener("click", () => {
  const url   = el.url.value.trim();
  const token = el.token.value.trim();
  if (!url || !token) {
    el.status.textContent = "Vul zowel URL als token in.";
    el.status.className = "status err";
    return;
  }
  doConnect(url, token);
});
[el.url, el.token].forEach((i) =>
  i.addEventListener("keydown", (e) => { if (e.key === "Enter") el.connectBtn.click(); })
);
el.disconnectBtn.addEventListener("click", disconnect);
el.search.addEventListener("input", renderDashboard);

/* ============ Events: navigatie ============ */
el.addPersonBtn.addEventListener("click", showAddPerson);
el.addFamilyBtn.addEventListener("click", showAddFamily);
el.addPersonBackBtn.addEventListener("click", showHome);
el.addFamilyBackBtn.addEventListener("click", showHome);
el.previewDoneBtn.addEventListener("click", showHome);

/* ============ Events: foto upload ============ */
el.personPhoto.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    el.personPhotoPreview.src = ev.target.result;
    el.personPhotoPreview.classList.remove("hidden");
    el.photoIcon.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

/* ============ Events: bewaakt persoon opslaan ============ */
el.savePersonBtn.addEventListener("click", () => {
  const firstName = el.personFirstname.value.trim();
  if (!firstName) {
    el.personStatus.textContent = "Vul minimaal een voornaam in.";
    el.personStatus.className = "status err";
    el.personFirstname.focus();
    return;
  }

  const person = {
    id:          Date.now(),
    personType:  "monitored",
    firstName,
    lastName:    el.personLastname.value.trim(),
    birthdate:   el.personBirthdate.value,
    street:      el.personStreet.value.trim(),
    housenumber: el.personHousenumber.value.trim(),
    zipcode:     el.personZipcode.value.trim(),
    city:        el.personCity.value.trim(),
    phone:       el.personPhone.value.trim(),
    email:       el.personEmail.value.trim(),
    medication:  el.personMedication.value.trim(),
    photo:       !el.personPhotoPreview.classList.contains("hidden") ? el.personPhotoPreview.src : null,
  };

  const persons = JSON.parse(store.get("dl_persons") || "[]");
  persons.push(person);
  store.set("dl_persons", JSON.stringify(persons));

  if (client) {
    client.callServiceData("digital_lifeline", "add_person", {
      first_name:  person.firstName,
      last_name:   person.lastName,
      birthdate:   person.birthdate,
      street:      person.street,
      housenumber: person.housenumber,
      zipcode:     person.zipcode,
      city:        person.city,
      phone:       person.phone,
      email:       person.email,
      medication:  person.medication,
      person_type: "monitored",
    }).catch((e) => console.warn("Digital Lifeline add_person:", e.message));
  }

  el.personStatus.textContent = "";
  showPersonPreview(person);
});

/* ============ Events: familielid opslaan ============ */
el.saveFamilyBtn.addEventListener("click", () => {
  const firstName = el.familyFirstname.value.trim();
  if (!firstName) {
    el.familyStatus.textContent = "Vul minimaal een voornaam in.";
    el.familyStatus.className = "status err";
    el.familyFirstname.focus();
    return;
  }

  const notificationTypes    = [];
  const notificationChannels = [];
  if (el.familyNotifySystem.checked)   notificationTypes.push("system");
  if (el.familyNotifyCritical.checked) notificationTypes.push("critical");
  if (el.familyChannelSms.checked)     notificationChannels.push("sms");
  if (el.familyChannelEmail.checked)   notificationChannels.push("email");
  if (el.familyChannelWhatsapp.checked) notificationChannels.push("whatsapp");

  const person = {
    id:                   Date.now(),
    personType:           "family",
    gender:               el.familyGender.value,
    firstName,
    lastName:             el.familyLastname.value.trim(),
    email:                el.familyEmail.value.trim(),
    phone:                el.familyPhone.value.trim(),
    relation:             el.familyRelation.value,
    notificationTypes,
    notificationChannels,
  };

  const persons = JSON.parse(store.get("dl_persons") || "[]");
  persons.push(person);
  store.set("dl_persons", JSON.stringify(persons));

  if (client) {
    client.callServiceData("digital_lifeline", "add_person", {
      first_name:            person.firstName,
      last_name:             person.lastName,
      gender:                person.gender,
      email:                 person.email,
      phone:                 person.phone,
      relation:              person.relation,
      notification_types:    notificationTypes,
      notification_channels: notificationChannels,
      person_type:           "family",
    }).catch((e) => console.warn("Digital Lifeline add_person:", e.message));
  }

  el.familyStatus.textContent = "";
  showPersonPreview(person);
});

/* ============ Splash screen ============ */
const splash = document.getElementById("splash");
if (splash) {
  splash.addEventListener("animationend", () => splash.remove(), { once: true });
}

/* ============ Opstarten ============ */
window.addEventListener("DOMContentLoaded", () => {
  const url   = store.get("ha_url");
  const token = store.get("ha_token");
  if (url) el.url.value = url;
  if (url && token) {
    el.token.value = token;
    el.connectScreen.classList.add("hidden");
    el.homeScreen.classList.remove("hidden");
    // Toon lokale personen direct, sync daarna via HA
    const local = JSON.parse(store.get("dl_persons") || "[]");
    const hasMonitored = local.some(p => p.personType === "monitored");
    el.addFamilyBtn.classList.toggle("hidden", !hasMonitored);
    renderPersonsList(local);
    doConnect(url, token, {
      onSuccess: () => {},
      onFailure: () => {
        el.homeScreen.classList.add("hidden");
        el.connectScreen.classList.remove("hidden");
      },
    });
  }
});
