(function () {
  var movies = window.SEARCH_MOVIES || [];
  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var typeFilter = document.getElementById("type-filter");
  var regionFilter = document.getElementById("region-filter");
  var yearFilter = document.getElementById("year-filter");
  var results = document.getElementById("search-results");
  var loadMore = document.getElementById("load-more");
  var clearButton = document.getElementById("clear-search");
  var visible = 48;
  var filtered = movies.slice();

  var params = new URLSearchParams(window.location.search);

  var escapeHtml = function (value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var makeCard = function (movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<a href="./search.html?tag=' + encodeURIComponent(tag) + '">' + escapeHtml(tag) + '</a>';
    }).join("");

    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
          '<span class="poster-score">' + escapeHtml(movie.score) + '</span>' +
        '</a>' +
        '<div class="card-content">' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>' +
          '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>' +
          '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
      '</article>';
  };

  var normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };

  var applyParams = function () {
    if (input) {
      input.value = params.get("q") || params.get("tag") || params.get("genre") || "";
    }

    if (typeFilter && params.get("type")) {
      typeFilter.value = params.get("type");
    }

    if (regionFilter && params.get("region")) {
      regionFilter.value = params.get("region");
    }

    if (yearFilter && params.get("year")) {
      yearFilter.value = params.get("year");
    }
  };

  var filterMovies = function () {
    var keyword = normalize(input && input.value);
    var typeValue = normalize(typeFilter && typeFilter.value);
    var regionValue = normalize(regionFilter && regionFilter.value);
    var yearValue = normalize(yearFilter && yearFilter.value);

    filtered = movies.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.type,
        movie.region,
        movie.year,
        movie.genre,
        movie.desc,
        (movie.tags || []).join(" ")
      ].join(" "));

      var matchKeyword = keyword ? text.indexOf(keyword) !== -1 : true;
      var matchType = typeValue ? normalize(movie.type) === typeValue : true;
      var matchRegion = regionValue ? normalize(movie.region) === regionValue : true;
      var matchYear = yearValue ? normalize(movie.year) === yearValue : true;

      return matchKeyword && matchType && matchRegion && matchYear;
    });

    visible = 48;
    render();
  };

  var render = function () {
    if (!results) {
      return;
    }

    var slice = filtered.slice(0, visible);

    if (!slice.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词或筛选条件。</div>';
    } else {
      results.innerHTML = slice.map(makeCard).join("");
    }

    if (loadMore) {
      loadMore.style.display = filtered.length > visible ? "inline-flex" : "none";
    }
  };

  applyParams();
  filterMovies();

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterMovies();
    });
  }

  [input, typeFilter, regionFilter, yearFilter].forEach(function (element) {
    if (element) {
      element.addEventListener("input", filterMovies);
      element.addEventListener("change", filterMovies);
    }
  });

  if (loadMore) {
    loadMore.addEventListener("click", function () {
      visible += 48;
      render();
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      if (input) {
        input.value = "";
      }
      if (typeFilter) {
        typeFilter.value = "";
      }
      if (regionFilter) {
        regionFilter.value = "";
      }
      if (yearFilter) {
        yearFilter.value = "";
      }
      filterMovies();
    });
  }
})();
