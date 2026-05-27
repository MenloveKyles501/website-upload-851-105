(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.hasAttribute("hidden");
      if (open) {
        nav.removeAttribute("hidden");
      } else {
        nav.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function searchableText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-meta") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-category") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function initSearchPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card-list] > a"));
      var searchInput = panel.querySelector(".js-search");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));
      var clear = panel.querySelector(".js-clear-search");
      var count = panel.querySelector(".result-count");

      function apply() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var activeFilters = {};
        selects.forEach(function (select) {
          activeFilters[select.getAttribute("data-filter")] = select.value.trim();
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = searchableText(card);
          var matched = !query || text.indexOf(query) !== -1;
          if (matched && activeFilters.category) {
            matched = (card.getAttribute("data-category") || "") === activeFilters.category;
          }
          if (matched && activeFilters.type) {
            matched = text.indexOf(activeFilters.type.toLowerCase()) !== -1;
          }
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible > 0 ? "筛选结果已更新" : "没有匹配的影片";
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          apply();
        });
      }
      apply();
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsLoadingPromise) {
      return window.__hlsLoadingPromise;
    }
    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsLoadingPromise;
  }

  function bindSource(video, source) {
    if (!source) {
      return Promise.reject(new Error("missing source"));
    }
    if (video.dataset.ready === "true") {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "true";
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hls) {
          video._hls.destroy();
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
        video.dataset.ready = "true";
      } else {
        video.src = source;
        video.dataset.ready = "true";
      }
    }).catch(function () {
      video.src = source;
      video.dataset.ready = "true";
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var source = player.getAttribute("data-source");
      if (!video || !button) {
        return;
      }
      function start() {
        bindSource(video, source).then(function () {
          player.classList.add("is-playing");
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        });
      }
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("video")) {
          return;
        }
        start();
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchPanels();
    initPlayers();
  });
})();
