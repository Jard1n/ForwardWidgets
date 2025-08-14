// 引用地址：https://raw.githubusercontent.com/huangxd-/ForwardWidgets/refs/heads/main/widgets/danmu_auto.js
/**
 * 弹幕示例模块
 * 给 module 指定 type 为 danmu 后，默认会携带以下参数：
 * tmdbId: TMDB ID，Optional
 * type: 类型，tv | movie
 * title: 标题
 * season: 季，电影时为空
 * episode: 集，电影时为空
 * link: 链接，Optional
 * videoUrl: 视频链接，Optional
 * commentId: 弹幕ID，Optional。在搜索到弹幕列表后实际加载时会携带
 * animeId: 动漫ID，Optional。在搜索到动漫列表后实际加载时会携带
 *
 */
WidgetMetadata = {
  id: "forward.auto.danmu",
  title: "自动链接弹幕",
  version: "1.0.6",
  requiredVersion: "0.0.2",
  description: "自动获取播放链接并从服务器获取弹幕【五折码：CHEAP.5;七折码：CHEAP】",
  author: "huangxd",
  site: "https://github.com/huangxd-/ForwardWidgets",
  globalParams: [
    {
      name: "danmu_server",
      title: "自定义服务器",
      type: "input",
      placeholders: [
        {
          title: "lyz05",
          value: "https://fc.lyz05.cn",
        },
        {
          title: "56uxi",
          value: "https://danmu.56uxi.com",
        },
        {
          title: "hls",
          value: "https://dmku.hls.one",
        },
        {
          title: "icu",
          value: "https://api.danmu.icu",
        },
        {
          title: "678",
          value: "https://se.678.ooo",
        },
      ],
    },
    {
      name: "platform",
      title: "电影弹幕优先平台",
      type: "enumeration",
      value: "random",
      enumOptions: [
        {
            title: "随机",
            value: "random",
        },
        {
            title: "爱奇艺",
            value: "qiyi",
        },
        {
            title: "腾讯",
            value: "qq",
        },
        {
            title: "优酷",
            value: "youku",
        },
        {
            title: "芒果",
            value: "imgo",
        },
        {
            title: "哔哩哔哩",
            value: "bilibili1",
        },
      ],
    },
    {
      name: "vod_site",
      title: "兜底vod站点",
      type: "input",
      placeholders: [
        {
          title: "69mu",
          value: "https://www.69mu.cn",
        },
        {
          title: "xmm",
          value: "https://zy.xmm.hk",
        },
      ],
    },
    {
      name: "debug",
      title: "调试日志，是否开启前2分钟投放弹幕日志",
      type: "enumeration",
      value: "false",
      enumOptions: [
        {
            title: "关",
            value: "false",
        },
        {
            title: "开",
            value: "true",
        },
      ],
    },
  ],
  modules: [
    {
      //id需固定为searchDanmu
      id: "searchDanmu",
      title: "搜索弹幕",
      functionName: "searchDanmu",
      type: "danmu",
      params: [],
    },
    {
      //id需固定为getComments
      id: "getComments",
      title: "获取弹幕",
      functionName: "getCommentsById",
      type: "danmu",
      params: [],
    },
  ],
};

function printFirst200Chars(data) {
  let dataToPrint;

  if (typeof data === 'string') {
    dataToPrint = data;  // 如果是字符串，直接使用
  } else if (Array.isArray(data)) {
    dataToPrint = JSON.stringify(data);  // 如果是数组，转为字符串
  } else if (typeof data === 'object') {
    dataToPrint = JSON.stringify(data);  // 如果是对象，转为字符串
  } else {
    console.error("Unsupported data type");
    return;
  }

  console.log(dataToPrint.slice(0, 200));  // 打印前200个字符
}

async function fetchTmdbData(id, type) {
    const tmdbResult = await Widget.tmdb.get(`/${type}/${id}`, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
    });
    //打印结果
    // console.log("搜索内容：" + key)
    if (!tmdbResult) {
        console.log("搜索内容失败：", `/${type}/${id}`);
        return null;
    }
    console.log("tmdbResults:" + JSON.stringify(tmdbResult, null, 2));
    // console.log("tmdbResults.total_results:" + tmdbResults.total_results);
    // console.log("tmdbResults.results[0]:" + tmdbResults.results[0]);
    return tmdbResult;
}

async function getPlayurls(title, tmdbInfo, type, season) {
  let queryTitle = title;

  const response = await Widget.http.get(
    `https://api.so.360kan.com/index?force_v=1&kw=${queryTitle}&from=&pageno=1&v_ap=1&tab=all`,
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );

  if (!response) {
    throw new Error("获取数据失败");
  }

  const data = response.data;
  console.log("360kan response:", data);

  // 检查API返回状态
  if (data.msg !== "ok") {
    throw new Error(data.errorMessage || "API调用失败");
  }

  // 开始过滤数据
  let animes = [];
  const longData = data.data.longData;
  if (longData.rows && longData.rows.length > 0) {
    animes = longData.rows.filter((anime) => {
      if ((anime.cat_name === "电视剧" || anime.cat_name === "动漫") && type === "tv" && tmdbInfo.type !== "Reality") {
        return true;
      } else if (anime.cat_name === "综艺" && type === "tv" && tmdbInfo.type === "Reality") {
        return true;
      } else if (anime.cat_name === "电影" && type === "movie") {
        return true;
      } else {
        return false;
      }
    });
    if (season && tmdbInfo.type !== "Reality") {
      // filter season
      const matchedAnimes = animes.filter((anime) => {
        if (!anime.seriesPlaylinks || anime.seriesPlaylinks.length === 0) {
          return false;
        }
        let anime_title = anime.title.replace(/<\/b>·<b>/g, '');

        if (anime_title.includes(queryTitle)) {
          // use space to split animeTitle
          let titleParts = anime_title.split("</b>");
          console.log(titleParts);
          if (titleParts.length > 1) {
            let seasonPart = titleParts[1];
            // match number from seasonPart
            let seasonIndex = seasonPart.match(/\d+/);
            if (seasonIndex && String(seasonIndex[0]) === String(season)) {
              return true;
            }
            // match chinese number
            let chineseNumber = seasonPart.match(/[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+/);
            if (chineseNumber && String(convertChineseNumber(chineseNumber[0])) === String(season)) {
              return true;
            }
            // match season 1 and no seasonPart
            if (String(season) === "1" && seasonPart === "") {
              return true;
            }
          }
          return false;
        } else {
          return false;
        }
      });
      animes = matchedAnimes;
    }
    if (season && tmdbInfo.type === "Reality") {
      const matchedAnimes = animes.filter((anime) => {
        if (anime.cat_name !== "综艺") {
          return false;
        }
        return true;
      });
      animes = matchedAnimes;
    }
  }

  console.log("animes.length:", animes.length);

  if (animes.length > 1 && tmdbInfo.type !== "Reality") {
    const tmdbYear = type === "tv" ? tmdbInfo.first_air_date.split("-")[0] : tmdbInfo.release_date.split("-")[0];

    animes = animes.filter(anime => anime.year == tmdbYear);
  }

  return animes;
}

async function searchDanmu(params) {
  const { tmdbId, type, title, season, link, videoUrl, danmu_server } = params;

  // const animes = await getPlayurls(title, tmdbId, type, season);

  return {
    animes: [
      {
        "animeId": 1223,
        "bangumiId": "string",
        "animeTitle": title,
        "type": "tvseries",
        "typeDescription": "string",
        "imageUrl": "string",
        "startDate": "2025-08-08T13:25:11.189Z",
        "episodeCount": 12,
        "rating": 0,
        "isFavorited": true
      }
    ]
  };
}

function convertChineseNumber(chineseNumber) {
  // 如果是阿拉伯数字，直接转换
  if (/^\d+$/.test(chineseNumber)) {
    return Number(chineseNumber);
  }

  // 中文数字映射（简体+繁体）
  const digits = {
    // 简体
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9,
    // 繁体
    '壹': 1, '貳': 2, '參': 3, '肆': 4, '伍': 5,
    '陸': 6, '柒': 7, '捌': 8, '玖': 9
  };

  // 单位映射（简体+繁体）
  const units = {
    // 简体
    '十': 10, '百': 100, '千': 1000,
    // 繁体
    '拾': 10, '佰': 100, '仟': 1000
  };

  let result = 0;
  let current = 0;
  let lastUnit = 1;

  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];

    if (digits[char] !== undefined) {
      // 数字
      current = digits[char];
    } else if (units[char] !== undefined) {
      // 单位
      const unit = units[char];

      if (current === 0) current = 1;

      if (unit >= lastUnit) {
        // 更大的单位，重置结果
        result = current * unit;
      } else {
        // 更小的单位，累加到结果
        result += current * unit;
      }

      lastUnit = unit;
      current = 0;
    }
  }

  // 处理最后的个位数
  if (current > 0) {
    result += current;
  }

  return result;
}

function parseDanmakuXML(xmlString) {
  const regex = /<d\s+p="([^"]+)">([\s\S]*?)<\/d>/g;
  const comments = [];
  let match;
  let cid = 0;

  while ((match = regex.exec(xmlString)) !== null) {
    const p = match[1];
    const m = match[2];
    comments.push({
      cid: cid++,
      p: p,
      m: m
    });
  }

  return {
    count: comments.length,
    comments: comments
  };
}

function convertYoukuUrl(url) {
  // 使用正则表达式提取 vid 参数
  const vidMatch = url.match(/vid=([^&]+)/);
  if (!vidMatch || !vidMatch[1]) {
    return null; // 如果没有找到 vid 参数，返回 null
  }

  const vid = vidMatch[1];
  // 构造新的 URL
  return `https://v.youku.com/v_show/id_${vid}.html`;
}

function generateDanmaku(message, count) {
  const comments = [];
  const baseP = "1,1,25,16777215,1754803089,0,0,26732601000067074,1"; // 原始 p 字符串

  for (let i = 0; i < count; i++) {
    // 增加 cid
    const cid = i;

    // 修改 p 的第一位数字，加 5
    const pParts = baseP.split(',');
    pParts[0] = (parseInt(pParts[0], 10) + i * 5).toString(); // 每次增加 i * 5
    const updatedP = pParts.join(',');

    // 使用传入的 m 参数
    const m = message;

    // 生成每个弹幕对象
    comments.push({
      cid: cid,
      p: updatedP,
      m: m
    });
  }

  return {
    count: comments.length,
    comments: comments
  };
}


function printParams(seriesName, episodeName, airDate, runtime, premiereDate, season, episode, tmdbId) {
    /*
    seriesName: 歌手
    episodeName: 第13期：荣耀汇聚终极一战
    airDate: 2025-08-08
    runtime: 12360
    premiereDate: 08/08 08:00
    season: 10
    episode: 13
    tmdbId: 107467
    */
    const comments = [];
    comments.push({
        cid: 0,
        p: "1,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `seriesName: ${seriesName}`
    });
    comments.push({
        cid: 0,
        p: "6,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `episodeName: ${episodeName}`
    });
    comments.push({
        cid: 0,
        p: "11,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `airDate: ${airDate}`
    });
    comments.push({
        cid: 0,
        p: "16,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `runtime: ${runtime}`
    });
    comments.push({
        cid: 0,
        p: "21,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `premiereDate: ${premiereDate}`
    });
    comments.push({
        cid: 0,
        p: "26,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `season: ${season}`
    });
    comments.push({
        cid: 0,
        p: "31,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `episode: ${episode}`
    });
    comments.push({
        cid: 0,
        p: "36,1,25,16777215,1754803089,0,0,26732601000067074,1",
        m: `tmdbId: ${tmdbId}`
    });
    return {
        count: 8,
        comments: comments
    };
}

async function getDanmuFromUrl(danmu_server, playUrl, debug) {
    let response
    try {
        response = await Widget.http.get(
            `${danmu_server}/?url=${playUrl}&ac=dm`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            }
        );
    } catch (error) {
        // 捕获错误并输出
        console.error("请求失败:", error);
        // 这里你可以根据需求处理错误，比如返回特定的错误信息或状态码
        const count = debug === "true" ? 24 : 1;
        return generateDanmaku(`【自动链接弹幕】：弹幕服务器异常 ${error.cause} ${error}`, count);
    }

    console.log("danmu response:", printFirst200Chars(response.data));
    // const result = parseDanmakuXML(response.data);
    // console.log("danmu json response:", printFirst200Chars(result));
    return response.data;
}

async function getCommentsById(params) {
  const { danmu_server, platform, vod_site, debug, commentId, seriesName, episodeName, airDate, runtime,
      premiereDate, link, videoUrl, season, episode, tmdbId, type, title } = params;

  // 测试参数值
  // return printParams(seriesName, episodeName, airDate, runtime, premiereDate, season, episode, tmdbId);

  if (typeof tmdbId === 'undefined') {
    const count = debug === "true" ? 24 : 1;
    return generateDanmaku("【自动链接弹幕】：参数tmdbId为undefined", count);
  }

  let playUrl = null;
  let playUrlList = [];

  const tmdbInfo = await fetchTmdbData(tmdbId, type);

  const animes = await getPlayurls(title, tmdbInfo, type, season);
  console.log("animes.length:", animes.length);

  if (animes.length === 0) {
    playUrl = await getPlayurlFromVod(title, tmdbInfo, type, season, episode, episodeName, airDate, platform, vod_site);
    if (playUrl) {
        return await getDanmuFromUrl(danmu_server, playUrl, debug);
    }
    if (!playUrl) {
        const count = debug === "true" ? 24 : 1;
        return generateDanmaku("【自动链接弹幕】：相关站点没有找到这部影视剧", count);
    }
  }

  if (tmdbInfo.type !== "Reality") {
      console.log("anime: ", animes[0]);

      if (episode) {
        if (episode - 1 >= 0 && episode - 1 < animes[0].seriesPlaylinks.length) {
            playUrl = animes[0].seriesPlaylinks[episode - 1].url;
        } else {
            playUrl = await getPlayurlFromVod(title, tmdbInfo, type, season, episode, episodeName, airDate, platform, vod_site);
            if (playUrl) {
                return await getDanmuFromUrl(danmu_server, playUrl, debug);
            }
            if (!playUrl) {
                const count = debug === "true" ? 24 : 1;
                return generateDanmaku("【自动链接弹幕】：没有找到该集弹幕", count);
            }
        }
      } else {
        // 获取所有平台名称
        if (platform === "random" || !animes[0].playlinks[platform]) {
          const allowedPlatforms = ["qiyi", "bilibili1", "imgo", "youku", "qq"];
          // 随机选择一个平台
          const filteredLinks = Object.keys(animes[0].playlinks).filter(platform => allowedPlatforms.includes(platform));
          const randomPlatform = filteredLinks[Math.floor(Math.random() * filteredLinks.length)];
          console.log(`Random platform: ${randomPlatform}`);
          // 获取对应平台的链接
          playUrl = animes[0].playlinks[randomPlatform];
        } else {
          console.log(`Selected platform: ${platform}`);
          playUrl = animes[0].playlinks[platform];
        }
      }
  } else {
      if (!episodeName) {
          playUrl = await getPlayurlFromVod(title, tmdbInfo, type, season, episode, episodeName, airDate, platform, vod_site);
          if (playUrl) {
              return await getDanmuFromUrl(danmu_server, playUrl, debug);
          }
          if (!playUrl) {
              const count = debug === "true" ? 24 : 1;
              return generateDanmaku("【自动链接弹幕】：该集综艺没有集标题，匹配不了", count);
          }
      }
      // 如果存在airDate，则先获取airDate的年份，并通过年份获取所有年份相关的集信息
      let airYear = null;
      if (airDate && airDate !== "" && /^\d{4}-\d{2}-\d{2}$/.test(airDate)) {
          airYear = airDate.split("-")[0];
      }
      console.log("airYear: ", airYear);
      for (let i = 0; i < animes.length; i++) {
          for (const key of Object.keys(animes[i].playlinks_year)) {
            for (const year of animes[i].playlinks_year[key]) {
                if (!airYear || year === Number(airYear)) {
                    console.log(`键: ${key}, 年份: ${year}`);
                    for (let j = 0; j <= 10; j++) {
                        const response = await Widget.http.get(
                            `https://api.so.360kan.com/episodeszongyi?entid=${animes[i].id}&site=${key}&y=${year}&count=20&offset=${j*20}`,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                                },
                            }
                        );

                        const data = response.data;
                        console.log("360kan zongyi response:", data);

                        // 检查API返回状态
                        if (data.msg !== "ok") {
                            throw new Error(data.errorMessage || "API调用失败");
                        }

                        const episodeList = data.data.list;
                        if (!episodeList) {
                            break;
                        }
                        for (const episodeInfo of episodeList) {
                            if (airDate && episodeInfo.pubdate === airDate) {
                                playUrlList.push(episodeInfo);
                            }
                            if (episodeInfo.name === episodeName) {
                                playUrl = episodeInfo.url;
                                break
                            }
                        }
                        if (playUrl) {
                            break
                        }
                    }
                }
                if (playUrl) {
                    break
                }
            }
            if (playUrl) {
                break
            }
        }
        if (playUrl) {
            break
        }
      }
  }

  if (!playUrl && playUrlList.length !== 0) {
      playUrl = playUrlList[0].url;
  }

  console.log("playUrl: ", playUrl);

  if (!playUrl) {
      playUrl = await getPlayurlFromVod(title, tmdbInfo, type, season, episode, episodeName, airDate, platform, vod_site);
      if (playUrl) {
          return await getDanmuFromUrl(danmu_server, playUrl, debug);
      }
      if (!playUrl) {
          const count = debug === "true" ? 24 : 1;
          return generateDanmaku("【自动链接弹幕】：没有获取到相应播放链接！", count);
      }
  }

  // 处理302场景
  // https://v.youku.com/video?vid=XNjQ4MTIwOTE2NA==&tpa=dW5pb25faWQ9MTAyMjEzXzEwMDAwNl8wMV8wMQ需要转成https://v.youku.com/v_show/id_XNjQ4MTIwOTE2NA==.html
  if (playUrl.includes("youku.com/video?vid")) {
      playUrl = convertYoukuUrl(playUrl);
  }

  return await getDanmuFromUrl(danmu_server, playUrl, debug);
}

function extractAndFormatDate(episodeKey) {
    // 检查 YYYYMMDD 格式（如 20220612）
    const yyyymmddRegex = /^\d{8}/;
    // 检查 YYYY-MM-DD 格式（如 2014-01-03）
    const yyyy_mm_ddRegex = /^\d{4}-\d{2}-\d{2}/;

    let dateStr = null;

    // 优先检查 YYYYMMDD 格式
    if (yyyymmddRegex.test(episodeKey)) {
        dateStr = episodeKey.slice(0, 8);
        // 转换为 YYYY-MM-DD
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }
    // 检查 YYYY-MM-DD 格式
    else if (yyyy_mm_ddRegex.test(episodeKey)) {
        dateStr = episodeKey.slice(0, 10);
        // 已经是正确格式，直接返回
        return dateStr;
    }

    // 如果没有找到有效日期格式，返回 null
    return null;
}

async function getPlayurlFromVod(title, tmdbInfo, type, season, episode, episodeName, airDate, platform, vod_site) {
  const response = await Widget.http.get(
    `${vod_site}/api.php/provide/vod/?ac=detail&wd=${title}&pg=1`,
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );

  if (!response) {
    throw new Error("获取数据失败");
  }

  const data = response.data;
  console.log("vod response:", printFirst200Chars(data));

  // 开始过滤数据
  let animes = [];
  if (data.list && data.list.length > 0) {
    animes = data.list.filter((anime) => {
      if ((anime.type_name === "电视剧" || anime.type_name === "动漫" || anime.type_name === "连续剧" || anime.type_name === "少儿"
      ) && type === "tv" && tmdbInfo.type !== "Reality") {
        return true;
      } else if (anime.type_name === "综艺" && type === "tv" && tmdbInfo.type === "Reality") {
        return true;
      } else if (anime.type_name === "电影" && type === "movie") {
        return true;
      } else {
        return false;
      }
    });
  }

  console.log("animes.length:", animes.length);

  if (animes.length > 1) {
    const tmdbYear = type === "tv" ? tmdbInfo.seasons[season].air_date.split("-")[0] : tmdbInfo.release_date.split("-")[0];

    animes = animes.filter(anime => anime.vod_year == tmdbYear);
  }

  if (animes.length === 0) {
      return null;
  }

  const anime = animes[0];
  if (!anime.vod_play_url || anime.vod_play_url === "") {
      return null;
  }

  let playUrl = null;

  let vodPlayFromList = anime.vod_play_from.split("$$$")
  vodPlayFromList = vodPlayFromList.map(item => {
      if (item === "mgtv") {
        return "imgo"; // 将mgtv替换为imgo
      } else if (item === "bilibili") {
        return "bilibili1"; // 将bilibili替换为bilibili1
      } else {
        return item; // 其他情况保持原值
      }
  });

  const vodPlayUrlList = anime.vod_play_url.split("$$$")
  let platformIndex = -1;
  if (platform === "random" || !vodPlayFromList.includes(platform)) {
      // 允许的平台列表
      const allowedPlatforms = ["qiyi", "bilibili1", "imgo", "youku", "qq"];

      // Step 1: 过滤出在allowedPlatforms中的元素，并保持它们在vodPlayFromList中的原始索引
      const validIndices = vodPlayFromList
          .map((item, index) => allowedPlatforms.includes(item) ? index : -1)
          .filter(index => index !== -1);

      // Step 2: 从有效的索引中随机选择一个
      if (validIndices.length > 0) {
          platformIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
          const randomPlatform = vodPlayFromList[platformIndex];
          console.log(`Randomly selected platform: ${randomPlatform} (Index: ${platformIndex})`);
      } else {
          return null;
      }
  } else {
      console.log(`Selected platform: ${platform}`);
      platformIndex = vodPlayFromList.indexOf(platform);
  }
  if (!episode) {
      playUrl = vodPlayUrlList[platformIndex].split("#")[0].split("$")[1];
  } else {
      const episodeList = vodPlayUrlList[platformIndex].split("#");
      if (tmdbInfo.type !== "Reality") {
          if (episode - 1 >= 0 && episode - 1 < episodeList.length) {
              playUrl = episodeList[episode - 1].split("$")[1];
          } else {
              return null;
          }
      } else {
          for (const episodeInfo of episodeList) {
              const episodeKey = episodeInfo.split("$")[0];
              const episodeDate = extractAndFormatDate(episodeKey);
              console.log(episodeKey, episodeDate);
              if (episodeDate && airDate && episodeDate === airDate) {
                  playUrl = episodeInfo.split("$")[1];
                  break;
              }
              if (episodeKey === episodeName) {
                  playUrl = episodeInfo.split("$")[1];
                  break;
              }
          }
      }
  }

  return playUrl;
}
