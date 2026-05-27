(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.year,
      card.dataset.category
    ].join(" ").toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var state = {
      text: "",
      field: "all",
      value: "all"
    };

    function applyFilters() {
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var textMatch = !state.text || haystack.indexOf(state.text) !== -1;
        var filterMatch = true;

        if (state.value !== "all") {
          var fieldValue = (card.dataset[state.field] || "").toLowerCase();
          filterMatch = fieldValue.indexOf(state.value.toLowerCase()) !== -1;
        }

        var visible = textMatch && filterMatch;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", shown === 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        state.text = input.value.trim().toLowerCase();
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applyFilters();
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        state.field = button.dataset.filterField || "all";
        state.value = button.dataset.filterValue || "all";
        applyFilters();
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.dataset.heroDot || 0));
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
  });

  window.setupMoviePlayer = function (videoAddress) {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector(".player-cover");
    var hlsInstance = null;

    if (!video || !cover || !videoAddress) {
      return;
    }

    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoAddress;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoAddress);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoAddress;
      }

      video.dataset.ready = "1";
      video.controls = true;
      window.activeMovieHls = hlsInstance;
    }

    function play() {
      attach();
      cover.classList.add("hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
