window.addEventListener('message', async e => {

  console.log(e.data)

  let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };
  let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let allorigins = 'https://crp-proxy.herokuapp.com/get?url=';
  let rgx = /http.*$/gm;

  let video_config_media = e.data.video_config_media;
  let video_id = video_config_media['metadata']['id'];
  let next_up_enable = e.data.next_up_enable;
  let next_up = e.data.next_up;
  let user_lang = e.data.lang;
  let video_m3u8_array = [];
  let video_mp4_array = [];
  let rows_number = 0;
  let sources = [];

  let dlSize = [];
  let dlUrl = [];
  for (let idx in r) {
    dlSize[idx] = document.getElementById(r[idx] + '_down_size');
    dlUrl[idx] = document.getElementById(r[idx] + '_down_url');
  }

  const streamlist = video_config_media['streams'];
  const hasUserLang = streamlist.find(stream => stream.hardsub_lang == user_lang);
  const search_lang = hasUserLang ? user_lang : null;

  for (let stream of streamlist) {
    if (stream.format == 'trailer_hls' && stream.hardsub_lang == search_lang)
      if (rows_number <= 4) {
        const arr_idx = (rows_number === 0 ? 2 : (rows_number === 2 ? 0 : rows_number));
        video_mp4_array[arr_idx] = getDirectFile(stream.url);
        rows_number++;
        if (rows_number > 4) {
          video_m3u8_array = video_mp4_array;
          break;
        }
      }

    if (stream.format == 'adaptive_hls' && stream.hardsub_lang == search_lang) {
      video_stream_url = stream.url
      video_m3u8_array = await m3u8ListFromStream(video_stream_url);
      video_mp4_array = mp4ListFromStream(video_stream_url);
      break;
    }
  }

  for (let id of [1, 0, 2, 3, 4]) {
    setFileSize(video_mp4_array[id], id)
    sources.push({ file: video_m3u8_array[id], label: r[id] })
  }

  let playerInstance = jwplayer('jwplayer')
  playerInstance.setup({
    'playlist': [{
        'title': video_config_media['metadata']['title'],
        'image': video_config_media['thumbnail']['url'],
        'sources': sources,
  },
      next_up_enable ? {
        'file': 'https://i.imgur.com/8wEeX0R.mp4',
  } : {}],
    'related': { displayMode: 'none' },
    'displayPlaybackLabel': true,
    'primary': 'html5',
  }).on('playlistItem', e => {
    if (e.index == 1) {
      jwplayer().setControls(false);
      localStorage.setItem('autoplay', 'true')
      window.top.location = next_up;
    }
  })

  let rewind_iconPath = 'assets/icon/replay-10s.svg';
  let rewind_id = "rewind-video-button";
  let rewind_tooltipText = "Retroceder 10s";

  let forward_iconPath = 'assets/icon/forward-30s.svg';
  let forward_id = 'forward-video-button';
  let forward_tooltipText = 'Avanzar 30s';

  let download_iconPath = 'assets/icon/download_icon.svg';
  let download_id = 'download-video-button';
  let download_tooltipText = 'Descargar';

  const modal = document.querySelector('.modal')
  const close = document.querySelector('.close')

  const rewind_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() - 10)
  const forward_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() + 30)

  function download_ButtonClickAction() {
    modal.style.visibility = 'visible'
  }

  close.addEventListener('click', e => {
    modal.style.visibility = 'hidden'
  })

  playerInstance
    .addButton(forward_iconPath, forward_tooltipText, forward_ButtonClickAction, forward_id)
    .addButton(rewind_iconPath, rewind_tooltipText, rewind_ButtonClickAction, rewind_id)
    .addButton(download_iconPath, download_tooltipText, download_ButtonClickAction, download_id);

  jwplayer().on('ready', e => {
    document.querySelector('.loading-container').style.display = 'none'

    setInterval(() => {
      if (jwplayer().getState() == 'playing') localStorage.setItem(video_id, jwplayer().getPosition());
    });

    if (localStorage.getItem(video_id) != null) {
      const t = localStorage.getItem(video_id);
      document.getElementsByTagName('video')[0].currentTime = t >= 5 ? t - 5 : t;
    }

    if (localStorage.getItem('autoplay') == 'true') {
      localStorage.setItem('autoplay', 'false')
      jwplayer().play()
    }
  })

  jwplayer().on('viewable', e => {
    if(e.viewable == 1) {
    const old = document.querySelector('.jw-button-container > .jw-icon-rewind')
    if (!old) return
    const btn = query => document.querySelector(`div[button="${query}"]`)
    const btnContainer = old.parentElement
    btnContainer.insertBefore(btn(rewind_id), old)
    btnContainer.insertBefore(btn(forward_id), old)
    btnContainer.removeChild(old)
    }
  })

  function setFileSize(url, id) {
    let http = new XMLHttpRequest();
    http.onload = () => {
      fileSize = http.getResponseHeader('content-length');
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
      fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + sizes[i];
      dlSize[id].innerText = fileSize;
      dlUrl[id].href = url;
    }
    http.open('HEAD', url, true);
    http.send(null);
  }

  function getAllOrigins(url) {
    return new Promise(async (resolve, reject) => {
      await $.ajax({
          async: true,
          type: 'GET',
          url: allorigins + encodeURIComponent(url),
          responseType: 'json'
        })
        .then(res => {
          resolve(res.contents ?? res)
        })
        .catch(err => reject(err));
    })
  }

  function getDirectFile(url) {
    return url.replace(/\/clip.*?index.m3u8/, '').replace(url.split('/')[2], 'fy.v.vrv.co')
  }

  function mp4ListFromStream(url) {
    const cleanUrl = url.replace(url.split('/')[2], 'fy.v.vrv.co');
    const res = [];
    for (let i in r)
      if (streamrgx_three.test(cleanUrl) && i <= 2)
        res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
    else
      res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i) + 1)}`))
    return res;
  }

  async function m3u8ListFromStream(url) {
    return new Promise(async (resolve, reject) => {
      let m3u8list = []
      const master_m3u8 = await getAllOrigins(url);

      if (master_m3u8) {
        streams = master_m3u8.match(rgx);
        m3u8list = streams.filter((el, idx) => idx % 2 === 0)
      }
      const res = [];

      for (let i in m3u8list) {
        const video_m3u8 = await getAllOrigins(m3u8list[i]);
        m3u8list[i] = blobStream(video_m3u8);
      }
      res.push(buildM3u8(m3u8list));
      resolve(res)
    })
  }

  function blobStream(stream) {
    const blob = new Blob([stream], {
      type: 'text/plain; charset=utf-8'
    });
    return URL.createObjectURL(blob) + '#.m3u8';
  }

  function buildM3u8(m3u8list) {
    const video_m3u8 = '#EXTM3U' +
      '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4112345,RESOLUTION=1280x720,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
      '\n' + m3u8list[0] +
      '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8098235,RESOLUTION=1920x1080,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
      '\n' + m3u8list[1] +
      '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2087088,RESOLUTION=848x480,FRAME-RATE=23.974,CODECS="avc1.4d401f,mp4a.40.2"' +
      '\n' + m3u8list[2] +
      '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1090461,RESOLUTION=640x360,FRAME-RATE=23.974,CODECS="avc1.4d401e,mp4a.40.2"' +
      '\n' + m3u8list[3] +
      '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=559942,RESOLUTION=428x240,FRAME-RATE=23.974,CODECS="avc1.42c015,mp4a.40.2"' +
      '\n' + m3u8list[4];
    return blobStream(video_m3u8);
  }
})
