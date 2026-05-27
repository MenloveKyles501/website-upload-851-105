(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.getElementById("mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    var activate = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        restart();
      });
    });

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    };

    activate(0);
    restart();
  }
})();
