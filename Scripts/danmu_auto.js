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
  version: "1.0.0",
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
  console.log(data);

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

  console.log(animes.length);

  if (animes.length > 1) {
    const tmdbInfo = await fetchTmdbData(tmdbId, type);
    const tmdbYear = type === "tv" ? tmdbInfo.data.first_air_date.split("-")[0] : tmdbInfo.data.release_date.split("-")[0];

    animes = animes.filter(anime => anime.year == tmdbYear);
  }

  return animes;
}

async function searchDanmu(params) {
  const { tmdbId, type, title, season, link, videoUrl, danmu_server } = params;

  const animes = await getPlayurls(title, tmdbId, type, season);

  return {
    animes: animes.length === 0 ? [] : [
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

async function getCommentsById(params) {
  const { danmu_server, commentId, link, videoUrl, season, episode, tmdbId, type, title } = params;

  const animes = await getPlayurls(title, tmdbId, type, season);
  console.log(animes.length);
  console.log(animes[0]);

  let playUrl;
  if (episode) {
    playUrl = animes[0].seriesPlaylinks[episode-1].url;
  } else {
    playUrl = Object.values(animes[0].playlinks)[0];
  }

  console.log(playUrl);

  // 处理302场景
  // https://v.youku.com/video?vid=XNjQ4MTIwOTE2NA==&tpa=dW5pb25faWQ9MTAyMjEzXzEwMDAwNl8wMV8wMQ需要转成https://v.youku.com/v_show/id_XNjQ4MTIwOTE2NA==.html
  if (playUrl.includes("youku.com/video?vid")) {
    playUrl = convertYoukuUrl(playUrl);
  }

  const response = await Widget.http.get(
    `${danmu_server}/?url=${playUrl}&ac=dm`,
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );

  console.log(response.data);
  // const result = parseDanmakuXML(response.data);
  // console.log(result);
  return response.data;
}