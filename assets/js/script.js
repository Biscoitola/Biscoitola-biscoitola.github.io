const STORAGE_KEY = "cha_panela_reservados";
const SPLIT_STORAGE_KEY = "cha_panela_cotas";
const USER_NAME_STORAGE_KEY = "cha_panela_actor_name";
const API_BASE_URL_META = document
  .querySelector('meta[name="cha-panela-api-base-url"]')
  ?.getAttribute("content")
  ?.trim();
const API_BASE_URL = window.CHA_PANELA_API_BASE_URL || API_BASE_URL_META || "";
const RESERVATION_REFRESH_MS = 15000;

let reservationState = loadReservationState();
let currentActorName = loadActorName();
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
  if (!isReserved(item)) return "Disponivel";
  if (isReservedByCurrentUser(item)) return "Reservado por voce";
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

function ensureActorName(promptMessage) {
  if (currentActorName) return currentActorName;

  const typed = window.prompt(promptMessage || "Digite seu nome para reservar itens:") || "";
  const normalized = normalizeActorName(typed);

  if (!normalized) {
    alert("Informe seu nome para continuar.");
    return null;
  }

  currentActorName = normalized;
  localStorage.setItem(USER_NAME_STORAGE_KEY, currentActorName);
  return currentActorName;
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
      links: parseLinksFromCard(card)
    };
  });

  itemMap = nextMap;
}

function getItemImage(item) {
  return item?.image || "";
}

function buildLinksHtml(links) {
  if (!links || links.length === 0) {
    return '<div class="item-link"><i class="fa-solid fa-hourglass-half"></i> Link em breve</div>';
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
    if (!silent) console.warn("API indisponivel. Usando estado local.", error);
    return false;
  } finally {
    isLoadingReservations = false;
  }
}

async function toggleRegularReservation(item) {
  if (isLockedForCurrentUser(item)) {
    alert("Este item ja foi reservado por outra pessoa.");
    return;
  }

  const shouldReserve = !isReserved(item);
  const actorName = ensureActorName(
    shouldReserve ? "Digite seu nome para reservar este item:" : "Digite seu nome para liberar este item:"
  );
  if (!actorName) return;

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
    await apiFetchJson(endpoint, { method: "POST", body: JSON.stringify({ actorName }) });
    await loadReservationsFromApi({ silent: true });
  } catch (error) {
    if (error.status === 403) {
      await loadReservationsFromApi({ silent: true });
      alert("Este item foi reservado por outra pessoa e nao pode ser liberado por voce.");
    } else if (error.status === 409) {
      await loadReservationsFromApi({ silent: true });
      alert(shouldReserve ? "Este item acabou de ser reservado por outra pessoa." : "Este item ja estava disponivel.");
    } else if (error.status === 400) {
      alert("Informe seu nome para continuar.");
    } else {
      console.error("Falha ao salvar reserva na API.", error);
      alert("Nao foi possivel atualizar a reserva agora. Tente novamente.");
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
  modalDescription.textContent = item.description || "Sem descricao.";
  modalImage.src = getItemImage(item);
  modalImage.alt = item.name;
  modalLinks.innerHTML = buildLinksHtml(item.links);

  if (modalSplit) modalSplit.hidden = true;
  modalReserveButton.hidden = false;
  updateRegularReserveButton(item);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeItemModal() {
  currentItemId = null;
  modal.classList.remove("is-open");
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
  const sections = Array.from(document.querySelectorAll("#gift-sections > .gift-group[id]"));

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
  if (!item) return;
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
window.setInterval(() => {
  void loadReservationsFromApi({ silent: true });
}, RESERVATION_REFRESH_MS);

navToggle.addEventListener("click", () => {
  if (drawer.classList.contains("is-open")) closeDrawer();
  else openDrawer();
});

drawerClose.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);
