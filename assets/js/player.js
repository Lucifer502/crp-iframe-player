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
   break;
  }
 }

 let playerInstance = jwplayer('player');
 playerInstance.setup({
  'playlist': [{
   'title': title,
   'file': video_m3u8_array,
   'image': thumbnail,
 }]
 }).on('ready', e => {
  document.body.querySelector(".loading_container").style.display = "none";
 });


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

 function m3u8ListFromStream(url) {
  return new Promise(async (resolve) => {
   let m3u8list = []
   const master_m3u8 = await getAllOrigins(url);

   if (master_m3u8) {
    streams = master_m3u8.match(rgx)
    m3u8list = streams.filter((el, idx) => idx % 2 === 0)
   }

   const response = await getAllOrigins(m3u8list[0])
   let link = response.match(rgx)
   //console.log(link[0])
   //console.log(link[1])

   let video = link[0].replace(/\/encryption.key.*$/gm, '?').replace(link[0].split('/')[2],'fy.v.vrv.co')
   console.log(video)
   resolve(video)
  })
 }
})
