window.addEventListener('message', async e => {

let video_config_media = e.data.video_config_media
console.log(video_config_media)



 const r = { 0: '1080p', 1: '720p' }
 let rgx = /http.*$/gm;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url="
 let video_m3u8_array = []
 let video_mp4_array = [];
 let sources = []
 //let video_config_media = {
  //'streams': [{
   //'format': 'adaptive_hls',
   //'url': 'https:\/\/pl.crunchyroll.com\/evs3\/1ffcabd99029abc6ce11b0b47c1a28bd\/assets\/1ffcabd99029abc6ce11b0b47c1a28bd_4485622.mp4\/clipFrom\/0000\/clipTo\/120000\/index.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cCo6Ly9wbC5jcnVuY2h5cm9sbC5jb20vZXZzMy8xZmZjYWJkOTkwMjlhYmM2Y2UxMWIwYjQ3YzFhMjhiZC9hc3NldHMvMWZmY2FiZDk5MDI5YWJjNmNlMTFiMGI0N2MxYTI4YmRfNDQ4NTYyMi5tcDQvY2xpcEZyb20vMDAwMC9jbGlwVG8vMTIwMDAwL2luZGV4Lm0zdTgiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE2NTMzMjMwMzR9fX1dfQ__&Signature=SGq5N~8UnjK5ikwUC1Cdzgh75Z-rvHUq~Bxsw7RH3eGVPOx9FSerCDQJhfPSywC8hlE8F7JZ1SlVwLNMK8mprg5dzBI165bcK~myztX2~fqHlAJfnMoDUK8mkDqQ~r1-xsFBMHsCJEW1KQqeqKGF5530Zo8LqkRqn1VpSzo4PBv9rVWl83Snn9D3bcKCP4nle9zg4YoUzSNO~ZMent0m56fltRUWhnp9pNjxnU5Dm87a-Co3LU0CtbN-6Bkq8-9GqxXG83nQGBlN4aBVZNGb51LCkjEuwhLAzGrK6bbTG80wcuLzy3qBgTX1MVZ-4tmcpcny07szktnhvdTcq-A4Qw__&Key-Pair-Id=APKAJMWSQ5S7ZB3MF5VA'
  //}]
 //}

 function startPlayer() {
  console.log(sources)
  let playerInstance = jwplayer('player')
  playerInstance.setup({
   sources:sources,
  }).on('ready',e=>{
document.body.querySelector(".loading_container").style.display = "none";
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


  //let f = await fetch('https:\/\/pl.crunchyroll.com\/evs3\/5b88e67f12a0cae8d078be2d8c82abc5\/assets\/61cc3201a0b1207f505e0d092cb60954_,4434944.mp4,4434945.mp4,4434943.mp4,4434941.mp4,4434942.mp4,.urlset\/master.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cCo6Ly9wbC5jcnVuY2h5cm9sbC5jb20vZXZzMy81Yjg4ZTY3ZjEyYTBjYWU4ZDA3OGJlMmQ4YzgyYWJjNS9hc3NldHMvNjFjYzMyMDFhMGIxMjA3ZjUwNWUwZDA5MmNiNjA5NTRfLDQ0MzQ5NDQubXA0LDQ0MzQ5NDUubXA0LDQ0MzQ5NDMubXA0LDQ0MzQ5NDEubXA0LDQ0MzQ5NDIubXA0LC51cmxzZXQvbWFzdGVyLm0zdTgiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE2NTMzMjE5NzR9fX1dfQ__&Signature=EEXFRKBtEl9kIXQSVFaf~O45gS9oKSM3yBZy1P6tAvmIkRDn5usPKx-08rn6hcIFCqhgejL4GhTYGgw3EV5zZ5JUGVKsXHpChIV2ynEwbYQBz5ZCA4rUwslaK-R7d7KIy-5-QekGy1Q5btQ2OFvKQ3PfaK~kEF-svpCzwSZIHP0rRd5qghulel41dY6H3V6T290AQCBbHDz5IBBDhe-MY0xzJ~x4KWW3MUN2iNZrhuxlLLkkKXKQMnvYc17N8bukcR0imKXRCdSzfgJWifjbxioUGHfSkRdpvSKkZGryi4kxZMeW0xIQ4IvpjpnMq0iytD6ZMgFkyVG0YAqWfPLL7g__&Key-Pair-Id=APKAJMWSQ5S7ZB3MF5VA').then(res => res.text())
  //console.log(master_m3u8)



  stream = master_m3u8.match(rgx)
  m3u8list = stream.filter((el, idx) => idx % 2 === 0)
  //console.log(m3u8list)

  const video_m3u8 = await getAllOrigins(m3u8list[0])
  //console.log(video_m3u8)
  return m3u8list[0]
 }

})
