WidgetMetadata = {
  id: "forward.doubantv",
  title: "豆瓣热门影视",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "获取豆瓣时下热门电视剧与综艺",
  author: "Forward",
  site: "https://github.com/Jard1n/ForwardWidgets",
  detailCacheDuration: 3600,
    
  modules: [
    {
      id: "doubanTV",
      title: "热门电视剧",
      functionName: "doubanTV",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "doubanVariety",
      title: "热门综艺",
      functionName: "doubanVariety",
      cacheDuration: 3600,
      params: [],
    }
  ],
};

const DATA_URL = "https://gist.githubusercontent.com/Jard1n/4ebe54ecb6a4c62b777f03fea98ad473/raw/douban_tv.json";

// 基础获取数据方法
async function fetchDoubanData() {
  try {
    console.log("正在获取最新豆瓣影视数据...");
    const response = await Widget.http.get(DATA_URL);
    
    if (response && response.data) {
      // 兼容处理：有时 Gist 返回的是字符串，需要 parse
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log(`豆瓣影视数据获取成功，数据更新时间: ${jsonData.update_time || '未知'}`);
      return jsonData;
    }
  } catch (error) {
    console.error("获取豆瓣影视数据失败:", error.message);
  }
  return null;
}

// 统一的格式化数据方法
function formatMediaData(mediaList, defaultGenre) {
  if (!mediaList || !Array.isArray(mediaList)) return [];

  let resultList = [];
  
  for (const item of mediaList) {
    const tmdb = item.tmdb_info || {};
    
    resultList.push({
      id: tmdb.id || item.id || Math.random().toString(36).substring(2, 9),
      type: "tmdb",
      // 主标题选用 tmdb_info 下的 title，如果为空则回退使用豆瓣原标题
      title: tmdb.title || item.title || "未知剧集",
      originalTitle: tmdb.originalTitle || item.title || "",
      // 只保留简介信息
      description: tmdb.description || "暂无简介",
      releaseDate: tmdb.releaseDate || item.release_date || "",
      backdropPath: tmdb.backdropPath || "",
      posterPath: tmdb.posterPath || item.cover_url || item.poster_url || "",
      rating: tmdb.rating || item.rating || item.rate || 0,
      mediaType: tmdb.mediaType || "tv",
      genreTitle: defaultGenre, // 左下角标签显示类型（电视剧/综艺）
      tmdbInfo: tmdb,
      popularity: tmdb.popularity || 0,
      isNew: true
    });
  }

  // 过滤掉没有成功获取到 TMDB 海报的项，以免在组件中显示黑屏
  const validList = resultList.filter(item => item.posterPath);
  
  console.log(`[${defaultGenre}] 格式化完成，共包含 ${validList.length} 部带有海报的影视`);
  return validList;
}

// 模块 1：热门电视剧
async function doubanTV(params) {
  const data = await fetchDoubanData();
  if (data && data.tv_domestic) {
    return formatMediaData(data.tv_domestic, "电视剧");
  }
  return [];
}

// 模块 2：热门综艺
async function doubanVariety(params) {
  const data = await fetchDoubanData();
  if (data) {
    const varietyShow = data.tv_variety_show || [];
    const bestWeekly = data.show_chinese_best_weekly || [];
    
    // 合并两个列表
    const combinedList = [...varietyShow, ...bestWeekly];
    
    // 根据 tmdb_info.id 去重（如果没有 tmdb_info.id 则使用豆瓣 item.id）
    const seenIds = new Set();
    const uniqueList = [];
    
    for (const item of combinedList) {
      const id = (item.tmdb_info && item.tmdb_info.id) ? item.tmdb_info.id : item.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueList.push(item);
      }
    }
    
    return formatMediaData(uniqueList, "综艺");
  }
  return [];
}
