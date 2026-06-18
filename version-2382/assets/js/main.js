(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-site-nav]");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".search-card"));
            var empty = scope.querySelector("[data-empty]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
            var activeFilter = "";

            function cardText(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" "));
            }

            function apply() {
                var query = input ? normalize(input.value) : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = cardText(card);
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedFilter = !activeFilter || haystack.indexOf(activeFilter) !== -1;
                    var showCard = matchedQuery && matchedFilter;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    var value = normalize(chip.getAttribute("data-filter-chip"));
                    if (activeFilter === value) {
                        activeFilter = "";
                    } else {
                        activeFilter = value;
                    }
                    chips.forEach(function (item) {
                        item.classList.toggle("active", normalize(item.getAttribute("data-filter-chip")) === activeFilter && activeFilter !== "");
                    });
                    apply();
                });
            });

            apply();
        });
    });
})();
