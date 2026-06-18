(function () {
  var input = document.getElementById('search-input');
  var form = document.getElementById('search-form');
  var result = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (!input || !form || !result) {
    return;
  }

  input.value = initialQuery;

  function card(movie) {
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.image + '" alt="' + movie.title + '封面" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="score-pill">热度 ' + movie.score + '</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
          '<p>' + movie.oneLine + '</p>' +
          '<div class="meta-row"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
        '</div>' +
      '</article>';
  }

  function runSearch(query) {
    var q = query.trim().toLowerCase();
    var movies = window.MOVIE_DATA || [];
    var hits;

    if (!q) {
      hits = movies.slice(0, 60);
    } else {
      hits = movies.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);
    }

    count.textContent = q ? '找到 ' + hits.length + ' 个相关结果' : '展示最新 ' + hits.length + ' 部影片';

    if (!hits.length) {
      result.innerHTML = '<div class="empty-state">没有找到匹配结果，可以换一个片名、类型、地区或年份继续搜索。</div>';
      return;
    }

    result.innerHTML = '<div class="movie-grid">' + hits.map(card).join('') + '</div>';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var q = input.value.trim();
    var url = new URL(window.location.href);
    if (q) {
      url.searchParams.set('q', q);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
    runSearch(q);
  });

  input.addEventListener('input', function () {
    runSearch(input.value);
  });

  runSearch(initialQuery);
})();
