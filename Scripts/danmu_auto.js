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
  version: "1.0.4",
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

async function getPlayurls(title, tmdbId, type, season) {
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
      if (
        (anime.cat_name === "电视剧" || anime.cat_name === "动漫") &&
        type === "tv"
      ) {
        return true;
      } else if (anime.cat_name === "电影" && type === "movie") {
        return true;
      } else {
        return false;
      }
    });
    if (season) {
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
  }

  console.log("animes.length:", animes.length);

  if (animes.length > 1) {
    const tmdbInfo = await fetchTmdbData(tmdbId, type);
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

async function getCommentsById(params) {
  const { danmu_server, platform, debug, commentId, link, videoUrl, season, episode, tmdbId, type, title } = params;

  const animes = await getPlayurls(title, tmdbId, type, season);
  console.log("animes.length:", animes.length);

  if (animes.length === 0) {
    const count = debug === "true" ? 24 : 1;
    return generateDanmaku("【自动链接弹幕】：相关站点没有找到这部影视剧", count);
  }

  console.log("anime: ", animes[0]);

  let playUrl;
  if (episode) {
    playUrl = animes[0].seriesPlaylinks[episode-1].url;
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

  console.log("playUrl: ", playUrl);

  // 处理302场景
  // https://v.youku.com/video?vid=XNjQ4MTIwOTE2NA==&tpa=dW5pb25faWQ9MTAyMjEzXzEwMDAwNl8wMV8wMQ需要转成https://v.youku.com/v_show/id_XNjQ4MTIwOTE2NA==.html
  if (playUrl.includes("youku.com/video?vid")) {
    playUrl = convertYoukuUrl(playUrl);
  }

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