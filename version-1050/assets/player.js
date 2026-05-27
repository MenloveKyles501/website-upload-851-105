function initMoviePlayer(source) {
    document.addEventListener("DOMContentLoaded", function () {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector(".player-cover");
        var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
        var loaded = false;
        var hls = null;

        if (!video) {
            return;
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function reveal() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
        }

        function start() {
            reveal();
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(source);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }
            video.src = source;
            video.load();
            playVideo();
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        });

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
}
