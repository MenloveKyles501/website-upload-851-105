(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var list = panel.parentElement.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var searchInput = panel.querySelector('[data-search-input]');
      var categoryFilter = panel.querySelector('[data-category-filter]');
      var yearFilter = panel.querySelector('[data-year-filter]');
      var filterButton = panel.querySelector('[data-filter-button]');
      var resetButton = panel.querySelector('[data-filter-reset]');
      var emptyState = panel.parentElement.querySelector('[data-empty-state]');

      function yearMatches(cardYear, value) {
        if (value === 'all') {
          return true;
        }
        if (value === 'older') {
          var year = Number(cardYear);
          return !year || year < 2020;
        }
        return String(cardYear) === value;
      }

      function applyFilter() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : 'all';
        var year = yearFilter ? yearFilter.value : 'all';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = (!query || text.indexOf(query) !== -1) && (category === 'all' || cardCategory === category) && yearMatches(cardYear, year);
          card.classList.toggle('hidden-card', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle('show', visible === 0);
        }
      }

      function resetFilter() {
        if (searchInput) {
          searchInput.value = '';
        }
        if (categoryFilter) {
          categoryFilter.value = 'all';
        }
        if (yearFilter) {
          yearFilter.value = 'all';
        }
        applyFilter();
      }

      if (filterButton) {
        filterButton.addEventListener('click', applyFilter);
      }
      if (resetButton) {
        resetButton.addEventListener('click', resetFilter);
      }
      if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
      }
      if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilter);
      }
      if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && searchInput) {
        searchInput.value = q;
      }
      applyFilter();
    });
  }

  function attachStream(video, source, shell) {
    if (!video || !source) {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      return video.play();
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsReady = true;
        video._hls = hls;
      }
      return video.play();
    }
    if (video.src !== source) {
      video.src = source;
    }
    return video.play();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-stream') || '';

      function play() {
        shell.classList.add('playing');
        var result = attachStream(video, source, shell);
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!video.src) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
