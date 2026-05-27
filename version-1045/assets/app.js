document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');

  function runFilter() {
    if (!filterInput || !filterList) {
      return;
    }
    var query = filterInput.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var value = [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region')
      ].join(' ').toLowerCase();
      card.style.display = value.indexOf(query) === -1 ? 'none' : '';
    });
  }

  if (filterInput) {
    var urlQuery = new URLSearchParams(window.location.search).get('q');
    if (urlQuery) {
      filterInput.value = urlQuery;
      runFilter();
    }
    filterInput.addEventListener('input', runFilter);
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });
  }
});
