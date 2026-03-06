const STORAGE_KEY = "cha_panela_reservados";
const SPLIT_STORAGE_KEY = "cha_panela_cotas";
const USER_NAME_STORAGE_KEY = "cha_panela_actor_name";
const USER_PIN_STORAGE_KEY = "cha_panela_actor_pin";
const DEVICE_TOKEN_STORAGE_KEY = "cha_panela_device_token";
const API_BASE_URL_META = document
  .querySelector('meta[name="cha-panela-api-base-url"]')
  ?.getAttribute("content")
  ?.trim();
const API_BASE_URL = window.CHA_PANELA_API_BASE_URL || API_BASE_URL_META || "";
const RESERVATION_REFRESH_MS = 15000;
const TRIBUTES_REFRESH_MS = 20000;

let reservationState = loadReservationState();
let currentActorName = loadActorName();
let currentActorPin = loadActorPin();
const currentActorToken = loadOrCreateDeviceToken();
let currentItemId = null;
let isApiAvailable = false;
let isLoadingReservations = false;

const modal = document.getElementById("item-modal");
const modalTitle = document.getElementById("item-modal-title");
const modalDescription = document.getElementById("item-modal-description");
const modalImage = document.getElementById("item-modal-image");
const modalLinks = document.getElementById("item-modal-links");
const modalReserveButton = document.getElementById("item-modal-reserve");
const modalSplit = document.getElementById("item-modal-split");

const navToggle = document.getElementById("nav-toggle");
const drawer = document.getElementById("section-drawer");
const drawerClose = document.getElementById("drawer-close");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const sectionNavLinks = document.getElementById("section-nav-links");
const welcomeButtons = document.getElementById("welcome-buttons");
const tributesCloud = document.getElementById("tributes-cloud");

let itemMap = {};

function normalizeActorName(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function actorNamesMatch(left, right) {
  return normalizeActorName(left).toLowerCase() === normalizeActorName(right).toLowerCase();
}

function loadActorName() {
  return normalizeActorName(localStorage.getItem(USER_NAME_STORAGE_KEY) || "");
}

function loadActorPin() {
  return normalizeActorName(localStorage.getItem(USER_PIN_STORAGE_KEY) || "");
}

function createRandomToken() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function loadOrCreateDeviceToken() {
  const existing = normalizeActorName(localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY) || "");
  if (existing) return existing;
  const created = createRandomToken();
  localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, created);
  return created;
}

function loadReservationState() {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const nextState = {};

  Object.entries(parsed || {}).forEach(([id, value]) => {
    if (value === true) {
      nextState[id] = { isReserved: true, reservedBy: null };
      return;
    }

    if (value && typeof value === "object" && value.isReserved === true) {
      nextState[id] = {
        isReserved: true,
        reservedBy: normalizeActorName(value.reservedBy || "")
      };
    }
  });

  return nextState;
}

function saveStates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservationState));
  localStorage.removeItem(SPLIT_STORAGE_KEY);
}

function saveLocalOnlyReservationState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservationState));
}

function getReservation(item) {
  return reservationState[item.id] || null;
}

function isReserved(item) {
  return Boolean(getReservation(item)?.isReserved);
}

function getReservedBy(item) {
  return normalizeActorName(getReservation(item)?.reservedBy || "");
}

function isReservedByCurrentUser(item) {
  if (!isReserved(item)) return false;
  const reservedBy = getReservedBy(item);
  if (!reservedBy || !currentActorName) return false;
  return actorNamesMatch(reservedBy, currentActorName);
}

function isLockedForCurrentUser(item) {
  return isReserved(item) && !isReservedByCurrentUser(item);
}

function reserveTagText(item) {
  if (!isReserved(item)) return "Disponível";
  if (isReservedByCurrentUser(item)) return "Reservado por você";
  return "Reservado";
}

function reserveTagIcon(item) {
  return isReserved(item) ? "fa-lock" : "fa-gift";
}

function getReserveButtonState(item) {
  if (!isReserved(item)) {
    return {
      className: "reserve",
      icon: "fa-calendar-check",
      label: "Reservar item",
      disabled: false
    };
  }

  if (isReservedByCurrentUser(item)) {
    return {
      className: "release",
      icon: "fa-rotate-left",
      label: "Liberar item",
      disabled: false
    };
  }

  return {
    className: "release",
    icon: "fa-lock",
    label: "Reservado",
    disabled: true
  };
}

function ensureActorName(promptMessage, forceAsk = false) {
  if (!forceAsk && currentActorName) return currentActorName;

  const typed =
    window.prompt(
      promptMessage || "Escreva uma frase para homenagear o casal:",
      currentActorName || ""
    ) || "";
  const normalized = normalizeActorName(typed);

  if (!normalized) {
    alert("Escreva uma frase para continuar.");
    return null;
  }

  currentActorName = normalized;
  localStorage.setItem(USER_NAME_STORAGE_KEY, currentActorName);
  return currentActorName;
}

function ensureActorPin(forceAsk = false) {
  if (!forceAsk && currentActorPin) return currentActorPin;
  currentActorPin = normalizeActorName(currentActorName || "");
  localStorage.setItem(USER_PIN_STORAGE_KEY, currentActorPin);
  return currentActorPin;
}

function askRecoveryPin() {
  return normalizeActorName(currentActorName || "");
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function normalizeLinkEntry(entry, index) {
  if (typeof entry === "string") {
    const url = entry.trim();
    if (!url) return null;
    return { label: `Link ${index + 1}`, url };
  }

  if (entry && typeof entry === "object" && typeof entry.url === "string") {
    const url = entry.url.trim();
    if (!url) return null;
    return {
      label: typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : `Link ${index + 1}`,
      url
    };
  }

  return null;
}

function parseLinksFromCard(card) {
  const node = card.querySelector(".item-links-data");
  if (!node) return [];

  const raw = decodeHtmlEntities((node.textContent || "").trim());
  if (!raw) return [];

  if (/^https?:\/\//i.test(raw)) {
    return [{ label: "Link de compra", url: raw }];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((entry, index) => normalizeLinkEntry(entry, index)).filter(Boolean);
    }

    const single = normalizeLinkEntry(parsed, 0);
    return single ? [single] : [];
  } catch {
    return [];
  }
}

function initializeItemsFromDom() {
  const nextMap = {};
  const usedIds = new Set();

  document.querySelectorAll(".gift-card").forEach((card, index) => {
    const fallbackName = card.querySelector(".gift-title")?.textContent?.trim() || `item-${index + 1}`;
    const baseId =
      card.dataset.itemId ||
      fallbackName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      `item-${index + 1}`;

    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    card.dataset.itemId = id;

    const reserveButton = card.querySelector(".btn-reserve");
    if (reserveButton && !reserveButton.dataset.reserve) {
      reserveButton.dataset.reserve = id;
    }

    nextMap[id] = {
      id,
      name: card.dataset.itemName || fallbackName || id,
      description:
        card.dataset.itemDescription || card.querySelector(".gift-description")?.textContent?.trim() || "",
      image: card.querySelector(".gift-image")?.getAttribute("src") || card.dataset.itemImage || "",
      modalImage: card.dataset.itemModalImage || "",
      pixKey: normalizeActorName(card.dataset.pixKey || ""),
      links: parseLinksFromCard(card),
      reservable: card.dataset.reservable !== "false"
    };
  });

  itemMap = nextMap;
}

function getItemImage(item) {
  return item?.modalImage || item?.image || "";
}

function buildLinksHtml(links) {
  if (!links || links.length === 0) {
    return '<div class="item-link"><i class="fa-solid fa-bag-shopping"></i> Compra de sua escolha</div>';
  }

  return links
    .map(
      (link, i) => `
      <a class="item-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
        <i class="fa-solid fa-link"></i> ${link.label || `Link ${i + 1}`}
      </a>`
    )
    .join("");
}

function buildPixLinksHtml(pixKey) {
  if (!pixKey) return "";
  return `
    <button class="item-link item-link-copy" type="button" data-copy-text="${pixKey}">
      <i class="fa-solid fa-copy"></i> Copiar chave Pix
    </button>`;
}

async function copyTextToClipboard(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  return copied;
}

function updateRegularReserveButton(item) {
  const state = getReserveButtonState(item);
  modalReserveButton.className = `btn-reserve ${state.className}`;
  modalReserveButton.innerHTML = `<i class="fa-solid ${state.icon} me-2"></i>${state.label}`;
  modalReserveButton.disabled = state.disabled;
}

function setReserveButtonsDisabled(itemId, disabled) {
  document.querySelectorAll(`[data-reserve="${itemId}"]`).forEach((btn) => {
    btn.disabled = disabled;
  });

  if (currentItemId === itemId) {
    modalReserveButton.disabled = disabled;
  }
}

function normalizeApiBase(path) {
  return `${API_BASE_URL}${path}`;
}

async function apiFetchJson(path, options = {}) {
  const response = await fetch(normalizeApiBase(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.payload = body;
    throw error;
  }

  return body;
}

function applyRemoteStatuses(rows) {
  const nextState = {};
  (rows || []).forEach((row) => {
    if (row && row.id && row.is_reserved) {
      nextState[row.id] = {
        isReserved: true,
        reservedBy: normalizeActorName(row.reserved_by || "")
      };
    }
  });
  reservationState = nextState;
  saveLocalOnlyReservationState();
}

async function loadReservationsFromApi({ silent = false } = {}) {
  if (isLoadingReservations) return false;
  isLoadingReservations = true;

  try {
    const data = await apiFetchJson("/api/items");
    applyRemoteStatuses(data.items || []);
    isApiAvailable = true;
    renderGiftSections();
    if (currentItemId && itemMap[currentItemId]) updateRegularReserveButton(itemMap[currentItemId]);
    return true;
  } catch (error) {
    isApiAvailable = false;
    if (!silent) console.warn("API indisponível. Usando estado local.", error);
    return false;
  } finally {
    isLoadingReservations = false;
  }
}

async function toggleRegularReservation(item) {
  if (isLockedForCurrentUser(item)) {
    alert("Este item já foi reservado por outra pessoa.");
    return;
  }

  const shouldReserve = !isReserved(item);
  const actorName = ensureActorName(
    shouldReserve
      ? "Escreva uma frase para homenagear o casal e reservar este item:"
      : "Para liberar, informe a mesma frase usada na reserva:",
    true
  );
  if (!actorName) return;
  currentActorPin = actorName;
  localStorage.setItem(USER_PIN_STORAGE_KEY, currentActorPin);
  const actorPin = ensureActorPin(true);
  if (!actorPin) return;

  setReserveButtonsDisabled(item.id, true);

  if (!isApiAvailable) {
    const loaded = await loadReservationsFromApi({ silent: true });
    if (loaded) {
      setReserveButtonsDisabled(item.id, false);
      if (currentItemId === item.id) updateRegularReserveButton(item);
      return;
    }
  }

  if (!isApiAvailable) {
    if (shouldReserve) {
      reservationState[item.id] = { isReserved: true, reservedBy: actorName };
    } else {
      delete reservationState[item.id];
    }
    saveStates();
    renderGiftSections();
    if (currentItemId === item.id) updateRegularReserveButton(item);
    setReserveButtonsDisabled(item.id, false);
    return;
  }

  try {
    const endpoint = shouldReserve ? `/api/items/${item.id}/reserve` : `/api/items/${item.id}/release`;
    const payload = shouldReserve
      ? { actorName, actorToken: currentActorToken, actorPin }
      : { actorName, actorToken: currentActorToken, actorPin };
    await apiFetchJson(endpoint, { method: "POST", body: JSON.stringify(payload) });
    await loadReservationsFromApi({ silent: true });
  } catch (error) {
    if (error.status === 403) {
      if (!shouldReserve) {
        const recoveryPin = askRecoveryPin();
        if (recoveryPin) {
          try {
            await apiFetchJson(`/api/items/${item.id}/release`, {
              method: "POST",
              body: JSON.stringify({ actorName, actorToken: currentActorToken, actorPin: recoveryPin })
            });
            currentActorPin = recoveryPin;
            localStorage.setItem(USER_PIN_STORAGE_KEY, recoveryPin);
            await loadReservationsFromApi({ silent: true });
            await loadTributesFromApi({ silent: true });
            return;
          } catch (retryError) {
            if (retryError.status === 403) {
              alert("Frase inválida ou reserva pertence a outra pessoa.");
            } else {
              console.error("Falha ao recuperar liberação por frase.", retryError);
              alert("Não foi possível validar sua frase agora. Tente novamente.");
            }
          }
        }
      } else {
        alert("Este item foi reservado por outra pessoa e não pode ser alterado por você.");
      }
      await loadReservationsFromApi({ silent: true });
    } else if (error.status === 409) {
      await loadReservationsFromApi({ silent: true });
      alert(shouldReserve ? "Este item acabou de ser reservado por outra pessoa." : "Este item já estava disponivel.");
    } else if (error.status === 400) {
      if (error.payload?.error === "actor_pin_required") {
        alert("Escreva uma frase para reservar.");
      } else {
        alert("Informe seus dados para continuar.");
      }
    } else {
      console.error("Falha ao salvar reserva na API.", error);
      alert("Não foi possível atualizar a reserva agora. Tente novamente.");
    }
  } finally {
    setReserveButtonsDisabled(item.id, false);
    if (currentItemId === item.id && itemMap[currentItemId]) updateRegularReserveButton(itemMap[currentItemId]);
  }
}

function openItemModal(itemId) {
  const item = itemMap[itemId];
  if (!item || isLockedForCurrentUser(item)) return;

  currentItemId = itemId;
  modalTitle.textContent = item.name;
  modalDescription.textContent = item.description || "Sem descrição.";
  modalImage.src = getItemImage(item);
  modalImage.alt = item.name;
  modalLinks.innerHTML = item.reservable ? buildLinksHtml(item.links) : buildPixLinksHtml(item.pixKey);

  if (modalSplit) modalSplit.hidden = true;
  if (item.reservable) {
    modalReserveButton.hidden = false;
    updateRegularReserveButton(item);
  } else {
    modalReserveButton.hidden = true;
    modalReserveButton.disabled = true;
  }

  modal.classList.toggle("is-pix", item.id === "pix-contribuicao");

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeItemModal() {
  currentItemId = null;
  modal.classList.remove("is-open");
  modal.classList.remove("is-pix");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function scrollToSectionById(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openDrawer() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  navToggle.setAttribute("aria-expanded", "true");
  drawerBackdrop.hidden = false;
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  navToggle.setAttribute("aria-expanded", "false");
  drawerBackdrop.hidden = true;
}

function buildNavigationUi() {
  const sections = Array.from(document.querySelectorAll("#gift-sections .gift-group[id]"));

  const sectionsHtml = sections
    .map((section) => {
      const id = section.id;
      const title = section.dataset.sectionTitle || section.querySelector(".group-title")?.textContent?.trim() || id;
      const icon = section.dataset.sectionIcon || "fa-gift";

      return `
      <button class="section-link" type="button" data-go-section="${id}">
        <i class="fa-solid ${icon}"></i> ${title}
      </button>`;
    })
    .join("");

  sectionNavLinks.innerHTML = sectionsHtml;
  welcomeButtons.innerHTML = sectionsHtml.replaceAll("section-link", "welcome-btn");

  document.querySelectorAll("[data-go-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      scrollToSectionById(btn.dataset.goSection);
      closeDrawer();
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTributes(messages = []) {
  if (!tributesCloud) return;

  const normalized = (messages || [])
    .map((message) => ({
      text: normalizeActorName(message.message || message.actor_name || ""),
      itemName: normalizeActorName(message.item_name || itemMap[message.item_id]?.name || "")
    }))
    .filter((message) => message.text);

  if (normalized.length === 0) {
    tributesCloud.innerHTML =
      '<p class="tributes-empty">As homenagens aparecerão aqui conforme as reservas forem feitas.</p>';
    return;
  }

  tributesCloud.innerHTML = normalized
    .map((message, index) => {
      const delay = (index % 10) * 0.35;
      const duration = 4.6 + (index % 5) * 0.35;
      const itemLabel = message.itemName ? `<small>Item: ${escapeHtml(message.itemName)}</small>` : "";

      return `
        <article class="tribute-bubble" style="animation-delay:${delay}s;animation-duration:${duration}s">
          <p>${escapeHtml(message.text)}</p>
          ${itemLabel}
        </article>
      `;
    })
    .join("");
}

function buildFallbackTributes() {
  return Object.entries(reservationState)
    .filter(([, value]) => value?.isReserved && normalizeActorName(value.reservedBy || ""))
    .map(([itemId, value]) => ({
      item_id: itemId,
      item_name: itemMap[itemId]?.name || "",
      message: normalizeActorName(value.reservedBy || "")
    }));
}

async function loadTributesFromApi({ silent = false } = {}) {
  try {
    const data = await apiFetchJson("/api/messages");
    renderTributes(data.messages || []);
    return true;
  } catch (error) {
    if (!silent) console.warn("Falha ao carregar homenagens da API.", error);
    renderTributes(buildFallbackTributes());
    return false;
  }
}

function updateCardUi(card) {
  const id = card.dataset.itemId;
  const item = itemMap[id];
  if (!item) return;

  const reserved = isReserved(item);
  const locked = isLockedForCurrentUser(item);
  card.classList.toggle("reserved", reserved);
  card.classList.toggle("locked", locked);

  const tag = card.querySelector(".reserve-tag");
  if (tag) {
    tag.innerHTML = `<i class="fa-solid ${reserveTagIcon(item)}"></i>${reserveTagText(item)}`;
  }

  const button = card.querySelector(".btn-reserve");
  if (button) {
    const state = getReserveButtonState(item);
    button.className = `btn-reserve ${state.className}`;
    button.innerHTML = `<i class="fa-solid ${state.icon} me-2"></i>${state.label}`;
    button.disabled = state.disabled;
  }
}

function renderGiftSections() {
  document.querySelectorAll(".gift-card").forEach(updateCardUi);
}

function bindGiftCardEvents() {
  document.querySelectorAll(".gift-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      const interactive = event.target.closest("button, a");
      if (interactive) return;

      const item = itemMap[card.dataset.itemId];
      if (!item) return;
      if (isLockedForCurrentUser(item)) return;
      openItemModal(card.dataset.itemId);
    });
  });

  document.querySelectorAll("[data-reserve]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const item = itemMap[btn.dataset.reserve];
      if (!item) return;
      void toggleRegularReservation(item);
    });
  });
}

modalReserveButton.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || !item.reservable) return;
  void toggleRegularReservation(item);
});

modal.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeItemModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeItemModal();
  if (event.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
});

initializeItemsFromDom();
bindGiftCardEvents();
renderGiftSections();
buildNavigationUi();
void loadReservationsFromApi({ silent: true });
void loadTributesFromApi({ silent: true });
window.setInterval(() => {
  void loadReservationsFromApi({ silent: true });
}, RESERVATION_REFRESH_MS);
window.setInterval(() => {
  void loadTributesFromApi({ silent: true });
}, TRIBUTES_REFRESH_MS);

navToggle.addEventListener("click", () => {
  if (drawer.classList.contains("is-open")) closeDrawer();
  else openDrawer();
});

drawerClose.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy-text]");
  if (!copyButton) return;

  event.preventDefault();
  event.stopPropagation();

  const textToCopy = normalizeActorName(copyButton.getAttribute("data-copy-text") || "");
  const copied = await copyTextToClipboard(textToCopy);

  if (copied) {
    alert("Chave Pix copiada!");
  } else {
    alert("Não foi possível copiar automaticamente. Copie manualmente: " + textToCopy);
  }
});

