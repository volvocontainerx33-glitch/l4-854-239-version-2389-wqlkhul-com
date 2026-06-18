(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupRails() {
    document.querySelectorAll(".section-rail").forEach(function (section) {
      var rail = section.querySelector("[data-rail]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }
    function apply() {
      var q = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var regionOk = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
        var typeOk = !selectedType || normalize(card.getAttribute("data-type")).indexOf(selectedType) !== -1;
        var queryOk = !q || haystack.indexOf(q) !== -1;
        card.classList.toggle("is-hidden", !(regionOk && typeOk && queryOk));
      });
    }
    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function attachStream(video, source) {
    if (!source || video.dataset.ready === "true") {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = source;
    }
    video.dataset.ready = "true";
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream") || button.getAttribute("data-stream");
      function play() {
        attachStream(video, stream);
        wrap.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            wrap.classList.remove("is-playing");
          });
        }
      }
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
      wrap.addEventListener("click", function (event) {
        if (event.target === video) {
          attachStream(video, stream);
          return;
        }
        if (!wrap.classList.contains("is-playing")) {
          play();
        }
      });
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupRails();
    setupFilters();
    setupPlayers();
  });
})();
