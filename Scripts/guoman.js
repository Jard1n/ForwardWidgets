WidgetMetadata = {
  id: "forward.animeschedule",
  title: "国漫日程表",
  version: "1.1.0",
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

// 获取你 Gist 上的最新 JSON 数据
const DATA_URL = "https://gist.githubusercontent.com/Jard1n/0c7ea2fcede896a7af690b9a54487aa8/raw/tencent_anime.json";

// 基础获取数据方法
async function fetchScheduleData() {
  try {
    console.log("正在获取最新动漫排播数据...");
    const response = await Widget.http.get(DATA_URL);
    
    if (response && response.data) {
      // 兼容处理：有时 Gist 返回的是字符串，需要 parse
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log(`动漫数据获取成功，数据更新时间: ${jsonData.update_time}`);
      return jsonData;
    }
  } catch (error) {
    console.error("获取动漫排播数据失败:", error.message);
  }
  return null;
}

// 格式化动漫排播数据
function formatAnimeData(dayData) {
  if (!dayData) return [];

  const platforms = [
    { key: 'tencent', name: '腾讯视频' },
    { key: 'bilibili', name: '哔哩哔哩' },
    { key: 'iqiyi', name: '爱奇艺' },
    { key: 'youku', name: '优酷视频' }
  ];
  
  let resultList = [];
  
  // 遍历四个平台的数据
  for (const platform of platforms) {
    const animeList = dayData[platform.key] || [];
    
    for (const anime of animeList) {
      const tmdb = anime.tmdb_info || {};
      
      resultList.push({
        id: tmdb.id || Math.random().toString(36).substring(2, 9),
        type: "tmdb",
        title: tmdb.title || anime.title,
        originalTitle: tmdb.title || anime.title,
        description: tmdb.description || "暂无简介",
        releaseDate: tmdb.releaseDate || dayData.date,
        backdropPath: tmdb.backdropPath || "",
        posterPath: tmdb.posterPath || "",
        rating: tmdb.rating || 0,
        mediaType: "tv",
        genreTitle: platform.name, // 左下角标签显示所在的视频平台
        tmdbInfo: tmdb,
        popularity: tmdb.popularity || 0,
        isNew: true
      });
    }
  }

  // 过滤掉没有成功获取到 TMDB 海报的项，以免在组件中显示黑屏
  let validList = resultList.filter(item => item.posterPath);
  
  // 按热度 (popularity) 降序排序，热度高的排在前面
  validList.sort((a, b) => b.popularity - a.popularity);
  
  console.log(`格式化完成，共包含 ${validList.length} 部带有海报的动漫`);
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
