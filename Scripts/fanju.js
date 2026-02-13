WidgetMetadata = {
    id: "anime_tmdb_daily_pure",
    title: "番剧·日程表",
    author: "Jard1n",
    description: "专注 TMDB 每日与明日动漫更新",
    version: "1.0.1",
    requiredVersion: "0.0.1",
    site: "https://www.themoviedb.org",

    modules: [
        {
            title: "番剧更新",
            functionName: "loadTmdbDailyUpdate",
            type: "video",
            cacheDuration: 3600,
            params: [
                {
                    name: "mode",
                    title: "日期选择",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { title: "📅 今日播出", value: "today" },
                        { title: "🌅 明日预告", value: "tomorrow" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// =========================================================================
// 0. 核心工具
// =========================================================================

const GENRE_MAP = {
    16: "动画", 10759: "动作冒险", 35: "喜剧", 18: "剧情", 14: "奇幻", 
    878: "科幻", 9648: "悬疑", 10749: "爱情", 27: "恐怖", 10765: "科幻奇幻"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "动画";
    const genres = ids.filter(id => id !== 16).map(id => GENRE_MAP[id]).filter(Boolean);
    return genres.length > 0 ? genres[0] : "动画";
}

// 获取 YYYY-MM-DD 格式日期
function getDateString(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * 构建 Item 对象
 */
function buildItem({ id, tmdbId, type, title, date, poster, backdrop, rating, genreText, desc }) {
    return {
        id: String(id),
        tmdbId: parseInt(tmdbId),
        type: "tmdb", 
        mediaType: type || "tv",
        title: title,
        
        // 类型标签
        genreTitle: genreText || "动画", 
        
        // 副标题仅显示具体日期
        description: date || "暂无日期", 
        
        // 内核自动提取年份
        releaseDate: date,
        
        posterPath: poster ? `https://image.tmdb.org/t/p/w500${poster}` : "",
        backdropPath: backdrop ? `https://image.tmdb.org/t/p/w780${backdrop}` : "",
        rating: rating ? Number(rating).toFixed(1) : "0.0"
    };
}

// =========================================================================
// 1. TMDB 每日更新逻辑
// =========================================================================

async function loadTmdbDailyUpdate(params = {}) {
    const { mode = "today", page = 1 } = params;
    
    // 计算目标日期：today=0, tomorrow=1
    const offset = mode === "today" ? 0 : 1;
    const targetDate = getDateString(offset);

    // 构造请求参数：筛选指定日期范围、日漫、按人气排序
    // 注意：air_date 筛选的是剧集的播出时间
    const queryParams = {
        "air_date.gte": targetDate,
        "air_date.lte": targetDate,
        sort_by: "popularity.desc",
        with_genres: "16",              // 16=动画
        with_original_language: "ja",   // ja=日语
        include_adult: false,
        language: "zh-CN",
        page: page
    };

    try {
        // 使用 discover/tv 接口查找特定日期播出的番剧
        const res = await Widget.tmdb.get("/discover/tv", { params: queryParams });
        const dataList = res.results || [];

        return dataList.map(item => buildItem({
            id: item.id,
            tmdbId: item.id,
            type: "tv",
            title: item.name || item.original_name,        
            date: item.first_air_date || targetDate,            
            poster: item.poster_path,
            backdrop: item.backdrop_path,
            rating: item.vote_average,
            genreText: getGenreText(item.genre_ids),
            desc: item.overview
        }));

    } catch (e) {
        console.error(`TMDB Daily Load Error: ${e}`);
        return [];
    }
}
