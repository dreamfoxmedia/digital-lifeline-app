/* ============ Veilige opslag ============ */
const store = {
  get(k)    { try { return localStorage.getItem(k); }     catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); }        catch {} },
  del(k)    { try { localStorage.removeItem(k); }        catch {} },
};

/* ============ Element-verwijzingen ============ */
const el = {
  homeScreen:           document.getElementById("home-screen"),
  addPersonScreen:      document.getElementById("add-person-screen"),
  addFamilyScreen:      document.getElementById("add-family-screen"),
  addCaregiverScreen:   document.getElementById("add-caregiver-screen"),
  appDashboardScreen:   document.getElementById("app-dashboard-screen"),
  personPreviewScreen:  document.getElementById("person-preview-screen"),
  connectScreen:        document.getElementById("connect-screen"),
  dashboard:            document.getElementById("dashboard-screen"),
  personsList:          document.getElementById("persons-list"),
  addFamilyBtn:         document.getElementById("add-family-btn"),
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
  previewOrganizationRow:   document.getElementById("preview-organization-row"),
  previewOrganization:      document.getElementById("preview-organization"),
  previewFunctionRow:       document.getElementById("preview-function-row"),
  previewFunction:          document.getElementById("preview-function"),
  previewDoneBtn:           document.getElementById("preview-done-btn"),
  // Bewaakt persoon form
  addPersonBackBtn:    document.getElementById("add-person-back-btn"),
  personPhoto:         document.getElementById("person-photo"),
  personPhotoPreview:  document.getElementById("person-photo-preview"),
  photoIcon:           document.querySelector(".photo-icon"),
  personNickname:      document.getElementById("person-nickname"),
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
  // Hulpverlener form
  addCaregiverBackBtn:       document.getElementById("add-caregiver-back-btn"),
  caregiverGender:           document.getElementById("caregiver-gender"),
  caregiverFirstname:        document.getElementById("caregiver-firstname"),
  caregiverLastname:         document.getElementById("caregiver-lastname"),
  caregiverEmail:            document.getElementById("caregiver-email"),
  caregiverPhone:            document.getElementById("caregiver-phone"),
  caregiverOrganization:     document.getElementById("caregiver-organization"),
  caregiverFunction:         document.getElementById("caregiver-function"),
  caregiverNotifySystem:     document.getElementById("caregiver-notify-system"),
  caregiverNotifyCritical:   document.getElementById("caregiver-notify-critical"),
  caregiverChannelSms:       document.getElementById("caregiver-channel-sms"),
  caregiverChannelEmail:     document.getElementById("caregiver-channel-email"),
  caregiverChannelWhatsapp:  document.getElementById("caregiver-channel-whatsapp"),
  saveCaregiverBtn:          document.getElementById("save-caregiver-btn"),
  caregiverStatus:           document.getElementById("caregiver-status"),
  // App dashboard
  dashMonitoredCard:   document.getElementById("dash-monitored-card"),
  dashFamilyList:      document.getElementById("dash-family-list"),
  dashCaregiverList:   document.getElementById("dash-caregiver-list"),
  dashMenuBtn:         document.getElementById("dash-menu-btn"),
  dashMenuOverlay:     document.getElementById("dash-menu-overlay"),
  dashAddFamilyBtn:    document.getElementById("dash-add-family-btn"),
  dashAddCaregiverBtn: document.getElementById("dash-add-caregiver-btn"),
  dashCloseMenuBtn:    document.getElementById("dash-close-menu-btn"),
  // Bevestigingsmodal
  confirmModal:     document.getElementById("confirm-modal"),
  confirmMessage:   document.getElementById("confirm-message"),
  confirmOkBtn:     document.getElementById("confirm-ok-btn"),
  confirmCancelBtn: document.getElementById("confirm-cancel-btn"),
  // Connect / HA entities dashboard
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
let states  = new Map();

/* ============ Labels ============ */
const RELATION_LABELS = {
  partner: "Partner", kind: "Kind", ouder: "Ouder",
  broer_zus: "Broer / Zus", vriend: "Vriend / Vriendin",
  buurman: "Buurman / Buurvrouw", mantelzorger: "Mantelzorger", anders: "Anders",
};
const GENDER_LABELS = { man: "Man", vrouw: "Vrouw", niet_zeggen: "Niet zeggen" };
const TYPE_ICONS    = { monitored: "🫀", family: "👨‍👩‍👧", caregiver: "🏥" };

/* ============ Helpers ============ */
function personName(p) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ")
      || p.displayName || p.nickname || "Onbekend";
}
function allScreensHidden() {
  [el.homeScreen, el.addPersonScreen, el.addFamilyScreen, el.addCaregiverScreen,
   el.appDashboardScreen, el.personPreviewScreen, el.connectScreen, el.dashboard]
    .forEach(s => s.classList.add("hidden"));
}
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}
function cssEscape(str) {
  return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/["\\]/g, "\\$&");
}
function setInfoRow(row, valueEl, value) {
  if (value) { valueEl.textContent = value; row.classList.remove("hidden"); }
  else        { row.classList.add("hidden"); }
}
function notifSummary(person) {
  const types    = (person.notificationTypes    || []).map(t => t === "system" ? "Systeemmeldingen" : "Kritieke meldingen");
  const channels = (person.notificationChannels || []).map(c => ({ sms: "SMS", email: "E-mail", whatsapp: "WhatsApp" }[c] || c));
  let text = types.join(", ");
  if (channels.length) text += (text ? "\nVia: " : "Via: ") + channels.join(", ");
  return text;
}

/* ============ Welk scherm? ============ */
function resolveHomeTarget(persons) {
  const monitored  = persons.filter(p => p.personType === "monitored");
  const family     = persons.filter(p => p.personType === "family");
  if (monitored.length > 0 && family.length > 0) return "dashboard";
  return "home";
}

/* ============ Navigatie ============ */
function showHome() {
  const persons = JSON.parse(store.get("dl_persons") || "[]");
  if (resolveHomeTarget(persons) === "dashboard") {
    showAppDashboard(persons);
    return;
  }
  allScreensHidden();
  el.homeScreen.classList.remove("hidden");
  const hasMonitored  = persons.some(p => p.personType === "monitored");
  el.addFamilyBtn.classList.toggle("hidden", !hasMonitored);
  renderPersonsList(persons);
}

function showAppDashboard(persons) {
  allScreensHidden();
  el.appDashboardScreen.classList.remove("hidden");
  renderAppDashboard(persons);
}

function showAddPerson() {
  allScreensHidden();
  el.addPersonScreen.classList.remove("hidden");
}

function showAddFamily() {
  closeDashMenu();
  allScreensHidden();
  el.addFamilyScreen.classList.remove("hidden");
}

function showAddCaregiver() {
  closeDashMenu();
  allScreensHidden();
  el.addCaregiverScreen.classList.remove("hidden");
}

function showConnect() {
  allScreensHidden();
  el.connectScreen.classList.remove("hidden");
}

function disconnect() {
  if (client) client.disconnect();
  client = null;
  el.connPill.textContent = "verbonden";
  el.connPill.classList.remove("off");
  el.status.textContent = "";
  el.status.className = "status";
  showHome();
}

function openDashMenu()  { el.dashMenuOverlay.classList.remove("hidden"); }
function closeDashMenu() { el.dashMenuOverlay.classList.add("hidden"); }

/* ============ App dashboard renderen ============ */
function renderAppDashboard(persons) {
  const monitored  = persons.find(p => p.personType === "monitored");
  const family     = persons.filter(p => p.personType === "family");
  const caregivers = persons.filter(p => p.personType === "caregiver");

  // Bewaakt persoon kaart
  if (monitored) {
    const sensorId = `sensor.dl_${(personName(monitored)).toLowerCase().replace(/\s+/g, "_")}`;
    const haState  = states.get(sensorId);
    const connected = haState != null;

    let avatarHtml = monitored.photo
      ? `<img src="${escapeHtml(monitored.photo)}" alt="foto" />`
      : "🫀";
    const detail = [monitored.phone, monitored.city].filter(Boolean).join(" · ");

    el.dashMonitoredCard.innerHTML = `
      <div class="dash-monitored-avatar">${avatarHtml}</div>
      <div class="dash-monitored-info">
        <div class="dash-monitored-name">${escapeHtml(personName(monitored))}</div>
        <div class="dash-monitored-status ${connected ? "" : "offline"}">
          ${connected ? "Verbonden met Home Assistant" : "Niet verbonden"}
        </div>
        ${detail ? `<div class="dash-monitored-detail">${escapeHtml(detail)}</div>` : ""}
      </div>
      <button class="dash-monitored-delete" title="Verwijderen" data-id="${escapeHtml(String(monitored.id))}">🗑</button>
    `;
    el.dashMonitoredCard.querySelector(".dash-monitored-delete")
      .addEventListener("click", () => deletePerson(monitored.id, personName(monitored)));
  }

  // Familie
  renderDashList(el.dashFamilyList, family, p => RELATION_LABELS[p.relation] || p.relation || "");

  // Hulpverleners
  renderDashList(el.dashCaregiverList, caregivers, p => [p.caregiverFunction, p.organization].filter(Boolean).join(" · ") || "");
}

function renderDashList(container, persons, subFn) {
  container.innerHTML = "";
  if (!persons.length) {
    container.innerHTML = `<div class="dash-empty">Nog niemand toegevoegd.</div>`;
    return;
  }
  for (const p of persons) {
    const card = document.createElement("div");
    card.className = "dash-person-card";
    card.innerHTML = `
      <span class="dash-person-card-icon">${TYPE_ICONS[p.personType] || "👤"}</span>
      <div class="dash-person-card-info">
        <div class="dash-person-card-name">${escapeHtml(personName(p))}</div>
        <div class="dash-person-card-sub">${escapeHtml(subFn(p))}</div>
      </div>
      <button class="dash-person-card-delete" title="Verwijderen" data-id="${escapeHtml(String(p.id))}">🗑</button>
    `;
    card.querySelector(".dash-person-card-delete")
      .addEventListener("click", () => deletePerson(p.id, personName(p)));
    container.appendChild(card);
  }
}

/* ============ Personenlijst op setup home screen ============ */
function renderPersonsList(persons) {
  el.personsList.innerHTML = "";
  for (const p of persons) {
    const item = document.createElement("div");
    item.className = "person-item";
    item.innerHTML = `
      <span class="person-item-icon">${TYPE_ICONS[p.personType] || "👤"}</span>
      <div class="person-item-info">
        <div class="person-item-name">${escapeHtml(personName(p))}</div>
        <div class="person-item-type">${{ monitored: "Bewaakt persoon", family: "Familielid", caregiver: "Hulpverlener" }[p.personType] || p.personType}</div>
      </div>
      <button class="person-item-delete" title="Verwijderen" data-id="${escapeHtml(String(p.id))}">🗑</button>
    `;
    item.querySelector(".person-item-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePerson(p.id, personName(p));
    });
    el.personsList.appendChild(item);
  }
}

/* ============ Bevestigingsdialog ============ */
let _pendingAction = null;

function askConfirm(message, onConfirm) {
  _pendingAction = onConfirm;
  el.confirmMessage.textContent = message;
  el.confirmModal.classList.remove("hidden");
}

/* ============ Persoon verwijderen ============ */
function deletePerson(id, name) {
  askConfirm(
    `Wil je "${name || "deze persoon"}" verwijderen? Dit kan niet ongedaan worden gemaakt.`,
    () => {
      const persons = JSON.parse(store.get("dl_persons") || "[]");
      store.set("dl_persons", JSON.stringify(persons.filter(p => String(p.id) !== String(id))));
      if (client) {
        client.callServiceData("digital_lifeline", "remove_person", { person_id: String(id) })
          .catch(e => console.warn("remove_person:", e.message));
      }
      showHome();
    }
  );
}

/* ============ Preview ============ */
function showPersonPreview(person) {
  if (person.photo) {
    el.previewPhoto.src = person.photo;
    el.previewPhoto.classList.remove("hidden");
    el.previewPhotoPlaceholder.classList.add("hidden");
  } else {
    el.previewPhoto.classList.add("hidden");
    el.previewPhotoPlaceholder.classList.remove("hidden");
  }

  el.previewNickname.textContent = personName(person);
  setInfoRow(el.previewPhoneRow, el.previewPhone, person.phone);
  setInfoRow(el.previewEmailRow, el.previewEmail, person.email);

  // Verberg alle optionele rijen
  [el.previewDisplayNameRow, el.previewTypeRow, el.previewBirthdateRow,
   el.previewAddressRow, el.previewMedicationRow, el.previewGenderRow,
   el.previewRelationRow, el.previewNotificationsRow,
   el.previewOrganizationRow, el.previewFunctionRow]
    .forEach(r => r.classList.add("hidden"));

  if (person.personType === "monitored") {
    setInfoRow(el.previewBirthdateRow, el.previewBirthdate, person.birthdate);
    const addr = [[person.street, person.housenumber].filter(Boolean).join(" "),
                  [person.zipcode, person.city].filter(Boolean).join(" ")]
                  .filter(Boolean).join("\n");
    setInfoRow(el.previewAddressRow,    el.previewAddress,    addr);
    setInfoRow(el.previewMedicationRow, el.previewMedication, person.medication);

  } else if (person.personType === "family") {
    setInfoRow(el.previewGenderRow,         el.previewGender,         GENDER_LABELS[person.gender] || person.gender);
    setInfoRow(el.previewRelationRow,       el.previewRelation,       RELATION_LABELS[person.relation] || person.relation);
    setInfoRow(el.previewNotificationsRow,  el.previewNotifications,  notifSummary(person));

  } else if (person.personType === "caregiver") {
    setInfoRow(el.previewGenderRow,        el.previewGender,       GENDER_LABELS[person.gender] || person.gender);
    setInfoRow(el.previewOrganizationRow,  el.previewOrganization, person.organization);
    setInfoRow(el.previewFunctionRow,      el.previewFunction,     person.caregiverFunction);
    setInfoRow(el.previewNotificationsRow, el.previewNotifications, notifSummary(person));
  }

  allScreensHidden();
  el.personPreviewScreen.classList.remove("hidden");
}

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
    states = new Map(all.map(s => [s.entity_id, s]));
    await client.subscribeStateChanges();
    store.set("ha_url", url);
    store.set("ha_token", token);
    syncPersonsFromHA(states);
    renderHADashboard();
    if (onSuccess) onSuccess();
    else { el.connectScreen.classList.add("hidden"); showHome(); }
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
      id:                   a.id,
      personType:           a.person_type        || "monitored",
      firstName:            a.first_name         || "",
      lastName:             a.last_name          || "",
      nickname:             a.nickname           || "",
      displayName:          a.display_name       || "",
      birthdate:            a.birthdate          || "",
      street:               a.street             || "",
      housenumber:          a.housenumber        || "",
      zipcode:              a.zipcode            || "",
      city:                 a.city               || "",
      phone:                a.phone              || "",
      email:                a.email              || "",
      medication:           a.medication         || "",
      gender:               a.gender             || "",
      relation:             a.relation           || "",
      organization:         a.organization       || "",
      caregiverFunction:    a.caregiver_function || "",
      notificationTypes:    a.notification_types    || [],
      notificationChannels: a.notification_channels || [],
    });
  }
  if (synced.length > 0) store.set("dl_persons", JSON.stringify(synced));
}

/* ============ HA entities dashboard ============ */
const TOGGLEABLE = new Set(["light","switch","fan","input_boolean","automation","script","media_player"]);
const ICONS = {
  light:"💡",switch:"🔌",fan:"🌀",lock:"🔒",climate:"🌡️",sensor:"📊",
  binary_sensor:"📡",cover:"🪟",media_player:"🔊",input_boolean:"🎚️",
  automation:"⚙️",script:"📜",person:"👤",camera:"📷",vacuum:"🤖",scene:"🎬",weather:"⛅",
};
const ON_STATES   = new Set(["on","open","home","playing","unlocked"]);
const domainOf    = id  => id.split(".")[0];
const iconFor     = id  => ICONS[domainOf(id)] || "▫️";
const isOn        = s   => ON_STATES.has(s.state);
const friendlyName = s  => s.attributes?.friendly_name || s.entity_id;

function renderHADashboard() {
  const q = el.search.value.trim().toLowerCase();
  const groups = {};
  for (const s of states.values()) {
    const d = domainOf(s.entity_id);
    if (["sun","zone","persistent_notification"].includes(d)) continue;
    if (q && !friendlyName(s).toLowerCase().includes(q) && !s.entity_id.includes(q)) continue;
    (groups[d] ||= []).push(s);
  }
  const domainNames = Object.keys(groups).sort();
  el.entities.innerHTML = "";
  el.emptyNote.classList.toggle("hidden", domainNames.length > 0);
  for (const d of domainNames) {
    const wrap = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "group-title";
    title.textContent = `${d} (${groups[d].length})`;
    wrap.appendChild(title);
    const cards = document.createElement("div");
    cards.className = "cards";
    groups[d].sort((a,b) => friendlyName(a).localeCompare(friendlyName(b))).forEach(s => cards.appendChild(buildCard(s)));
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
  const d = domainOf(id);
  const svc = isOn(states.get(id)) ? "turn_off" : "turn_on";
  try { await client.callService(d, "toggle", id); }
  catch { try { await client.callService(d, svc, id); } catch(e) { console.warn(e); } }
}

/* ============ Events: verbinding ============ */
el.connectBtn.addEventListener("click", () => {
  const url = el.url.value.trim(), token = el.token.value.trim();
  if (!url || !token) {
    el.status.textContent = "Vul zowel URL als token in.";
    el.status.className = "status err";
    return;
  }
  doConnect(url, token);
});
[el.url, el.token].forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") el.connectBtn.click(); }));
el.disconnectBtn.addEventListener("click", disconnect);
el.search.addEventListener("input", renderHADashboard);

/* ============ Events: navigatie ============ */
el.addPersonBtn.addEventListener("click", showAddPerson);
el.addFamilyBtn.addEventListener("click", showAddFamily);
el.addPersonBackBtn.addEventListener("click", showHome);
el.addFamilyBackBtn.addEventListener("click", showHome);
el.addCaregiverBackBtn.addEventListener("click", showHome);
el.previewDoneBtn.addEventListener("click", showHome);

/* ============ Events: bevestigingsdialog ============ */
el.confirmOkBtn.addEventListener("click", () => {
  el.confirmModal.classList.add("hidden");
  if (_pendingAction) { _pendingAction(); _pendingAction = null; }
});
el.confirmCancelBtn.addEventListener("click", () => {
  el.confirmModal.classList.add("hidden");
  _pendingAction = null;
});

/* ============ Events: app dashboard menu ============ */
el.dashMenuBtn.addEventListener("click", openDashMenu);
el.dashCloseMenuBtn.addEventListener("click", closeDashMenu);
el.dashMenuOverlay.addEventListener("click", e => { if (e.target === el.dashMenuOverlay) closeDashMenu(); });
el.dashAddFamilyBtn.addEventListener("click", showAddFamily);
el.dashAddCaregiverBtn.addEventListener("click", showAddCaregiver);

/* ============ Events: foto upload ============ */
el.personPhoto.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
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
    id: Date.now(), personType: "monitored",
    nickname: el.personNickname.value.trim(),
    firstName, lastName: el.personLastname.value.trim(),
    birthdate: el.personBirthdate.value,
    street: el.personStreet.value.trim(), housenumber: el.personHousenumber.value.trim(),
    zipcode: el.personZipcode.value.trim(), city: el.personCity.value.trim(),
    phone: el.personPhone.value.trim(), email: el.personEmail.value.trim(),
    medication: el.personMedication.value.trim(),
    photo: !el.personPhotoPreview.classList.contains("hidden") ? el.personPhotoPreview.src : null,
  };
  savePerson(person);
  if (client) {
    client.callServiceData("digital_lifeline", "add_person", {
      id: String(person.id),
      nickname: person.nickname,
      first_name: person.firstName, last_name: person.lastName,
      birthdate: person.birthdate, street: person.street, housenumber: person.housenumber,
      zipcode: person.zipcode, city: person.city, phone: person.phone,
      email: person.email, medication: person.medication, person_type: "monitored",
    }).catch(e => console.warn("add_person:", e.message));
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
  const notificationTypes    = checkedValues([[el.familyNotifySystem,"system"],[el.familyNotifyCritical,"critical"]]);
  const notificationChannels = checkedValues([[el.familyChannelSms,"sms"],[el.familyChannelEmail,"email"],[el.familyChannelWhatsapp,"whatsapp"]]);
  const person = {
    id: Date.now(), personType: "family",
    gender: el.familyGender.value, firstName, lastName: el.familyLastname.value.trim(),
    email: el.familyEmail.value.trim(), phone: el.familyPhone.value.trim(),
    relation: el.familyRelation.value, notificationTypes, notificationChannels,
  };
  savePerson(person);
  if (client) {
    client.callServiceData("digital_lifeline", "add_person", {
      id: String(person.id),
      first_name: person.firstName, last_name: person.lastName, gender: person.gender,
      email: person.email, phone: person.phone, relation: person.relation,
      notification_types: notificationTypes, notification_channels: notificationChannels,
      person_type: "family",
    }).catch(e => console.warn("add_person:", e.message));
  }
  el.familyStatus.textContent = "";
  showPersonPreview(person);
});

/* ============ Events: hulpverlener opslaan ============ */
el.saveCaregiverBtn.addEventListener("click", () => {
  const firstName = el.caregiverFirstname.value.trim();
  if (!firstName) {
    el.caregiverStatus.textContent = "Vul minimaal een voornaam in.";
    el.caregiverStatus.className = "status err";
    el.caregiverFirstname.focus();
    return;
  }
  const notificationTypes    = checkedValues([[el.caregiverNotifySystem,"system"],[el.caregiverNotifyCritical,"critical"]]);
  const notificationChannels = checkedValues([[el.caregiverChannelSms,"sms"],[el.caregiverChannelEmail,"email"],[el.caregiverChannelWhatsapp,"whatsapp"]]);
  const person = {
    id: Date.now(), personType: "caregiver",
    gender: el.caregiverGender.value, firstName, lastName: el.caregiverLastname.value.trim(),
    email: el.caregiverEmail.value.trim(), phone: el.caregiverPhone.value.trim(),
    organization: el.caregiverOrganization.value.trim(),
    caregiverFunction: el.caregiverFunction.value.trim(),
    notificationTypes, notificationChannels,
  };
  savePerson(person);
  if (client) {
    client.callServiceData("digital_lifeline", "add_person", {
      id: String(person.id),
      first_name: person.firstName, last_name: person.lastName, gender: person.gender,
      email: person.email, phone: person.phone,
      organization: person.organization, caregiver_function: person.caregiverFunction,
      notification_types: notificationTypes, notification_channels: notificationChannels,
      person_type: "caregiver",
    }).catch(e => console.warn("add_person:", e.message));
  }
  el.caregiverStatus.textContent = "";
  showPersonPreview(person);
});

/* ============ Hulpfuncties opslaan ============ */
function savePerson(person) {
  const persons = JSON.parse(store.get("dl_persons") || "[]");
  persons.push(person);
  store.set("dl_persons", JSON.stringify(persons));
}

function checkedValues(pairs) {
  return pairs.filter(([el]) => el.checked).map(([, v]) => v);
}

/* ============ Splash screen ============ */
const splash = document.getElementById("splash");
if (splash) splash.addEventListener("animationend", () => splash.remove(), { once: true });

/* ============ Opstarten ============ */
window.addEventListener("DOMContentLoaded", () => {
  const url   = store.get("ha_url");
  const token = store.get("ha_token");
  if (url) el.url.value = url;
  if (url && token) {
    el.token.value = token;
    // Toon direct de juiste view op basis van lokale data
    const local = JSON.parse(store.get("dl_persons") || "[]");
    if (resolveHomeTarget(local) === "dashboard") {
      el.appDashboardScreen.classList.remove("hidden");
      renderAppDashboard(local);
    } else {
      el.homeScreen.classList.remove("hidden");
      const hasMonitored = local.some(p => p.personType === "monitored");
      el.addFamilyBtn.classList.toggle("hidden", !hasMonitored);
      renderPersonsList(local);
    }
    el.connectScreen.classList.add("hidden");
    doConnect(url, token, {
      onSuccess: () => showHome(),
      onFailure: () => { allScreensHidden(); el.connectScreen.classList.remove("hidden"); },
    });
  }
});
