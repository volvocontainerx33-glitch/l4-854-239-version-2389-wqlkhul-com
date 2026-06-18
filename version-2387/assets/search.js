(function() {
  function params() {
    return new URLSearchParams(window.location.search);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(item.url) + "\" class=\"card-link\">" +
      "<div class=\"card-cover\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-hidden')\">" +
      "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>" +
      "<span class=\"card-play\">▶</span>" +
      "</div>" +
      "<div class=\"card-body\">" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<div class=\"card-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function run() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    if (!input || !results || !summary || !window.SEARCH_INDEX && typeof SEARCH_INDEX === "undefined") {
      return;
    }

    var list = typeof SEARCH_INDEX !== "undefined" ? SEARCH_INDEX : window.SEARCH_INDEX;
    var q = params().get("q") || "";
    input.value = q;

    function apply() {
      var keyword = normalize(input.value.trim());
      if (!keyword) {
        results.innerHTML = "";
        summary.textContent = "输入关键词搜索影片";
        return;
      }
      var matched = list.filter(function(item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" "));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      summary.textContent = "找到 " + matched.length + " 部相关影片";
      results.innerHTML = matched.map(renderCard).join("");
    }

    input.addEventListener("input", apply);
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
