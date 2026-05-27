document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const activate = (next) => {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => activate(i));
    });

    if (slides.length > 1) {
      setInterval(() => activate(index + 1), 5200);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const region = panel.querySelector('[data-filter-region]');
    const year = panel.querySelector('[data-filter-year]');
    const grid = panel.parentElement.querySelector('.searchable-grid');

    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const empty = document.createElement('div');
    empty.className = 'no-results';
    empty.textContent = '没有找到匹配的影片';
    grid.insertAdjacentElement('afterend', empty);

    const apply = () => {
      const q = (input ? input.value : '').trim().toLowerCase();
      const r = region ? region.value : '';
      const y = year ? year.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        const okQuery = !q || haystack.includes(q);
        const okRegion = !r || card.dataset.region === r;
        const okYear = !y || card.dataset.year === y;
        const show = okQuery && okRegion && okYear;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });

      empty.style.display = visible ? 'none' : 'block';
    };

    [input, region, year].forEach((element) => {
      if (element) element.addEventListener('input', apply);
      if (element) element.addEventListener('change', apply);
    });

    apply();
  });
});
