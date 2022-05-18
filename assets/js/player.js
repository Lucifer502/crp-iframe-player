window.addEventListener("message", async e => {

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;

 let video_config_media = e.data.video_config_media;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let thumbnail = video_config_media['thumbnail']['url'];
 let streamslist = video_config_media['streams'];
 let video_id = video_config_media['metadata']['id']
 let title = video_config_media['metadata']['title']
 let user_lang = e.data.user_lang;
 let next = e.data.next;
 let next_enable = e.data.next_enable;
 let video_m3u8 = [];
 let video_mp4 = [];
 let sources = [];

 for (let stream of streamslist) {
  if (stream.format == 'trailer_hls' == user_lang) {
   video_mp4.push(stream.url)
   if (video_mp4.length > 4) {
    video_m3u8 = await getDirectFile(video_mp4)
    break;
   }
  }
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
   video_m3u8 = await m3u8ListFromStream(stream.url)
   video_mp4 = await mp4ListFromStream(stream.url)
   break;
  }
 }

 for (let idx of [1, 0, 2, 3, 4])
  sources.push({
   'file': video_m3u8[idx],
   'label': r[idx] +
    (idx < 2 ? '<sup>HD</sup>' : '')
  });

 let playerInstance = jwplayer('player');
 playerInstance.setup({
  'playlist': [{
   'title': title,
   'sources': sources,
   'image': thumbnail,
 }],
  'displayPlaybackLabel': true
 }).on("ready", e => {

  config_player = JSON.parse(localStorage.getItem('config_player'))
  //console.log(config_player[video_id])
  var id = localStorage.getItem('id')
  var autoplay = localStorage.getItem('autoplay')
  var time = localStorage.getItem(video_id)

  if (id == video_id && config_player[video_id] != 'complete') {
   jwplayer().play()
   console.log(config_player[video_id])
   jwplayer().seek(jwplayer().getPosition() + Number(time))

  }

  if (autoplay == 'true' && id != video_id) {
   jwplayer().play();
  }

  document.querySelector('.loading_container').style.display = 'none';
  setInterval(() => {
   position = jwplayer().getPosition()
   duration = jwplayer().getDuration()
   state = jwplayer().getState()

   if (state == 'playing')
    localStorage.setItem(video_id, position);

   localStorage.setItem('config_player', `{"${video_id}":"${state}"}`)

   if (next_enable && state == 'complete') localStorage.setItem('autoplay', 'true')
   localStorage.setItem('id', video_id);
  })
 })

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

 function getDirectFile(url) {
  return new Promise((resolve, reject) => {
   const res = []
   for (let i in r) {
    res.push(url[i].replace(/\/clipFrom.*?index.m3u8/, '').replace('_,', '_').replace(url[i].split("/")[2], "fy.v.vrv.co"))
   }
   resolve(res)
  })
 }

 function mp4ListFromStream(url) {
  const cleanUrl = url.replace(url.split("/")[2], "fy.v.vrv.co");
  const res = [];
  for (let i in r)
   if (streamrgx_three.test(cleanUrl) && i <= 2)
    res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
  else
   res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
  return res;
 }

 async function m3u8ListFromStream(url) {
  let m3u8list = [];
  const master_m3u8 = await getAllOrigins(url)

  if (master_m3u8) {
   streams = master_m3u8.match(rgx)
   m3u8list = streams.filter((el, idx) => idx % 2 === 0)
  }
  //console.log(m3u8list)
  const res = [];
  for (let i in r)
   res.push(m3u8list[i].replace('pl.crunchyroll.com', 'fy.v.vrv.co').replace('/index-v1-a1.m3u8', ''))

  console.log(res[1])
  return res;
 }
})
