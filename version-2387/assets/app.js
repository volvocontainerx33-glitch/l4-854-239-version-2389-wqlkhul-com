(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function activate(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        activate(index + 1);
      }, 5000);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        activate(i);
        start();
      });
    });

    activate(0);
    start();
  }

  function setupRows() {
    var buttons = document.querySelectorAll(".scroll-row");
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        var target = document.getElementById(button.getAttribute("data-target"));
        if (!target) {
          return;
        }
        var dir = button.getAttribute("data-dir") === "left" ? -1 : 1;
        target.scrollBy({
          left: dir * 460,
          behavior: "smooth"
        });
      });
    });
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function(card) {
      var value = card.getAttribute(key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function(a, b) {
      return b.localeCompare(a, "zh-CN", { numeric: true });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-card"));
    var search = document.getElementById("page-search");
    var year = document.getElementById("filter-year");
    var type = document.getElementById("filter-type");
    var region = document.getElementById("filter-region");
    var resultText = document.querySelector(".result-text");

    fillSelect(year, uniqueValues(cards, "data-year"));
    fillSelect(type, uniqueValues(cards, "data-type"));
    fillSelect(region, uniqueValues(cards, "data-region"));

    function apply() {
      var q = normalize(search && search.value);
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var r = region ? region.value : "";
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = (!q || haystack.indexOf(q) !== -1) &&
          (!y || card.getAttribute("data-year") === y) &&
          (!t || card.getAttribute("data-type") === t) &&
          (!r || card.getAttribute("data-region") === r);
        card.classList.toggle("is-filter-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (resultText) {
        resultText.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [search, year, type, region].forEach(function(el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupRows();
    setupFilters();
  });
})();
