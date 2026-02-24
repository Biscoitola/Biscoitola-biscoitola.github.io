const STORAGE_KEY = "cha_panela_reservados";
const SPLIT_STORAGE_KEY = "cha_panela_cotas";
const API_BASE_URL = window.CHA_PANELA_API_BASE_URL || "";
const RESERVATION_REFRESH_MS = 15000;

let reservedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
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

function saveStates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservedItems));
  localStorage.removeItem(SPLIT_STORAGE_KEY);
}

function saveLocalOnlyReservationState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservedItems));
}

function isReserved(item) {
  return reservedItems[item.id] === true;
}

function reserveTagText(item) {
  return isReserved(item) ? "Reservado" : "Disponivel";
}

function reserveTagIcon(item) {
  return isReserved(item) ? "fa-lock" : "fa-gift";
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function parseLinksFromCard(card) {
  const node = card.querySelector(".item-links-data");
  if (!node) return [];

  try {
    const raw = decodeHtmlEntities(node.textContent || "[]");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function initializeItemsFromDom() {
  const nextMap = {};

  document.querySelectorAll(".gift-card[data-item-id]").forEach((card) => {
    const id = card.dataset.itemId;
    if (!id) return;

    nextMap[id] = {
      id,
      name: card.dataset.itemName || card.querySelector(".gift-title")?.textContent?.trim() || id,
      description:
        card.dataset.itemDescription || card.querySelector(".gift-description")?.textContent?.trim() || "",
      image: card.dataset.itemImage || card.querySelector(".gift-image")?.getAttribute("src") || "",
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
  const reserved = isReserved(item);
  modalReserveButton.className = `btn-reserve ${reserved ? "release" : "reserve"}`;
  modalReserveButton.innerHTML = `<i class="fa-solid ${reserved ? "fa-rotate-left" : "fa-calendar-check"} me-2"></i>${
    reserved ? "Liberar item" : "Reservar item"
  }`;
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
  const nextReserved = {};
  (rows || []).forEach((row) => {
    if (row && row.id && row.is_reserved) nextReserved[row.id] = true;
  });
  reservedItems = nextReserved;
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
  const shouldReserve = !isReserved(item);
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
    reservedItems[item.id] = shouldReserve;
    if (!reservedItems[item.id]) delete reservedItems[item.id];
    saveStates();
    renderGiftSections();
    if (currentItemId === item.id) updateRegularReserveButton(item);
    setReserveButtonsDisabled(item.id, false);
    return;
  }

  try {
    const endpoint = shouldReserve ? `/api/items/${item.id}/reserve` : `/api/items/${item.id}/release`;
    await apiFetchJson(endpoint, { method: "POST", body: JSON.stringify({}) });
    await loadReservationsFromApi({ silent: true });
  } catch (error) {
    if (error.status === 409) {
      await loadReservationsFromApi({ silent: true });
      alert(shouldReserve ? "Este item acabou de ser reservado por outra pessoa." : "Este item ja estava disponivel.");
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
  if (!item) return;

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
  card.classList.toggle("reserved", reserved);

  const tag = card.querySelector(".reserve-tag");
  if (tag) {
    tag.innerHTML = `<i class="fa-solid ${reserveTagIcon(item)}"></i>${reserveTagText(item)}`;
  }

  const button = card.querySelector(`[data-reserve="${id}"]`);
  if (button) {
    button.className = `btn-reserve ${reserved ? "release" : "reserve"}`;
    button.innerHTML = `<i class="fa-solid ${reserved ? "fa-rotate-left" : "fa-calendar-check"} me-2"></i>${
      reserved ? "Liberar item" : "Reservar item"
    }`;
  }
}

function renderGiftSections() {
  document.querySelectorAll(".gift-card[data-item-id]").forEach(updateCardUi);
}

function bindGiftCardEvents() {
  document.querySelectorAll(".gift-card[data-item-id]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const interactive = event.target.closest("button, a");
      if (interactive) return;
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
