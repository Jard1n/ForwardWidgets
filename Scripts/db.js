// 引用地址：https://raw.githubusercontent.com/huangxd-/ForwardWidgets/refs/heads/main/widgets/douban.js
// 豆瓣片单组件
WidgetMetadata = {
  id: "douban",
  title: "豆瓣我看&豆瓣个性化推荐",
  modules: [
    {
      title: "豆瓣我看",
      requiresWebView: false,
      functionName: "loadInterestItems",
      params: [
        {
          name: "user_id",
          title: "用户ID",
          type: "input",
          description: "未填写情况下接口不可用",
        },
        {
          name: "status",
          title: "状态",
          type: "enumeration",
          enumOptions: [
            {
              title: "想看",
              value: "mark",
            },
            {
              title: "在看",
              value: "doing",
            },
            {
              title: "看过",
              value: "done",
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    },
    {
      title: "豆瓣个性化推荐",
      requiresWebView: false,
      functionName: "loadSuggestionItems",
      params: [
        {
          name: "cookie",
          title: "用户Cookie",
          type: "input",
          description: "未填写情况下非个性化推荐；可手机登陆网页版后，通过loon，Qx等软件抓包获取Cookie",
        },
        {
          name: "type",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            {
              title: "电影",
              value: "movie",
            },
            {
              title: "电视",
              value: "tv",
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    },
    {
      title: "豆瓣片单(TMDB版)",
      requiresWebView: false,
      functionName: "loadCardItems",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "豆瓣片单地址",
          placeholders: [
            {
              title: "豆瓣热门电影",
              value: "https://m.douban.com/subject_collection/movie_hot_gaia",
            },
            {
              title: "热播新剧",
              value: "https://m.douban.com/subject_collection/tv_hot",
            },
            {
              title: "热播综艺",
              value: "https://m.douban.com/subject_collection/show_hot",
            },
            {
              title: "影院热映",
              value: "https://m.douban.com/subject_collection/movie_showing",
            },
            {
              title: "实时热门电影",
              value: "https://m.douban.com/subject_collection/movie_real_time_hotest",
            },
            {
              title: "实时热门电视",
              value: "https://m.douban.com/subject_collection/tv_real_time_hotest",
            },
            {
              title: "豆瓣 Top 250",
              value: "https://m.douban.com/subject_collection/movie_top250",
            },
            {
              title: "一周电影口碑榜",
              value: "https://m.douban.com/subject_collection/movie_weekly_best",
            },
            {
              title: "华语口碑剧集榜",
              value: "https://m.douban.com/subject_collection/tv_chinese_best_weekly",
            },
            {
              title: "全球口碑剧集榜",
              value: "https://m.douban.com/subject_collection/tv_global_best_weekly",
            },
            {
              title: "国内综艺口碑榜",
              value: "https://m.douban.com/subject_collection/show_chinese_best_weekly",
            },
            {
              title: "全球综艺口碑榜",
              value: "https://m.douban.com/subject_collection/show_global_best_weekly",
            },
            {
              title: "第97届奥斯卡",
              value: "https://m.douban.com/subject_collection/EC7I7ZDRA?type=rank",
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    },
  ],
  version: "1.0.3",
  requiredVersion: "0.0.1",
  description: "解析豆瓣想看、在看、已看以及根据个人数据生成的个性化推荐【五折码：CHEAP.5;七折码：CHEAP】",
  author: "huangxd",
  site: "https://github.com/huangxd-/ForwardWidgets"
};

async function loadInterestItems(params = {}) {
  const page = params.page;
  const user_id = params.user_id || "";
  const status = params.status || "";
  const count = 20
  start = (page - 1) * count
  let url = `https://m.douban.com/rexxar/api/v2/user/${user_id}/interests?status=${status}&start=${start}&count=${count}`;
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://m.douban.com/mine/movie`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  console.log("请求结果:", response.data);
  if (response.data && response.data.interests) {
    const items = response.data.interests;
    const doubanIds = items.filter((item) => item.subject.id != null).map((item) => ({
      id: item.subject.id,
      type: "douban",
    }));
    return doubanIds;
  }
  return [];
}

async function loadSuggestionItems(params = {}) {
  const page = params.page;
  const cookie = params.cookie || "";
  const type = params.type || "";
  const count = 20
  const start = (page - 1) * count
  const ckMatch = cookie.match(/ck=([^;]+)/);
  const ckValue = ckMatch ? ckMatch[1] : null;
  let url = `https://m.douban.com/rexxar/api/v2/${type}/suggestion?start=${start}&count=${count}&new_struct=1&with_review=1&ck=${ckValue}`;
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://m.douban.com/movie`,
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  console.log("请求结果:", response.data);
  if (response.data && response.data.items) {
    const items = response.data.items;
    const doubanIds = items.filter((item) => item.id != null).map((item) => ({
      id: item.id,
      type: "douban",
    }));
    return doubanIds;
  }
  return [];
}

// 基础获取TMDB数据方法
async function fetchTmdbData(key, mediaType) {
    const tmdbResults = await Widget.tmdb.get(`/search/${mediaType}`, {
        params: {
            query: key,
            language: "zh_CN",
        }
    });
    //打印结果
    // console.log("搜索内容：" + key)
    if (!tmdbResults) {
      return [];
    }
    console.log("tmdbResults:" + JSON.stringify(tmdbResults, null, 2));
    // console.log("tmdbResults.total_results:" + tmdbResults.total_results);
    // console.log("tmdbResults.results[0]:" + tmdbResults.results[0]);
    return tmdbResults.results;
}

// 解析豆瓣片单
async function loadCardItems(params = {}) {
  try {
    console.log("开始解析豆瓣片单...");
    console.log("参数:", params);
    // 获取片单 URL
    const url = params.url;
    if (!url) {
      console.error("缺少片单 URL");
      throw new Error("缺少片单 URL");
    }
    // 验证 URL 格式
    if (url.includes("douban.com/subject_collection/")) {
      return loadSubjectCollection(params);
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadItemsFromApi(params = {}) {
  const url = params.url;
  console.log("请求 API 页面:", url);
  const listId = params.url.match(/subject_collection\/(\w+)/)?.[1];
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://m.douban.com/subject_collection/${listId}/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  console.log("请求结果:", response.data);
  if (response.data && response.data.subject_collection_items) {
    const scItems = response.data.subject_collection_items;

    const promises = scItems.map(async (scItem) => {
        // 模拟API请求
        const title = scItem.title.replace(/ 第[^季]*季/, '');
        console.log("title: ", title, " ; type: ", scItem.type);
        const tmdbDatas = await fetchTmdbData(title, scItem.type)

        if (tmdbDatas.length !== 0) {
            return {
                id: tmdbDatas[0].id,
                type: "tmdb",
                title: tmdbDatas[0].title ?? tmdbDatas[0].name,
                description: tmdbDatas[0].overview,
                releaseDate: tmdbDatas[0].release_date ?? tmdbDatas[0].first_air_date,
                backdropPath: tmdbDatas[0].backdrop_path,
                posterPath: tmdbDatas[0].poster_path,
                rating: tmdbDatas[0].vote_average,
                mediaType: scItem.type,
            };
        } else {
            return null;
        }
    });

    // 等待所有请求完成
    const items = (await Promise.all(promises)).filter(Boolean);

    console.log(items)

    return items;
  }
  return [];
}

async function loadSubjectCollection(params = {}) {
  const listId = params.url.match(/subject_collection\/(\w+)/)?.[1];
  console.debug("合集 ID:", listId);
  if (!listId) {
    console.error("无法获取合集 ID");
    throw new Error("无法获取合集 ID");
  }

  const page = params.page;
  const count = 20
  const start = (page - 1) * count
  let pageUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items?start=${start}&count=${count}&updated_at&items_only=1&type_tag&for_mobile=1`;
  if (params.type) {
    pageUrl += `&type=${params.type}`;
  }
  params.url = pageUrl;
  return await loadItemsFromApi(params);
}
