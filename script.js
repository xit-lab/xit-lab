const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const pageViews = Array.from(document.querySelectorAll(".page-view"));
const pageLinks = Array.from(document.querySelectorAll(".nav-links a"));
const pageJumpLinks = Array.from(document.querySelectorAll("[data-page-link]"));
const newsItems = Array.from(document.querySelectorAll(".news-item"));
const newsToggle = document.querySelector(".news-toggle");
const projectItems = Array.from(document.querySelectorAll(".project-card"));
const projectToggle = document.querySelector(".project-toggle");
const pubPanels = Array.from(document.querySelectorAll(".pub-panel"));
const pubToggle = document.querySelector(".pub-toggle");
const mediaModal = document.querySelector("#media-modal");
const mediaModalVisual = document.querySelector(".media-modal-visual");
const mediaModalImage = document.querySelector("#media-modal-image");
const mediaModalTitle = document.querySelector("#media-modal-title");
const mediaModalDescription = document.querySelector("#media-modal-description");
const mediaModalClose = document.querySelector(".media-modal-close");

const pageIds = new Set(["home", "research", "publications", "people", "gallery", "contact"]);
let currentNewsFilter = "latest";
let newsExpanded = false;
let projectsExpanded = false;
let publicationsExpanded = false;
const itemAnimationTimers = new WeakMap();
let modalAlbumSwipeCleanup = null;

function normalizePage(hash) {
  const page = String(hash || "").replace("#", "") || "home";
  return pageIds.has(page) ? page : "home";
}

function setPage(page, shouldPush = true) {
  pageViews.forEach((section) => {
    section.hidden = section.dataset.page !== page;
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("is-active", normalizePage(link.getAttribute("href")) === page);
  });

  if (navLinks && navToggle) {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (shouldPush) {
    history.pushState({ page }, "", `#${page}`);
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setPage(normalizePage(link.getAttribute("href")));
  });
});

pageJumpLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setPage(normalizePage(link.getAttribute("href")));
  });
});

window.addEventListener("popstate", () => setPage(normalizePage(location.hash), false));

function enhanceHomeAlbum() {
  const album = document.querySelector(".home-album");
  if (!album) return;

  const slides = Array.from(album.querySelectorAll(".album-slide"));
  const dots = album.querySelector(".album-dots");
  const prev = album.querySelector("[data-album-prev]");
  const next = album.querySelector("[data-album-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let albumTimer = 0;

  if (slides.length <= 1) {
    prev?.setAttribute("hidden", "");
    next?.setAttribute("hidden", "");
    dots?.setAttribute("hidden", "");
    return;
  }

  const dotButtons = slides.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "album-dot";
    button.setAttribute("aria-label", `Show photo ${index + 1}`);
    button.addEventListener("click", () => {
      showSlide(index);
      startAlbumTimer();
    });
    dots?.appendChild(button);
    return button;
  });

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function stopAlbumTimer() {
    if (!albumTimer) return;
    window.clearInterval(albumTimer);
    albumTimer = 0;
  }

  function startAlbumTimer() {
    stopAlbumTimer();
    if (prefersReducedMotion) return;
    albumTimer = window.setInterval(() => showSlide(activeIndex + 1), 4800);
  }

  prev?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAlbumTimer();
  });

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAlbumTimer();
  });

  album.addEventListener("mouseenter", stopAlbumTimer);
  album.addEventListener("mouseleave", startAlbumTimer);
  album.addEventListener("focusin", stopAlbumTimer);
  album.addEventListener("focusout", startAlbumTimer);

  showSlide(activeIndex);
  startAlbumTimer();
}

function enhanceGalleryAlbums() {
  document.querySelectorAll("[data-gallery-album]").forEach((album) => {
    const card = album.closest(".gallery-card");
    const slides = Array.from(album.querySelectorAll(".gallery-album-slide"));
    const dots = card?.querySelector(".gallery-album-dots");
    const prev = card?.querySelector("[data-gallery-prev]");
    const next = card?.querySelector("[data-gallery-next]");
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    if (slides.length <= 1) {
      prev?.setAttribute("hidden", "");
      next?.setAttribute("hidden", "");
      dots?.setAttribute("hidden", "");
      return;
    }

    const dotButtons = slides.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-album-dot";
      button.setAttribute("aria-label", `Show gallery photo ${index + 1}`);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        showSlide(index);
      });
      dots?.appendChild(button);
      return button;
    });

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      dotButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    prev?.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(activeIndex - 1);
    });

    next?.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(activeIndex + 1);
    });

    if (supportsSwipeNavigation()) {
      bindSwipeNavigation(album, {
        previous() {
          showSlide(activeIndex - 1);
        },
        next() {
          showSlide(activeIndex + 1);
        },
        onSwipe() {
          if (!card) return;
          card.dataset.albumSwiped = "true";
          window.setTimeout(() => {
            delete card.dataset.albumSwiped;
          }, 350);
        },
      });
    }

    showSlide(activeIndex);
  });
}

function supportsSwipeNavigation() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function bindSwipeNavigation(target, handlers) {
  if (!target) return () => {};

  let startX = 0;
  let startY = 0;
  let activePointerId = null;
  const minDistance = 42;

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target?.closest?.("button, a, input, textarea, select, [role='button']")) return;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    target.setPointerCapture?.(event.pointerId);
  }

  function onPointerUp(event) {
    if (activePointerId !== event.pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const isHorizontalSwipe = Math.abs(deltaX) >= minDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    activePointerId = null;

    if (!isHorizontalSwipe) return;
    event.preventDefault();
    event.stopPropagation();
    if (deltaX < 0) {
      handlers.next?.();
    } else {
      handlers.previous?.();
    }
    handlers.onSwipe?.();
  }

  function onPointerCancel() {
    activePointerId = null;
  }

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);

  return () => {
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerCancel);
  };
}

function dateScore(item) {
  const time = item.querySelector("time")?.textContent || "";
  const match = time.match(/(\d{4})\D+(\d{1,2})/);
  if (!match) return 0;
  return Number(match[1]) * 100 + Number(match[2]);
}

function sortNews() {
  const list = document.querySelector(".news-list");
  if (!list) return;
  newsItems
    .sort((a, b) => dateScore(b) - dateScore(a))
    .forEach((item) => list.appendChild(item));
}

function revealItem(item) {
  const timer = itemAnimationTimers.get(item);
  if (timer) window.clearTimeout(timer);
  itemAnimationTimers.delete(item);
  item.classList.remove("is-collapsing", "is-hidden", "is-revealing", "is-visible");
  item.style.removeProperty("--collapse-height");
  item.hidden = false;
  item.classList.add("is-revealing");
  requestAnimationFrame(() => item.classList.add("is-visible"));
  const revealTimer = window.setTimeout(() => {
    item.classList.remove("is-revealing", "is-visible");
    itemAnimationTimers.delete(item);
  }, 360);
  itemAnimationTimers.set(item, revealTimer);
}

function collapseItem(item) {
  if (item.hidden) return;

  const timer = itemAnimationTimers.get(item);
  if (timer) window.clearTimeout(timer);
  itemAnimationTimers.delete(item);

  item.classList.remove("is-revealing", "is-visible");
  item.style.setProperty("--collapse-height", `${item.getBoundingClientRect().height}px`);
  item.classList.add("is-collapsing");
  item.hidden = false;

  requestAnimationFrame(() => item.classList.add("is-hidden"));

  const collapseTimer = window.setTimeout(() => {
    item.hidden = true;
    item.classList.remove("is-collapsing", "is-hidden");
    item.style.removeProperty("--collapse-height");
    itemAnimationTimers.delete(item);
  }, 360);
  itemAnimationTimers.set(item, collapseTimer);
}

function setItemVisibility(item, shouldShow, animate = false) {
  if (shouldShow) {
    if (item.hidden && animate) {
      revealItem(item);
    } else {
      item.hidden = false;
    }
    return;
  }

  if (animate) {
    collapseItem(item);
  } else {
    const timer = itemAnimationTimers.get(item);
    if (timer) window.clearTimeout(timer);
    itemAnimationTimers.delete(item);
    item.classList.remove("is-revealing", "is-visible", "is-collapsing", "is-hidden");
    item.style.removeProperty("--collapse-height");
    item.hidden = true;
  }
}

function applyNewsFilter(filter) {
  currentNewsFilter = filter || "latest";
  newsExpanded = false;
  renderNews(false);
}

function renderNews(animate = false) {
  const candidates =
    currentNewsFilter === "latest"
      ? newsItems
      : newsItems.filter((item) => item.dataset.category === currentNewsFilter);

  const visible = new Set(newsExpanded ? candidates : candidates.slice(0, 5));
  newsItems.forEach((item) => {
    setItemVisibility(item, visible.has(item), animate);
  });

  document.querySelectorAll("[data-news-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.newsFilter === currentNewsFilter);
  });

  if (newsToggle) {
    newsToggle.hidden = candidates.length <= 5;
    newsToggle.textContent = newsExpanded ? "Show less" : "Show all";
    newsToggle.setAttribute("aria-expanded", String(newsExpanded));
  }
}

document.querySelectorAll("[data-news-filter]").forEach((button) => {
  button.addEventListener("click", () => applyNewsFilter(button.dataset.newsFilter || "latest"));
});

if (newsToggle) {
  newsToggle.addEventListener("click", () => {
    newsExpanded = !newsExpanded;
    renderNews(true);
  });
}

function renderProjects(animate = false) {
  const visible = new Set(projectsExpanded ? projectItems : projectItems.slice(0, 5));
  projectItems.forEach((item) => setItemVisibility(item, visible.has(item), animate));

  if (projectToggle) {
    projectToggle.hidden = projectItems.length <= 5;
    projectToggle.textContent = projectsExpanded ? "Show less" : "Show all";
    projectToggle.setAttribute("aria-expanded", String(projectsExpanded));
  }
}

if (projectToggle) {
  projectToggle.addEventListener("click", () => {
    projectsExpanded = !projectsExpanded;
    renderProjects(true);
  });
}

function activePubPanel() {
  return pubPanels.find((panel) => !panel.hidden) || pubPanels[0];
}

function renderPublications(animate = false) {
  const panel = activePubPanel();
  if (!panel) return;

  const publications = Array.from(panel.querySelectorAll(".publication"));
  const visible = new Set(publicationsExpanded ? publications : publications.slice(0, 5));
  publications.forEach((item) => setItemVisibility(item, visible.has(item), animate));

  if (pubToggle) {
    pubToggle.hidden = publications.length <= 5;
    pubToggle.textContent = publicationsExpanded ? "Show less" : "Show all";
    pubToggle.setAttribute("aria-expanded", String(publicationsExpanded));
  }
}

document.querySelectorAll("[data-pub-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.pubTab;
    publicationsExpanded = false;
    document.querySelectorAll("[data-pub-tab]").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    document.querySelectorAll(".pub-panel").forEach((panel) => {
      panel.hidden = panel.id !== target;
    });
    renderPublications(false);
  });
});

if (pubToggle) {
  pubToggle.addEventListener("click", () => {
    publicationsExpanded = !publicationsExpanded;
    renderPublications(true);
  });
}

function enhanceNewsCards() {
  newsItems.forEach((item) => item.classList.remove("has-card-links"));
}

function enhancePublicationLinks() {
  document.querySelectorAll(".publication .link-pill").forEach((link) => {
    const publication = link.closest(".publication");
    if (!publication || publication.dataset.publicationEnhanced) return;

    const href = link.href;
    const title = publication.querySelector("h3");
    if (!title) return;

    publication.dataset.publicationEnhanced = "true";
    link.remove();

    const inlineLink = document.createElement("a");
    inlineLink.className = "publication-title-link";
    inlineLink.href = href;
    inlineLink.target = "_blank";
    inlineLink.rel = "noopener";
    inlineLink.textContent = "[link]";
    inlineLink.setAttribute("aria-label", `Open ${title.textContent.trim()}`);
    title.append(" ", inlineLink);
  });
}

function splitPersonNames() {
  document.querySelectorAll(".person-card h3").forEach((heading) => {
    if (heading.querySelector(".person-name-en")) return;

    const name = heading.textContent.replace(/\s+/g, " ").trim();
    heading.dataset.fullName = name;
    const koreanIndex = name.search(/[가-힣]/);
    const englishName = koreanIndex === -1 ? name : name.slice(0, koreanIndex).trim();
    const koreanName = koreanIndex === -1 ? "" : name.slice(koreanIndex).trim();

    const englishSpan = document.createElement("span");
    englishSpan.className = "person-name-en";
    englishSpan.textContent = englishName;

    if (!koreanName) {
      heading.replaceChildren(englishSpan);
      return;
    }

    const koreanSpan = document.createElement("span");
    koreanSpan.className = "person-name-ko";
    koreanSpan.textContent = koreanName;
    heading.replaceChildren(englishSpan, koreanSpan);
  });
}

function getPersonCardName(card) {
  const heading = card.querySelector("h3");
  return heading?.dataset.fullName || heading?.textContent.trim() || "";
}

function normalizeCareerEntries() {
  const careerPattern = /^(\d{4}(?:\.\d{2})?\s*-\s*(?:Present|\d{4}(?:\.\d{2})?)):\s*(.+)$/;

  document.querySelectorAll(".person-meta li").forEach((item) => {
    let period = item.querySelector(".career-period");
    let detail = item.querySelector(".career-detail");

    if (!period && !detail) {
      const match = item.textContent.replace(/\s+/g, " ").trim().match(careerPattern);
      if (!match) return;

      period = document.createElement("span");
      period.className = "career-period";
      period.textContent = `${match[1]}:`;

      detail = document.createElement("span");
      detail.className = "career-detail";
      detail.textContent = match[2];

      item.textContent = "";
      item.append(period, detail);
    }

    if (!detail || detail.dataset.careerFormatted === "true") return;
    detail.textContent = detail.textContent.replace(/\s+/g, " ").trim();
    detail.dataset.careerFormatted = "true";
  });
}

function renderPersonEmails() {
  document.querySelectorAll(".person-card a[href^='mailto:']").forEach((link) => {
    const personBody = link.closest(".person-body");
    if (!personBody) return;

    const address = link.getAttribute("href").replace(/^mailto:/, "");
    const email = document.createElement("p");
    email.className = "person-email";
    email.innerHTML = `<strong>Email</strong> <a href="mailto:${address}">${address}</a>`;
    personBody.appendChild(email);

    const row = link.closest(".button-row");
    link.remove();
    if (row && !row.querySelector("a")) row.remove();
  });
}

function imageSource(image) {
  return image?.currentSrc || image?.src || "";
}

function clearModalAlbumControls() {
  modalAlbumSwipeCleanup?.();
  modalAlbumSwipeCleanup = null;
  mediaModal?.classList.remove("is-gallery-album-modal");
  mediaModal?.querySelectorAll(".modal-album-button, .modal-album-dots").forEach((item) => item.remove());
}

function setModalImage(image, fallbackTitle) {
  mediaModalImage.src = imageSource(image);
  mediaModalImage.alt = image?.alt || fallbackTitle || "Image preview";
}

function cardDescription(card) {
  const metaParts = Array.from(card.querySelectorAll(".memory-meta span"))
    .map((span) => span.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (metaParts.length) return metaParts.join(" · ");
  return card.querySelector("p")?.textContent.replace(/\s+/g, " ").trim() || "";
}

function enableModalAlbum(images, initialIndex, fallbackTitle) {
  if (!mediaModal || !mediaModalVisual || images.length <= 1) return;

  mediaModal.classList.add("is-gallery-album-modal");
  let activeIndex = Math.max(0, initialIndex);

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "modal-album-button modal-album-button-prev";
  prev.setAttribute("aria-label", "Previous photo");
  prev.textContent = "‹";

  const next = document.createElement("button");
  next.type = "button";
  next.className = "modal-album-button modal-album-button-next";
  next.setAttribute("aria-label", "Next photo");
  next.textContent = "›";

  const dots = document.createElement("div");
  dots.className = "modal-album-dots";
  dots.setAttribute("aria-label", "Preview photo selector");

  const dotButtons = images.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modal-album-dot";
    button.setAttribute("aria-label", `Show photo ${index + 1}`);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showImage(index);
    });
    dots.appendChild(button);
    return button;
  });

  function showImage(index) {
    activeIndex = (index + images.length) % images.length;
    setModalImage(images[activeIndex], fallbackTitle);
    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  prev.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showImage(activeIndex - 1);
  });
  next.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showImage(activeIndex + 1);
  });
  if (supportsSwipeNavigation()) {
    modalAlbumSwipeCleanup = bindSwipeNavigation(mediaModalVisual, {
      previous() {
        showImage(activeIndex - 1);
      },
      next() {
        showImage(activeIndex + 1);
      },
    });
  }

  mediaModalVisual.append(prev, next, dots);
  showImage(activeIndex);
}

function openMediaPreview(card) {
  if (!mediaModal || !mediaModalImage || !mediaModalTitle || !mediaModalDescription) return;

  clearModalAlbumControls();
  mediaModal.classList.remove("is-person-modal");
  const albumImages = Array.from(card.querySelectorAll(".gallery-album-slide img"));
  const activeAlbumImage = card.querySelector(".gallery-album-slide.is-active img");
  const image = activeAlbumImage || albumImages[0] || card.querySelector("img");
  const initialIndex = Math.max(0, albumImages.indexOf(image));
  const title = card.querySelector("h3")?.textContent.trim() || image?.alt || "Image preview";
  const description = cardDescription(card) || image?.alt || "";

  setModalImage(image, title);
  mediaModalTitle.textContent = title;
  mediaModalDescription.textContent = description;
  enableModalAlbum(albumImages, initialIndex, title);
  mediaModal.hidden = false;
  mediaModalClose?.focus();
}

function openPersonPreview(card) {
  if (!mediaModal || !mediaModalImage || !mediaModalTitle || !mediaModalDescription) return;

  clearModalAlbumControls();
  mediaModal.classList.add("is-person-modal");
  const useMobileDetails = window.matchMedia("(max-width: 760px)").matches;
  const image = card.querySelector("img");
  const title = getPersonCardName(card) || image?.alt || "Member";
  const role = card.querySelector(".person-role")?.textContent.trim() || "";
  const metaItems = Array.from(card.querySelectorAll(".person-meta li")).map((item) => ({
    text: item.textContent.replace(/\s+/g, " ").trim(),
    period: item.querySelector(".career-period")?.textContent.replace(/\s+/g, " ").trim() || "",
    detail: (useMobileDetails && item.dataset.mobileDetail
      ? item.dataset.mobileDetail
      : item.querySelector(".career-detail")?.textContent
    )?.replace(/\s+/g, " ").trim() || ""
  }));
  const emailLink = card.querySelector(".person-email a[href^='mailto:']");
  const detailLinks = Array.from(card.querySelectorAll(".button-row a[href]"));

  setModalImage(image, title);
  mediaModalTitle.textContent = title;
  mediaModalDescription.innerHTML = "";

  if (role) {
    const roleLine = document.createElement("p");
    roleLine.className = "modal-role";
    roleLine.textContent = role;
    mediaModalDescription.appendChild(roleLine);
  }

  if (metaItems.length) {
    const list = document.createElement("ul");
    list.className = "modal-detail-list";
    metaItems.forEach(({ text, period, detail }) => {
      const item = document.createElement("li");
      if (period && detail) {
        item.className = "career-entry";
        const periodSpan = document.createElement("span");
        periodSpan.className = "career-period";
        periodSpan.textContent = period.endsWith(":") ? `${period} ` : period;
        const detailSpan = document.createElement("span");
        detailSpan.className = "career-detail";
        detailSpan.textContent = detail;
        item.append(periodSpan, detailSpan);
      } else {
        item.textContent = text;
      }
      list.appendChild(item);
    });
    mediaModalDescription.appendChild(list);
  }

  if (emailLink) {
    const email = document.createElement("p");
    email.className = "modal-email";
    const address = emailLink.textContent.trim();
    email.innerHTML = `<strong>Email</strong> <a href="mailto:${address}">${address}</a>`;
    mediaModalDescription.appendChild(email);
  }

  if (detailLinks.length) {
    const links = document.createElement("div");
    links.className = "modal-link-row";
    detailLinks.forEach((source) => {
      const link = document.createElement("a");
      link.className = "link-pill";
      link.href = source.href;
      link.target = source.target || "_blank";
      link.rel = source.rel || "noopener";
      link.textContent = source.textContent.trim() || "Open";
      links.appendChild(link);
    });
    mediaModalDescription.appendChild(links);
  }

  mediaModal.hidden = false;
  mediaModalClose?.focus();
}

function closeMediaPreview() {
  if (!mediaModal) return;
  clearModalAlbumControls();
  mediaModal.hidden = true;
}

function enhanceImageCards() {
  document.querySelectorAll(".research-card, .gallery-card").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${card.querySelector("h3")?.textContent.trim() || "image"}`);

    card.addEventListener("click", (event) => {
      if (event.target.closest(".gallery-album-button, .gallery-album-dot")) return;
      if (card.dataset.albumSwiped === "true") {
        delete card.dataset.albumSwiped;
        return;
      }
      openMediaPreview(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openMediaPreview(card);
    });
  });

  mediaModalClose?.addEventListener("click", closeMediaPreview);
  mediaModal?.addEventListener("click", (event) => {
    if (event.target === mediaModal) closeMediaPreview();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMediaPreview();
  });
}

function enhancePersonCards() {
  document.querySelectorAll(".person-card").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${getPersonCardName(card) || "member"} details`);

    card.addEventListener("click", () => openPersonPreview(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openPersonPreview(card);
    });
  });
}

function highlightLabAuthors() {
  const names = ["Hee-Youl Kwak", "Dae-Young Yun", "DaeYoung Yun", "Daeyoung Yun", "H.-Y. Kwak", "D.-Y. Yun"];
  const pattern = new RegExp(`(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");

  document.querySelectorAll(".pub-panel .publication p").forEach((paragraph) => {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        pattern.lastIndex = 0;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const parts = node.nodeValue.split(pattern);
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (names.includes(part)) {
          const strong = document.createElement("strong");
          strong.className = "lab-author";
          strong.textContent = part;
          fragment.appendChild(strong);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      });
      node.replaceWith(fragment);
    });
  });
}

function placeholderSvg(label, type) {
  const safeLabel = (label || "xIT Lab").replace(/[<>&"]/g, "");
  const initials = safeLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const isPerson = type === "person";
  const title = isPerson ? initials || "xIT" : safeLabel;
  const subtitle = isPerson ? safeLabel : "Image will be replaced with local source";

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="${isPerson ? 900 : 560}" viewBox="0 0 900 ${isPerson ? 900 : 560}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f7fbfa"/>
          <stop offset="0.55" stop-color="#dcefeb"/>
          <stop offset="1" stop-color="#d6e2c7"/>
        </linearGradient>
        <pattern id="grid" width="58" height="58" patternUnits="userSpaceOnUse">
          <path d="M58 0H0v58" fill="none" stroke="#0b7778" stroke-opacity="0.12" stroke-width="1"/>
          <circle cx="0" cy="0" r="2.2" fill="#0b7778" fill-opacity="0.18"/>
        </pattern>
      </defs>
      <rect width="900" height="${isPerson ? 900 : 560}" rx="0" fill="url(#bg)"/>
      <rect width="900" height="${isPerson ? 900 : 560}" fill="url(#grid)"/>
      <circle cx="740" cy="120" r="92" fill="#f3b23c" fill-opacity="0.22"/>
      <circle cx="170" cy="${isPerson ? 720 : 450}" r="120" fill="#008c8c" fill-opacity="0.12"/>
      <path d="M105 ${isPerson ? 610 : 365} C250 250, 430 ${isPerson ? 700 : 430}, 785 230" fill="none" stroke="#008c8c" stroke-opacity="0.34" stroke-width="6"/>
      <g font-family="Pretendard, Arial, sans-serif" text-anchor="middle">
        <text x="450" y="${isPerson ? 430 : 255}" fill="#17312e" font-size="${isPerson ? 118 : 38}" font-weight="850">${title}</text>
        <text x="450" y="${isPerson ? 495 : 310}" fill="#58706b" font-size="${isPerson ? 28 : 24}" font-weight="650">${subtitle}</text>
      </g>
    </svg>
  `)}`;
}

function stabilizeImages() {
  document.querySelectorAll('img[data-original-src*="googleusercontent.com/sitesv"], img[src*="googleusercontent.com/sitesv"]').forEach((img) => {
    const currentSrc = img.getAttribute("src") || "";
    if (!currentSrc.includes("googleusercontent.com") && !currentSrc.includes("placeholder-")) return;

    const type = img.closest(".person-card") ? "person" : "topic";
    img.src = type === "person" ? "assets/placeholder-person.png" : "assets/placeholder-topic.png";
    img.classList.add("placeholder-image");
  });
}

sortNews();
renderNews();
renderProjects();
enhanceHomeAlbum();
enhanceGalleryAlbums();
enhanceNewsCards();
enhancePublicationLinks();
splitPersonNames();
normalizeCareerEntries();
renderPersonEmails();
renderPublications();
highlightLabAuthors();
stabilizeImages();
enhanceImageCards();
enhancePersonCards();
setPage(normalizePage(location.hash), false);

