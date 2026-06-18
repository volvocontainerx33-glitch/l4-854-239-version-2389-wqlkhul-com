(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4800);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        play();
      });
    });
    root.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    root.addEventListener("mouseleave", play);
    play();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var textInput = panel.querySelector("[data-filter-text]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (textInput && query) {
      textInput.value = query;
    }
    function apply() {
      var q = normalize(textInput && textInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var genre = normalize(card.getAttribute("data-genre"));
        var tags = normalize(card.getAttribute("data-tags"));
        var cardCategory = normalize(card.querySelector(".category-badge") && card.querySelector(".category-badge").textContent);
        var haystack = [title, cardRegion, cardType, cardYear, genre, tags, cardCategory].join(" ");
        var matched = (!q || haystack.indexOf(q) !== -1) &&
          (!region || cardRegion === region) &&
          (!type || cardType === type) &&
          (!year || cardYear === year) &&
          (!category || cardCategory === category);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [textInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (item) {
      if (!item) {
        return;
      }
      item.addEventListener("input", apply);
      item.addEventListener("change", apply);
    });
    apply();
  }

  ready(function () {
    bindMenu();
    initHeroCarousel();
    initFilters();
  });
})();
