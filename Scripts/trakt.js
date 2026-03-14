WidgetMetadata = {
  id: "forward.trakt",
  title: "Trakt 影视追踪",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "获取 Trakt 追剧日历、待看列表、收藏列表与观看历史",
  author: "Jard1n",
  detailCacheDuration: 3600,
  site: "https://github.com/Jard1n/ForwardWidgets",
  
  modules: [
    {
      id: "traktCalendar",
      title: "追剧日历",
      functionName: "getCalendar",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "traktWatchlist",
      title: "待看列表",
      functionName: "getWatchlist",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "traktCollection",
      title: "收藏列表",
      functionName: "getCollection",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "traktHistory",
      title: "观看历史",
      functionName: "getHistory",
      cacheDuration: 3600,
      params: [],
    }
  ],
};

const DATA_URL = "https://gist.githubusercontent.com/Jard1n/c2f77019fb114bfa7f2cc883fe1f1c26/raw/trakt_data.json";

async function fetchTraktData() {
  try {
    const response = await Widget.http.get(DATA_URL);
    if (response && response.data) {
      return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    }
  } catch (error) {
    console.error("获取 Trakt 数据失败:", error.message);
  }
  return null;
}

// 提取并格式化为 YY-MM-DD 的辅助函数
function formatShortDate(dateStr) {
  if (!dateStr) return "未知时间";
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1].slice(-2); // 截取最后两位：26
    const month = match[2];          // 03
    const day = match[3];            // 11
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function formatMediaData(mediaList, defaultGenre, formatType = "default") {
  if (!mediaList || !Array.isArray(mediaList)) return [];

  let resultList = [];
  
  for (const item of mediaList) {
    const tmdb = item.tmdb_info || {};
    const title = tmdb.title || item.title || "未知影视";
    
    // 获取原始时间字符串
    const timeStrRaw = item.air_date || item.listed_at || item.collected_at || item.watched_at || tmdb.releaseDate || "";
    
    // --- 计算原来的显示格式 (用于 genreTitle) ---
    let originalDisplayStr = "";
    const shortDate = formatShortDate(timeStrRaw);
    if (formatType === "history") {
      let epInfo = "";
      if (item.season !== undefined && item.episode !== undefined) {
        epInfo = `S${item.season}E${item.episode}`;
      } else if (item.media_type === "movie" || item.type === "movie") {
        epInfo = "电影";
      }
      originalDisplayStr = epInfo ? `${shortDate} 已观看·${epInfo}` : `${shortDate} 已观看`;
    } else {
      let epInfo = "";
      if (item.season !== undefined && item.episode !== undefined) {
        epInfo = `S${item.season}E${item.episode}`;
      } else if (item.collected_episodes !== undefined) {
        epInfo = `已收藏${item.collected_episodes}集`;
      }
      originalDisplayStr = epInfo ? `${shortDate}·${epInfo}` : shortDate;
    }

    // --- 计算新的显示格式 (用于 subTitle) ---
    let newDisplayStr = "";
    const fullDate = formatFullDate(timeStrRaw);
    if (formatType === "history") {
      newDisplayStr = `${fullDate} 已观看·${title}`;
    } else {
      newDisplayStr = `${fullDate}·${title}`;
    }

    resultList.push({
      id: tmdb.id || item.tmdb_id || item.trakt_id || Math.random().toString(36).substring(2, 9),
      type: "tmdb",
      title: title,
      originalTitle: tmdb.originalTitle || item.original_title || "",
      description: tmdb.description || "暂无简介",
      // 此处置空可以避免 App 自动拼接额外的前缀年份
      releaseDate: "",
      backdropPath: tmdb.backdropPath || "",
      posterPath: tmdb.posterPath || "",
      rating: tmdb.rating || 0,
      mediaType: tmdb.mediaType || (item.media_type === "movie" ? "movie" : "tv"),
      genreTitle: originalDisplayStr,  // 保持原样：YY-MM-DD·SxEyy
      subTitle: newDisplayStr,         // 采用新版：YYYY-MM-DD·剧名
      tmdbInfo: tmdb,
      popularity: tmdb.popularity || 0,
      isNew: true
    });
  }

  return resultList.filter(item => item.posterPath);
}

// 模块 1：追剧日历
async function getCalendar(params) {
  const data = await fetchTraktData();
  if (data && data.calendar) return formatMediaData(data.calendar, "日历", "default");
  return [];
}

// 模块 2：待看列表
async function getWatchlist(params) {
  const data = await fetchTraktData();
  if (data && data.watchlist) {
    if (Array.isArray(data.watchlist)) {
      return formatMediaData(data.watchlist, "待看", "default");
    }
    const combined = [...(data.watchlist.shows || []), ...(data.watchlist.movies || [])];
    return formatMediaData(combined, "待看", "default");
  }
  return [];
}

// 模块 3：收藏列表
async function getCollection(params) {
  const data = await fetchTraktData();
  if (data && data.collection) {
    const combined = [...(data.collection.shows || []), ...(data.collection.movies || [])];
    return formatMediaData(combined, "收藏", "default");
  }
  return [];
}

// 模块 4：观看历史
async function getHistory(params) {
  const data = await fetchTraktData();
  if (data && data.history) return formatMediaData(data.history, "历史", "history");
  return [];
}
