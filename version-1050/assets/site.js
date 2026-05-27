(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function goSearch(form) {
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : "";
        if (value) {
            window.location.href = "search.html?q=" + encodeURIComponent(value);
        } else {
            window.location.href = "search.html";
        }
    }

    function bindHeader() {
        var header = qs("#siteHeader");
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (header) {
            var onScroll = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 20);
            };
            onScroll();
            window.addEventListener("scroll", onScroll, { passive: true });
        }
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }
        qsa("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                goSearch(form);
            });
        });
    }

    function bindHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    function bindLocalFilters() {
        var input = qs("[data-local-filter]");
        if (!input) {
            return;
        }
        var yearSelect = qs("[data-year-filter]");
        var cards = qsa("[data-movie-card]");
        function apply() {
            var keyword = normalize(input.value);
            var year = yearSelect ? normalize(yearSelect.value) : "";
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year
                ].join(" "));
                var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var passYear = !year || normalize(card.dataset.year) === year;
                card.classList.toggle("hidden-card", !(passKeyword && passYear));
            });
        }
        input.addEventListener("input", apply);
        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }
        apply();
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card" data-movie-card>',
            '    <a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" onerror="this.style.opacity=\'0\'">',
            '        <span class="play-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>',
            '        <span class="duration-chip">' + escapeHtml(item.duration) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="category-pill" href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a>',
            '        <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '        <p>' + escapeHtml(item.summary) + '</p>',
            '        <div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function bindSearchPage() {
        var results = qs("#searchResults");
        var input = qs("#searchInput");
        var form = qs("[data-page-search-form]");
        if (!results || !input || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";
        function render() {
            var keyword = normalize(input.value);
            var items = window.SEARCH_ITEMS.filter(function (item) {
                if (!keyword) {
                    return true;
                }
                return normalize([
                    item.title,
                    item.summary,
                    item.category,
                    item.genre,
                    item.region,
                    item.year,
                    item.type,
                    item.tags
                ].join(" ")).indexOf(keyword) !== -1;
            });
            results.innerHTML = items.map(cardTemplate).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
                history.replaceState(null, "", url);
                render();
            });
        }
        input.addEventListener("input", render);
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindHeader();
        bindHero();
        bindLocalFilters();
        bindSearchPage();
    });
})();
