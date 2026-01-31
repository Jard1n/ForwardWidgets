WidgetMetadata = {
  id: "makka.anime.tabs.selector",
  title: "全网国漫·日程表",
  author: "Customized",
  description: "聚合国内四大平台更新，国漫·日程表",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "国漫更新",
      functionName: "loadAnimeWithTabs",
      type: "list",
      requiresWebView: false,
      params: [
        // 1. 顶部标签选择器
        {
          name: "dayTab",
          title: "日期切换",
          type: "enumeration", 
          // 这里的 value 会作为默认选中的标签
          value: "today", 
          enumOptions: [
            { title: "📅 今日播出", value: "today" },
            { title: "🌅 明日预告", value: "tomorrow" }
          ],
          // 关键：设置为 inline 可能会在部分客户端表现为顶部 Tab 切换
          displayMode: "inline" 
        },
        // 2. 页码
        {
          name: "page",
          title: "页码",
          type: "page"
        }
      ],
    },
  ],
};

// ==========================================
// 主逻辑
// ==========================================

async function loadAnimeWithTabs(params) {
  // 获取当前选中的标签：today 或 tomorrow
  const dayTab = params.dayTab || "today"; 
  const page = params.page || 1;
  
  // 1. 计算目标日期
  const targetDate = new Date();
  
  // 如果选了明天，日期+1
  if (dayTab === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
  }
  
  // 转为 YYYY-MM-DD 格式
  const dateStr = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000))
                  .toISOString().split("T")[0];

  // 定义四大平台 ID
  const networks = [
      "1605", // Bilibili
      "2007", // 腾讯视频
      "1330", // 爱奇艺
      "1419"  // 优酷
  ];

  // 仅支持第一页聚合（性能考虑）
  if (page > 1) return [];

  try {
    // 2. 并发请求四大平台
    const promises = networks.map(netId => {
        return Widget.tmdb.get("/discover/tv", { 
            params: {
                with_networks: netId,
                language: "zh-CN",
                include_null_first_air_dates: false,
                page: 1, 
                with_genres: "16", // 动画
                "air_date.gte": dateStr, // 锁定具体某一天
                "air_date.lte": dateStr, 
                sort_by: "popularity.desc"
            }
        }).then(res => res?.results || []);
    });

    const resultsArray = await Promise.all(promises);
    
    // 3. 合并去重
    const allItems = resultsArray.flat();
    const uniqueItems = [];
    const seenIds = new Set();

    for (const item of allItems) {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
        }
    }

    const label = dayTab === "today" ? "今日" : "明天";
    if (uniqueItems.length === 0) {
        return [{ title: "暂无更新", subTitle: `${label}四大平台均无记录`, type: "text" }];
    }

    // 4. 获取详细信息 (取热度前 30 防止请求爆炸)
    const topItems = uniqueItems
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 30);

    const processedItems = await Promise.all(topItems.map(async (item) => {
        try {
            const detail = await Widget.tmdb.get(`/tv/${item.id}`, { 
                params: { 
                    language: "zh-CN",
                    append_to_response: "next_episode_to_air,last_episode_to_air,networks"
                } 
            });

            if (!detail) return null;

            // 寻找匹配日期的集数
            let targetEp = null;
            if (detail.next_episode_to_air && detail.next_episode_to_air.air_date === dateStr) {
                targetEp = detail.next_episode_to_air;
            } else if (detail.last_episode_to_air && detail.last_episode_to_air.air_date === dateStr) {
                targetEp = detail.last_episode_to_air;
            }

            if (!targetEp) return null;

            const epStr = `S${String(targetEp.season_number).padStart(2,'0')}E${String(targetEp.episode_number).padStart(2,'0')}`;
            
            // 获取平台名
            let platformName = "";
            if (detail.networks) {
                 const targetNames = ["Bilibili", "Tencent Video", "iQiyi", "Youku"];
                 const names = detail.networks
                    .filter(n => targetNames.some(t => n.name.includes(t) || n.name === t))
                    .map(n => {
                        if (n.name.includes("Bilibili")) return "B站";
                        if (n.name.includes("Tencent")) return "腾讯";
                        if (n.name.includes("iQiyi")) return "爱奇艺";
                        if (n.name.includes("Youku")) return "优酷";
                        return n.name;
                    });
                if (names.length > 0) platformName = names.slice(0, 2).join("/");
            }
            if (!platformName) platformName = "全网";

            return {
                ...item,
                _displayStr: `${label} · ${epStr}`, // 显示 "今日 · S02E10"
                _platform: platformName,
                vote_average: detail.vote_average
            };

        } catch(e) {
            return null;
        }
    }));

    // 5. 最终返回
    const finalItems = processedItems
        .filter(i => i !== null)
        .sort((a, b) => b.popularity - a.popularity);

    if (finalItems.length === 0) {
        return [{ title: "暂无详细数据", subTitle: "数据源可能尚未刷新", type: "text" }];
    }

    return finalItems.map(item => buildCard(item));

  } catch (e) {
    return [{ title: "请求失败", subTitle: e.message, type: "text" }];
  }
}

function buildCard(item) {
    let imagePath = "";
    if (item.backdrop_path) imagePath = `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
    else if (item.poster_path) imagePath = `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: "tv",
        title: item.name || item.original_name,
        subTitle: item._displayStr,  // 左下角：今日 · SxxExx
        genreTitle: item._platform,  // 右上角：B站/腾讯
        description: item.overview || "暂无简介",
        posterPath: imagePath
    };
}
