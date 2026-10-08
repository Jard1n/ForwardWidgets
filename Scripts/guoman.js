WidgetMetadata = {
  id: "forward.animeschedule",
  title: "国漫日程表",
  version: "1.2.3",
  requiredVersion: "0.0.1",
  description: "获取国内四大平台今日与明日的动漫更新日程",
  author: "Jard1n",
  site: "https://github.com/Jard1n/ForwardWidgets",
  detailCacheDuration: 3600,

  modules: [
    {
      id: "todayAnime",
      title: "今日更新",
      functionName: "todayAnime",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "tomorrowAnime",
      title: "明日更新",
      functionName: "tomorrowAnime",
      cacheDuration: 3600,
      params: [],
    }
  ],
};

// 获取 Gist 上的最新 JSON 数据
const DATA_URL = "https://gist.githubusercontent.com/Jard1n/0c7ea2fcede896a7af690b9a54487aa8/raw/tencent_anime.json";

// 基础获取数据方法
async function fetchScheduleData() {
  try {
    console.log("正在获取最新动漫排播数据...");
    const response = await Widget.http.get(DATA_URL);
    
    if (response && response.data) {
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log(`动漫数据获取成功，数据更新时间: ${jsonData.update_time}`);
      return jsonData;
    }
  } catch (error) {
    console.error("获取动漫排播数据失败:", error.message);
  }
  return null;
}

// 格式化动漫排播数据（包含去重与多平台合并）
function formatAnimeData(dayData) {
  if (!dayData) return [];

  // 将平台名称做简化配置
  const platforms = [
    { key: 'tencent', name: '腾讯' },
    { key: 'bilibili', name: 'B站' },
    { key: 'iqiyi', name: '爱奇艺' },
    { key: 'youku', name: '优酷' }
  ];
  
  // 使用 Map 进行去重，Key 为 tmdb.id 或 清理后的标题
  const animeMap = new Map();
  
  // 遍历四个平台的数据
  for (const platform of platforms) {
    const animeList = dayData[platform.key] || [];
    
    for (const anime of animeList) {
      const tmdb = anime.tmdb_info || {};
      
      // 优先使用 tmdb.id 去重，没有则使用 title 去重（去除首尾空格）
      const uniqueKey = tmdb.id ? `tmdb_${tmdb.id}` : `title_${(anime.title || "").trim()}`;

      if (animeMap.has(uniqueKey)) {
        // 如果已存在，合并平台简称
        const existingItem = animeMap.get(uniqueKey);
        if (!existingItem.platformNames.includes(platform.name)) {
          existingItem.platformNames.push(platform.name);
          existingItem.genreItems.push({ id: platform.key, title: platform.name });
        }
      } else {
        // 如果不存在，记录下来
        const rawDate = tmdb.releaseDate || dayData.date || "";
        const year = rawDate ? rawDate.split('-')[0] : "";

        animeMap.set(uniqueKey, {
          id: tmdb.id || Math.random().toString(36).substring(2, 9),
          type: "tmdb",
          mediaType: "tv",
          title: tmdb.title || anime.title,
          description: tmdb.description || "暂无简介",
          year: year,
          platformNames: [platform.name], // 存储简短名称数组
          backdropPath: tmdb.backdropPath || "",
          posterPath: tmdb.posterPath || "",
          rating: tmdb.rating || 0,     
          genreItems: [{ id: platform.key, title: platform.name }],
          popularity: tmdb.popularity || 0,
        });
      }
    }
  }

  // 整理数据结构，组装最终副标题
  let resultList = Array.from(animeMap.values()).map(item => {
    // 拼接成 "腾讯 / B站" 格式
    const platformsStr = item.platformNames.join(' / ');
    // 最终副标题格式，例如："2023 · 腾讯 / B站"
    const displaySubtitle = item.year ? `${item.year} · ${platformsStr}` : platformsStr;
    
    return {
      id: item.id,
      type: item.type,
      mediaType: item.mediaType,
      title: item.title,
      description: item.description,
      releaseDate: displaySubtitle, 
      backdropPath: item.backdropPath,
      posterPath: item.posterPath,
      rating: item.rating,
      genreItems: item.genreItems,
      popularity: item.popularity,
    };
  });

  // 过滤掉没有海报的项
  let validList = resultList.filter(item => item.posterPath);
  
  // 按热度降序排序
  validList.sort((a, b) => b.popularity - a.popularity);
  
  console.log(`格式化完成，去重后共包含 ${validList.length} 部动漫`);
  return validList;
}

// 模块 1：今日更新
async function todayAnime(params) {
  const data = await fetchScheduleData();
  if (data && data.today) {
    return formatAnimeData(data.today);
  }
  return [];
}

// 模块 2：明日更新
async function tomorrowAnime(params) {
  const data = await fetchScheduleData();
  if (data && data.tomorrow) {
    return formatAnimeData(data.tomorrow);
  }
  return [];
}
