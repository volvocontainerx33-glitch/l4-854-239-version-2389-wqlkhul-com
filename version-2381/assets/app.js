(function () {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    const toggle = qs("[data-menu-toggle]");
    const nav = qs("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    const slides = qsa("[data-hero-slide]", slider);
    const dots = qsa("[data-hero-dot]", slider);
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function start() {
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    start();
  }

  function initLocalFilter() {
    const input = qs("[data-local-search]");
    const cards = qsa("[data-card]");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", () => {
      const key = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = `${card.getAttribute("data-title") || ""} ${card.getAttribute("data-meta") || ""}`.toLowerCase();
        card.style.display = !key || haystack.includes(key) ? "" : "none";
      });
    });
  }

  function initSearch() {
    const input = qs("[data-search-input]");
    const type = qs("[data-search-type]");
    const results = qs("[data-search-results]");
    if (!input || !results || !window.searchItems) {
      return;
    }

    function card(item) {
      const tags = (item.tags || [])
        .slice(0, 3)
        .map((tag) => `<span>${escapeHTML(tag)}</span>`)
        .join("");
      return `<article class="movie-card" data-card>
  <a class="movie-poster" href="./${escapeHTML(item.file)}" aria-label="${escapeHTML(item.title)}">
    <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy">
    <span class="poster-type">${escapeHTML(item.type)}</span>
  </a>
  <div class="movie-card-body">
    <div class="movie-meta-line">
      <span>${escapeHTML(item.region)}</span>
      <span>${escapeHTML(item.year)}</span>
    </div>
    <h3><a href="./${escapeHTML(item.file)}">${escapeHTML(item.title)}</a></h3>
    <p>${escapeHTML(item.oneLine)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
    }

    function render() {
      const key = input.value.trim().toLowerCase();
      const typeValue = type ? type.value : "";
      const list = window.searchItems.filter((item) => {
        const typeOk = !typeValue || String(item.type || "").includes(typeValue);
        const haystack = [item.title, item.region, item.year, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(" ")]
          .join(" ")
          .toLowerCase();
        return typeOk && (!key || haystack.includes(key));
      });
      const limited = list.slice(0, 120);
      results.innerHTML = limited.length ? limited.map(card).join("") : "<div class=\"empty-state\">没有找到匹配影片</div>";
    }

    input.addEventListener("input", render);
    if (type) {
      type.addEventListener("change", render);
    }
    render();
  }

  function initPlayer() {
    const video = qs("[data-player]");
    const button = qs("[data-play]");
    if (!video || !button) {
      return;
    }
    const stream = video.getAttribute("data-stream");
    let ready = false;
    let hls = null;

    function playVideo() {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    }

    function loadAndPlay() {
      if (!stream) {
        return;
      }
      button.classList.add("is-hidden");
      video.controls = true;
      if (ready) {
        playVideo();
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = stream;
        playVideo();
      }
    }

    button.addEventListener("click", loadAndPlay);
    video.addEventListener("click", () => {
      if (!ready || video.paused) {
        loadAndPlay();
      }
    });
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initHero();
    initLocalFilter();
    initSearch();
    initPlayer();
  });
})();
