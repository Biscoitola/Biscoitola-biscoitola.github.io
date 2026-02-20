const IMG = {
  cozinha:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  limpeza:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  banheiro:
    "https://images.unsplash.com/photo-1604709177225-055f99402ea3?auto=format&fit=crop&w=1200&q=80",
  quarto:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
};

const categories = [
  {
    id: "cozinha",
    title: "Cozinha",
    icon: "fa-utensils",
    items: [
      {
        id: "coz-kit-panelas-tramontina",
        name: "Kit panelas Tramontina fundo triplo",
        description: "Conjunto de panelas em aco inox para uso diario.",
        image: IMG.cozinha,
        split: { totalParts: 10 },
        links: [
          {
            label: "Magalu - Linha Allegra",
            url: "https://m.magazineluiza.com.br/conjunto-de-panelas-em-aco-inox-5pcs-linha-allegra-tramontina/p/af9j0be2e0/ud/panl/?partner_id=64853&utm_source=pdp_desk&utm_medium=share"
          }
        ]
      },
      {
        id: "coz-faqueiro-tramontina",
        name: "2 kits de talheres Tramontina",
        description: "Faqueiro 16 pecas - linha Laguna.",
        image: IMG.cozinha,
        links: [{ label: "Amazon", url: "https://a.co/d/0ftguzeU" }]
      },
      {
        id: "coz-porta-talheres",
        name: "Porta talheres",
        description: "Organizador para manter os talheres separados.",
        image: IMG.cozinha,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/9zsCWndpII" }]
      },
      {
        id: "coz-fritadeira-oster",
        name: "Fritadeira sem oleo Oster 12L",
        description: "Oven fryer 3 em 1.",
        image: IMG.cozinha,
        split: { totalParts: 10 },
        links: [
          {
            label: "Casas Bahia",
            url: "https://www.casasbahia.com.br/fritadeira-sem-oleo-ofrt780-12l-1800w-oven-fryer-3-em-1-oster/p/1572806047"
          }
        ]
      },
      {
        id: "coz-organizadores-armario-prato",
        name: "Organizador de armario + organizador de prato",
        description: "Kit para melhorar espaco interno dos armarios.",
        image: IMG.cozinha,
        links: [
          { label: "Shopee - Organizador 1", url: "https://s.shopee.com.br/1LaEJP5bwQ" },
          { label: "Shopee - Organizador 2", url: "https://s.shopee.com.br/9fFMEUfbuD" }
        ]
      },
      {
        id: "coz-porta-temperos",
        name: "Porta temperos",
        description: "Suporte para organizar os temperos da cozinha.",
        image: IMG.cozinha,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/1LaEJaA2Gf" }]
      },
      {
        id: "coz-jarra-vidro",
        name: "Jarra de vidro",
        description: "Jarra para agua e sucos.",
        image: IMG.cozinha,
        links: [
          { label: "Amazon - Opcao 1", url: "https://a.co/d/04jEs7ut" },
          { label: "Amazon - Opcao 2", url: "https://a.co/d/03YbddNm" },
          { label: "Amazon - Opcao 3", url: "https://a.co/d/0hKJC8xk" }
        ]
      },
      {
        id: "coz-espremedor",
        name: "Espremedor",
        description: "Espremedor para frutas.",
        image: IMG.cozinha,
        links: [{ label: "Amazon", url: "https://a.co/d/0dA9lPM9" }]
      },
      {
        id: "coz-liquidificador",
        name: "Liquidificador",
        description: "Liquidificador para uso diario.",
        image: IMG.cozinha,
        links: [{ label: "Mercado Livre", url: "https://mercadolivre.com/sec/18CAQWz" }]
      },
      {
        id: "coz-batedeira",
        name: "Batedeira",
        description: "Batedeira para massas e receitas doces.",
        image: IMG.cozinha,
        split: { totalParts: 10 },
        links: [
          { label: "Mercado Livre - Opcao 1", url: "https://mercadolivre.com/sec/1LpEt9B" },
          { label: "Mercado Livre - Opcao 2", url: "https://mercadolivre.com/sec/31AFWF1" }
        ]
      },
      {
        id: "coz-potes-hermeticos",
        name: "Potes hermeticos",
        description: "Conjunto para armazenar alimentos.",
        image: IMG.cozinha,
        links: [
          { label: "Shopee - Opcao 1", url: "https://s.shopee.com.br/6pvFnomPj1" },
          { label: "Shopee - Opcao 2", url: "https://s.shopee.com.br/50TbdBWPbN" }
        ]
      },
      {
        id: "coz-tacas-agua",
        name: "Tacas para agua",
        description: "Jogo de tacas para agua.",
        image: IMG.cozinha,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/AABgqU9gY7" }]
      },
      {
        id: "coz-lixo-grande",
        name: "Lixo grande cozinha",
        description: "Lixeira grande para cozinha.",
        image: IMG.cozinha,
        links: [{ label: "Amazon", url: "https://a.co/d/09MRTp7g" }]
      },
      {
        id: "coz-lixo-pequeno-bege",
        name: "Lixo pequeno cozinha bege",
        description: "Lixeira pequena para pia/apoio.",
        image: IMG.cozinha,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/qe1l88ZFz" }]
      },
      {
        id: "coz-multiprocessador",
        name: "Multiprocessador",
        description: "Item solicitado (link em breve).",
        image: IMG.cozinha,
        split: { totalParts: 10 },
        links: []
      },
      {
        id: "coz-liquidificador-multiprocessador",
        name: "Liquidificador multiprocessador",
        description: "Versao 2 em 1.",
        image: IMG.cozinha,
        split: { totalParts: 10 },
        links: [{ label: "Amazon", url: "https://a.co/d/0hgUmJ5L" }]
      }
    ]
  },
  {
    id: "limpeza",
    title: "Limpeza e Lavanderia",
    icon: "fa-pump-soap",
    items: [
      {
        id: "lim-aspirador",
        name: "Aspirador",
        description: "Item solicitado (link em breve).",
        image: IMG.limpeza,
        split: { totalParts: 10 },
        links: []
      },
      {
        id: "lim-aspirador-philco",
        name: "Aspirador de po Philco",
        description: "Opcao de aspirador para casa.",
        image: IMG.limpeza,
        split: { totalParts: 10 },
        links: [{ label: "Mercado Livre", url: "https://mercadolivre.com/sec/2xAszsc" }]
      },
      {
        id: "lim-vassoura-cabo",
        name: "Vassoura com cabo",
        description: "Vassoura para limpeza geral.",
        image: IMG.limpeza,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/AKV1owopVd" }]
      },
      {
        id: "lim-rodo",
        name: "Rodo",
        description: "Rodo para piso.",
        image: IMG.limpeza,
        links: [{ label: "Mercado Livre", url: "https://mercadolivre.com/sec/2yywKzQ" }]
      },
      {
        id: "lim-dispenser-lavanderia",
        name: "Kit 3 dispenser lavanderia",
        description: "Dispenser para sabao/amaciante.",
        image: IMG.limpeza,
        links: [{ label: "Shopee", url: "https://s.shopee.com.br/8AQYKWpxup" }]
      },
      {
        id: "lim-pano-microfibra",
        name: "Pano microfibra",
        description: "Pano para limpeza delicada.",
        image: IMG.limpeza,
        links: [{ label: "Amazon", url: "https://a.co/d/00IiT2e2" }]
      },
      {
        id: "lim-pano-chao",
        name: "Pano de chao",
        description: "Pano para limpeza pesada.",
        image: IMG.limpeza,
        links: [{ label: "Amazon", url: "https://a.co/d/0gVQo7Pz" }]
      },
      {
        id: "lim-pazinha",
        name: "Pazinha",
        description: "Pazinha para coleta de sujeira.",
        image: IMG.limpeza,
        links: [{ label: "Mercado Livre", url: "https://mercadolivre.com/sec/1aLTawP" }]
      }
    ]
  },
  {
    id: "banheiro",
    title: "Banheiro",
    icon: "fa-bath",
    items: [
      {
        id: "ban-chuveiro-eletrico",
        name: "Chuveiro eletrico",
        description: "Ducha eletrica para banheiro.",
        image: IMG.banheiro,
        split: { totalParts: 10 },
        links: [
          { label: "Amazon", url: "https://a.co/d/0fASNxU0" },
          {
            label: "Magalu - Lorenzetti",
            url: "https://m.magazineluiza.com.br/ducha-fashion-220v-6800w-branco-lorenzetti/p/ehkcjc9h3d/cj/duxx/?partner_id=64853&utm_source=pdp_desk&utm_medium=share"
          }
        ]
      },
      {
        id: "ban-toalha-rosto-buddemeyer",
        name: "Toalha de rosto Buddemeyer",
        description: "Toalha de rosto de boa qualidade.",
        image: IMG.banheiro,
        links: [{ label: "Mercado Livre", url: "https://mercadolivre.com/sec/1zMgseM" }]
      },
      {
        id: "ban-lixeira-12l-inox",
        name: "Lixeira banheiro 12L inox",
        description: "Lixeira inox para banheiro.",
        image: IMG.banheiro,
        links: [{ label: "Amazon", url: "https://a.co/d/06eELxlv" }]
      },
      {
        id: "ban-kit-tapetes",
        name: "Kit tapetes de banheiro",
        description: "Conjunto de tapetes para banheiro.",
        image: IMG.banheiro,
        links: [
          { label: "Mercado Livre - Opcao 1", url: "https://mercadolivre.com/sec/1jLYWM8" },
          { label: "Mercado Livre - Opcao 2", url: "https://mercadolivre.com/sec/1LMBWVz" },
          { label: "Mercado Livre - Opcao 3", url: "https://mercadolivre.com/sec/25t5opF" }
        ]
      }
    ]
  },
  {
    id: "quarto",
    title: "Quarto",
    icon: "fa-bed",
    items: [
      {
        id: "qua-kit-casal-4pecas-cor-lisa",
        name: "Kit casal 4 pecas cor lisa",
        description: "Conjunto para cama de casal (link em breve).",
        image: IMG.quarto,
        links: []
      },
      {
        id: "qua-kit-casal-4pecas",
        name: "Kit casal 4 pecas",
        description: "Outra opcao de kit de cama casal (link em breve).",
        image: IMG.quarto,
        links: []
      }
    ]
  }
];

const STORAGE_KEY = "cha_panela_reservados";
const SPLIT_STORAGE_KEY = "cha_panela_cotas";

let reservedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let splitItems = JSON.parse(localStorage.getItem(SPLIT_STORAGE_KEY) || "{}");
let currentItemId = null;
let modalSplitSelected = 0;

const modal = document.getElementById("item-modal");
const modalTitle = document.getElementById("item-modal-title");
const modalDescription = document.getElementById("item-modal-description");
const modalImage = document.getElementById("item-modal-image");
const modalLinks = document.getElementById("item-modal-links");
const modalReserveButton = document.getElementById("item-modal-reserve");

const modalSplit = document.getElementById("item-modal-split");
const splitCaption = document.getElementById("item-split-caption");
const splitBoxes = document.getElementById("item-split-boxes");
const splitSelected = document.getElementById("split-selected");
const splitMinus = document.getElementById("split-minus");
const splitPlus = document.getElementById("split-plus");
const splitSave = document.getElementById("split-save");
const splitFull = document.getElementById("split-full");
const navToggle = document.getElementById("nav-toggle");
const drawer = document.getElementById("section-drawer");
const drawerClose = document.getElementById("drawer-close");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const sectionNavLinks = document.getElementById("section-nav-links");
const welcomeButtons = document.getElementById("welcome-buttons");

const itemMap = categories.flatMap((c) => c.items).reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

function getSplitTotal(item) {
  return item?.split?.totalParts || 0;
}

function getSplitFilled(itemId) {
  return Number(splitItems[itemId] || 0);
}

function isSplitItem(item) {
  return getSplitTotal(item) > 0;
}

function isReserved(item) {
  if (isSplitItem(item)) return getSplitFilled(item.id) >= getSplitTotal(item);
  return reservedItems[item.id] === true;
}

function saveStates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservedItems));
  localStorage.setItem(SPLIT_STORAGE_KEY, JSON.stringify(splitItems));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function updateRegularReserveButton(item) {
  const reserved = isReserved(item);
  modalReserveButton.className = `btn-reserve ${reserved ? "release" : "reserve"}`;
  modalReserveButton.innerHTML = `<i class="fa-solid ${reserved ? "fa-rotate-left" : "fa-calendar-check"} me-2"></i>${
    reserved ? "Liberar item" : "Reservar item"
  }`;
}

function toggleRegularReservation(item) {
  reservedItems[item.id] = !isReserved(item);
  if (!reservedItems[item.id]) delete reservedItems[item.id];
  saveStates();
  renderGiftSections();
  if (currentItemId === item.id) updateRegularReserveButton(item);
}

function setSplitValue(item, value) {
  const total = getSplitTotal(item);
  const finalValue = clamp(value, 0, total);
  if (finalValue === 0) delete splitItems[item.id];
  else splitItems[item.id] = finalValue;
  saveStates();
}

function buildLinksHtml(links) {
  if (!links || links.length === 0) {
    return `<div class="item-link"><i class="fa-solid fa-hourglass-half"></i> Link em breve</div>`;
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

function renderSplitBoxes(item, previewValue) {
  const total = getSplitTotal(item);
  const filled = getSplitFilled(item.id);
  splitBoxes.innerHTML = Array.from({ length: total })
    .map((_, i) => {
      const isFilled = i < filled;
      const isPreview = i < previewValue;
      return `<span class="split-box ${isFilled ? "is-filled" : ""} ${isPreview ? "is-preview" : ""}"></span>`;
    })
    .join("");
}

function updateSplitUi(item) {
  const total = getSplitTotal(item);
  const filled = getSplitFilled(item.id);
  modalSplitSelected = clamp(modalSplitSelected, 0, total);

  splitCaption.textContent = `Item divisivel em ${total} cotas (${Math.round(
    100 / total
  )}% cada). Reservado quando completar ${total}/${total}.`;
  splitSelected.textContent = `${modalSplitSelected} cota(s) (${Math.round(
    (modalSplitSelected / total) * 100
  )}%)`;
  renderSplitBoxes(item, modalSplitSelected);

  splitMinus.disabled = modalSplitSelected <= 0;
  splitPlus.disabled = modalSplitSelected >= total;
  splitSave.textContent = `Salvar ${modalSplitSelected} cota(s)`;
  splitFull.textContent = "Pagar 100%";

  if (filled >= total) {
    splitCaption.textContent = `Item completo (${total}/${total}) - Reservado.`;
  }
}

function openItemModal(itemId) {
  const item = itemMap[itemId];
  if (!item) return;

  currentItemId = itemId;
  modalTitle.textContent = item.name;
  modalDescription.textContent = item.description || "Sem descricao.";
  modalImage.src = item.image;
  modalImage.alt = item.name;
  modalLinks.innerHTML = buildLinksHtml(item.links);

  if (isSplitItem(item)) {
    modalReserveButton.hidden = true;
    modalSplit.hidden = false;
    modalSplitSelected = getSplitFilled(item.id);
    updateSplitUi(item);
  } else {
    modalSplit.hidden = true;
    modalReserveButton.hidden = false;
    updateRegularReserveButton(item);
  }

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

function reserveTagText(item) {
  if (!isSplitItem(item)) return isReserved(item) ? "Reservado" : "Disponivel";
  const total = getSplitTotal(item);
  const filled = getSplitFilled(item.id);
  return filled >= total ? "Reservado" : `${filled}/${total} cotas`;
}

function reserveTagIcon(item) {
  if (!isSplitItem(item)) return isReserved(item) ? "fa-lock" : "fa-gift";
  return isReserved(item) ? "fa-lock" : "fa-puzzle-piece";
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
  const sectionsHtml = categories
    .map(
      (category) => `
      <button class="section-link" type="button" data-go-section="${category.id}">
        <i class="fa-solid ${category.icon}"></i> ${category.title}
      </button>`
    )
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

function renderGiftSections() {
  const container = document.getElementById("gift-sections");
  container.innerHTML = categories
    .map(
      (category) => `
      <section id="${category.id}" class="gift-group">
        <h2 class="group-title"><i class="fa-solid ${category.icon}"></i>${category.title}</h2>
        <div class="row g-4">
          ${category.items
            .map((item) => {
              const reserved = isReserved(item);
              const splitItem = isSplitItem(item);
              const total = getSplitTotal(item);
              const filled = getSplitFilled(item.id);
              return `
                <div class="col-sm-6 col-lg-3">
                  <article class="gift-card ${reserved ? "reserved" : ""}" data-open-item="${item.id}">
                    <div class="gift-image-wrap">
                      <img class="gift-image" src="${item.image}" alt="${item.name}" />
                      <span class="reserve-tag">
                        <i class="fa-solid ${reserveTagIcon(item)}"></i>${reserveTagText(item)}
                      </span>
                    </div>
                    <div class="gift-body">
                      <h3 class="gift-title">${item.name}</h3>
                      <p class="gift-description">${item.description}</p>
                      ${
                        splitItem
                          ? `<p class="split-line">Cotas: <strong>${filled}/${total}</strong> (${Math.round(
                              (filled / total) * 100
                            )}%)</p>
                             <button class="btn-reserve reserve" data-open="${item.id}">
                               <i class="fa-solid fa-layer-group me-2"></i>Escolher cotas
                             </button>`
                          : `<button class="btn-reserve ${reserved ? "release" : "reserve"}" data-reserve="${item.id}">
                               <i class="fa-solid ${reserved ? "fa-rotate-left" : "fa-calendar-check"} me-2"></i>${
                               reserved ? "Liberar item" : "Reservar item"
                             }
                             </button>`
                      }
                    </div>
                  </article>
                </div>`;
            })
            .join("")}
        </div>
      </section>`
    )
    .join("");

  container.querySelectorAll("[data-open-item], [data-open]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = el.dataset.openItem || el.dataset.open;
      openItemModal(id);
    });
  });

  container.querySelectorAll("[data-reserve]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const item = itemMap[btn.dataset.reserve];
      if (!item) return;
      toggleRegularReservation(item);
    });
  });
}

modalReserveButton.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || isSplitItem(item)) return;
  toggleRegularReservation(item);
});

splitMinus.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || !isSplitItem(item)) return;
  modalSplitSelected = clamp(modalSplitSelected - 1, 0, getSplitTotal(item));
  updateSplitUi(item);
});

splitPlus.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || !isSplitItem(item)) return;
  modalSplitSelected = clamp(modalSplitSelected + 1, 0, getSplitTotal(item));
  updateSplitUi(item);
});

splitSave.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || !isSplitItem(item)) return;
  setSplitValue(item, modalSplitSelected);
  renderGiftSections();
  updateSplitUi(item);
});

splitFull.addEventListener("click", () => {
  const item = itemMap[currentItemId];
  if (!item || !isSplitItem(item)) return;
  modalSplitSelected = getSplitTotal(item);
  setSplitValue(item, modalSplitSelected);
  renderGiftSections();
  updateSplitUi(item);
});

modal.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeItemModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeItemModal();
  if (event.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
});

renderGiftSections();
buildNavigationUi();

navToggle.addEventListener("click", () => {
  if (drawer.classList.contains("is-open")) closeDrawer();
  else openDrawer();
});

drawerClose.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);
