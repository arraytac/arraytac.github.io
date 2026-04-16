function padNumber(value) {
  return String(value).padStart(2, "0");
}

function getImagePath(folder, index, extension) {
  return `./assets/gallery/${folder}/${folder}-${padNumber(index)}.${extension}`;
}

function getImageCandidates(folder, index) {
  return ["webp", "png"].map((extension) => getImagePath(folder, index, extension));
}

function loadImageWithFallback(target, folder, index, onLoad) {
  const candidates = getImageCandidates(folder, index);
  const requestId = `${folder}-${index}-${Date.now()}-${Math.random()}`;
  let candidateIndex = 0;

  target.dataset.galleryRequestId = requestId;

  function tryNextCandidate() {
    if (candidateIndex >= candidates.length) {
      target.onerror = null;
      target.onload = null;
      return;
    }

    const nextSource = candidates[candidateIndex];
    candidateIndex += 1;
    target.src = nextSource;
  }

  target.onerror = () => {
    if (target.dataset.galleryRequestId !== requestId) {
      return;
    }
    tryNextCandidate();
  };

  target.onload = () => {
    if (target.dataset.galleryRequestId !== requestId) {
      return;
    }

    target.onerror = null;
    target.onload = null;

    if (typeof onLoad === "function") {
      onLoad();
    }
  };

  tryNextCandidate();
}

function preloadImage(folder, index, cache) {
  const normalizedIndex = String(index);
  const cacheKey = `${folder}-${normalizedIndex}`;

  if (cache.has(cacheKey)) {
    return;
  }

  const preloader = new Image();
  const candidates = getImageCandidates(folder, index);
  let candidateIndex = 0;

  cache.set(cacheKey, preloader);

  function tryNextCandidate() {
    if (candidateIndex >= candidates.length) {
      return;
    }

    preloader.src = candidates[candidateIndex];
    candidateIndex += 1;
  }

  preloader.onerror = tryNextCandidate;
  tryNextCandidate();
}

function initializeViewer(viewer) {
  const folder = viewer.dataset.galleryFolder || "";
  const title = viewer.dataset.galleryTitle || "";
  const count = Number.parseInt(viewer.dataset.galleryCount || "0", 10);
  const image = viewer.querySelector("[data-gallery-image]");
  const previousButton = viewer.querySelector("[data-gallery-prev]");
  const nextButton = viewer.querySelector("[data-gallery-next]");
  const dotsContainer = viewer.querySelector("[data-gallery-dots]");
  const preloadCache = new Map();

  let currentIndex = 1;
  const visibleDotCount = 5;

  if (count <= 0) {
    return;
  }

  image.decoding = "async";

  function normalizeIndex(index) {
    return ((index - 1 + count) % count) + 1;
  }

  function preloadAdjacentImages(index) {
    preloadImage(folder, normalizeIndex(index - 1), preloadCache);
    preloadImage(folder, normalizeIndex(index + 1), preloadCache);
  }

  function updateButtons() {
    const isSingleImage = count <= 1;
    previousButton.disabled = isSingleImage;
    nextButton.disabled = isSingleImage;
  }

  function updateDots() {
    dotsContainer.innerHTML = "";
    const windowSize = Math.min(visibleDotCount, count);
    const halfWindow = Math.floor(windowSize / 2);

    if (count <= visibleDotCount) {
      for (let index = 1; index <= count; index += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "gallery-dot";
        dot.dataset.galleryDot = String(index);
        dot.setAttribute("aria-label", `${title} image ${padNumber(index)}`);
        dot.classList.toggle("is-active", index === currentIndex);
        dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
        dot.addEventListener("click", () => renderImage(index));
        dotsContainer.appendChild(dot);
      }
      return;
    }

    for (let offset = -halfWindow; offset <= halfWindow; offset += 1) {
      const index = normalizeIndex(currentIndex + offset);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.dataset.galleryDot = String(index);
      dot.setAttribute("aria-label", `${title} image ${padNumber(index)}`);
      dot.classList.toggle("is-active", offset === 0);
      dot.setAttribute("aria-current", offset === 0 ? "true" : "false");
      dot.addEventListener("click", () => renderImage(index));
      dotsContainer.appendChild(dot);
    }
  }

  function renderImage(index) {
    currentIndex = normalizeIndex(index);
    image.alt = `${title} ${padNumber(currentIndex)}`;
    loadImageWithFallback(image, folder, currentIndex, () => {
      preloadAdjacentImages(currentIndex);
    });
    updateButtons();
    updateDots();
  }

  previousButton.addEventListener("click", () => renderImage(currentIndex - 1));
  nextButton.addEventListener("click", () => renderImage(currentIndex + 1));
  renderImage(1);
}

function initializeViewers() {
  document.querySelectorAll("[data-gallery-carousel]").forEach(initializeViewer);
}

document.addEventListener("DOMContentLoaded", initializeViewers);
