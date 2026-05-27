(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;
        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            activeIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === activeIndex);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === activeIndex);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var currentFilter = "all";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function currentQuery() {
            var first = searchInputs.find(function (input) {
                return input.value.trim().length > 0;
            });
            return first ? normalize(first.value) : "";
        }

        function applyListState() {
            var query = currentQuery();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year"));
                var filterText = normalize(card.getAttribute("data-filter-key") || "");
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = currentFilter === "all" || filterText.indexOf(currentFilter) !== -1;
                var shouldShow = matchesQuery && matchesFilter;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyListState();
            });
        });

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                currentFilter = normalize(button.getAttribute("data-filter-value"));
                filterButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyListState();
            });
        });
    });
})();
