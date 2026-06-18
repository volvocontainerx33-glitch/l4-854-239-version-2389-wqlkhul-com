
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      menuButton.textContent = mobilePanel.classList.contains('open') ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterBox = document.querySelector('[data-filter-box]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }

    var keywordInput = document.querySelector('[data-local-search]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var activeChip = document.querySelector('[data-chip].active');
    var keyword = normalize(keywordInput && keywordInput.value);
    var yearValue = yearSelect ? yearSelect.value : '';
    var chipValue = activeChip ? activeChip.getAttribute('data-chip') : 'all';
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year'),
        card.getAttribute('data-text')
      ].join(' '));
      var year = card.getAttribute('data-year') || '';
      var tags = normalize(card.getAttribute('data-tags'));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !yearValue || year.indexOf(yearValue) === 0;
      var matchChip = chipValue === 'all' || tags.indexOf(normalize(chipValue)) !== -1 || text.indexOf(normalize(chipValue)) !== -1;
      var visible = matchKeyword && matchYear && matchChip;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  if (filterBox) {
    filterBox.addEventListener('input', runFilter);
    filterBox.addEventListener('change', runFilter);
    filterBox.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-chip]');
      if (!chip) {
        return;
      }
      Array.prototype.slice.call(filterBox.querySelectorAll('[data-chip]')).forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      runFilter();
    });
    runFilter();
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = document.querySelector('[data-local-search]');
    var title = document.querySelector('[data-search-title]');
    if (input) {
      input.value = q;
    }
    if (title && q) {
      title.textContent = '搜索：' + q;
    }
    runFilter();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    var prepare = function () {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    };

    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
