WidgetMetadata = {
    id: "trakt_personal_mixed",
    title: "Trakt 追剧日历&个人中心",
    author: "Jard1n",
    description: "追剧日历:显示你观看剧集最新集的 更新时间&Trakt 待看/收藏/历史。",
    version: "2.0.0",
    requiredVersion: "0.0.1",
    site: "https://trakt.tv",

    globalParams: [
        { name: "traktUser", title: "Trakt 用户名 (必填)", type: "input", value: "" },
        { name: "traktClientId", title: "Trakt Client ID (必填)", type: "input", value: "" }
    ],

    modules: [
        {
            title: "我的片单",
            functionName: "loadTraktProfile",
            type: "list",
            cacheDuration: 300, // 模块级缓存 5分钟
            params: [
                {
                    name: "section",
                    title: "浏览区域",
                    type: "enumeration",
                    value: "updates",
                    enumOptions: [
                        { title: "📅 追剧日历", value: "updates" },
                        { title: "📜 待看列表", value: "watchlist" },
                        { title: "📦 收藏列表", value: "collection" },
                        { title: "🕒 观看历史", value: "history" }
                    ]
                },
                {
                    name: "type",
                    title: "内容筛选",
                    type: "enumeration",
                    value: "all",
                    belongTo: { paramName: "section", value: ["watchlist", "collection", "history"] },
                    enumOptions: [ { title: "全部", value: "all" }, { title: "剧集", value: "shows" }, { title: "电影", value: "movies" } ]
                },
                {
                    name: "updateSort",
                    title: "追剧模式",
                    type: "enumeration",
                    value: "future_first",
                    belongTo: { paramName: "section", value: ["updates"] },
                    enumOptions: [
                        { title: "🔜 从今天往后", value: "future_first" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// ==========================================
// 0. 核心工具函数 (并发控制 & 缓存)
// ==========================================

/**
 * 并发控制池，防止瞬间发起过多请求触发 Rate Limit
 * @param {number} poolLimit 最大并发数
 * @param {Array} array 数据源
 * @param {Function} iteratorFn 处理函数
 */
async function asyncPool(poolLimit, array, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item, array));
        ret.push(p);
        if (poolLimit <= array.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

/**
 * 带缓存的 TMDB 详情请求
 * 逻辑：完结剧缓存7天，连载剧缓存12小时
 */
async function getCachedTmdbShow(tmdbId) {
    const cacheKey = `trakt_cache_show_${tmdbId}`;
    const cachedStr = Widget.storage.get(cacheKey);
    
    if (cachedStr) {
        try {
            const cached = JSON.parse(cachedStr);
            const now = Date.now();
            const isEnded = cached.data.status === "Ended" || cached.data.status === "Canceled";
            const ttl = isEnded ? 7 * 24 * 3600 * 1000 : 12 * 3600 * 1000; // 7天 或 12小时
            
            if (now - cached.timestamp < ttl) {
                return cached.data;
            }
        } catch (e) { console.log("Cache parse error"); }
    }

    // 缓存过期或不存在，发起网络请求
    try {
        const data = await Widget.tmdb.get(`/tv/${tmdbId}`, { params: { language: "zh-CN" } });
        if (data) {
            Widget.storage.set(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        }
        return data;
    } catch (e) {
        return null;
    }
}

function formatShortDate(dateStr) {
    if (!dateStr) return "待定";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // 防止无效日期
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2);
    return `${y}-${m}-${d}`;
}

// ==========================================
// 1. 主入口逻辑
// ==========================================

async function loadTraktProfile(params = {}) {
    const { traktUser, traktClientId, section, updateSort = "future_first", type = "all", page = 1 } = params;

    if (!traktUser || !traktClientId) return [{ id: "err", type: "text", title: "请填写用户名和Client ID" }];

    try {
        // === A. 追剧日历 (Updates) ===
        if (section === "updates") {
            return await loadUpdatesLogic(traktUser, traktClientId, "future_first", page);
        }

        // === B. 常规列表 (历史/待看/收藏) ===
        let rawItems = [];
        const sortType = "added,desc";
        const historySort = section === "history" ? "watched_at,desc" : sortType;

        if (type === "all") {
            // 限制并发为 2，避免同时请求电影和剧集导致超时
            const [movies, shows] = await Promise.all([
                fetchTraktList(section, "movies", historySort, page, traktUser, traktClientId),
                fetchTraktList(section, "shows", historySort, page, traktUser, traktClientId)
            ]);
            rawItems = [...movies, ...shows];
        } else {
            rawItems = await fetchTraktList(section, type, historySort, page, traktUser, traktClientId);
        }
        
        // 本地排序：最新的在前面
        rawItems.sort((a, b) => new Date(getItemTime(b, section)) - new Date(getItemTime(a, section)));
        
        if (!rawItems || rawItems.length === 0) return page === 1 ? [{ id: "empty", type: "text", title: "列表为空" }] : [];

        // 使用并发控制处理详情获取，限制并发数为 8
        const processedItems = await asyncPool(8, rawItems, async (item) => {
            const subject = item.show || item.movie || item;
            if (!subject?.ids?.tmdb) return null;
            
            let subInfo = "";
            const timeStr = getItemTime(item, section);

            if (section === "history") {
                const watchShort = formatShortDate(timeStr.split('T')[0]);
                let watchedEpInfo = "";
                if (item.episode?.season && item.episode?.number) {
                    const s = item.episode.season.toString().padStart(2, '0');
                    const e = item.episode.number.toString().padStart(2, '0');
                    watchedEpInfo = ` · S${s}E${e}`;
                }
                subInfo = `👁️ ${watchShort} 看过${watchedEpInfo}`;
            } else {
                if (timeStr) subInfo = timeStr.split('T')[0];
                if (type === "all") subInfo = `[${item.show ? "剧" : "影"}] ${subInfo}`;
            }

            return await fetchTmdbDetail(subject.ids.tmdb, item.show ? "tv" : "movie", subInfo, subject.title);
        });
        
        return processedItems.filter(Boolean);

    } catch (e) {
        return [{ id: "err_global", type: "text", title: "加载失败: " + e.message }];
    }
}

// ==========================================
// 2. 追剧日历逻辑 (重构版)
// ==========================================

async function loadUpdatesLogic(user, id, sort, page) {
    // 限制获取 100 条，减少不必要的数据传输
    const url = `https://api.trakt.tv/users/${user}/watched/shows?extended=noseasons&limit=100`;
    try {
        const res = await Widget.http.get(url, {
            headers: { "Content-Type": "application/json", "trakt-api-version": "2", "trakt-api-key": id }
        });
        
        let data = res.data || [];
        if (data.length === 0) return [{ id: "empty", type: "text", title: "无观看记录" }];

        // 1. 预过滤：只保留有 TMDB ID 的数据
        data = data.filter(item => item.show?.ids?.tmdb);

        // 2. 并发控制 + 缓存机制获取详情
        // 限制并发数为 5，避免 TMDB 429 错误
        const enrichedShows = await asyncPool(5, data, async (item) => {
            try {
                // 使用带缓存的请求函数
                const tmdb = await getCachedTmdbShow(item.show.ids.tmdb);
                if (!tmdb) return null;
                
                const nextAir = tmdb.next_episode_to_air?.air_date;
                const lastAir = tmdb.last_episode_to_air?.air_date;
                const sortDate = nextAir || lastAir || "1970-01-01";
                const today = new Date().toISOString().split('T')[0];
                const isFuture = sortDate >= today;

                return {
                    trakt: item, 
                    tmdb: tmdb,
                    sortDate: sortDate,
                    isFuture: isFuture,
                    watchedDate: item.last_watched_at
                };
            } catch (e) { return null; }
        });

        const valid = enrichedShows.filter(Boolean);
        
        // 3. 排序逻辑：待播出的按时间正序，已完结/过去的按时间倒序
        const futureShows = valid.filter(s => s.isFuture && s.tmdb.next_episode_to_air);
        const pastShows = valid.filter(s => !s.isFuture || !s.tmdb.next_episode_to_air);
        
        futureShows.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));
        pastShows.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
        
        valid.length = 0; 
        valid.push(...futureShows, ...pastShows);

        // 4. 分页切片
        const start = (page - 1) * 15;
        const pagedItems = valid.slice(start, start + 15);

        // 5. 格式化输出
        return pagedItems.map(item => {
            const d = item.tmdb;
            let displayStr = "暂无排期";
            let epData = null;
            let statusSuffix = "";
            
            // 优先显示下一集，其次显示上一集
            if (d.next_episode_to_air) {
                epData = d.next_episode_to_air;
            } else if (d.last_episode_to_air) {
                epData = d.last_episode_to_air;
            }

            if (d.status === "Ended" || d.status === "Canceled") {
                statusSuffix = " (全剧终)";
            } else if (!d.next_episode_to_air && d.last_episode_to_air) {
                statusSuffix = " (本季完)";
            }
            
            if (epData) {
                const shortDate = formatShortDate(epData.air_date);
                displayStr = `${shortDate} · S${epData.season_number}E${epData.episode_number}${statusSuffix}`;
            }

            return {
                id: String(d.id), 
                tmdbId: d.id, 
                type: "tmdb", 
                mediaType: "tv",
                title: d.name, 
                genreTitle: displayStr, 
                subTitle: displayStr,
                posterPath: buildPosterPath(d.poster_path, d.backdrop_path),
                description: `上次观看: ${item.watchedDate.split("T")[0]}\n${d.overview || "暂无简介"}`
            };
        });
    } catch (e) { 
        console.error(e);
        return [{ id: "err_cal", type: "text", title: "日历加载错误，请重试" }]; 
    }
}

// ==========================================
// 3. 辅助网络请求函数
// ==========================================

async function fetchTraktList(section, type, sort, page, user, id) {
    const limit = 20; 
    const url = `https://api.trakt.tv/users/${user}/${section}/${type}?extended=full&page=${page}&limit=${limit}`;
    try {
        const res = await Widget.http.get(url, {
            headers: { "Content-Type": "application/json", "trakt-api-version": "2", "trakt-api-key": id }
        });
        return Array.isArray(res.data) ? res.data : [];
    } catch (e) { return []; }
}

async function fetchTmdbDetail(id, type, subInfo, originalTitle) {
    try {
        const d = await Widget.tmdb.get(`/${type}/${id}`, { params: { language: "zh-CN" } });
        const year = (d.first_air_date || d.release_date || "").substring(0, 4);
        
        let displayGenre = year;
        if (subInfo && (subInfo.includes("👁️") || subInfo.includes("更新") || subInfo.includes("·"))) {
            displayGenre = subInfo;
        }

        return {
            id: String(d.id), 
            tmdbId: d.id, 
            type: "tmdb", 
            mediaType: type,
            title: d.name || d.title || originalTitle,
            genreTitle: displayGenre, 
            subTitle: subInfo, 
            description: d.overview || "暂无简介",
            posterPath: buildPosterPath(d.poster_path, d.backdrop_path)
        };
    } catch (e) { return null; }
}

function buildPosterPath(poster, backdrop) {
    if (poster) return `https://image.tmdb.org/t/p/w500${poster}`;
    if (backdrop) return `https://image.tmdb.org/t/p/w500${backdrop}`;
    return "";
}

function getItemTime(item, section) {
    if (section === "watchlist") return item.listed_at;
    if (section === "history") return item.watched_at;
    if (section === "collection") return item.collected_at;
    return item.created_at || "1970-01-01";
}
