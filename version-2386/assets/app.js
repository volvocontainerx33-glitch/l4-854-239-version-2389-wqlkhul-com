(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-scroll-rail]').forEach(function (rail) {
        var section = rail.closest('section') || document;
        var left = section.querySelector('[data-scroll-left]');
        var right = section.querySelector('[data-scroll-right]');
        function move(amount) {
            rail.scrollBy({
                left: amount,
                behavior: 'smooth'
            });
        }
        if (left) {
            left.addEventListener('click', function () {
                move(-420);
            });
        }
        if (right) {
            right.addEventListener('click', function () {
                move(420);
            });
        }
    });

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
        var input = box.querySelector('[data-card-filter]');
        var select = box.querySelector('[data-type-filter]');
        var section = box.closest('section') || document;
        var grid = section.querySelector('[data-card-grid]');
        var empty = section.querySelector('[data-empty-filter]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var type = select ? select.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var matched = (!keyword || search.indexOf(keyword) !== -1) && (!type || cardType === type);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
        apply();
    });

    function createSearchCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';

        var link = document.createElement('a');
        link.className = 'movie-cover';
        link.href = movie.link;

        var img = document.createElement('img');
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';
        link.appendChild(img);

        var year = document.createElement('span');
        year.className = 'year-badge';
        year.textContent = movie.year;
        link.appendChild(year);

        var play = document.createElement('span');
        play.className = 'play-mark';
        play.setAttribute('aria-hidden', 'true');
        play.textContent = '▶';
        link.appendChild(play);

        var body = document.createElement('div');
        body.className = 'movie-body';

        var title = document.createElement('h3');
        var titleLink = document.createElement('a');
        titleLink.href = movie.link;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);
        body.appendChild(title);

        var desc = document.createElement('p');
        desc.textContent = movie.oneLine;
        body.appendChild(desc);

        var meta = document.createElement('div');
        meta.className = 'meta-row';
        [movie.region, movie.type].forEach(function (item) {
            var span = document.createElement('span');
            span.textContent = item;
            meta.appendChild(span);
        });
        body.appendChild(meta);

        var tags = document.createElement('div');
        tags.className = 'tag-row';
        movie.tags.slice(0, 3).forEach(function (item) {
            var span = document.createElement('span');
            span.textContent = item;
            tags.appendChild(span);
        });
        body.appendChild(tags);

        article.appendChild(link);
        article.appendChild(body);
        return article;
    }

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var subtitle = document.querySelector('[data-search-subtitle]');
        var empty = document.querySelector('[data-search-empty]');
        if (input) {
            input.value = query;
        }
        var pool = window.MOVIE_SEARCH_INDEX;
        var normalized = query.toLowerCase();
        var result = normalized ? pool.filter(function (movie) {
            return movie.search.indexOf(normalized) !== -1;
        }).slice(0, 180) : pool.slice(0, 48);
        if (title) {
            title.textContent = normalized ? '搜索结果' : '热门推荐';
        }
        if (subtitle) {
            subtitle.textContent = normalized ? '以下影片与关键词相关。' : '可直接输入关键词继续查找。';
        }
        searchResults.innerHTML = '';
        result.forEach(function (movie) {
            searchResults.appendChild(createSearchCard(movie));
        });
        if (empty) {
            empty.classList.toggle('is-visible', result.length === 0);
        }
    }

    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var stream = box.getAttribute('data-stream');
        var ready = false;
        var hls = null;
        if (!video || !stream) {
            return;
        }
        function playVideo() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }
        function attach() {
            if (ready) {
                playVideo();
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            } else {
                video.src = stream;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            }
        }
        if (cover) {
            cover.addEventListener('click', attach);
        }
        video.addEventListener('click', function () {
            if (!ready) {
                attach();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
