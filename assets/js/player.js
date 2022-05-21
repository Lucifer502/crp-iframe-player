window.addEventListener('load', async e => {






 const r = { 0: '1080p', 1: '720p' }

 let allorigins = "https://crp-proxy.herokuapp.com/get?url="
 let rgx = /http.*$/gm;

 let video_config_media = {
  'streams': [{
   'format': 'adaptive_hls',
   'url': 'https://pl.crunchyroll.com/evs3/5b88e67f12a0cae8d078be2d8c82abc5/assets/61cc3201a0b1207f505e0d092cb60954_,4435006.mp4,4435007.mp4,4435005.mp4,4435003.mp4,4435004.mp4,.urlset/master.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cCo6Ly9wbC5jcnVuY2h5cm9sbC5jb20vZXZzMy81Yjg4ZTY3ZjEyYTBjYWU4ZDA3OGJlMmQ4YzgyYWJjNS9hc3NldHMvNjFjYzMyMDFhMGIxMjA3ZjUwNWUwZDA5MmNiNjA5NTRfLDQ0MzUwMDYubXA0LDQ0MzUwMDcubXA0LDQ0MzUwMDUubXA0LDQ0MzUwMDMubXA0LDQ0MzUwMDQubXA0LC51cmxzZXQvbWFzdGVyLm0zdTgiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE2NTMzMzY0Mzl9fX1dfQ__&Signature=H7vIwnEc1WR3lNg8U17n6Ytn5fiErypSRMo9IwCGkFG4z-tcTToSD3U3JoddM6uHoyzDU6-tMJNLEEppPRp-vm5aoOTiQgVLEXvuPgTy4-EMqqX53nHmZuc5q0cFL4F1gG9pv~SgFjD120DjVQC4muOq~cVu0vgLJ5NWK~Dk-QIwWQ3Tk9msWPJumgxnTtlDk9PDH~rrVrx12L1ztDGvBcZITFNy253dwzCBDqDNwkBOkyksShXUyAx6r8plsX5pBPm0~rJeSLetQFj9eu-1CqoOAQ5anY21VOgBRdeysNLjSkFWp6wUDKi~u3jsWtfB9tP2GBwh1aLE~ZHvay6K-Q__&Key-Pair-Id=APKAJMWSQ5S7ZB3MF5VA'
  }]
 }
 let video_m3u8_array = []
 let video_mp4_array = [];
 let sources = []

 function startPlayer() {
  console.log(sources)
  let playerInstance = jwplayer('player')
  playerInstance.setup({
   sources: sources,
  })
 }


 getStreams(video_config_media['streams'])

 async function getStreams(streamlist) {
  for (let stream of streamlist) {
   if (stream.format == 'trailer_hls') {

   }

   if (stream.format == 'adaptive_hls') {
    video_m3u8_array = await m3u8ListFromStream(stream.url)
    video_mp4_array = stream.url
    pushVideoM3u8()
   }
  }

 }

 function pushVideoM3u8() {
  for (let i in r) {
   sources.push({
    'file': video_m3u8_array,
    'label': r[i],
   })
  }
  startPlayer()
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

 async function m3u8ListFromStream(url) {
  const master_m3u8 = await getAllOrigins(url)
  if (master_m3u8) {
   streams = master_m3u8.match(rgx)
   m3u8list = streams.filter((el, idx) => idx % 2 === 0)
  }

  for (let i in r) {
   const video_m3u8 = await getAllOrigins(m3u8list[i])
   m3u8list[i] = blobStream(video_m3u8)
  }

  const res = []
  res.push(buildM3u8(m3u8list))
  return res;
 }

 function blobStream(stream) {
  const blob = new Blob([stream], {
   type: "text/plain; charset=utf-8"
  });
  return URL.createObjectURL(blob) + "#.m3u8";
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
