(function () {
    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load"));
            };
            document.head.appendChild(script);
        });
    }

    function setupPlayer(player) {
        var source = player.getAttribute("data-source");
        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play-button]");
        var status = player.querySelector("[data-player-status]");
        var hlsInstance = null;
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachNative() {
            video.src = source;
            initialized = true;
            setStatus("播放源已加载");
            return Promise.resolve();
        }

        function attachHls(Hls) {
            return new Promise(function (resolve, reject) {
                if (!Hls || !Hls.isSupported()) {
                    reject(new Error("HLS is not supported"));
                    return;
                }
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    initialized = true;
                    setStatus("播放源已加载");
                    resolve();
                });
                hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus("播放源加载遇到问题，请刷新重试");
                    }
                });
            });
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }
            setStatus("正在加载播放源");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                return attachNative();
            }
            return loadHlsLibrary()
                .then(attachHls)
                .catch(function () {
                    return attachNative();
                });
        }

        function play() {
            initialize().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise
                        .then(function () {
                            if (playButton) {
                                playButton.classList.add("is-hidden");
                            }
                            setStatus("正在播放");
                        })
                        .catch(function () {
                            setStatus("浏览器阻止了自动播放，请再次点击播放器");
                        });
                }
            });
        }

        if (playButton) {
            playButton.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
            setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
            setStatus("已暂停");
        });
        video.addEventListener("ended", function () {
            setStatus("播放结束");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
    });
})();
