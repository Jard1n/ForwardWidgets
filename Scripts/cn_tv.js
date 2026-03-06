WidgetMetadata = {
    id: "cn_tv_calendar_pure",
    title: "国剧综艺日历",
    author: "Jard1n",
    description: "专注中国地区今日及明日的剧集、综艺更新聚合",
    version: "1.0.1", 
    requiredVersion: "0.0.1",
    
    globalParams: [],

    modules: [
        {
            title: "国剧综艺更新",
            functionName: "loadCalendar",
            type: "video", 
            cacheDuration: 3600,
            params: [
                {
                    name: "mode", 
                    title: "更新时间",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { title: "今日更新", value: "today" },
                        { title: "明日更新", value: "tomorrow" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// =========================================================================
// 0. 通用工具与字典
// =========================================================================

const GENRE_MAP = {
    10759: "动作冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 10762: "儿童", 9648: "悬疑", 10763: "新闻",
    10764: "真人秀(综艺)", 10765: "科幻", 10766: "肥皂剧", 10767: "脱口秀(综艺)",
    10768: "政治", 37: "西部", 28: "动作", 12: "冒险", 14: "奇幻", 
    878: "科幻", 27: "恐怖", 10749: "爱情", 53: "惊悚", 10752: "战争"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "";
    return ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 1).join("");
}

function buildItem({ id, tmdbId, title, poster, backdrop, subTitle, desc, year, releaseDate }) {
    const fullPoster = poster && poster.startsWith("http") ? poster : (poster ? `https://image.tmdb.org/t/p/w500${poster}` : "");
    const fullBackdrop = backdrop && backdrop.startsWith("http") ? backdrop : (backdrop ? `https://image.tmdb.org/t/p/w780${backdrop}` : "");

    return {
        id: String(id),
        tmdbId: parseInt(tmdbId),
        type: "tv", // 固定为剧集/综艺
        mediaType: "tv",
        title: title,
        
        genreTitle: subTitle, 
        subTitle: subTitle,
        
        posterPath: fullPoster,
        backdropPath: fullBackdrop,
        description: `${subTitle}\n${desc || "暂无简介"}`,
        
        year: year || "",            
        releaseDate: releaseDate || "" 
    };
}

// =========================================================================
// 1. 核心业务逻辑
// =========================================================================

async function loadCalendar(params = {}) {
    const mode = params.mode || "today";
    const page = params.page || 1;
    
    // 计算查询日期
    const dates = calculateDates(mode);
    
    // 基础查询参数
    const queryParams = {
        language: "zh-CN",
        sort_by: "popularity.desc",
        page: page,
        timezone: "Asia/Shanghai",
        with_origin_country: "CN",
        with_original_language: "zh",
        "air_date.gte": dates.start,
        "air_date.lte": dates.end,
        without_genres: "16" // 排除动画和动漫
    };

    try {
        const res = await Widget.tmdb.get("/discover/tv", { params: queryParams });
        const data = res || {};
        
        if (!data.results || data.results.length === 0) {
            return page === 1 ? [{ id: "empty", type: "text", title: "暂无影视更新" }] : [];
        }

        return data.results.map(item => {
            const fullDate = item.first_air_date || dates.start;
            const title = item.name;
            
            const yearStr = fullDate ? fullDate.substring(0, 4) : "";
            const genreText = getGenreText(item.genre_ids) || "剧综";
            
            const displaySubtitle = genreText;

            return buildItem({
                id: item.id, 
                tmdbId: item.id, 
                title: title, 
                poster: item.poster_path, 
                backdrop: item.backdrop_path,
                subTitle: displaySubtitle, 
                desc: item.overview,
                year: yearStr,           
                releaseDate: fullDate    
            });
        });
    } catch (e) { 
        return [{ id: "err", type: "text", title: "网络或接口超时" }]; 
    }
}

// =========================================================================
// 2. 辅助函数
// =========================================================================

function calculateDates(mode) {
    const today = new Date();
    const toStr = (d) => d.toISOString().split('T')[0];
    
    if (mode === "tomorrow") {
        const tmr = new Date(today); 
        tmr.setDate(today.getDate() + 1); 
        return { start: toStr(tmr), end: toStr(tmr) };
    }
    
    // 默认为 today
    return { start: toStr(today), end: toStr(today) };
}
