function initVideoPlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var attached = false;

  if (!video || !sourceUrl) {
    return;
  }

  var attachSource = function () {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          video.src = sourceUrl;
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      }, { once: true });

      return;
    }

    video.src = sourceUrl;
  };

  var playVideo = function () {
    attachSource();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
}
