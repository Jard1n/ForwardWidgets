// 引用：https://raw.githubusercontent.com/MakkaPakka518/ForwardWidgets/refs/heads/main/widgets/traktlistpro.js
WidgetMetadata = {
    id: "trakt_personal_mixed",
    title: "Trak 追剧日历&个人中心",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    description: "追剧日历:显示你观看剧集最新集的 更新时间&Trakt 待看/收藏/历史。",
    version: "1.1.4",
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
            cacheDuration: 300,
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
// 0. 工具函数
// ==========================================

// 格式化日期为 yy-MM-dd (26-01-30)
function formatShortDate(dateStr) {
    if (!dateStr) return "待定";
    const date = new Date(dateStr);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2); 
    return `${y}-${m}-${d}`;
}

// ==========================================
// 1. 主逻辑
// ==========================================

async function loadTraktProfile(params = {}) {
    const { traktUser, traktClientId, section, updateSort = "future_first", type = "all", page = 1 } = params;

    if (!traktUser || !traktClientId) return [{ id: "err", type: "text", title: "请填写用户名和Client ID" }];

    // === A. 追剧日历 (Updates) ===
    if (section === "updates") {
        return await loadUpdatesLogic(traktUser, traktClientId, "future_first", page);
    }

    // === B. 常规列表 (历史/待看/收藏) ===
    let rawItems = [];
    const sortType = "added,desc";
    const historySort = section === "history" ? "watched_at,desc" : sortType;

    if (type === "all") {
        const [movies, shows] = await Promise.all([
            fetchTraktList(section, "movies", historySort, page, traktUser, traktClientId),
            fetchTraktList(section, "shows", historySort, page, traktUser, traktClientId)
        ]);
        rawItems = [...movies, ...shows];
    } else {
        rawItems = await fetchTraktList(section, type, historySort, page, traktUser, traktClientId);
    }
    
    // 再次在本地按时间倒序整理
    rawItems.sort((a, b) => new Date(getItemTime(b, section)) - new Date(getItemTime(a, section)));
    
    if (!rawItems || rawItems.length === 0) return page === 1 ? [{ id: "empty", type: "text", title: "列表为空" }] : [];

    const promises = rawItems.map(async (item) => {
        const subject = item.show || item.movie || item;
        if (!subject?.ids?.tmdb) return null;
        
        let subInfo = "";
        const timeStr = getItemTime(item, section);

        // --- 核心处理：历史记录 (History) ---
        if (section === "history") {
            const watchShort = formatShortDate(timeStr.split('T')[0]);
            let watchedEpInfo = "";
            
            if (item.episode && item.episode.season && item.episode.number) {
                const s = item.episode.season.toString().padStart(2, '0');
                const e = item.episode.number.toString().padStart(2, '0');
                watchedEpInfo = ` · S${s}E${e}`;
            }
            // 纯文本，无空格前缀，确保和标题对其
            subInfo = `${watchShort} 看过${watchedEpInfo}`;

        } else {
            if (timeStr) subInfo = timeStr.split('T')[0];
            if (type === "all") subInfo = `[${item.show ? "剧" : "影"}] ${subInfo}`;
        }

        return await fetchTmdbDetail(subject.ids.tmdb, item.show ? "tv" : "movie", subInfo, subject.title);
    });
    
    return (await Promise.all(promises)).filter(Boolean);
}

// ==========================================
// 2. 追剧日历逻辑 (Updates)
// ==========================================

async function loadUpdatesLogic(user, id, sort, page) {
    const url = `https://api.trakt.tv/users/${user}/watched/shows?extended=noseasons&limit=100`;
    try {
        const res = await Widget.http.get(url, {
            headers: { "Content-Type": "application/json", "trakt-api-version": "2", "trakt-api-key": id }
        });
        const data = res.data || [];
        if (data.length === 0) return [{ id: "empty", type: "text", title: "无观看记录" }];

        const enrichedShows = await Promise.all(data.slice(0, 60).map(async (item) => {
            if (!item.show?.ids?.tmdb) return null;
            const tmdb = await fetchTmdbShowDetails(item.show.ids.tmdb);
            if (!tmdb) return null;
            
            const nextAir = tmdb.next_episode_to_air?.air_date;
            const lastAir = tmdb.last_episode_to_air?.air_date;
            const sortDate = nextAir || lastAir || "1970-01-01";
            const today = new Date().toISOString().split('T')[0];
            const isFuture = sortDate >= today;

            return {
                trakt: item, tmdb: tmdb,
                sortDate: sortDate,
                isFuture: isFuture,
                watchedDate: item.last_watched_at
            };
        }));

        const valid = enrichedShows.filter(Boolean);
        
        // 强制 Future First 排序
        const futureShows = valid.filter(s => s.isFuture && s.tmdb.next_episode_to_air);
        const pastShows = valid.filter(s => !s.isFuture || !s.tmdb.next_episode_to_air);
        futureShows.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));
        pastShows.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
        valid.length = 0; 
        valid.push(...futureShows, ...pastShows);

        const start = (page - 1) * 15;
        return valid.slice(start, start + 15).map(item => {
            const d = item.tmdb;
            let displayStr = "暂无排期";
            let epData = null;
            let statusSuffix = "";
            
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
                // 确保这里没有任何前导空格
                displayStr = `${shortDate} · S${epData.season_number}E${epData.episode_number}${statusSuffix}`;
            }

            return {
                id: String(d.id), 
                tmdbId: d.id, 
                type: "tmdb", 
                mediaType: "tv",
                title: d.name, 
                // 关键修正：确保 genreTitle 被正确赋值且无前缀
                genreTitle: displayStr, 
                subTitle: displayStr,
                posterPath: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : "",
                description: `上次观看: ${item.watchedDate.split("T")[0]}\n${d.overview}`
            };
        });
    } catch (e) { return []; }
}

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
        
        // 默认显示年份（完美对齐）
        let displayGenre = year;
        
        // 如果有自定义信息（如历史记录日期），覆盖年份
        // 确保 subInfo 本身是干净的字符串，没有前导空格
        if (subInfo && subInfo !== "1970-01-01") {
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
            description: d.overview,
            posterPath: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : ""
        };
    } catch (e) { return null; }
}

async function fetchTmdbShowDetails(id) {
    try { return await Widget.tmdb.get(`/tv/${id}`, { params: { language: "zh-CN" } }); } catch (e) { return null; }
}

function getItemTime(item, section) {
    if (section === "watchlist") return item.listed_at;
    if (section === "history") return item.watched_at;
    if (section === "collection") return item.collected_at;
    return item.created_at || "1970-01-01";
}
