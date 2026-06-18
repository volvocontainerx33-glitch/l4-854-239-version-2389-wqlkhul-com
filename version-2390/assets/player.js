function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player]");
  var cover = document.querySelector("[data-player-cover]");
  var hlsInstance = null;
  if (!video || !streamUrl) {
    return;
  }
  function attachStream() {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }
    video.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    attachStream();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
