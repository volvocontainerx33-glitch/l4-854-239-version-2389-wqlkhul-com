(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var play = document.getElementById(options.playId);
        var cover = document.getElementById(options.coverId);
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded || !video) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(options.url);
                hls.attachMedia(video);
            } else {
                video.src = options.url;
            }
            loaded = true;
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (play) {
            play.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("error", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
                loaded = false;
            });
        }
    }

    window.initMoviePlayer = initMoviePlayer;
})();
