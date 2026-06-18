function initMoviePlayer(source) {
  var video = document.getElementById("movie-video");
  var cover = document.getElementById("play-cover");
  var hls = null;

  if (!video || !cover || !source) {
    return;
  }

  function showCover() {
    cover.classList.remove("is-hidden");
  }

  function hideCover() {
    cover.classList.add("is-hidden");
  }

  function playVideo() {
    hideCover();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        showCover();
      });
    }
  }

  function loadAndPlay() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", source);
      }
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          playVideo();
        });
      } else {
        playVideo();
      }
      return;
    }

    if (!video.getAttribute("src")) {
      video.setAttribute("src", source);
    }
    playVideo();
  }

  cover.addEventListener("click", loadAndPlay);
  video.addEventListener("click", function() {
    if (video.paused) {
      loadAndPlay();
    }
  });
  video.addEventListener("play", hideCover);
  video.addEventListener("pause", function() {
    if (!video.currentTime || video.ended) {
      showCover();
    }
  });
}
