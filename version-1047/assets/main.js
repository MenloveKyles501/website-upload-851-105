(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    function setHero(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            setHero(i);
        });
    });
    if (slides.length > 1) {
        setHero(0);
        window.setInterval(function () {
            setHero(active + 1);
        }, 5000);
    }

    var params = new URLSearchParams(window.location.search);
    var qParam = params.get('q') || '';
    var regionParam = params.get('region') || '';
    var typeParam = params.get('type') || '';
    var yearParam = params.get('year') || '';
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterYear = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');

    filterInputs.forEach(function (input) {
        if (qParam) input.value = qParam;
    });
    if (filterRegion && regionParam) filterRegion.value = regionParam;
    if (filterType && typeParam) filterType.value = typeParam;
    if (filterYear && yearParam) filterYear.value = yearParam;

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function filterCards() {
        var query = normalize(filterInputs[0] ? filterInputs[0].value : qParam);
        var region = filterRegion ? filterRegion.value : regionParam;
        var type = filterType ? filterType.value : typeParam;
        var year = filterYear ? filterYear.value : yearParam;
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var ok = true;
            if (query && haystack.indexOf(query) === -1) ok = false;
            if (region && card.getAttribute('data-region') !== region) ok = false;
            if (type && card.getAttribute('data-type') !== type) ok = false;
            if (year && card.getAttribute('data-year') !== year) ok = false;
            card.style.display = ok ? '' : 'none';
            if (ok) visible += 1;
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0 && cards.length > 0);
        }
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', filterCards);
    });
    [filterRegion, filterType, filterYear].forEach(function (select) {
        if (select) select.addEventListener('change', filterCards);
    });
    if (cards.length) filterCards();

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var hls;
        function start() {
            if (!video) return;
            var src = video.getAttribute('data-src');
            if (!src) return;
            shell.classList.add('is-playing');
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                }
                video.play().catch(function () {});
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) video.setAttribute('src', src);
                video.play().catch(function () {});
            } else {
                if (!video.getAttribute('src')) video.setAttribute('src', src);
                video.play().catch(function () {});
            }
        }
        if (button) button.addEventListener('click', start);
        if (video) video.addEventListener('click', start, { once: true });
    });
})();
