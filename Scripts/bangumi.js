WidgetMetadata = {
  id: "bangumi",
  title: "Bangumi 追番日历",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "获取 Bangumi 每日更新番剧列表",
  author: "Jard1n",
  site: "https://github.com/Jard1n/ForwardWidgets",
  modules: [
    {
      id: "bangumi_calendar",
      title: "Bangumi 追番日历",
      functionName: "loadBangumiCalendar",
      params: [
        {
          name: "weekday",
          title: "选择日期",
          type: "enumeration",
          value: "today",
          enumOptions: [
            { title: "📅 今日更新", value: "today" },
            { title: "星期一", value: "1" },
            { title: "星期二", value: "2" },
            { title: "星期三", value: "3" },
            { title: "星期四", value: "4" },
            { title: "星期五", value: "5" },
            { title: "星期六", value: "6" },
            { title: "星期日", value: "7" }
          ]
        }
      ]
    }
  ],
};

// 获取你 Gist 上的最新 Bangumi JSON 数据
const DATA_URL = "https://gist.githubusercontent.com/Jard1n/472a6583a11c93b60b31a4b1696ee4ef/raw/bangumi_calendar.json";

// 基础获取数据方法
async function fetchScheduleData() {
  try {
    console.log("正在获取最新 Bangumi 追番日历数据...");
    const response = await Widget.http.get(DATA_URL);
    
    if (response && response.data) {
      // 兼容处理：有时 Gist 返回的是字符串，需要 parse
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log(`动漫数据获取成功，数据更新时间: ${jsonData.update_time}`);
      return jsonData;
    }
  } catch (error) {
    console.error("获取 Bangumi 数据失败:", error.message);
  }
  return null;
}

// 格式化动漫数据
function formatBangumiData(items, dayStr) {
  if (!items || !items.length) return [];

  let resultList = [];
  
  for (const anime of items) {
    const tmdb = anime.tmdb_info || {};
    
    resultList.push({
      id: tmdb.id,
      type: tmdb.type,
      title: anime.title || tmdb.title,
      originalTitle: anime.original_title || tmdb.original_title || anime.title,
      description: tmdb.description || "暂无简介",
      releaseDate: tmdb.releaseDate || "",
      backdropPath: tmdb.backdropPath || "",
      posterPath: tmdb.posterPath || "",
      rating: anime.bgm_score || tmdb.rating || 0,
      mediaType: "tv",
      genreTitle: tmdb.genre || dayStr,
      tmdbInfo: tmdb,
      popularity: tmdb.popularity || 0,
      isNew: true
    });
  }

  // 过滤掉没有成功获取到 TMDB 海报的项，以免在组件中显示黑屏
  let validList = resultList.filter(item => item.posterPath);
  
  // 按评分降序排序，评分高的排在前面
  validList.sort((a, b) => b.rating - a.rating);
  
  console.log(`[${dayStr}] 格式化完成，共包含 ${validList.length} 部带有海报的番剧`);
  return validList;
}

// 星期数字与文字映射表
const dayMap = {
  1: "星期一",
  2: "星期二",
  3: "星期三",
  4: "星期四",
  5: "星期五",
  6: "星期六",
  7: "星期日"
};

// 模块：获取特定日期的 Bangumi 日历
async function loadBangumiCalendar(params) {
  const data = await fetchScheduleData();
  if (!data || !data.calendar) return [];

  const weekdayParam = params.weekday || "today";
  let targetDayStr = "";

  // 如果选择 today，计算当前星期
  if (weekdayParam === "today") {
    let currentDayNum = new Date().getDay(); // 0(周日) - 6(周六)
    if (currentDayNum === 0) currentDayNum = 7;
    targetDayStr = dayMap[currentDayNum];
  } else {
    targetDayStr = dayMap[parseInt(weekdayParam)];
  }

  console.log(`当前需要获取的数据为: ${targetDayStr}`);

  // 从日历数组中寻找匹配的天数
  const targetDayData = data.calendar.find(c => c.day === targetDayStr);

  if (targetDayData && targetDayData.items) {
    return formatBangumiData(targetDayData.items, targetDayStr);
  }

  return [];
}
