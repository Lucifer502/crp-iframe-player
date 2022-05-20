window.addEventListener("message", async e => {

 const promises = [],
  request = [];
 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };
 for (let i in r)
  promises[i] = new Promise((resolve) => request[i] = { resolve })

 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let video_config_media = e.data.video_config_media;
 let rgx = /http.*$/gm;

 let thumbnail = video_config_media['thumbnail']['url'];
 let video_id = video_config_media['metadata']['id'];
 let title = video_config_media['metadata']['title'];
 let streamslist = video_config_media['streams'];
 let next_enable = e.data.next_enable;
 let user_lang = e.data.user_lang;
 let video_stream_url = "";
 let video_m3u8_array = [];
 let video_mp4_array = [];
 let next = e.data.next;
 let rows_number = 0;
 let sources = [];

 let dlSize = [];
 let dlUrl = [];
 for (let idx in r) {
  dlSize[idx] = document.getElementById(r[idx] + "_down_size");
  dlUrl[idx] = document.getElementById(r[idx] + "_down_url");
 }

 for (let stream of video_config_media['streams']) {
  if (stream.format == 'trailer_hls' && stream.hardsub_lang == user_lang) {
   const arr_idx = (rows_number === 0 ? 2 : (rows_number === 2 ? 0 : rows_number));
   video_mp4_array[arr_idx] = getDirectFile(stream.url);
   rows_number++;
   if (rows_number > 4) {
    video_m3u8_array = video_mp4_array;
    for (let i in r) {
     request[i].resolve()
    }
   }
  }

  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
   video_stream_url = stream.url
   video_m3u8_array = await m3u8ListFromStream(video_stream_url)
   video_mp4_array = video_m3u8_array
   break;
  }
 }

 for (let idx of [1, 0, 2, 3, 4]) {
  setFileSize(idx)
  sources.push({
   'file': video_m3u8_array[idx],
   'label': r[idx] +
    (idx < 2 ? '<sup>HD</sup>' : '')
  })
  dlUrl[idx].href = video_mp4_array[idx];
 }

 startPlayer()

 function startPlayer() {
  let playerInstance = jwplayer('player');
  playerInstance.setup({
   'playlist': [{
     'title': title,
     'sources': sources,
     'image': thumbnail,
 },
   next_enable ? {
     'file': 'https://i.imgur.com/8wEeX0R.mp4',
 } : {}],
   'related': { displayMode: 'none' },
   'displayPlaybackLabel': true,
  }).on("playlistItem", e => {

   if (e.index > 0 && next_enable) {
    localStorage.setItem('autoplay', 'true')
    window.top.location = next
   }
  })

  let rewind_iconPath = "assets/icon/replay-10s.svg";
  let rewind_id = "rewind-video-button";
  let rewind_tooltipText = "Regresar 10s";

  let forward_iconPath = "assets/icon/forward-30s.svg";
  let forward_id = "forward-video-button";
  let forward_tooltipText = "Avanzar 30s";

  let download_iconPath = "assets/icon/download_icon.svg";
  let download_id = "download-video-button";
  let download_tooltipText = "Descargar";

  const rewind_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() - 10)
  const forward_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() + 30)

  const abrir = document.querySelector('.modal');
  const cerrar = document.querySelector('.close');

  function downloadButton() {
   abrir.style.visibility = 'visible';
  }

  cerrar.addEventListener('click', e => {
   abrir.style.visibility = 'hidden';
  })

  playerInstance
   .addButton(forward_iconPath, forward_tooltipText, forward_ButtonClickAction, forward_id)
   .addButton(rewind_iconPath, rewind_tooltipText, rewind_ButtonClickAction, rewind_id)
   .addButton(download_iconPath, download_tooltipText, downloadButton, download_id);

  jwplayer().on('ready', e => {
   console.log(sources)
   if (localStorage.getItem('autoplay') == 'true') {
    localStorage.setItem('autoplay', 'false')
    jwplayer().play()
   }

   document.querySelector('.loading_container').style.display = 'none';
  })

  jwplayer().on('viewable', e => {
   const old = document.querySelector('.jw-icon-inline')
   const btnContainer = old.parentElement;
   const btn = query => document.querySelector(`div[button="${query}"]`)
   btnContainer.insertBefore(btn(rewind_id), old);
   btnContainer.insertBefore(btn(forward_id), old)
   btnContainer.removeChild(old)
  })
 }

 function getAllOrigins(url) {
  return new Promise(async (resolve, reject) => {
   await $.ajax({
     async: true,
     type: "GET",
     url: allorigins + encodeURIComponent(url),
     responseType: 'json'
    })
    .then(res => {
     resolve(res.contents ?? res)
    })
    .catch(err => reject(err));
  })
 }

 function setFileSize(id, intentos = 0) {
  let video_mp4_url = video_mp4_array[id];
  let fileSize = "";
  let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
  http.onreadystatechange = () => {
   if (http.readyState == 4 && http.status == 200) {
    fileSize = http.getResponseHeader('content-length');
    if (!fileSize)
     return setTimeout(() => setFileSize(id), 5000);
    else {
     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (fileSize == 0) return console.log('addSource#fileSize == 0');
     let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
     if (i == 0) return console.log('addSource#i == 0');
     let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
     dlSize[id].innerText = return_fileSize;
     return console.log(`Tamaño de: ${r[id]} (${return_fileSize})`);
    }
   } else if (http.readyState == 4 && intentos < 3)
    return setTimeout(() => setFileSize(id, intentos + 1), 5000);
  }
  http.open("HEAD", video_mp4_url, true);
  http.send(null);
 }

 function getDirectFile(url) {
  return url.replace(url.split('/')[2], 'fy.v.vrv.co').replace(/\/clip.*?index.m3u8/, '')
 }

 async function m3u8ListFromStream(url) {
  return new Promise(async (resolve) => {
   let m3u8list = []
   const master_m3u8 = await getAllOrigins(url);

   if (master_m3u8) {
    streams = master_m3u8.match(rgx)
    m3u8list = streams.filter((el, idx) => idx % 2 === 0)
   }

    const response=await getAllOrigins(m3u8list[0])
    let link = response.match(rgx)
    console.log(link[0])
    console.log(link[1])
  
let video = link[0]
console.log(video)

   const res = []
   for (let i in r) {
    const video_m3u8 = await getAllOrigins(m3u8list[i])
    m3u8list[i] = blobStream(video_m3u8)
   }

   res.push(buildM3u8(m3u8list))

   resolve(res)
  })
 }

 function blobStream(stream) {
  const blob = new Blob([stream], {
   type: "text/plain; charset=utf-8"
  });
  return URL.createObjectURL(blob) + '#.m3u8'
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
