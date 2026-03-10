WidgetMetadata = {
  id: "makka.anime.tabs.selector",
  title: "全网国漫·日程表",
  author: "Jard1n",
  description: "聚合国内四大平台更新，国漫·日程表",
  version: "1.0.3",
  requiredVersion: "0.0.1",
  detailCacheDuration: 3600, 
  modules: [
    {
      title: "国漫更新",
      functionName: "loadAnimeWithTabs",
      type: "list",
      requiresWebView: false,
      cacheDuration: 3600, 
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

// ==========================================
// 常量配置
// ==========================================

const NETWORKS_CONFIG = [
    { id: "1605", name: "B站" },
    { id: "2007", name: "腾讯" },
    { id: "1330", name: "爱奇艺" },
    { id: "1419", name: "优酷" }
];

// ==========================================
// 主逻辑
// ==========================================

async function loadAnimeWithTabs(params) {
  const dayTab = params.dayTab || "today"; 
  const page = params.page || 1;
  
  // 性能优化：仅支持第一页，因为聚合去重逻辑在分页下极其复杂且耗资源
  if (page > 1) return [];

  // 1. 获取东八区(CN)的日期字符串
  const dateStr = getCNDateString(dayTab === "tomorrow" ? 1 : 0);

  try {
    // 2. 并发请求四大平台
    const promises = NETWORKS_CONFIG.map(network => {
        return Widget.tmdb.get("/discover/tv", { 
            params: {
                with_networks: network.id,
                language: "zh-CN",
                include_null_first_air_dates: false,
                page: 1, 
                with_genres: "16", // 动画分类
                "air_date.gte": dateStr, // 锁定具体日期
                "air_date.lte": dateStr, 
                sort_by: "popularity.desc"
            }
        }).then(res => {
            const results = res?.results || [];
            // 在这里直接注入平台名称
            return results.map(item => ({ ...item, _platformSource: network.name }));
        });
    });

    const resultsArray = await Promise.all(promises);
    
    // 3. 聚合与去重 (核心逻辑)
    const itemMap = new Map();

    // 展平数组并遍历
    for (const item of resultsArray.flat()) {
        if (itemMap.has(item.id)) {
            // 如果已存在，说明是多平台播出
            const existingItem = itemMap.get(item.id);
            // 避免重复拼接 (如: B站/B站)
            if (!existingItem._platformSource.includes(item._platformSource)) {
                existingItem._platformSource += `/${item._platformSource}`;
            }
        } else {
            itemMap.set(item.id, item);
        }
    }

    // 转回数组
    const uniqueItems = Array.from(itemMap.values());

    // 4. 排序与文案处理
    const label = dayTab === "today" ? "今日更新" : "明日预告";
    
    if (uniqueItems.length === 0) {
        return [{ title: "暂无更新", subTitle: `${label}四大平台均无记录`, type: "text" }];
    }

    // 按热度降序
    uniqueItems.sort((a, b) => b.popularity - a.popularity);

    // 5. 构建卡片
    return uniqueItems.map(item => {
        // 给 buildCard 传递处理好的额外字段
        item._displayStr = label; 
        item._platform = item._platformSource;
        return buildCard(item);
    });

  } catch (e) {
    return [{ title: "请求失败", subTitle: String(e), type: "text" }];
  }
}

// 辅助函数：获取东八区 YYYY-MM-DD
function getCNDateString(offsetDays = 0) {
    const d = new Date();
    // 转换到 UTC 时间
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 强制 +8 小时
    const cnTime = new Date(utc + (3600000 * 8));
    
    if (offsetDays !== 0) {
        cnTime.setDate(cnTime.getDate() + offsetDays);
    }
    return cnTime.toISOString().split("T")[0];
}

// 优化后的构建函数 (透传图片路径)
function buildCard(item) {
    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: "tv",
        title: item.name || item.original_name,
        subTitle: item._displayStr,  
        genreTitle: item._platform,  
        description: item.overview || "暂无简介",
        
        // 直接透传字段，让客户端自动根据设备处理分辨率和域名
        backdropPath: item.backdrop_path, 
        posterPath: item.poster_path
    };
}
