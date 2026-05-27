import { H as Hls } from './hls-vendor-dru42stk.js';

export function setupPlayer(source, videoId, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !source) {
    return;
  }

  let hls = null;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  const start = () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(() => {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}
