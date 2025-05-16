// 引用地址：https://raw.githubusercontent.com/quantumultxx/FW-Widgets/refs/heads/main/Widgets/jable.js
WidgetMetadata = {
  id: "jable",
  title: "Jable",
  description: "获取Jable热门影片榜单",
  author: "nibiru",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  modules: [
    // 热门影片模块
    {
      title: "热门影片",
      description: "热门影片",
      requiresWebView: false,
      functionName: "loadPage",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          description: "列表地址",
          value:
            "https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          description: "排序",
          enumOptions: [
            { title: "所有时间", value: "video_viewed" },
            { title: "本月热门", value: "video_viewed_month" },
            { title: "本周热门", value: "video_viewed_week" },
            { title: "今日热门", value: "video_viewed_today" },
          ],
        },
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 中文字幕模块
    {
      title: "中文字幕",
      description: "中文字幕影片",
      requiresWebView: false,
      functionName: "loadPage",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          description: "列表地址",
          value:
            "https://jable.tv/categories/chinese-subtitle/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          description: "排序",
          enumOptions: [
            { title: "最新发布", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 新增最新上市模块
    {
      title: "最新上市",
      description: "最新上市影片",
      requiresWebView: false,
      functionName: "loadPage",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          description: "列表地址",
          value:
            "https://jable.tv/new-release/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          description: "排序",
          enumOptions: [
            { title: "最新发布", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 新增影片主题模块
    {
      title: "影片主题",
      description: "按主题分类浏览影片",
      requiresWebView: false,
      functionName: "loadPage",
      params: [
        {
          name: "url",
          title: "选择主题",
          type: "enumeration",
          enumOptions: [
            { 
              title: "选择类型", 
              value: ""
            },
            { 
              title: "角色剧情", 
              value: "https://jable.tv/categories/roleplay/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "制度诱惑", 
              value: "https://jable.tv/categories/uniform/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "直接开啪", 
              value: "https://jable.tv/categories/sex-only/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "丝袜美腿", 
              value: "https://jable.tv/categories/pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "主奴调教", 
              value: "https://jable.tv/categories/bdsm/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "多P群交", 
              value: "https://jable.tv/categories/groupsex/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "男友视角", 
              value: "https://jable.tv/categories/pov/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "凌辱快感", 
              value: "https://jable.tv/categories/insult/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "盗摄偷拍", 
              value: "https://jable.tv/categories/private-cam/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "无码解放", 
              value: "https://jable.tv/categories/uncensored/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
            { 
              title: "女同欢愉", 
              value: "https://jable.tv/categories/lesbian/?mode=async&function=get_block&block_id=list_videos_common_videos_list"
            },
          ],
          value: "https://jable.tv/categories/all/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          description: "排序",
          enumOptions: [
            { title: "最新发布", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
  ],
};


async function search(params = {}) {
  const url = `https://jable.tv/search/${params.keyword}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${params.keyword}`;
  params.url = url;
  return await loadPage(params);
}

async function loadPage(params = {}) {
  const sections = await loadPageSections(params);
  const items = sections.flatMap((section) => section.childItems);
  return items;
}

async function loadPageSections(params = {}) {
  try {
    let url = params.url;
    if (!url) {
      throw new Error("地址不能为空");
    }
    if (params["sort_by"]) {
      url += `&sort_by=${params.sort_by}`;
    }
    if (params["from"]) {
      url += `&from=${params.from}`;
    }
    // 1. 获取HTML内容
    console.log("=== 获取HTML内容 ===");
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    if (!response || !response.data || typeof response.data !== "string") {
      throw new Error("无法获取有效的HTML内容");
    }

    const htmlContent = response.data;
    console.log(`获取到HTML内容长度: ${htmlContent.length} 字符`);
    console.log(htmlContent);

    return parseHtml(htmlContent);
  } catch (error) {
    console.error("测试过程出错:", error.message);
    throw error;
  }
}

async function parseHtml(htmlContent) {
  // 2. 解析HTML
  console.log("\n=== 解析HTML ===");
  const $ = Widget.html.load(htmlContent);
  const sectionSelector = ".site-content .py-3,.pb-e-lg-40";
  const itemSelector = ".video-img-box";
  const coverSelector = "img";
  const durationSelector = ".absolute-bottom-right .label";
  const titleSelector = ".title a";

  let sections = [];
  //use cheerio to parse html
  const sectionElements = $(sectionSelector).toArray();
  for (const sectionElement of sectionElements) {
    const $sectionElement = $(sectionElement);
    var items = [];
    const sectionTitle = $sectionElement.find(".title-box .h3-md").first();
    const sectionTitleText = sectionTitle.text();
    console.log("sectionTitleText:", sectionTitleText);
    const itemElements = $sectionElement.find(itemSelector).toArray();
    console.log("itemElements:", itemElements);
    if (itemElements && itemElements.length > 0) {
      for (const itemElement of itemElements) {
        const $itemElement = $(itemElement);
        const titleId = $itemElement.find(titleSelector).first();
        console.log("titleId:", titleId.length);
        const url = titleId.attr("href") || "";
        console.log("url:", url);
        if (url && url.includes("jable.tv")) {
          const durationId = $itemElement.find(durationSelector).first();
          const coverId = $itemElement.find(coverSelector).first();
          const cover = coverId.attr("data-src");
          const video = coverId.attr("data-preview");
          const title = titleId.text();
          const duration = durationId.text();
          const item = {
            id: url,
            type: "url",
            title: title,
            durationText: duration,
            backdropPath: cover,
            previewUrl: video,
            link: url
          };
          console.log("item:", item);
          items.push(item);
        }
      }

      sections.push({
        id: sectionTitleText,
        type: "web",
        title: sectionTitleText,
        childItems: items,
      });
    }
  }
  console.log("sections:", sections);
  return sections;
}

async function loadDetail(link) {
  const response = await Widget.http.get(link, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  //get hls with regex var hlsUrl = 'https://hot-box-gen.mushroomtrack.com/hls/TJHqwWuFPCwYqa4hyv1cCg/1746892414/50000/50377/50377.m3u8';
  const hlsUrl = response.data.match(/var hlsUrl = '(.*?)';/)[1];
  if (!hlsUrl) {
    throw new Error("无法获取有效的HLS URL");
  }
  console.log("hlsUrl:", hlsUrl);
  const item = {
    id: link,
    type: "detail",
    videoUrl: hlsUrl,
    customHeaders: {
      "Referer": link,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  };
  const sections = await parseHtml(response.data);
  const items = sections.flatMap((section) => section.childItems);
  if (items.length > 0) {
    item.childItems = items;
  }
  return item;
}