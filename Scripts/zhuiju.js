WidgetMetadata = {
  id: "makka.anime.tabs.fixed.subtitle",
  title: "全网国漫·日程表",
  author: "Customized",
  description: "聚合国内四大平台更新，国漫·日程表",
  version: "1.0.3",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "国漫更新",
      functionName: "loadAnimeWithTabs",
      type: "list",
      requiresWebView: false,
      params: [
        {
          name: "dayTab",
          title: "日期切换",
          type: "enumeration", 
          value: "today", 
          enumOptions: [
            { title: "📅 今日播出", value: "today" },
            { title: "🌅 明日预告", value: "tomorrow" }
          ],
          displayMode: "inline" 
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        }
      ],
    },
  ],
};

async function loadAnimeWithTabs(params) {
  const dayTab = params.dayTab || "today"; 
  const page = params.page || 1;
  
  const targetDate = new Date();
  if (dayTab === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
  }
  const dateStr = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000))
                  .toISOString().split("T")[0];

  const networks = ["1605", "2007", "1330", "1419"];

  if (page > 1) return [];

  try {
    const promises = networks.map(netId => {
        return Widget.tmdb.get("/discover/tv", { 
            params: {
                with_networks: netId,
                language: "zh-CN",
                include_null_first_air_dates: false,
                page: 1, 
                with_genres: "16", 
                "air_date.gte": dateStr, 
                "air_date.lte": dateStr, 
                sort_by: "popularity.desc"
            }
        }).then(res => res?.results || []);
    });

    const resultsArray = await Promise.all(promises);
    
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
        return [{ title: "暂无更新", subTitle: `${label}无记录`, type: "text" }];
    }

    const topItems = uniqueItems
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 30);

    const processedItems = await Promise.all(topItems.map(async (item) => {
        try {
            const detail = await Widget.tmdb.get(`/tv/${item.id}`, { 
                params: { 
                    language: "zh-CN",
                    append_to_response: "networks"
                } 
            });

            if (!detail) return null;

            let year = "";
            if (item.first_air_date) {
                year = item.first_air_date.split("-")[0];
            } else {
                year = new Date().getFullYear();
            }

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
                _subTitleStr: `${year} · ${platformName}`, 
                vote_average: detail.vote_average
            };

        } catch(e) {
            return null;
        }
    }));

    const finalItems = processedItems
        .filter(i => i !== null)
        .sort((a, b) => b.popularity - a.popularity);

    if (finalItems.length === 0) {
        return [{ title: "暂无详细数据", subTitle: "数据源可能尚未刷新", type: "text" }];
    }

    return finalItems.map(item => buildCard(item));

  } catch (e) {
    return [{ title: "请求失败", subTitle: String(e), type: "text" }];
  }
}

// ==========================================
// 修复的核心部分
// ==========================================
function buildCard(item) {
    let imagePath = "";
    // 优先使用 backdrop (横图)
    if (item.backdrop_path) imagePath = `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
    else if (item.poster_path) imagePath = `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
        // 使用 generic 类型而不是 tmdb，可以完全控制显示内容
        // Forward 会将其渲染为标准图文卡片
        type: "ticket", // 尝试使用 ticket 或 pure 卡片样式，通常对 subTitle 支持更好
        title: item.name || item.original_name,
        subTitle: item._subTitleStr, // 标准副标题位置
        footnote: item._subTitleStr, // 某些布局下的底部文字
        
        image: imagePath, // 通用图片字段
        posterPath: imagePath, // 兼容字段
        
        // 交互动作：点击跳转到 TMDb 详情页
        link: `https://www.themoviedb.org/tv/${item.id}`,
        
        // 辅助信息
        itemType: "tv",
        tmdbId: item.id
    };
}
