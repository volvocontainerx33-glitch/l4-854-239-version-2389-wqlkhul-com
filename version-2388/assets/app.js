(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        var search = document.querySelector(".header-search");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilterPanels() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var section = panel.closest(".filter-section");
            var grid = null;
            if (section) {
                var sibling = section.nextElementSibling;
                while (sibling && !grid) {
                    grid = sibling.querySelector("[data-filterable]");
                    sibling = sibling.nextElementSibling;
                }
            }
            if (!grid) {
                grid = document.querySelector("[data-filterable]");
            }
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var emptyState = grid.parentElement.querySelector("[data-empty-state]");
            var queryInput = panel.querySelector("[data-filter-query]");
            var yearInput = panel.querySelector("[data-filter-year]");
            var typeInput = panel.querySelector("[data-filter-type]");

            function applyFilters() {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var year = yearInput ? yearInput.value : "";
                var type = typeInput ? typeInput.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.keywords
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && card.dataset.year !== year) {
                        matched = false;
                    }
                    if (type && card.dataset.type !== type) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            panel.addEventListener("input", applyFilters);
            panel.addEventListener("change", applyFilters);
            panel.addEventListener("reset", function () {
                window.setTimeout(applyFilters, 0);
            });
            applyFilters();
        });
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-card-link" href="' + escapeHtml(movie.movie_page) + '" title="' + escapeHtml(movie.title) + '">',
            '        <div class="poster-frame">',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '            <span class="duration-pill">' + escapeHtml(movie.duration) + '分钟</span>',
            '            <span class="category-pill">' + escapeHtml(movie.category_name) + '</span>',
            '            <span class="score-pill">★ ' + escapeHtml(movie.score) + '</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p>' + escapeHtml(movie.one_line) + '</p>',
            '            <div class="movie-meta-line">',
            '                <span>' + escapeHtml(movie.year) + '年</span>',
            '                <span>' + escapeHtml(movie.region) + '</span>',
            '                <span>' + escapeHtml(movie.type) + '</span>',
            '            </div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("
");
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var results = document.getElementById("search-results");
        if (!form || !results || !window.MOVIE_DATA) {
            return;
        }
        var empty = document.getElementById("search-empty");
        var title = document.getElementById("search-title");
        var qInput = form.querySelector('[name="q"]');
        var regionInput = form.querySelector('[name="region"]');
        var typeInput = form.querySelector('[name="type"]');
        var params = new URLSearchParams(window.location.search);
        if (qInput && params.get("q")) {
            qInput.value = params.get("q");
        }

        function render() {
            var q = qInput ? qInput.value.trim().toLowerCase() : "";
            var region = regionInput ? regionInput.value : "";
            var type = typeInput ? typeInput.value : "";
            var filtered = window.MOVIE_DATA.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.one_line,
                    movie.summary,
                    (movie.tags || []).join(" "),
                    movie.category_name
                ].join(" ").toLowerCase();
                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                if (region && movie.region !== region) {
                    return false;
                }
                if (type && movie.type !== type) {
                    return false;
                }
                return true;
            });

            results.innerHTML = filtered.map(movieCard).join("
");
            if (empty) {
                empty.hidden = filtered.length !== 0;
            }
            if (title) {
                title.textContent = q ? "关键词匹配结果" : "精选内容";
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        form.addEventListener("input", render);
        form.addEventListener("change", render);
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHeroCarousel();
        setupFilterPanels();
        setupSearchPage();
    });
})();
