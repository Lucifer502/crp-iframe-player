window.addEventListener('message', async e => {

  const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

  let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let allorigins = "https://crp-proxy.herokuapp.com/get?url=";

  let video_config_media = e.data.video_config_media;
  let next_enable = e.data.next_enable;
  let user_lang = e.data.user_lang;
  let video_stream_url = "";
  let video_m3u8_array = [];
  let video_mp4_array = [];
  let next = e.data.next;
  let rows_number = 0;
  let sources = [];

  const streamlist = video_config_media["streams"];
  for (let stream of streamlist) {
    if (stream.format == "trailer_hls" && hardsub_lang == user_lang) {
      video_mp4_array = getDirectFile(stream.url);
      rows_number++
      if (rows_number > 4) {
        video_m3u8_array = video_mp4_array;
        break;
      }
    }

    if (stream.format == "adaptive_hls" && stream.hardsub_lang == user_lang) {
      video_stream_url = stream.url;
      video_mp4_array = mp4ListFromStream(video_stream_url);
      video_m3u8_array = await m3u8ListFromStream(video_stream_url);
      break;
    }
  }

  for (let idx of [1, 0, 2, 3, 4])
    sources.push({
      "file": video_m3u8_array[idx],
      "label": r[idx] +
        (idx < 2 ? '<sup>HD</sup>' : '')
    });

  let playerInstance = jwplayer("player_div")
  playerInstance.setup({
    "playlist": [
      {
        "title": video_config_media['metadata']['title'],
        "image": video_config_media['thumbnail']['url'],
        "sources": sources,
        },
        ]
  })

  if (next_enable)
    localStorage.setItem("autoplay", true)

  jwplayer().on("ready", e => {
    if (localStorage.getItem("autoplay") == "true") {
      jwplayer().play();
    }

    document.body.querySelector(".loading_container").style.display = "none";
  })

  function getDirectFile(url) {
    return url.replace(/\/clipFrom.*?index.m3u8/, '').replace('_,', '_').replace(url.split("/")[2], "fy.v.vrv.co");
  }

  function mp4ListFromStream(url) {
    const cleanUrl = url.replace(url.split("/")[2], "fy.v.vrv.co");
    const res = [];
    for (let i in r) {
      if (streamrgx_three.test(cleanUrl) && i <= 2) {
        res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      }
      else {
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
      }
    }
    return res;
  }

  async function m3u8ListFromStream(url) {
    return new Promise((resolve, reject) => {

      resolve(url)

    })
  }
})
