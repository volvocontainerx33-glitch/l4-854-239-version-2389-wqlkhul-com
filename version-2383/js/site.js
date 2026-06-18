(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dotsWrap = document.querySelector("[data-hero-dots]");
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === heroIndex);
        });
        if (dotsWrap) {
            Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
                dot.classList.toggle("active", i === heroIndex);
            });
        }
    }

    if (slides.length && dotsWrap) {
        slides.forEach(function (_, i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "切换推荐" + (i + 1));
            dot.addEventListener("click", function () {
                showHero(i);
            });
            dotsWrap.appendChild(dot);
        });
        showHero(0);
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var queryValue = getQuery("q");

        if (input && queryValue) {
            input.value = queryValue;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var text = normalize(input ? input.value : "");
            var active = {};

            selects.forEach(function (select) {
                active[select.getAttribute("data-filter-select")] = normalize(select.value);
            });

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var ok = !text || haystack.indexOf(text) !== -1;

                Object.keys(active).forEach(function (key) {
                    var val = active[key];
                    if (!val) {
                        return;
                    }
                    var field = normalize(card.getAttribute("data-" + key));
                    if (field.indexOf(val) === -1) {
                        ok = false;
                    }
                });

                card.classList.toggle("hidden", !ok);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilter);
        });
        applyFilter();
    });
})();
