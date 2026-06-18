import { H as Hls } from './hls-vendor-dru42stk.js';

function initMoviePlayer() {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-player-button]');
  var note = document.querySelector('[data-player-note]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');

  function setNote(message) {
    if (note) {
      note.textContent = message;
    }
  }

  if (!source) {
    setNote('当前影片暂未配置播放源。');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setNote('已使用浏览器原生 HLS 播放能力加载播放源。');
  } else if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setNote('HLS 播放源已加载，点击播放按钮即可开始观看。');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setNote('播放源加载失败，请稍后刷新页面重试。');
        hls.destroy();
      }
    });
  } else {
    setNote('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
  }

  if (button) {
    button.addEventListener('click', function () {
      video.play().catch(function () {
        setNote('浏览器阻止了自动播放，请直接点击视频控件播放。');
      });
      button.closest('.play-cover').style.display = 'none';
    });
  }

  video.addEventListener('play', function () {
    var cover = document.querySelector('.play-cover');
    if (cover) {
      cover.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', initMoviePlayer);
