(function () {
    function startPlayer(videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var started = false;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        function load() {
            if (started) {
                video.play();
                return;
            }

            started = true;
            button.classList.add("hidden");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        video.src = source;
                        video.play();
                    }
                });
                return;
            }

            video.src = source;
            video.play();
        }

        button.addEventListener("click", load);
        video.addEventListener("click", function () {
            if (!started) {
                load();
            }
        });
    }

    window.initMoviePlayer = startPlayer;
})();
