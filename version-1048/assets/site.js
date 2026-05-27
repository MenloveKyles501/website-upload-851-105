(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = panel.hasAttribute('hidden');
            if (isOpen) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        var previous = document.querySelector('.hero-control.prev');
        var next = document.querySelector('.hero-control.next');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle('is-active', active);
                if (active) {
                    slide.removeAttribute('aria-hidden');
                } else {
                    slide.setAttribute('aria-hidden', 'true');
                }
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
        if (!scopes.length) {
            return;
        }
        var input = document.querySelector('.filter-input');
        var region = document.querySelector('.region-filter');
        var year = document.querySelector('.year-filter');
        var empty = document.querySelector('.empty-state');

        function getValue(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function apply() {
            var query = getValue(input);
            var regionValue = getValue(region);
            var yearValue = getValue(year);
            var visibleCount = 0;
            scopes.forEach(function (scope) {
                Array.prototype.slice.call(scope.querySelectorAll('.movie-card, li')).forEach(function (item) {
                    var text = [
                        item.getAttribute('data-title') || item.textContent || '',
                        item.getAttribute('data-tags') || '',
                        item.getAttribute('data-region') || '',
                        item.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var itemRegion = (item.getAttribute('data-region') || item.textContent || '').toLowerCase();
                    var itemYear = (item.getAttribute('data-year') || item.textContent || '').toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchRegion = !regionValue || itemRegion.indexOf(regionValue) !== -1;
                    var matchYear = !yearValue || itemYear.indexOf(yearValue) !== -1;
                    var matched = matchQuery && matchRegion && matchYear;
                    item.hidden = !matched;
                    if (matched) {
                        visibleCount += 1;
                    }
                });
            });
            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        [input, region, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var results = document.querySelector('.search-results');
        var title = document.querySelector('.search-result-title');
        var input = document.querySelector('.search-page-input');
        if (!results || !title || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }

        function render(items) {
            if (!query) {
                title.textContent = '请输入关键词开始搜索';
                results.innerHTML = '';
                return;
            }
            title.textContent = '搜索结果：' + query;
            results.innerHTML = items.map(function (item) {
                var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a class="card-link" href="' + escapeHtml(item.url) + '">' +
                    '<figure class="card-cover">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<figcaption>' + escapeHtml(item.category) + '</figcaption>' +
                    '</figure>' +
                    '<div class="card-body">' +
                    '<h2>' + escapeHtml(item.title) + '</h2>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</a>' +
                    '</article>';
            }).join('');
        }

        var normalized = query.toLowerCase();
        var items = window.SEARCH_INDEX.filter(function (item) {
            var text = [
                item.title,
                item.oneLine,
                item.summary,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.category,
                (item.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return text.indexOf(normalized) !== -1;
        }).slice(0, 160);
        render(items);
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (card) {
            var video = card.querySelector('video');
            var button = card.querySelector('.play-button');
            var source = card.getAttribute('data-source');
            var hlsInstance = null;

            function load() {
                if (!video || !source || card.dataset.loaded === 'true') {
                    return;
                }
                card.dataset.loaded = 'true';
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function play() {
                load();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', load);
                video.addEventListener('play', function () {
                    card.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    card.classList.remove('is-playing');
                });
                video.addEventListener('ended', function () {
                    card.classList.remove('is-playing');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayers();
    });
}());
