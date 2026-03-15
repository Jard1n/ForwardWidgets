WidgetMetadata = {
  id: "douban",
  title: "豆瓣影视榜单",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "获取豆瓣各类影视榜单",
  author: "Jard1n",
  site: "https://github.com/Jard1n/ForwardWidgets",
  modules: [
    {
      id: "douban_cn",
      title: "国产剧",
      functionName: "getCNShows",
      params: [],
    },
    {
      id: "douban_us",
      title: "欧美剧",
      functionName: "getUSShows",
      params: [],
    },
    {
      id: "douban_jp",
      title: "日剧",
      functionName: "getJPShows",
      params: [],
    },
    {
      id: "douban_kr",
      title: "韩剧",
      functionName: "getKRShows",
      params: [],
    },
    {
      id: "douban_anime",
      title: "动漫",
      functionName: "getAnime",
      params: [],
    },
    {
      id: "douban_doc",
      title: "纪录片",
      functionName: "getDocumentary",
      params: [],
    },
    {
      id: "douban_variety",
      title: "综艺",
      functionName: "getVariety",
      params: [],
    }
  ],
};

const DATA_URL = "https://gist.githubusercontent.com/Jard1n/e3f77539c754a44998056681b01f7520/raw/douban.json";

// 缓存数据，避免重复请求
let doubanDataCache = null;

async function fetchDoubanData() {
  if (doubanDataCache) return doubanDataCache;
  try {
    const response = await Widget.http.get(DATA_URL);
    if (response && response.data) {
      doubanDataCache = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      return doubanDataCache;
    }
  } catch (error) {
    console.error("获取豆瓣数据失败:", error.message);
  }
  return null;
}

// 格式化数据的通用函数
function formatDoubanData(mediaList) {
  if (!mediaList || !Array.isArray(mediaList)) return [];

  let resultList = [];
  
  for (const item of mediaList) {
    const tmdb = item.tmdb_info || {};
    
    // 从 douban_subtitle 提取剧情标签 (例: 2026 / 中国大陆 / 剧情 爱情 古装 / ...)
    let genres = "";
    if (item.douban_subtitle) {
      const parts = item.douban_subtitle.split(" / ");
      if (parts.length >= 3) {
        // 第三部分通常是类型标签，用空格分割后取前两个
        const genreArray = parts[2].trim().split(" ");
        genres = genreArray.slice(0, 2).join(" ");
      } else if (parts.length === 2 && !item.douban_subtitle.includes(" /  / ")) {
        // 兼容一下极个别特殊格式
        genres = parts[1].trim().split(" ").slice(0, 2).join(" ");
      }
    }
    const displayGenre = genres || "暂无标签";
    
    resultList.push({
      id: tmdb.id,
      type: tmdb.type,
      title: item.title,
      originalTitle: tmdb.originalTitle || item.title || "",
      description: tmdb.description || item.douban_subtitle || "暂无简介",
      releaseDate: tmdb.releaseDate || item.year || "",
      backdropPath: tmdb.backdropPath || "",
      posterPath: tmdb.posterPath || "",
      rating: tmdb.rating || item.douban_rating || 0,
      mediaType: tmdb.mediaType || "tv",
      genreTitle: displayGenre,
      subTitle: item.year || tmdb.tmdb_year || "",
      tmdbInfo: tmdb,
      popularity: tmdb.popularity || 0,
      isNew: true
    });
  }

  // 过滤掉没有海报的数据
  return resultList.filter(item => item.posterPath);
}

// 模块 1：国产剧
async function getCNShows(params) {
  const data = await fetchDoubanData();
  if (data && data["国产剧"]) return formatDoubanData(data["国产剧"]);
  return [];
}

// 模块 2：欧美剧
async function getUSShows(params) {
  const data = await fetchDoubanData();
  if (data && data["欧美剧"]) return formatDoubanData(data["欧美剧"]);
  return [];
}

// 模块 3：日剧
async function getJPShows(params) {
  const data = await fetchDoubanData();
  if (data && data["日剧"]) return formatDoubanData(data["日剧"]);
  return [];
}

// 模块 4：韩剧
async function getKRShows(params) {
  const data = await fetchDoubanData();
  if (data && data["韩剧"]) return formatDoubanData(data["韩剧"]);
  return [];
}

// 模块 5：动漫
async function getAnime(params) {
  const data = await fetchDoubanData();
  if (data && data["动画"]) return formatDoubanData(data["动画"]);
  return [];
}

// 模块 6：纪录片
async function getDocumentary(params) {
  const data = await fetchDoubanData();
  if (data && data["纪录片"]) return formatDoubanData(data["纪录片"]);
  return [];
}

// 模块 7：综艺
async function getVariety(params) {
  const data = await fetchDoubanData();
  if (data && data["综艺"]) return formatDoubanData(data["综艺"]);
  return [];
}
