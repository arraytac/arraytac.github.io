function padNumber(value) {
  return String(value).padStart(2, "0");
}

function getImagePath(folder, index) {
  return `./assets/gallery/${folder}/${folder}-${padNumber(index)}.png`;
}

function initializeViewer(viewer) {
  const folder = viewer.dataset.galleryFolder || "";
  const title = viewer.dataset.galleryTitle || "";
  const count = Number.parseInt(viewer.dataset.galleryCount || "0", 10);
  const image = viewer.querySelector("[data-gallery-image]");
  const previousButton = viewer.querySelector("[data-gallery-prev]");
  const nextButton = viewer.querySelector("[data-gallery-next]");
  const dotsContainer = viewer.querySelector("[data-gallery-dots]");

  let currentIndex = 1;
  const visibleDotCount = 5;

  if (count <= 0) {
    return;
  }

  function normalizeIndex(index) {
    return ((index - 1 + count) % count) + 1;
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
    image.src = getImagePath(folder, currentIndex);
    image.alt = `${title} ${padNumber(currentIndex)}`;
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
