// 引用地址：https://raw.githubusercontent.com/quantumultxx/FW-Widgets/refs/heads/main/Widgets/ForwardWidgets.js
// =============UserScript=============
// @name         影视聚合查询组件
// @version      1.2.5
// @description  聚合查询豆瓣/TMDB/IMDB影视数据
// @author       阿米诺斯
// =============UserScript=============
WidgetMetadata = {
  id: "forward.combined.media.lists",
  title: "影视榜单",
  description: "聚合豆瓣、TMDB、IMDB和Bangumi的电影、剧集、动画片单与榜单",
  author: "阿米诺斯",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.2.5",
  requiredVersion: "0.0.1",
  modules: [
    // =============豆瓣模块=============
    // --- 🔥 实时热点 ---
    {
      title: "豆瓣电影实时热榜",
      description: "来自豆瓣的当前热门电影榜单",
      requiresWebView: false,
      functionName: "loadDoubanItemsFromApi",
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://m.douban.com/rexxar/api/v2/subject_collection/movie_real_time_hotest/items" },
        { name: "type", 
          title: "🎭 类型", 
          type: "constant", 
          value: "movie" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣剧集实时热榜",
      description: "来自豆瓣的当前热门剧集榜单",
      requiresWebView: false,
      functionName: "loadDoubanItemsFromApi",
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://m.douban.com/rexxar/api/v2/subject_collection/tv_real_time_hotest/items" },
        { name: "type", 
          title: "🎭 类型", 
          type: "constant", 
          value: "tv" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },

    // --- 🏆 精选榜单 ---
    {
      title: "豆瓣 Top 250 电影",
      description: "豆瓣评分最高的 250 部电影",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://m.douban.com/subject_collection/movie_top250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣自定义片单",
      description: "加载豆瓣官方榜单或用户豆列 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入豆瓣片单或榜单地址 (subject_collection 或 doulist)",
          placeholders: [
            { title: "一周电影口碑榜", 
              value: "https://m.douban.com/subject_collection/movie_weekly_best" },
            { title: "一周华语口碑剧集榜", 
              value: "https://m.douban.com/subject_collection/tv_chinese_best_weekly" },
            { title: "一周全球口碑剧集榜", 
              value: "https://m.douban.com/subject_collection/tv_global_best_weekly" },
            { title: "第97届奥斯卡 (2025)", 
              value: "https://m.douban.com/subject_collection/EC7I7ZDRA?type=rank" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },

    // --- 🎬 探索发现 ---
    {
      title: "豆瓣电影推荐",
      description: "按分类、地区、类型标签浏览豆瓣推荐电影",
      requiresWebView: false,
      functionName: "loadDoubanRecommendMovies",
      params: [
        {
          name: "category", 
          title: "🏷️ 分类", 
          type: "enumeration",
          enumOptions: [ 
            { title: "全部", value: "全部" }, 
            { title: "热门电影", value: "热门" }, 
            { title: "最新电影", value: "最新" }, 
            { title: "豆瓣高分", value: "豆瓣高分" }, 
            { title: "冷门佳片", value: "冷门佳片" } 
          ],
          value: "全部"
        },
        {
          name: "type", 
          title: "🌍 地区  (仅对 热门/最新/高分/冷门 分类生效)", 
          type: "enumeration",
          description: "(仅对 热门/最新/高分/冷门 分类生效)",
          enumOptions: [ 
            { title: "全部", value: "全部" }, 
            { title: "华语", value: "华语" }, 
            { title: "欧美", value: "欧美" }, 
            { title: "韩国", value: "韩国" }, 
            { title: "日本", value: "日本" } 
          ],
          value: "全部"
        },
        {
          name: "tags", 
          title: "🎭 类型  (仅当分类为'全部'时生效)", 
          type: "enumeration",
          description: "仅当分类为'全部'时生效", 
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            
            { title: "动作", value: "动作" }, 
            { title: "科幻", value: "科幻" }, 
            { title: "爱情", value: "爱情" }, 
            { title: "喜剧", value: "喜剧" }, 
            { title: "悬疑", value: "悬疑" }, 
            { title: "动画", value: "动画" }, 
            { title: "剧情", value: "剧情" }, 
            { title: "家庭", value: "家庭" }, 
            { title: "犯罪", value: "犯罪" }, 
            { title: "歌舞", value: "歌舞" }, 
            { title: "传记", value: "传记" }, 
            { title: "冒险", value: "冒险" }, 
            { title: "武侠", value: "武侠" }, 
            { title: "运动", value: "运动" }, 
            { title: "古装", value: "古装" },
            
            { title: "纪录片", value: "纪录片" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣剧集推荐",
      description: "按分类、类型浏览豆瓣推荐剧集",
      requiresWebView: false,
      functionName: "loadDoubanRecommendShows",
      params: [
        {
          name: "type", 
          title: "🎭 类型 (剧集)", 
          type: "enumeration",
            enumOptions: [
            { title: "综合", 
              value: "tv" }, 
            { title: "国产剧", 
              value: "tv_domestic" }, 
            { title: "欧美剧", 
              value: "tv_american" }, 
            { title: "日剧", 
              value: "tv_japanese" }, 
            { title: "韩剧", 
              value: "tv_korean" }, 
            { title: "动画", 
              value: "tv_animation" }, 
            { title: "纪录片", 
              value: "tv_documentary" } 
          ],
          value: "tv"
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },

    // =============TMDB模块=============
    // --- 当前与趋势模块 ---
    {
        title: "TMDB 正在热映",
        description: "当前影院或流媒体上映的电影/剧集",
        requiresWebView: false,
        functionName: "tmdbNowPlaying",
        params: [
            { 
                name: "type", 
                title: "类型", 
                type: "enumeration", 
                enumOptions: [
                    { title: "电影", 
                      value: "movie" },
                    { title: "剧集", 
                      value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "page", title: "页码", type: "page" },
            { name: "language", title: "语言", type: "language", value: "zh-CN" }
        ]
    },
    {
        title: "TMDB 本日热门",
        description: "今日热门电影与剧集",
        requiresWebView: false,
        functionName: "tmdbTrending",
        params: [
            { name: "time_window", 
              title: "时间", 
              type: "constant", 
              value: "day" },
            { name: "language", title: "语言", type: "constant", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },
    {
        title: "TMDB 本周热门",
        description: "本周热门电影与剧集",
        requiresWebView: false,
        functionName: "tmdbTrending",
        params: [
            { name: "time_window", 
              title: "时间", 
              type: "constant", 
              value: "week" },
            { name: "language", title: "语言", type: "constant", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // --- 常规发现模块 ---
    {
        title: "TMDB 高分内容",
        description: "高分电影或剧集 (按用户评分排序)",
        requiresWebView: false,
        functionName: "tmdbTopRated",
        params: [
            { 
                name: "type", 
                title: "类型", 
                type: "enumeration", 
                enumOptions: [
                    { title: "电影", 
                      value: "movie" },
                    { title: "剧集", 
                      value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "language", title: "语言", type: "language", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // --- 平台筛选模块---
    {
        title: "TMDB 播出平台",
        description: "按播出平台和内容类型筛选剧集内容",
        requiresWebView: false,
        functionName: "tmdbDiscoverByNetwork",
        params: [
            {
                name: "with_networks",
                title: "播出平台",
                type: "enumeration",
                description: "选择一个平台以查看其剧集内容",
                value: "",
                enumOptions: [
                    { title: "全部", value: "" },
                    { title: "Tencent", value: "2007" },
                    { title: "iQiyi", value: "1330" },
                    { title: "Youku", value: "1419" },
                    { title: "Bilibili", value: "1605" },
                    { title: "MGTV", value: "1631" },
                    { title: "Netflix", value: "213" },
                    { title: "Disney+", value: "2739" },
                    { title: "HBO", value: "49" },
                    { title: "HBO Max", value: "3186" },
                    { title: "Apple TV+", value: "2552" },
                    { title: "Hulu", value: "453" },
                    { title: "Amazon Prime Video", value: "1024" },
                    { title: "FOX", value: "19" },
                    { title: "Paramount", value: "576" },
                    { title: "Paramount+", value: "4330" },
                    { title: "TV Tokyo", value: "94" },
                    { title: "BBC One", value: "332" },
                    { title: "BBC Two", value: "295" },
                    { title: "NBC", value: "6" },
                    
                    { title: "AMC+", value: "174" }
                ]
            },
            {
                name: "sort_by",
                title: "排序方式",
                type: "enumeration",
                description: "选择内容排序方式,默认上映时间↓",
                value: "first_air_date.desc",
                enumOptions: [
                    { title: "上映时间↓", value: "first_air_date.desc" },
                    { title: "上映时间↑", value: "first_air_date.asc" },
                    { title: "人气最高", value: "popularity.desc" },

                    { title: "评分最高", value: "vote_average.desc" },
                    { title: "最多投票", value: "vote_count.desc" }
                ]
            },
            {
                name: "air_status",
                title: "上映状态",
                type: "enumeration",
                description: "默认已上映",
                value: "released",
                enumOptions: [
                    { title: "已上映", value: "released" },
                    { title: "未上映", value: "upcoming" }
                ]
            },
            {
                name: "with_genres",
                title: "内容类型",
                type: "enumeration",
                description: "选择要筛选的内容类型",
                value: "",
                enumOptions: [
                    { title: "全部类型", value: "" },
                    { title: "犯罪", value: "80" },
                    { title: "动画", value: "16" },
                    { title: "喜剧", value: "35" },
                    { title: "剧情", value: "18" },
                    { title: "家庭", value: "10751" },
                    { title: "儿童", value: "10762" },
                    { title: "悬疑", value: "9648" },
                    { title: "真人秀", value: "10764" },
                    { title: "脱口秀", value: "10767" },
                    { title: "肥皂剧", value: "10766" },
                    { title: "纪录片", value: "99" },
                    { title: "动作与冒险", value: "10759" },
                    { title: "科幻与奇幻", value: "10765" },
                    { title: "战争与政治", value: "10768" }
                ]
            },
            { name: "page", title: "页码", type: "page" },
            { name: "language", title: "语言", type: "language", value: "zh-CN" }
        ]
    },
    // --- 出品公司模块 ---
    {
      id: "companies",
      title: "TMDB 出品公司",
      functionName: "tmdbCompanies",
      params: [
        {
          name: "with_companies",
          title: "出品公司",
          type: "enumeration",
          description: "选择一个公司以查看其剧集内容",
                value: "",
          enumOptions: [
            { title: "全部", 
              value: "" },
            {
              title: "迪士尼(Disney)",
              value: "2",
            },
            {
              title: "华纳兄弟(Warner Bros)",
              value: "174",
            },
            {
              title: "哥伦比亚影业(Columbia)",
              value: "5",
            },
            {
              title: "索尼影业(Sony)",
              value: "34",
            },
            {
              title: "环球影业(Universal)",
              value: "33",
            },
            {
              title: "派拉蒙影业(Paramount)",
              value: "4",
            },
            {
              title: "二十世纪影业(20th Century)",
              value: "25",
            },
            {
              title: "漫威影业(Marvel)",
              value: "420",
            },
            {
              title: "東宝株式会社(Toho)",
              value: "882",
            },
            {
              title: "中国电影集团公司",
              value: "14714",
            },
            {
              title: "BBC",
              value: "3324",
            },
            {
              title: "印度",
              value: "1569",
            },
            {
              title: "A24",
              value: "41077",
            },
            {
              title: "Blumhouse",
              value: "3172",
            },
            {
              title: "Working Title Films",
              value: "10163",
            }
          ]
        },
        {
                name: "sort_by",
                title: "排序方式",
                type: "enumeration",
                description: "选择内容排序方式,默认上映时间↓",
                value: "primary_release_date.desc",
                enumOptions: [
                    { title: "上映时间↓", value: "primary_release_date.desc" },
                    { title: "上映时间↑", value: "primary_release_date.asc" },
                    { title: "人气最高", value: "popularity.desc" },

                    { title: "评分最高", value: "vote_average.desc" },
                    { title: "最多投票", value: "vote_count.desc" }
                ]
            },
            {
                name: "with_genres",
                title: "内容类型",
                type: "enumeration",
                description: "选择要筛选的内容类型",
                value: "",
                enumOptions: [
                    { title: "全部类型", value: "" },
                    { title: "冒险", value: "12" },
                    { title: "剧情", value: "18" },
                    { title: "动作", value: "28" },
                    { title: "动画", value: "16" },
                    { title: "历史", value: "36" },
                    { title: "喜剧", value: "35" },
                    { title: "奇幻", value: "14" },
                    { title: "家庭", value: "10751" },
                    { title: "恐怖", value: "27" },
                    { title: "悬疑", value: "9648" },
                    { title: "惊悚", value: "53" },
                    { title: "战争", value: "10752" },
                    { title: "爱情", value: "10749" },
                    { title: "犯罪", value: "80" },
                    { title: "科幻", value: "878" },
                    { title: "记录", value: "99" },
                    { title: "西部", value: "37" },
                    { title: "音乐", value: "10402" },
                    { title: "电视电影", value: "10770" }
                ]
            },
            {
                name: "air_status",
                title: "上映状态",
                type: "enumeration",
                description: "默认已上映",
                value: "released",
                enumOptions: [
                    { title: "已上映", value: "released" },
                    { title: "未上映", value: "upcoming" }
                ]
            },
            { name: "page", title: "页码", type: "page" },
            { name: "language", title: "语言", type: "language", value: "zh-CN" }
        ]
    },

    // --- 高级筛选模块 ---
    {
        title: "TMDB 即将上映",
        description: "即将上映的电影 (可筛选)",
        requiresWebView: false,
        functionName: "tmdbUpcomingMovies",
        params: [
            { name: "language", title: "语言", type: "language", value: "zh-CN" },
            { 
                name: "primary_release_date.gte", 
                title: "起始日期 (含)", 
                type: "input", 
                description: "格式：YYYY-MM-DD（默认今天）", 
                value: "",
                placeholder: "例：2023-12-31"
            },
            { 
                name: "primary_release_date.lte", 
                title: "结束日期 (含)", 
                type: "input", 
                description: "格式：YYYY-MM-DD（可选）", 
                value: "",
                placeholder: "例：2024-05-01"
            },
            { 
                name: "with_release_type", 
                title: "发行渠道", 
                type: "enumeration", 
                description: "选择发行渠道（多选用逗号分隔）", 
                value: "2,3",
                enumOptions: [ 
                    { title: "影院上映 (优先)", value: "2,3" },
                    { title: "全部渠道", 
                      value: "" }, 
                    { title: "数字发行", 
                      value: "4" }, 
                    { title: "实体发行", 
                      value: "5" }, 
                    { title: "电视播出", 
                      value: "6" }
                ] 
            },
            { 
                name: "with_genres", 
                title: "类型筛选", 
                type: "enumeration", 
                description: "选择电影类型", 
                value: "",
                enumOptions: [ 
                    { title: "任意类型", value: "" }, 
                    { title: "动作", value: "28" }, 
                    { title: "冒险", value: "12" },
                    { title: "动画", value: "16" }, 
                    { title: "喜剧", value: "35" }, 
                    { title: "犯罪", value: "80" },
                    { title: "纪录", value: "99" }, 
                    { title: "剧情", value: "18" }, 
                    { title: "家庭", value: "10751" },
                    { title: "悬疑", value: "9648" }, 
                    { title: "爱情", value: "10749" },
                    { title: "科幻", value: "878" }, 
                    { title: "战争", value: "10752" },
                    { title: "西部", value: "37" }, 
                    { title: "电视电影", value: "10770" }
                ] 
            },
            { 
                name: "vote_average.gte", 
                title: "最低评分", 
                type: "input", 
                description: "输入0-10之间的数字（如7）", 
                value: "",
                placeholder: "0-10"
            },
            { 
                name: "vote_count.gte", 
                title: "最少评价数", 
                type: "input", 
                description: "输入最小评价数量", 
                value: "",
                placeholder: "如：100"
            },
            { 
                name: "with_keywords", 
                title: "关键词", 
                type: "input", 
                description: "英文关键词（如'superhero'）", 
                value: "",
                placeholder: "多个用逗号分隔"
            },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // =============IMDB模块=============
    {
      title: "IMDb Top 250 电影",
      description: "IMDb 用户评分最高的 250 部电影",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/top/?ref_=nv_mv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDb Top 250 剧集",
      description: "IMDb 用户评分最高的 250 部剧集",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDB 自定义片单",
      description: "解析 IMDB 热门电影/剧集等网页片单 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入 IMDB 片单或榜单地址",
          placeholders: [
            { title: "时下热门电影", 
              value: "https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm" },
            { title: "时下热门剧集", 
              value: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
// =============BGM模块=============
    {
            title: "Bangumi 动画总排行",
            description: "按综合评分排名浏览动画",
            requiresWebView: false,
            functionName: "loadBangumiRankings",
            params: [
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "Bangumi 动画筛选",
            description: "按标签、年份、类型、题材等条件筛选动画",
            requiresWebView: false,
            functionName: "loadBangumiBrowser",
            params: [
                { 
                    name: "tag", 
                    title: "标签 (可选)", 
                    type: "input", 
                    description: "输入单个标签, 如 漫画改, 轻小说改...", 
                    value: "", 
                    placeholders: [
                        {title:"例如：漫画改", value:"漫画改"}, 
                        {title:"原创", value:"原创"}
                    ]
                },
                { 
                    name: "genre_tag", 
                    title: "题材", 
                    type: "enumeration", 
                    description: "选择动画题材", 
                    value: "", 
                    enumOptions: [ 
                        { title: "全部", value: "" },
                        { title: "科幻", value: "科幻" },
                        { title: "喜剧", value: "喜剧" },
                        { title: "校园", value: "校园" },
                        { title: "战斗", value: "战斗" },
                        { title: "恋爱", value: "恋爱" },
                        { title: "奇幻", value: "奇幻" },
                        { title: "剧情", value: "剧情" },
                        { title: "日常", value: "日常" },
                        { title: "机战", value: "机战" },
                        { title: "运动", value: "运动" },
                        { title: "悬疑", value: "悬疑" },
                        { title: "音乐", value: "音乐" },
                        { title: "治愈", value: "治愈" },
                        { title: "百合", value: "百合" },
                        { title: "惊悚", value: "惊悚" },
                        { title: "后宫", value: "后宫" },
                        { title: "推理", value: "推理" },
                        { title: "耽美", value: "耽美" },
                        { title: "冒险", value: "冒险" },
                        { title: "萌系", value: "萌系" },
                        { title: "穿越", value: "穿越" },
                        { title: "玄幻", value: "玄幻" },
                        { title: "乙女", value: "乙女" },
                        { title: "恐怖", value: "恐怖" },
                        { title: "历史", value: "历史" },
                        { title: "武侠", value: "武侠" },
                        { title: "美食", value: "美食" },
                        { title: "职场", value: "职场" }
                    ]
                },
                {
                    name: "region",
                    title: "地区",
                    type: "enumeration",
                    description: "选择动画地区",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "日本", value: "日本" },
                        { title: "中国", value: "中国" },
                        { title: "美国", value: "美国" },
                        { title: "韩国", value: "韩国" },
                        { title: "中国香港", value: "中国香港" },
                        { title: "中国台湾", value: "中国台湾" }
                    ]
                },
                {
                    name: "audience",
                    title: "受众",
                    type: "enumeration",
                    description: "选择动画受众",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "少女向", value: "少女向" },
                        { title: "少年向", value: "少年向" },
                        { title: "青年向", value: "青年向" },
                        { title: "女性向", value: "女性向" },
                        { title: "子供向", value: "子供向" },
                        { title: "BL", value: "BL" },
                        { title: "GL", value: "GL" }
                    ]
                },
                { 
                    name: "year", 
                    title: "年份 (可选)", 
                    type: "input", 
                    description: "输入四位年份, 例如 2024", 
                    value: "", 
                    placeholders: [{title:"例如：2024", value:"2024"}]
                },
                {
                    name: "type", 
                    title: "分类", 
                    type: "enumeration", 
                    description: "选择动画分类", 
                    value: "all", 
                    enumOptions: [
                        { title: "全部", value: "all" },
                        { title: "TV", value: "tv" },
                        { title: "Web", value: "web" },
                        { title: "OVA", value: "ova" },
                        { title: "剧场版", value: "movie" },
                        { title: "其他", value: "misc" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "Bangumi 放送日历",
            description: "查看动画每日/每周放送时间表",
            requiresWebView: false,
            functionName: "loadBangumiCalendarUnified",
            sectionMode: false,
            params: [
                {
                    name: "viewType",
                    title: "视图模式",
                    type: "enumeration",
                    description: "选择查看今日放送、指定单日放送还是整周概览",
                    value: "today",
                    enumOptions: [
                        { title: "今日", value: "today" },
                        { title: "整周", value: "weekly" },
                        { title: "指定单日", value: "daily" }
                    ]
                },
                {
                    name: "weekday",
                    title: "选择星期",
                    type: "enumeration",
                    description: "选择要看的单日放送",
                    value: "1",
                    enumOptions: [
                        { title: "周一", value: "1" },
                        { title: "周二", value: "2" },
                        { title: "周三", value: "3" },
                        { title: "周四", value: "4" },
                        { title: "周五", value: "5" },
                        { title: "周六", value: "6" },
                        { title: "周日", value: "0" }
                    ],
                    belongTo: { paramName: "viewType", value: ["daily"] }
                }
            ]
        }
    ]
};
// ===============辅助函数===============
function formatItemDescription(item) {
    let description = item.description || '';
    const hasRating = /评分|rating/i.test(description);
    const hasYear = /年份|year/i.test(description);
    
    if (item.rating && !hasRating) {
        description = `评分: ${item.rating} | ${description}`;
    }
    
    if (item.releaseDate && !hasYear) {
        const year = String(item.releaseDate).substring(0,4);
        if (/^\d{4}$/.test(year)) {
            description = `年份: ${year} | ${description}`;
        }
    }
    
    return description
        .replace(/^\|\s*/, '')
        .replace(/\s*\|$/, '')
        .trim();
}

function createErrorItem(id, title, error) {
    const errorMessage = String(error?.message || error || '未知错误');
    const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    return {
        id: uniqueId,
        type: "error",
        title: title || "加载失败",
        description: `错误详情：${errorMessage}`
    };
}

function calculatePagination(params) {
    let page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    
    if (typeof params.start !== 'undefined') {
        page = Math.floor(parseInt(params.start) / limit) + 1;
    }
    
    if (page < 1) page = 1;
    if (limit > 50) throw new Error("单页数量不能超过50");

    const start = (page - 1) * limit;
    return { page, limit, start };
}

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// ===============豆瓣功能模块===============
async function loadDoubanCardItems(params = {}) {
  try {
    const url = params.url;
    if (!url) throw new Error("缺少片单 URL");
    if (url.includes("douban.com/doulist/")) {
      return loadDoubanDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      return loadDoubanSubjectCollection(params);
    } else {
        throw new Error("不支持的豆瓣 URL 格式");
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadDoubanDefaultList(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("无法从 URL 获取豆瓣豆列 ID");
  const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}&sort=&playable=&sub_type=`;
  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://www.douban.com/`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  if (!response || !response.data) throw new Error("获取豆瓣豆列数据失败");
  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("解析豆瓣豆列 HTML 失败");
  const itemElements = Widget.dom.select(docId, "div.doulist-item");
  let fallbackItemElements = [];
  if (!itemElements || itemElements.length === 0) {
       const articleElement = Widget.dom.selectFirst(docId, ".article");
       if (articleElement >= 0) {
            fallbackItemElements = Widget.dom.select(articleElement, ".doulist-subject");
            if (!fallbackItemElements || fallbackItemElements.length === 0) {
                 fallbackItemElements = Widget.dom.select(articleElement, "li.subject-item");
            }
       }
  }
  const finalItemElements = (itemElements && itemElements.length > 0) ? itemElements : fallbackItemElements;
  if (!finalItemElements || finalItemElements.length === 0) {
      const paging = Widget.dom.selectFirst(docId, ".paginator .next a");
      if (paging < 0) {
          return [];
      } else {
           return [];
      }
  }
  let doubanIds = [];
  for (const itemId of finalItemElements) {
       let titleElementId = Widget.dom.selectFirst(itemId, ".title a");
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, ".item-title a");
       }
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, "a[onclick*='subject']");
       }
      if (titleElementId >= 0) {
          const link = await Widget.dom.attr(titleElementId, "href");
          const idMatch = link ? link.match(/subject\/(\d+)/) : null;
          const title = await Widget.dom.text(titleElementId);
          if (idMatch && idMatch[1]) {
              let coverUrl = "";
              let imgElementId = Widget.dom.selectFirst(itemId, ".post img");
              if (imgElementId < 0) {
                 imgElementId = Widget.dom.selectFirst(itemId, ".item-poster img");
              }
              if (imgElementId >= 0) {
                  coverUrl = await Widget.dom.attr(imgElementId, "src");
                   if (coverUrl) {
                       coverUrl = coverUrl.replace(/\/(s|m|sq)\//, '/l/');
                   }
              }
              let description = "";
              let abstractElementId = Widget.dom.selectFirst(itemId, ".abstract");
              if (abstractElementId < 0) {
                  abstractElementId = Widget.dom.selectFirst(itemId, ".card-abstract");
              }
               if (abstractElementId >= 0) {
                   description = await Widget.dom.text(abstractElementId);
                   description = description.trim().replace(/\n\s*/g, ' ');
               }
              let rating = undefined;
              let ratingElementId = Widget.dom.selectFirst(itemId, ".rating .rating_nums");
              if (ratingElementId < 0) {
                  ratingElementId = Widget.dom.selectFirst(itemId, ".item-rating .rating_nums");
              }
              if (ratingElementId >= 0) {
                  rating = await Widget.dom.text(ratingElementId);
                  rating = rating.trim();
              }
              doubanIds.push({
                  id: idMatch[1],
                  type: "douban",
                  title: title ? title.trim() : "未知标题",
                  coverUrl: coverUrl || undefined,
                  description: formatItemDescription({
                      description: description || undefined,
                      rating: rating,
                      releaseDate: item.releaseDate
                  }),
                  rating: rating ? parseFloat(rating) : undefined
                });
          } else {
             console.warn("解析豆列项时未找到 subject ID, Title:", title, "Link:", link);
          }
      } else {
         console.warn("在豆列项中未找到标题链接元素, Item ID:", itemId);
      }
  }
  return doubanIds;
}

async function loadDoubanItemsFromApi(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const apiUrl = `${url}?start=${start}&count=${limit}&updated_at&items_only=1&for_mobile=1`;
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  const referer = listIdMatch ? `https://m.douban.com/subject_collection/${listIdMatch[1]}/` : 'https://m.douban.com/';
  const response = await Widget.http.get(apiUrl, {
    headers: {
      Referer: referer,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;
    const doubanIds = items.map((item) => ({
      id: item.id,
      type: "douban",
      title: item.title,
      coverUrl: item.cover?.url,
      description: formatItemDescription({
          description: item.card_subtitle || item.description,
          rating: item.rating?.value,
          releaseDate: item.year
      }),
      rating: item.rating?.value,
      releaseDate: item.year
    }));
    return doubanIds;
  }
  return [];
}

async function loadDoubanSubjectCollection(params = {}) {
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  if (!listIdMatch) throw new Error("无法从 URL 获取豆瓣合集 ID");
  const listId = listIdMatch[1];
  const { start, limit } = calculatePagination(params);
  const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items`;
  return await loadDoubanItemsFromApi({
      ...params,
      url: apiUrl,
  });
}

async function loadDoubanRecommendMovies(params = {}) {
  return await loadDoubanRecommendItems(params, "movie");
}

async function loadDoubanRecommendShows(params = {}) {
  return await loadDoubanRecommendItems(params, "tv");
}

async function loadDoubanRecommendItems(params = {}, mediaType = "movie") {
  const { start, limit } = calculatePagination(params);
  const category = params.category || "";
  const subType = params.type || "";
  const tags = params.tags || "";
  const encodedTags = encodeURIComponent(tags);
  let url;
  if (category === "全部" || category === "all") {
      let recommendUrl = `https://m.douban.com/rexxar/api/v2/${mediaType}/recommend?refresh=0&start=${start}&count=${limit}&selected_categories=${encodeURIComponent(JSON.stringify(params.selected_categories || {}))}&uncollect=false&score_range=0,10`;
      if (encodedTags) {
          recommendUrl += `&tags=${encodedTags}`;
      }
      url = recommendUrl;
  } else {
      url = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${mediaType}?start=${start}&count=${limit}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(subType)}`;
  }
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  const items = response.data?.subjects
             || response.data?.items
             || response.data?.modules?.[0]?.data?.subject_collection_items
             || [];
  return items.map((item) => {
    const rating = item.rating?.value || (item.rate ? parseFloat(item.rate) : undefined);
    const releaseYear = item.year || item.release_date?.substring(0, 4);
    const cover = item.cover?.url || item.pic?.normal;
    return {
        id: String(item.id),
        type: "douban",
        title: item.title,
        coverUrl: cover,
        description: formatItemDescription({
            description: item.card_subtitle || item.description || item.intro,
            rating: rating,
            releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
        }),
        rating: rating,
        releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
    };
  }).filter(item => item !== null);
}

//===============TMDB功能函数===============
async function fetchTmdbData(api, params) {
    try {
        const tmdbParams = { ...params };
        delete tmdbParams.type;
        delete tmdbParams.time_window;
        const response = await Widget.tmdb.get(api, { params: tmdbParams });
        if (!response?.results) {
            throw new Error(response?.status_message || "无效的API响应格式");
        }
        return response.results.map(item => {
            const isMovie = api.includes('movie') || item.media_type === 'movie';
            const mediaType = isMovie ? 'movie' : 'tv';
            return {
                id: item.id,
                type: "tmdb",
                mediaType: mediaType,
                title: isMovie ? item.title : item.name,
                description: formatItemDescription({
                    description: item.overview,
                    rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined,
                    releaseDate: isMovie ? item.release_date : item.first_air_date
                }),
                releaseDate: isMovie ? item.release_date : item.first_air_date,
                backdropPath: item.backdrop_path && `https://image.tmdb.org/t/p/w780${item.backdrop_path}`,
                posterPath: item.poster_path && `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined
            };
        }).filter(item => item.id && item.title);
    } catch (error) {
        console.error(`API调用失败: ${api}`, error);
        return [createErrorItem(api, '数据加载失败', error)];
    }
}

async function tmdbNowPlaying(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? "movie/now_playing" : "tv/on_the_air";
    return await fetchTmdbData(api, params);
}

async function tmdbTrending(params) {
    const timeWindow = params.time_window || 'day';
    const api = `trending/all/${timeWindow}`;
    return await fetchTmdbData(api, params);
}


async function tmdbTopRated(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? `movie/top_rated` : `tv/top_rated`;
    return await fetchTmdbData(api, params);
}

async function tmdbUpcomingMovies(params) {
    const api = "discover/movie";
    const discoverParams = {
        language: params.language || 'zh-CN',
        page: params.page || 1,
        sort_by: 'primary_release_date.asc',
        'primary_release_date.gte': params['primary_release_date.gte'] || getCurrentDate(),
        with_release_type: params.with_release_type || '2,3'
    };
    if (params['primary_release_date.lte']) discoverParams['primary_release_date.lte'] = params['primary_release_date.lte'];
    if (params.with_genres) discoverParams.with_genres = params.with_genres;
    if (params['vote_average.gte']) discoverParams['vote_average.gte'] = params['vote_average.gte'];
    if (params['vote_count.gte']) discoverParams['vote_count.gte'] = params['vote_count.gte'];
    if (params.with_keywords) discoverParams.with_keywords = params.with_keywords;
    return await fetchTmdbData(api, discoverParams);
}

async function tmdbDiscoverByNetwork(params = {}) {
    const api = "discover/tv";
    const discoverParams = {
        language: params.language || 'zh-CN',
        page: params.page || 1,
        with_networks: params.with_networks,
        sort_by: params.sort_by,
        ...(params.air_status === 'released' && { 
            'first_air_date.lte': getCurrentDate() 
        }),
        ...(params.air_status === 'upcoming' && { 
            'first_air_date.gte': getCurrentDate() 
        }),
        ...(params.with_genres && { with_genres: params.with_genres })
    };
    return await fetchTmdbData(api, discoverParams);
}



async function tmdbCompanies(params = {}) {
  try {
    const api = "discover/movie";
    const withCompanies = String(params.with_companies || '').trim();

    const cleanParams = {
      page: params.page || 1,
      language: params.language || "zh-CN",
      sort_by: params.sort_by || "primary_release_date.desc",
    };

    if (withCompanies) {
      cleanParams.with_companies = withCompanies;
    }

    const currentDate = getCurrentDate();
    if (params.air_status === 'released') {
      cleanParams['primary_release_date.lte'] = currentDate;
    } else if (params.air_status === 'upcoming') {
      cleanParams['primary_release_date.gte'] = currentDate;
    }

    if (params.with_genres) {
      cleanParams.with_genres = String(params.with_genres).trim();
    }

    console.log('TMDB请求参数:', cleanParams);
    return await fetchTmdbData(api, cleanParams);
    
  } catch (error) {
    console.error('公司数据加载失败:', error);
    return [createErrorItem('companies', '数据加载失败', error)];
  }
}



//===============IMDB功能函数===============
async function loadImdbCardItems(params = {}) {
  const url = params.url;
  if (!url) throw new Error("缺少 IMDB 片单 URL");
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    },
  });
  if (!response || !response.data) throw new Error("获取 IMDB 片单数据失败");
  const videoIds = [];
  const ldJsonMatch = response.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldJsonMatch && ldJsonMatch[1]) {
      try {
          const json = JSON.parse(ldJsonMatch[1]);
          if (json && json.itemListElement && Array.isArray(json.itemListElement)) {
              for (const item of json.itemListElement) {
                  if (item && item.item && item.item.url) {
                      const idMatch = item.item.url.match(/(tt\d+)/);
                      if (idMatch && idMatch[1]) {
                          videoIds.push({
                              id: idMatch[1],
                              type: "imdb",
                              title: item.item.name || "Unknown Title",
                              coverUrl: item.item.image || undefined,
                          });
                      }
                  }
              }
          }
      } catch (e) {
          console.warn("解析 LD+JSON 失败:", e);
      }
  }
  if (videoIds.length === 0) {
      const docId = Widget.dom.parse(response.data);
      if (docId < 0) throw new Error("解析 IMDB HTML 失败");
      const itemElementIds = Widget.dom.select(docId, "ul.ipc-metadata-list > li, .lister-list > tr");
      for (const itemId of itemElementIds) {
          try {
              const linkElementId = Widget.dom.selectFirst(itemId, ".ipc-title__text, .titleColumn a");
              let link = "";
              let title = "";
              if (linkElementId >= 0) {
                  const titleText = await Widget.dom.text(linkElementId);
                  title = titleText ? titleText.replace(/^\d+\.\s*/, '').trim() : "Unknown Title";
                  const titleLinkElementId = Widget.dom.selectFirst(itemId, "a.ipc-title-link-wrapper, .titleColumn a");
                   if (titleLinkElementId >= 0) {
                       link = await Widget.dom.attr(titleLinkElementId, "href");
                   }
              }
              if (link) {
                  const idMatch = link.match(/(tt\d+)/);
                  if (idMatch && idMatch[1]) {
                      let coverUrl = "";
                      const imgElementId = Widget.dom.selectFirst(itemId, ".ipc-poster img, .posterColumn img");
                      if (imgElementId >= 0) {
                          coverUrl = await Widget.dom.attr(imgElementId, "src");
                          if (coverUrl && coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
                          if (coverUrl) coverUrl = coverUrl.replace(/\/(c|g|s)\//, '/l/');
                      }
                      videoIds.push({
                          id: idMatch[1],
                          type: "imdb",
                          title: title || "Unknown Title",
                          coverUrl: coverUrl || undefined,
                          description: ""
                        });
                  }
              }
          } catch (parseError) {
              console.error("IMDB 解析错误:", parseError);
          }
      }
  }
  const { start, limit } = calculatePagination(params);
  const end = start + limit;
  return videoIds.slice(start, end);
}
//===============BGM功能函数===============
const TMDB_API_LANGUAGE = "zh-CN";

async function searchTmdb(originalTitle, chineseTitle, listTitle, searchMediaType = 'tv', year = '') {
    const queries = [];
    const addedQueries = new Set();
    function addQuery(query) {
        if (query && typeof query === 'string' && query.trim()) {
            const trimmedQuery = query.trim();
            if (!addedQueries.has(trimmedQuery.toLowerCase())) {
                queries.push(trimmedQuery);
                addedQueries.add(trimmedQuery.toLowerCase());
            }
        }
    }
    addQuery(originalTitle);
    addQuery(chineseTitle);
    if (originalTitle) {
        addQuery(originalTitle.replace(/第.+[期季]$|[（(【\[].*?[】)）\]]/g, '').trim()); // 去除 "第二季" "S2" "(2024)" 等
        addQuery(originalTitle.split(/[:：\-\s（(【\[]/)[0].trim()); // 取第一个主要部分
    }
    if (chineseTitle) {
        addQuery(chineseTitle.replace(/第.+[期季]$|[（(【\[].*?[】)）\]]/g, '').trim());
        addQuery(chineseTitle.split(/[:：\-\s（(【\[]/)[0].trim());
    }
    addQuery(listTitle); // Bangumi 列表上显示的标题
    if (listTitle) {
         addQuery(listTitle.replace(/第.+[期季]$|[（(【\[].*?[】)）\]]/g, '').trim());
         addQuery(listTitle.split(/[:：\-\s（(【\[]/)[0].trim());
    }

    // 确保至少有一个有效查询词
    const finalQueries = queries.filter(q => q);
    if (finalQueries.length === 0) { console.log("[TMDB 搜索] 没有有效的查询语句。"); return null; }
    
    console.log(`[TMDB 搜索] 类型: ${searchMediaType}, 年份: ${year}. 查询语句:`, JSON.stringify(finalQueries));
    
    let bestOverallMatch = null;
    let highestOverallScore = -Infinity; // 初始为负无穷，确保任何有效分数都能成为第一个最高分
    const validYear = year && /^\d{4}$/.test(year) ? parseInt(year, 10) : null;

    // 阶段 1: 精确年份搜索 (如果年份和主标题可用)
    // 这一阶段的目的是快速找到年份完全匹配且标题相似度高的结果
    if (validYear && (originalTitle || chineseTitle)) {
        const preciseQuerySource = originalTitle || chineseTitle; // 优先使用原始标题
        if (preciseQuerySource && typeof preciseQuerySource === 'string' && preciseQuerySource.trim()) {
            const preciseQuery = preciseQuerySource.trim();
            console.log(`[TMDB 搜索] 阶段 1: 使用精确年份搜索，查询: "${preciseQuery}" (年份: ${validYear}, 类型: ${searchMediaType})`);
            try {
                const params = { query: preciseQuery, language: TMDB_API_LANGUAGE, include_adult: false };
                if (searchMediaType === 'tv') params.first_air_date_year = validYear;
                else if (searchMediaType === 'movie') params.primary_release_year = validYear;
                // 对于 'multi' 类型，TMDB API 不接受特定年份参数，年份匹配将在评分中处理

                const results = await Widget.tmdb.get(`/search/${searchMediaType}`, { params: params });
                if (results && results.results && results.results.length > 0) {
                    for (const result of results.results) {
                        // 确保是动画 (genre_id 16)
                        if (!(result.genre_ids && result.genre_ids.includes(16)) && (searchMediaType === 'tv' || searchMediaType === 'movie')) {
                            continue;
                        }
                        const resDate = result.release_date || result.first_air_date;
                        if (resDate && resDate.startsWith(String(validYear))) { // 严格年份匹配
                            let score = 15; // 基础分提高，因为这是精确年份匹配阶段
                            score += (result.popularity || 0) * 0.2; // 流行度权重略微提高
                            // 标题相似度 (简单检查)
                            const resultTitleLower = (result.title || result.name || "").toLowerCase();
                            const preciseQueryLower = preciseQuery.toLowerCase();
                            if (resultTitleLower.includes(preciseQueryLower) || preciseQueryLower.includes(resultTitleLower)) score += 5;
                            
                            if (score > highestOverallScore) { 
                                highestOverallScore = score; 
                                bestOverallMatch = result; 
                            }
                        }
                    }
                    if (bestOverallMatch) { console.log(`[TMDB 搜索] 阶段 1 找到候选: ID ${bestOverallMatch.id}, 标题: ${bestOverallMatch.title || bestOverallMatch.name}, 分数: ${highestOverallScore.toFixed(2)}`); }
                    else { console.log(`[TMDB 搜索] 阶段 1 "${preciseQuery}" (类型: ${searchMediaType}) 未找到严格年份匹配的动画。`); }
                }
            } catch (e) { console.error(`[TMDB 搜索] 阶段 1 错误，查询 "${preciseQuery}" (类型: ${searchMediaType}):`, e.message); }
        }
    }

    console.log("[TMDB 搜索] 阶段 2: 对所有查询词进行更广泛的搜索和评分。");
    for (const query of finalQueries) {
        console.log(`[TMDB 搜索] 阶段 2 尝试查询: "${query}" (类型: ${searchMediaType})`);
        try {
            const params = { query: query, language: TMDB_API_LANGUAGE, include_adult: false };
            const results = await Widget.tmdb.get(`/search/${searchMediaType}`, { params: params });

            if (results && results.results && results.results.length > 0) {
                for (const result of results.results) {
                     // 确保是动画 (genre_id 16)
                    if (!(result.genre_ids && result.genre_ids.includes(16)) && (searchMediaType === 'tv' || searchMediaType === 'movie' || result.media_type === 'tv' || result.media_type === 'movie')) {
                        continue;
                    }

                    let currentScore = 0;
                    const resultTitle = (result.title || result.name || "").toLowerCase();
                    const resultOriginalTitle = (result.original_title || result.original_name || "").toLowerCase();
                    const queryLower = query.toLowerCase();

                    // 标题匹配评分
                    if (resultTitle === queryLower || resultOriginalTitle === queryLower) currentScore += 15; // 完全匹配
                    else if (resultTitle.includes(queryLower) || resultOriginalTitle.includes(queryLower)) currentScore += 8; // 包含匹配
                    else { // 词语匹配
                        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
                        const titleWords = resultTitle.split(/\s+/);
                        if (queryWords.length > 0) {
                            let commonWords = 0; queryWords.forEach(qw => { if (titleWords.includes(qw)) commonWords++; });
                            currentScore += (commonWords / queryWords.length) * 6; // 提高一点权重
                        } else { currentScore -= 3; } // 无有效词语则减分
                    }

                    // 年份匹配评分
                    let yearBonus = 0;
                    if (validYear) {
                        const resDate = result.release_date || result.first_air_date;
                        if (resDate && resDate.length >=4 && /^\d{4}/.test(resDate)) {
                            const resYear = parseInt(resDate.substring(0, 4), 10);
                            const yearDiff = Math.abs(resYear - validYear);
                            if (yearDiff === 0) yearBonus = 6; // 同年加分提高
                            else if (yearDiff === 1) yearBonus = 3; // 相差1年
                            else if (yearDiff === 2) yearBonus = 1; // 相差2年
                            else if (yearDiff > 3) yearBonus = - (yearDiff * 2.5); // 差异过大惩罚加重
                            else yearBonus = -2; // 其他较小差异
                        } else { yearBonus = -2; } // 无日期信息或格式不对
                    } else { yearBonus = 0.5; } // 如果BGM没提供年份，TMDB有年份信息则略微加分
                    currentScore += yearBonus;

                    // 语言和类型加分
                    if (result.original_language === 'ja' && (searchMediaType === 'tv' || searchMediaType === 'movie' || result.media_type === 'tv' || result.media_type === 'movie')) currentScore += 2.5; // 日语动画
                    if (result.media_type === searchMediaType && searchMediaType === 'multi') currentScore +=2; // multi搜索时类型匹配
                    else if (searchMediaType !== 'multi' && (result.media_type === searchMediaType || !result.media_type)) currentScore +=1; // tv/movie搜索时类型应匹配或multi结果无类型

                    // 流行度评分 (对数，避免极端影响，权重略微调整)
                    currentScore += Math.log10((result.popularity || 0) + 0.1) * 2.5;
                    
                    // 如果阶段1已经有了一个很好的匹配，阶段2的结果需要明显更好才能覆盖
                    if (bestOverallMatch && highestOverallScore > (currentScore + 5) && result.id === bestOverallMatch.id) {
                        // 如果是同一个条目，但分数低很多，不更新
                    } else if (currentScore > highestOverallScore) { 
                        highestOverallScore = currentScore; 
                        bestOverallMatch = result; 
                    }
                }
            }
        } catch (e) {
            console.error(`[TMDB 搜索] 阶段 2 错误，查询 "${query}" (类型: ${searchMediaType}):`, e.message);
            if (String(e.message).includes("401") || String(e.message).includes("403")) { 
                console.error("[TMDB 搜索] 认证错误。中止当前条目的 TMDB 搜索。"); 
                return null; 
            }
        }
    }

    // 最终阈值判断 (原为 > 5，可以根据实际情况微调，如果误匹配多则提高，漏匹配多则降低)
    const scoreThreshold = 6; // 稍微提高阈值，要求更高匹配质量
    if (bestOverallMatch && highestOverallScore > scoreThreshold) { 
        console.log(`[TMDB 搜索] 最终最佳匹配: ID ${bestOverallMatch.id}, 标题: ${bestOverallMatch.title || bestOverallMatch.name}, 类型: ${bestOverallMatch.media_type || searchMediaType}, 分数: ${highestOverallScore.toFixed(2)}`);
        return bestOverallMatch; 
    }
    else { 
        const reason = bestOverallMatch ? `分数 ${highestOverallScore.toFixed(2)} <= ${scoreThreshold} (过低)` : "没有结果"; 
        console.log(`[TMDB 搜索] 未找到满意的 TMDB 匹配项 (${reason})，针对 BGM:${originalTitle}/${chineseTitle} (年份 ${year}, 类型 ${searchMediaType}) 的所有尝试均失败。`); 
        return null; 
    }
}


// --- 确保所有辅助函数都存在 ---

function getInfoFromBox($, labelText) {
    let value = ''; const listItems = $('#infobox li');
    for (let i = 0; i < listItems.length; i++) {
        const liElement = listItems.eq(i); const tipSpan = liElement.find('span.tip').first();
        if (tipSpan.text().trim() === labelText) { value = liElement.clone().children('span.tip').remove().end().text().trim(); return value; }
    } return value;
}

function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return ''; dateStr = dateStr.trim(); let match;
    match = dateStr.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/); if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    match = dateStr.match(/^(\d{4})年(\d{1,2})月(?!日)/); if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-01`;
    match = dateStr.match(/^(\d{4})年(冬|春|夏|秋)/); if (match) { let month = '01'; if (match[2] === '春') month = '04'; else if (match[2] === '夏') month = '07'; else if (match[2] === '秋') month = '10'; return `${match[1]}-${month}-01`; }
    match = dateStr.match(/^(\d{4})年(?![\d月春夏秋冬])/); if (match) return `${match[1]}-01-01`;
    match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/); if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    match = dateStr.match(/^(\d{4})[-/](\d{1,2})(?!.*[-/])/); if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-01`;
    match = dateStr.match(/^(\d{4})$/); if (match) return `${match[1]}-01-01`; return '';
}

function parseTitleAndSeason(title, originalTitle) {
    let baseTitle = title;
    let seasonNumber = null;
    let seasonTitlePart = ""; 
    const seasonPatterns = [
        { regex: /\s*(?:S|Season|第|Season)(?:\s*)(\d{1,2})(?:(?:\s*)(?:季|部分|Part))?$/i, group: 1 },
        { regex: /\s*([一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾])[之ノ](?:章|篇|部)$/i, group: 1, type: 'chinese_numeral' },
        { regex: /\s*(\d{1,2})[之ノ](?:章|篇|部)$/i, group: 1 },
    ];
    const chineseNumerals = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5, '陆': 6, '柒': 7, '捌': 8, '玖': 9, '拾': 10
    };
    for (const p of seasonPatterns) {
        const match = baseTitle.match(p.regex);
        if (match && match[p.group]) {
            seasonTitlePart = match[0]; 
            if (p.type === 'chinese_numeral') {
                seasonNumber = chineseNumerals[match[p.group]];
            } else {
                seasonNumber = parseInt(match[p.group], 10);
            }
            if (seasonNumber !== null && !isNaN(seasonNumber)) {
                baseTitle = baseTitle.substring(0, baseTitle.length - seasonTitlePart.length).trim();
                console.log(`[parseTitleAndSeason] Matched: "${seasonTitlePart}", Season: ${seasonNumber}, Base: "${baseTitle}"`);
                break; 
            }
        }
    }
    return {
        cleanedBaseTitle: baseTitle,
        searchableBaseTitles: [...new Set([baseTitle, title, originalTitle].filter(t => t && String(t).trim()))],
        seasonNumber: seasonNumber,
        originalTitleWithSeason: title 
    };
}

function formatItemDescription(item) {
    let description = item.description || '';
    if (item.rating) {
        const ratingStr = String(item.rating);
        if (!description.toLowerCase().includes('rating') && !description.toLowerCase().includes('评分') && !description.includes(ratingStr)) {
             description = `评分: ${ratingStr} | ${description}`;
        }
    }
     if (item.releaseDate) {
        if (typeof item.releaseDate === 'string' && item.releaseDate.length >= 4) {
            const year = item.releaseDate.substring(0, 4);
            if (!description.toLowerCase().includes('year') && !description.toLowerCase().includes('年份') && !description.includes(year)) {
                description = `年份: ${year} | ${description}`;
            }
        }
     }
    return description.trim().replace(/^\|\s*/, '').replace(/\s*\|$/, '');
}

function createSpecialItem(id, type, title, description) {
     return {
        id: String(id), type: type, title: title, description: description || "",
        posterPath: undefined, backdropPath: undefined, releaseDate: undefined,
        mediaType: undefined, rating: undefined, genreTitle: undefined,
        link: undefined,
        coverUrl: undefined, duration: undefined, durationText: undefined, 
        previewUrl: undefined, videoUrl: undefined, childItems: undefined
    };
}

function createErrorItem(id, title, error) {
    console.error(title, error);
    return createSpecialItem(String(id), "error", title, error?.message || String(error) || "发生未知错误");
}

async function fetchItemDetails(pendingItem, categoryHint) { 
    console.log(`[BGM 详情] 处理中: "${pendingItem.titleFromList}" (BGM ID: ${pendingItem.id}). CatHint: ${categoryHint}. 列表提供封面: ${pendingItem.coverFromList ? '有' : '无'}, 评分: ${pendingItem.ratingFromList || '无'}, Info: ${pendingItem.infoTextFromList || '无'}`);
    try {
        const response = await Widget.http.get(pendingItem.detailLink, { headers: { "User-Agent": "Mozilla/5.0 FW/1.0 (compatible; WidgetFramework)", "Referer": "https://bgm.tv/", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" } });
        const detailHtml = response.data;

        if (!detailHtml) {
            console.warn(`[BGM 详情] ${pendingItem.detailLink} 的 HTML 响应为空。尝试仅用列表信息进行TMDB匹配。`);
            let searchTypeForApiFallback = 'tv'; 
            if (categoryHint === 'movie') searchTypeForApiFallback = 'movie';
            else if (categoryHint === 'anime') searchTypeForApiFallback = 'tv'; 

            const yearFromListInfo = pendingItem.yearFromList || (pendingItem.infoTextFromList ? (pendingItem.infoTextFromList.match(/(\d{4})年/)?.[1] || '') : '');

            const tmdbDataFallback = await searchTmdb(
                pendingItem.titleFromList, 
                pendingItem.titleFromList,
                pendingItem.titleFromList,
                searchTypeForApiFallback,
                yearFromListInfo
            );

            if (tmdbDataFallback && tmdbDataFallback.id) {
                console.log(`[TMDB 匹配 - NoDetailHTML] 成功: (BGM List: "${pendingItem.titleFromList}") -> (TMDB: "${tmdbDataFallback.title || tmdbDataFallback.name}", ID: ${tmdbDataFallback.id})`);
                const tmdbMediaType = tmdbDataFallback.media_type || searchTypeForApiFallback;
                
                return {
                    id: String(tmdbDataFallback.id), 
                    type: "tmdb",
                    title: (tmdbDataFallback.title || tmdbDataFallback.name || pendingItem.titleFromList).trim(),
                    posterPath: tmdbDataFallback.poster_path || '', 
                    backdropPath: tmdbDataFallback.backdrop_path || '', 
                    releaseDate: parseDate(tmdbDataFallback.release_date || tmdbDataFallback.first_air_date) || (yearFromListInfo ? `${yearFromListInfo}-01-01` : ''),
                    rating: tmdbDataFallback.vote_average ? tmdbDataFallback.vote_average.toFixed(1) : (pendingItem.ratingFromList || undefined),
                    mediaType: tmdbMediaType,
                    description: "", 
                    genreTitle: null, 
                    link: null,       
                    originalBgmId: pendingItem.id,
                    childItems: []
                };
            } else {
                console.warn(`[TMDB 匹配 - NoDetailHTML] 失败 for BGM ID ${pendingItem.id} "${pendingItem.titleFromList}". 返回null.`);
                return null;
            }
        }

        const $ = Widget.html.load(detailHtml);
        const originalTitleFromDetail = $('h1.nameSingle > a').first().text().trim();
        const chineseTitleFromDetail = getInfoFromBox($, "中文名:");
        const displayTitle = chineseTitleFromDetail || originalTitleFromDetail || pendingItem.titleFromList;

        let posterPathFromBgm = $('#bangumiInfo .infobox a.thickbox.cover').attr('href') || $('#bangumiInfo .infobox img.cover').attr('src') || pendingItem.coverFromList || '';
        if (posterPathFromBgm && posterPathFromBgm.startsWith('//')) { posterPathFromBgm = 'https:' + posterPathFromBgm; }
        if (posterPathFromBgm.startsWith('https://lain.bgm.tv/pic/cover/')) {
             posterPathFromBgm = posterPathFromBgm.substring('https://lain.bgm.tv'.length); 
        }

        let releaseDateStr = getInfoFromBox($, "放送开始:") || getInfoFromBox($, "上映年度:") || getInfoFromBox($, "发售日期:") || getInfoFromBox($, "发行日期:");
        let releaseDate = parseDate(releaseDateStr);
        if (!releaseDate && pendingItem.infoTextFromList) {
            const match = pendingItem.infoTextFromList.match(/(\d{4}年\d{1,2}月\d{1,2}日|\d{4}年\d{1,2}月|\d{4}年[春夏秋冬]|\d{4}年)/);
            if (match && match[0]) releaseDate = parseDate(match[0]);
        }
        const yearForTmdbSearch = releaseDate ? releaseDate.substring(0, 4) : (pendingItem.yearFromList || '');
        
        let bgmMediaTypeDisplay = ($('h1.nameSingle small.grey').first().text().trim() || "").toLowerCase();
        let determinedBangumiTypeForWidget = categoryHint || 'anime'; 
        let tmdbSearchTypeForApi = '';

        if (categoryHint === 'anime' || categoryHint === 'real' || !categoryHint ) {
            if (bgmMediaTypeDisplay.includes('movie') || bgmMediaTypeDisplay.includes('剧场版') || bgmMediaTypeDisplay.includes('映画')) {
                tmdbSearchTypeForApi = 'movie';
                determinedBangumiTypeForWidget = 'movie';
            } else {
                tmdbSearchTypeForApi = 'tv'; 
                determinedBangumiTypeForWidget = 'tv';
            }
        } else if (categoryHint === 'movie') { 
             tmdbSearchTypeForApi = 'movie';
             determinedBangumiTypeForWidget = 'movie';
        }

        const ratingFromDetail = $('#panelInterestWrapper .global_rating .number').text().trim();
        const finalRating = ratingFromDetail || pendingItem.ratingFromList || undefined;
        const summaryFromDetail = $('#subject_summary').text()?.trim() || "";
        let itemToReturn = null;

        if (tmdbSearchTypeForApi) { 
            const tmdbData = await searchTmdb(originalTitleFromDetail, chineseTitleFromDetail, pendingItem.titleFromList, tmdbSearchTypeForApi, yearForTmdbSearch);
            if (tmdbData && tmdbData.id) {
                console.log(`[TMDB 匹配] 成功: (BGM: "${displayTitle}") -> (TMDB: "${tmdbData.title || tmdbData.name}", ID: ${tmdbData.id})`);
                const effectiveTmdbMediaType = tmdbData.media_type || tmdbSearchTypeForApi; 
                itemToReturn = {
                    id: String(tmdbData.id), 
                    type: "tmdb",
                    title: (tmdbData.title || tmdbData.name || displayTitle).trim(),
                    posterPath: tmdbData.poster_path || (posterPathFromBgm && !posterPathFromBgm.startsWith('http') ? posterPathFromBgm : ''), 
                    backdropPath: tmdbData.backdrop_path || '', 
                    releaseDate: parseDate(tmdbData.release_date || tmdbData.first_air_date) || releaseDate,
                    rating: tmdbData.vote_average ? tmdbData.vote_average.toFixed(1) : finalRating,
                    mediaType: effectiveTmdbMediaType,
                    description: "",      
                    genreTitle: null,   
                    link: null,         
                    originalBgmId: pendingItem.id, 
                    childItems: []      
                };
                if (itemToReturn.mediaType === 'tv') { 
                    const titleForSeasonParsing = chineseTitleFromDetail || originalTitleFromDetail || pendingItem.titleFromList;
                    const parsedSeasonInfo = parseTitleAndSeason(titleForSeasonParsing, originalTitleFromDetail); 
                    const detectedSeasonNumber = parsedSeasonInfo.seasonNumber;
                    if (detectedSeasonNumber) {
                        console.log(`[BGM 详情 -> TMDB Season] 检测到 S${detectedSeasonNumber} for "${titleForSeasonParsing}". TV ID: ${itemToReturn.id}.`);
                        try {
                            const seasonDetail = await Widget.tmdb.get(`tv/${itemToReturn.id}/season/${detectedSeasonNumber}`, { params: { language: TMDB_API_LANGUAGE, append_to_response: 'credits,images' } });
                            if (seasonDetail && seasonDetail.id && seasonDetail.air_date) {
                                console.log(`[BGM 详情 -> TMDB Season] 成功获取TMDB S${detectedSeasonNumber} (Season ID: ${seasonDetail.id}).`);
                                itemToReturn.seasonNumberHint = detectedSeasonNumber; 
                                if (seasonDetail.episodes && seasonDetail.episodes.length > 0) {
                                    itemToReturn.childItems = seasonDetail.episodes.map(ep => {
                                        let episodePoster = itemToReturn.posterPath; 
                                        if (ep.still_path) episodePoster = `https://image.tmdb.org/t/p/w300${ep.still_path}`;
                                        else if (itemToReturn.posterPath && itemToReturn.posterPath.startsWith('/')) episodePoster = `https://image.tmdb.org/t/p/w500${itemToReturn.posterPath}`;
                                        return {
                                            id: `ep.${itemToReturn.id}.${detectedSeasonNumber}.${ep.episode_number}`, type: "episode", 
                                            title: ep.name || `第 ${ep.episode_number} 集`, description: ep.overview || "", 
                                            coverUrl: episodePoster, releaseDate: ep.air_date,
                                            rating: ep.vote_average ? ep.vote_average.toFixed(1) : undefined,
                                            duration: ep.runtime ? ep.runtime * 60 : undefined, durationText: ep.runtime ? `${ep.runtime} 分钟` : undefined,
                                            episodeNumber: ep.episode_number, seasonNumber: ep.season_number,
                                            link: `https://www.themoviedb.org/tv/${itemToReturn.id}/season/${ep.season_number}/episode/${ep.episode_number}`
                                        };
                                    });
                                }
                            } else { console.warn(`[BGM 详情 -> TMDB Season] 未能获取TMDB S${detectedSeasonNumber} 的有效信息.`); }
                        } catch (e) { console.error(`[BGM 详情 -> TMDB Season] 获取TMDB S${detectedSeasonNumber} 时出错: ${e.message}`); }
                    }
                }
            } else { console.log(`[TMDB 匹配] 失败: (BGM: "${displayTitle}"). 回退到 Bangumi 'url' 类型.`); }
        } else { console.log(`[TMDB 搜索] 已跳过非影视内容 (BGM: "${displayTitle}", Cat: ${categoryHint}). 回退 Bangumi 'url' 类型.`); }

        if (!itemToReturn) {
            const fallbackDescription = formatItemDescription({ description: summaryFromDetail || pendingItem.infoTextFromList, rating: finalRating, releaseDate: releaseDate });
            let finalPosterPathFromBgm = posterPathFromBgm;
            if (finalPosterPathFromBgm && finalPosterPathFromBgm.startsWith('/pic/cover/')) finalPosterPathFromBgm = 'https://lain.bgm.tv' + finalPosterPathFromBgm;
            else if (!finalPosterPathFromBgm.startsWith('http')) finalPosterPathFromBgm = ''; 
            itemToReturn = {
                id: `bgm.${pendingItem.id}`, type: "url", title: displayTitle,
                coverUrl: finalPosterPathFromBgm, description: fallbackDescription.trim() || "暂无简介",
                rating: finalRating, releaseDate: releaseDate, mediaType: determinedBangumiTypeForWidget, 
                originalBgmId: pendingItem.id, link: pendingItem.detailLink, childItems: []
            };
             console.log(`[Fallback Item] Created 'url' type for BGM ID ${pendingItem.id}`);
        }
        if (itemToReturn.type === "tmdb") {
            itemToReturn.description = itemToReturn.description || ""; 
            itemToReturn.genreTitle = itemToReturn.genreTitle || null; 
            itemToReturn.link = itemToReturn.link || null;       
        }
        console.log(`[最终条目] ID: ${itemToReturn.id}, 类型: ${itemToReturn.type}, 标题: "${itemToReturn.title}"`);
        return itemToReturn;
    } catch (error) {
        console.error(`[BGM 详情] 严重错误，处理 BGM ID ${pendingItem.id} ("${pendingItem.titleFromList}") 失败:`, error.message, error.stack);
        return createErrorItem(`fetch-detail-error-${pendingItem.id}-${Date.now()}`, `获取 "${pendingItem.titleFromList}" 详情失败`, error);
    }
}

async function _fetchAndProcessBangumiCalendar() {
    const url = "https://api.bgm.tv/calendar";
    console.log("内部请求 Bangumi 放送日历 API:", url);
    try {
        const response = await Widget.http.get(url, { headers: { "User-Agent": `FW/1.0 (BWidget/${WidgetMetadata.version})`, "Accept": "application/json" } });
        if (!response || !response.data || !Array.isArray(response.data)) {
            console.error("Bangumi 日历 API 响应无效:", response.data); throw new Error("获取日历数据失败或格式错误");
        }
        const rawBangumiItems = []; const processedForDay = new Set(); 
        for (const dayData of response.data) {
            const apiWeekdayId = dayData.weekday?.id; 
            const itemsToProcess = dayData.items && Array.isArray(dayData.items) ? dayData.items : [];
            for (const item of itemsToProcess) {
                const itemIdRaw = item?.id;
                if (itemIdRaw === null || itemIdRaw === undefined) { console.warn(`[RawCal] 跳过 (ID null):`, item.name_cn || item.name); continue; }
                let finalIdString = String(itemIdRaw); 
                if (typeof itemIdRaw !== 'number' || !Number.isInteger(itemIdRaw) || itemIdRaw <= 0) {
                     console.warn(`[RawCal] 跳过 (ID无效: ${itemIdRaw}):`, item.name_cn || item.name); continue;
                }
                const dayBgmIdKey = `${apiWeekdayId}-${finalIdString}`;
                if (processedForDay.has(dayBgmIdKey)) {
                    console.warn(`[RawCal] API原始数据重复 (已跳过): BGM ID ${finalIdString} on weekday ${apiWeekdayId}`); continue; 
                }
                processedForDay.add(dayBgmIdKey);
                const images = item.images || {};
                const coverUrl = images.large || images.common || images.medium || images.small || undefined;
                const title = item.name_cn || item.name;
                const originalTitle = item.name;
                const airDate = item.air_date || ""; const year = airDate.substring(0,4);
                const summary = item.summary || ""; const rating = item.rating?.score; const rank = item.rank;
                if (!title) { console.warn(`[RawCal] 跳过 (无标题, ID: ${finalIdString})`); continue; }
                rawBangumiItems.push({
                    bgmId: finalIdString, title: title, originalTitle: originalTitle, year: year,
                    coverUrl: coverUrl ? (coverUrl.startsWith('//') ? 'https:' + coverUrl : coverUrl) : undefined,
                    airDate: airDate, apiWeekdayId: apiWeekdayId, summary: summary, ratingScore: rating, rank: rank,
                });
            }
        }
        console.log(`[RawCal] 解析 ${rawBangumiItems.length} 个原始日历条目 (去重后)。`);
        return rawBangumiItems;
    } catch (error) { console.error("内部获取 Bangumi 日历原始数据失败:", error); throw error; }
}

function getWeekdayTitle(apiWeekdayId) { 
    const weekdaysMeta = { 1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日" };
    return weekdaysMeta[apiWeekdayId] || `未知 (${apiWeekdayId})`;
}
function convertToApiWeekdayId(dayValueFromParam) { 
    const dayInt = parseInt(dayValueFromParam, 10);
    if (isNaN(dayInt) || dayInt < 0 || dayInt > 6) return 1; 
    return dayInt === 0 ? 7 : dayInt; 
}

async function loadBangumiCalendarUnified(params = {}) {
    const viewType = params.viewType || 'today'; const now = Date.now(); let dayName = ""; 
    try {
        const rawCalendarItems = await _fetchAndProcessBangumiCalendar(); 
        if (!rawCalendarItems || rawCalendarItems.length === 0) {
             return [createSpecialItem(`info-nodata-${now}`, "info", "无放送数据", "未能获取到本周放送数据。")];
        }
        let itemsToFetchTmdbForInput = [];
        if (viewType === 'weekly') itemsToFetchTmdbForInput = rawCalendarItems;
        else if (viewType === 'today' || viewType === 'daily') {
            let targetApiWeekdayId; 
            if (viewType === 'today') {
                const jsToday = new Date().getDay(); targetApiWeekdayId = convertToApiWeekdayId(jsToday);
                dayName = getWeekdayTitle(targetApiWeekdayId);
            } else { 
                const selectedWeekdayParam = params.weekday; 
                if (selectedWeekdayParam === undefined || selectedWeekdayParam === null) {
                     return [createErrorItem(`err-missing-weekday-${now}`, "缺少参数", { message: "请选择星期。" })];
                }
                targetApiWeekdayId = convertToApiWeekdayId(selectedWeekdayParam); dayName = getWeekdayTitle(targetApiWeekdayId);
            }
            itemsToFetchTmdbForInput = rawCalendarItems.filter(item => item.apiWeekdayId === targetApiWeekdayId);
            if (itemsToFetchTmdbForInput.length === 0) {
                 console.log(`[CalUnified] ${dayName} (${viewType}) 无条目。`);
                 return [createSpecialItem(`info-${viewType}-empty-${now}`, "info", `${dayName}无放送`, "当天无动画放送。")];
            }
        } else return [createErrorItem(`err-unknown-view-${now}`, "无效视图", { message: `未知视图: ${viewType}` })];
        
        const uniqueBgmIdsForView = new Set();
        const itemsToFetchTmdbFor = itemsToFetchTmdbForInput.filter(item => {
            if (uniqueBgmIdsForView.has(item.bgmId)) {
                console.warn(`[CalUnified] 视图数据重复BGM ID (跳过): ${item.bgmId} for "${item.title}"`); return false;
            }
            uniqueBgmIdsForView.add(item.bgmId); return true;
        });
        console.log(`[CalUnified] ${dayName||'周'}视图：为 ${itemsToFetchTmdbFor.length} 个唯一条目获取TMDB。`);
        if (itemsToFetchTmdbFor.length === 0) {
            if (viewType === 'weekly') return [createSpecialItem(`info-weekly-empty-${now}`, "info", "本周无放送", "本周无动画放送。")];
            return [createSpecialItem(`info-${viewType}-empty-dedupe-${now}`, "info", `${dayName}无放送`, "当天无动画放送。")];
        }

        const promises = itemsToFetchTmdbFor.map(async (rawItem) => {
            const tmdbSearchResult = await searchTmdb(rawItem.originalTitle, rawItem.title, rawItem.title, 'tv', rawItem.year);
            if (tmdbSearchResult && tmdbSearchResult.id) {
                const tmdbMediaType = tmdbSearchResult.media_type || 'tv'; 
                let itemToReturn = {
                    id: String(tmdbSearchResult.id), type: "tmdb",
                    title: (tmdbSearchResult.title || tmdbSearchResult.name || rawItem.title).trim(),
                    posterPath: tmdbSearchResult.poster_path || '', backdropPath: tmdbSearchResult.backdrop_path || '', description: "", 
                    rating: tmdbSearchResult.vote_average ? tmdbSearchResult.vote_average.toFixed(1) : (rawItem.ratingScore ? parseFloat(rawItem.ratingScore).toFixed(1) : undefined),
                    releaseDate: parseDate(tmdbSearchResult.first_air_date || tmdbSearchResult.release_date) || rawItem.airDate,
                    mediaType: tmdbMediaType, genreTitle: null, link: null, originalBgmId: rawItem.bgmId,
                    airWeekday: rawItem.apiWeekdayId, childItems: [] 
                };
                if (tmdbMediaType === 'tv') {
                    const parsedSeasonInfo = parseTitleAndSeason(rawItem.title, rawItem.originalTitle);
                    if (parsedSeasonInfo.seasonNumber) {
                        itemToReturn.title = `${itemToReturn.title} S${parsedSeasonInfo.seasonNumber}`; 
                        itemToReturn.seasonNumberHint = parsedSeasonInfo.seasonNumber;
                    }
                }
                return itemToReturn;
            } else {
                let desc = `放送: ${rawItem.airDate || '未知'}`; if (rawItem.summary) desc += ` | ${rawItem.summary.substring(0,80)}${rawItem.summary.length>80?'...':''}`;
                const fDesc = formatItemDescription({ description: desc, rating: rawItem.ratingScore, releaseDate: rawItem.airDate }) + (rawItem.rank ? ` | 排名: ${rawItem.rank}` : '');
                return {
                    id: `bgm_cal_${rawItem.bgmId}`, type: "url", title: rawItem.title, coverUrl: rawItem.coverUrl, 
                    description: fDesc.trim() || undefined,
                    rating: rawItem.ratingScore ? parseFloat(rawItem.ratingScore).toFixed(1) : undefined,
                    releaseDate: rawItem.airDate || undefined, mediaType: 'tv', airWeekday: rawItem.apiWeekdayId,
                    originalBgmId: rawItem.bgmId, link: `https://bgm.tv/subject/${rawItem.bgmId}`
                };
            }
        });
        const settledResults = await Promise.allSettled(promises);
        const finalItemsWithPotentialDuplicates = [];
        settledResults.forEach(r => { if (r.status==='fulfilled'&&r.value) finalItemsWithPotentialDuplicates.push(r.value); else if (r.status==='rejected') console.error("[CalUnified] TMDB处理失败:", r.reason);});
        
        const finalUniqueItemIds = new Set();
        const finalFlatList = finalItemsWithPotentialDuplicates.filter(item => {
            if (finalUniqueItemIds.has(item.id)) {
                console.warn(`[CalUnified] 最终结果重复Item ID (跳过): ${item.id} for "${item.title}"`); return false;
            }
            finalUniqueItemIds.add(item.id); return true;
        });
        
        if (finalFlatList.length === 0 && itemsToFetchTmdbFor.length > 0) return [createSpecialItem(`info-proc-fail-${now}`, "info", "处理失败", "获取信息时出错。")];
        else if (finalFlatList.length === 0 && (viewType === 'today' || viewType === 'daily')) return [createSpecialItem(`info-${viewType}-empty-final-${now}`, "info", `${dayName}无放送`, "当天无动画或无法获取信息。")];
        else if (finalFlatList.length === 0 && viewType === 'weekly') return [createSpecialItem(`info-weekly-empty-final-${now}`, "info", "本周无放送", "本周无动画或无法获取信息。")];
        
        console.log(`[CalUnified] 返回 ${finalFlatList.length} 个项目 (Flat List, 去重后)。`);
        return finalFlatList;
    } catch (error) {
         console.error(`加载 Bangumi 日历 (${viewType}) 失败:`, error);
         return [createErrorItem(`err-cal-unified-${now}`, "加载日历失败", error)];
    }
}

// 新增辅助函数，用于解析 Bangumi 列表项
async function _parseBangumiListItems($, listSelector, isRankings, yearFromParams = "") {
    const itemsToProcess = [];
    const list = $(listSelector);
    if (list.length === 0) {
        if (!$(".page_inner > .p_cur + a.p").length) {
            console.log(`BGM列表解析: 末页或无结果 (选择器: ${listSelector})`);
        }
        return [];
    }

    for (const el of list.get()) {
        try {
            const $i = $(el);
            const $l = $i.find("a.subjectCover");
            const $tl = $i.find("div.inner > h3 > a");
            const $info = $i.find("p.info.tip");
            const $r = $i.find("small.fade.rr");
            const t = $tl.text()?.trim();
            const h = $l.attr("href");

            if (h && t) {
                const idM = h.match(/\/subject\/(\d+)/);
                if (idM && idM[1]) {
                    const bgmId = idM[1];
                    let cv = $l.find("img").attr("src") || $l.find("img").attr("data-cfsrc");
                    if (cv?.startsWith('//')) cv = 'https:' + cv;
                    if (cv) cv = cv.replace(/\/(c|g|s)\//g, '/l/');
                    const infoT = $info.text()?.trim()?.replace(/\n\s*/g, ' | ') || "";
                    const rT = $r.text()?.trim() || undefined;
                    const yM = infoT.match(/(\d{4})年/);
                    const yL = yearFromParams || (yM ? yM[1] : '');
                    itemsToProcess.push({
                        id: bgmId,
                        titleFromList: t,
                        detailLink: `https://bgm.tv${h}`,
                        coverFromList: cv,
                        ratingFromList: rT,
                        infoTextFromList: infoT,
                        yearFromList: yL
                    });
                } else {
                    console.warn(`BGM列表解析: 跳过无ID条目。L: ${h}, T: ${t}`);
                }
            } else {
                console.warn(`BGM列表解析: 跳过无链接/标题条目。`);
            }
        } catch (e) {
            console.error("BGM列表解析: 解析单条出错:", e);
        }
    }
    return itemsToProcess;
}

async function loadBangumiRankings(params = {}) {
    const page = params.page || 1;
    const url = `https://bangumi.tv/anime/browser?sort=rank&page=${page}`;
    console.log("请求 Bangumi 排行:", url);
    try {
        const response = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8", "Referer": "https://bangumi.tv/anime/browser" }});
        if (!response || !response.data) { throw new Error("获取 Bangumi 排行榜页面失败"); }
        const $ = Widget.html.load(response.data);
        
        const itemsToProcess = await _parseBangumiListItems($, "ul#browserItemList > li.item", true);

        console.log(`[Rankings] 处理 ${itemsToProcess.length} 个排行条目...`);
        const promises = itemsToProcess.map(item => fetchItemDetails(item, 'anime'));
        const settled = await Promise.allSettled(promises);
        const final = [];
        settled.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                if (r.value.type !== 'error') {
                    final.push(r.value);
                } else {
                    console.warn(`[Rankings] 跳过错误条目: ID ${r.value.id}, 标题: ${r.value.title}, 描述: ${r.value.description}`);
                }
            } else if (r.status === 'rejected') {
                console.error("[Rankings] 条目处理失败 (Promise rejected):", r.reason);
            }
        });
        return final;
    } catch (error) {
         console.error("加载 Bangumi 排行榜失败:", error);
         return [createErrorItem(`err-rank-${Date.now()}`, "加载排行失败", error)]; // 使用 Date.now() 避免 now 未定义
    }
}

async function loadBangumiBrowser(params = {}) {
    const page = params.page || 1;
    const tag = params.tag || "";
    const genre = params.genre_tag || "";
    const region = params.region || "";
    const audience = params.audience || "";
    const yearP = params.year || "";
    const typeP = params.type || "all";
    let basePath = "https://bangumi.tv/anime/browser";
    const segments = [];
    const queries = [`page=${page}`, `sort=rank`];
    if (tag) segments.push("tag", encodeURIComponent(tag));
    if (genre) segments.push(encodeURIComponent(genre));
    if (region) segments.push(encodeURIComponent(region));
    if (audience) segments.push(encodeURIComponent(audience));
    if (typeP !== "all") segments.push(typeP);
    if (yearP && /\d{4}/.test(yearP)) segments.push("airtime", yearP);
    if (segments.length > 0) basePath += "/" + segments.join("/");
    const url = `${basePath}?${queries.join("&")}`;
    console.log("请求 Bangumi 浏览:", url);
    try {
        const response = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8", "Referer": "https://bangumi.tv/anime/browser" }});
        if (!response || !response.data) { throw new Error("获取 Bangumi 浏览页面失败"); }
        const $ = Widget.html.load(response.data);
        
        const itemsToProcess = await _parseBangumiListItems($, "ul#browserItemList > li.item", false, yearP);

        console.log(`[Browser] 处理 ${itemsToProcess.length} 个浏览条目...`);
        let hint = 'anime';
        if (typeP === 'movie') hint = 'movie';
        const promises = itemsToProcess.map(item => fetchItemDetails(item, hint));
        const settled = await Promise.allSettled(promises);
        const final = [];
        settled.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                if (r.value.type !== 'error') {
                    final.push(r.value);
                } else {
                    console.warn(`[Browser] 跳过错误条目: ID ${r.value.id}, 标题: ${r.value.title}, 描述: ${r.value.description}`);
                }
            } else if (r.status === 'rejected') {
                console.error("[Browser] 条目处理失败 (Promise rejected):", r.reason);
            }
        });
        return final;
    } catch (error) {
         console.error("加载 Bangumi 浏览页面失败:", error);
         return [createErrorItem(`err-browser-${Date.now()}`, "加载浏览失败", error)]; // 使用 Date.now() 避免 now 未定义
    }
}