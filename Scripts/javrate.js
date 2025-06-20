// 引用地址：https://gist.githubusercontent.com/bemarkt/17e04f66b772d4ab9ab839c12a8ad608/raw/javrate.js
var WidgetMetadata = {
  id: "ti.bemarkt.javrate",
  title: "JAVRate",
  description: "获取 JAVRate 推荐",
  author: "Ti",
  site: "https://www.javrate.com/",
  version: "1.3.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "按分类浏览",
      description: "根据选择的分类浏览 JAVRate 上的视频。",
      functionName: "getJAVRateContent",
      params: [
        {
          name: "baseUrl",
          title: "JAVRate 网址",
          type: "input",
          value: "https://www.javrate.com",
          description: "JAVRate 可用网址，例如 https://www.javrate.com",
        },
        {
          name: "categoryPath",
          title: "选择分类",
          type: "enumeration",
          value: "/movie/new/",
          enumOptions: [
            { title: "最新发布", value: "/movie/new/" },
            { title: "无码A片", value: "/menu/uncensored/" },
            { title: "日本A片", value: "/menu/censored/" },
            { title: "国产AV", value: "/menu/chinese/" },
            { title: "热门排行", value: "/best/" },
            { title: "评分最高", value: "/movie/top/" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
  ],
  search: {
    title: "搜索影片",
    functionName: "searchJAVRate",
    params: [
      {
        name: "baseUrl",
        title: "JAVRate 网址",
        type: "input",
        value: "https://www.javrate.com",
        description: "JAVRate 可用网址",
      },
      {
        name: "query",
        title: "搜索词",
        type: "input",
        description: "输入番号、标题关键词或演员名称",
      },
      {
        name: "page",
        title: "页码",
        type: "page",
      },
    ],
  },
};

const VIDEO_PLAY_REFERER = "https://iframe.mediadelivery.net/";
const PLACEHOLDER_IMAGE =
  "https://placehold.co/200x300/A8D19E/F6F7F1?text=Made%5Cnby%5CnLove&font=source-sans-pro";

function getCommonHeaders(baseUrl) {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    Referer: baseUrl
      ? baseUrl.endsWith("/")
        ? baseUrl
        : baseUrl + "/"
      : "https://www.javrate.com/",
  };
}

/**
 * 解析影片详情页的HTML内容
 */
function parseDetailPage(detailPageHtml, detailPageUrl, currentBaseUrl) {
  const $ = Widget.html.load(detailPageHtml);

  // 标题
  const titleH1 = $("h1.mb-2.mt-1");
  const movieNumber = titleH1.find("strong.fg-main").text().trim();
  const titleClone = titleH1.clone();
  titleClone.find("strong").remove();
  const mainTitleText = titleClone.text().trim();
  const rawTitle = movieNumber
    ? `${movieNumber} ${mainTitleText}`
    : mainTitleText;

  // 视频 URL、海报、描述、持续时间
  let videoUrl = null;
  let posterPath = null;
  let backdropPath = null;
  let description = "";
  let durationText = "";

  // 从 LD+JSON 获取数据
  try {
    const schemaScript = $('script[type="application/ld+json"]').html();
    if (schemaScript) {
      const schemaData = JSON.parse(schemaScript);
      videoUrl = schemaData.contentUrl || schemaData.embedUrl;
      posterPath = schemaData.thumbnailUrl;
      description = schemaData.description;
      if (schemaData.duration) {
        const durationMatch = schemaData.duration.match(
          /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );
        if (durationMatch) {
          const hours = parseInt(durationMatch[1] || 0);
          const minutes = parseInt(durationMatch[2] || 0);
          const seconds = parseInt(durationMatch[3] || 0);
          durationText = [hours, minutes, seconds]
            .map((num) => num.toString().padStart(2, "0"))
            .join(":");
        }
      }
    }
  } catch (e) {
    console.error(`parseDetailPage: 解析 LD+JSON schema 失败:`, e.message);
  }

  if (!videoUrl) {
    videoUrl = $(".player-box iframe").attr("src");
  }

  // 发片日期
  let releaseDate = "";
  $('.main-content > .left h4:contains("发片日期")')
    .next("div.col-auto")
    .find("h4")
    .each(function () {
      releaseDate = $(this).text().trim();
    });
  if (releaseDate) {
    const dateMatch = releaseDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (dateMatch) {
      releaseDate = `${dateMatch[1]}-${dateMatch[2].padStart(
        2,
        "0"
      )}-${dateMatch[3].padStart(2, "0")}`;
    }
  }

  // 时长
  if (!durationText) {
    $("div.d-flex.gap-2 span.badge.bg-default").each(function () {
      const text = $(this).text().trim();
      if (/\d{2}\s*:\s*\d{2}\s*:\s*\d{2}/.test(text)) {
        durationText = text.replace(/\s/g, "");
      }
    });
  }

  // 影片剧情
  if (!description) {
    description = $(".description-text").text().trim();
  }

  // 标签
  const tags = [];
  $("section.movie-keywords a.badge").each((i, el) => {
    tags.push($(el).text().trim());
  });
  const genreTitle = tags.join(", ");

  // 背景图 和 海报图
  backdropPath = $(".fixed-background-img").attr("src");
  if (!posterPath) {
    posterPath = backdropPath;
  }

  // 你可能也喜歡
  const relatedItems = [];
  $("div.alike-grid-container .mgn-item").each((idx, element) => {
    try {
      const item = $(element);
      const linkElement = item.find(".mgn-title a");
      const relativeLink = linkElement.attr("href");
      if (!relativeLink) return;

      const absoluteLink = relativeLink.startsWith("http")
        ? relativeLink
        : (currentBaseUrl.endsWith("/")
            ? currentBaseUrl.slice(0, -1)
            : currentBaseUrl) +
          (relativeLink.startsWith("/") ? relativeLink : "/" + relativeLink);

      const childPoster = item.find(".mgn-picture img.mgn-cover").attr("src");

      const childTitleH = item.find(".mgn-title h5");
      const titleClone = childTitleH.clone();
      titleClone.find("strong").remove();
      const mainTitle = titleClone.text().trim();
      const number = childTitleH.find("strong").text().trim();
      const fullTitle = `${number} ${mainTitle}`.trim();

      if (fullTitle && absoluteLink) {
        relatedItems.push({
          id: absoluteLink,
          type: "url",
          title: fullTitle,
          posterPath: childPoster,
          backdropPath: childPoster,
          link: absoluteLink,
          mediaType: "movie",
        });
      }
    } catch (e) {
      console.error(
        `parseDetailPage: 解析相关推荐第 ${idx + 1} 个条目时出错:`,
        e.message
      );
    }
  });

  return {
    id: detailPageUrl,
    type: "url",
    title: rawTitle,
    videoUrl: videoUrl,
    description: description || "暂无简介",
    releaseDate: releaseDate,
    durationText: durationText,
    genreTitle: genreTitle,
    posterPath: posterPath,
    backdropPath: backdropPath || posterPath,
    link: detailPageUrl,
    relatedItems: relatedItems,
  };
}

/**
 * 解析列表页面
 */
async function parseItems(currentBaseUrl, $, listPageUrl) {
  const videoItems = [];
  const items = $('div[class^="movie-grid-new-"] .mgn-item');

  console.log(`parseItems: 在 ${listPageUrl} 发现 ${items.length} 条影片条目`);

  items.each((index, element) => {
    try {
      const item = $(element);

      const linkElement = item.find(".mgn-title a");
      const relativeLink = linkElement.attr("href");

      const titleH3 = item.find(".mgn-title h3");
      const titleClone = titleH3.clone();
      titleClone.find("strong").remove();
      const mainTitleText = titleClone.text().trim();
      const movieNumber = titleH3.find("strong").text().trim();
      const rawTitle = `${movieNumber} ${mainTitleText}`.trim();

      if (!relativeLink || !rawTitle) {
        console.warn(
          `parseItems: 因缺少链接或标题，跳过第 ${index + 1} 个条目。`
        );
        return;
      }

      const absoluteLink = relativeLink.startsWith("http")
        ? relativeLink
        : (currentBaseUrl.endsWith("/")
            ? currentBaseUrl.slice(0, -1)
            : currentBaseUrl) +
          (relativeLink.startsWith("/") ? relativeLink : "/" + relativeLink);

      let posterPath = item.find(".mgn-picture img.mgn-cover").attr("src");
      if (posterPath) {
        posterPath = posterPath.replace(/\\/g, "/");
      }

      const rating = item.find(".mgn-rating .score-label").text().trim();
      const genre = item.find(".mgn-badges .mgn-badge-type").text().trim();

      let releaseDate = "";
      const dateLabel = item.find(".mgn-date");
      if (dateLabel.length > 0) {
        const dateClone = dateLabel.clone();
        dateClone.find("svg").remove();
        releaseDate = dateClone.text().trim();
      }

      videoItems.push({
        id: absoluteLink,
        type: "url",
        title: rawTitle,
        posterPath: posterPath,
        backdropPath: posterPath,
        link: absoluteLink,
        releaseDate: releaseDate || null,
        rating: rating || null,
        genreTitle: genre || null,
        mediaType: "movie",
        description: "加载详情中，等待UI刷新...",
      });
    } catch (e) {
      console.error(`parseItems: 解析第 ${index + 1} 个条目时出错: ${e}`);
    }
  });

  console.log(
    `parseItems: 从 ${listPageUrl} 成功解析了 ${videoItems.length} 条影片条目`
  );
  return videoItems;
}

async function fetchDataForPath(currentBaseUrl, path, params = {}) {
  const page = parseInt(params.page, 10) || 1;
  let requestUrl;
  const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const MENU_PATHS_PREFIX = "/menu/";
  const DEFAULT_MENU_PAGINATION_PREFIX = "5-2-";

  if (path.startsWith(MENU_PATHS_PREFIX)) {
    requestUrl = `${currentBaseUrl}${trimmedPath}/${DEFAULT_MENU_PAGINATION_PREFIX}${page}`;
  } else {
    if (page === 1) {
      requestUrl = `${currentBaseUrl}${path}`;
    } else {
      requestUrl = `${currentBaseUrl}${trimmedPath}/${page}.html`;
    }
  }

  console.log(`fetchDataForPath: 正在从 ${requestUrl} 获取数据`);

  try {
    const response = await Widget.http.get(requestUrl, {
      headers: getCommonHeaders(currentBaseUrl),
    });
    if (!response || !response.data) {
      console.error(
        `fetchDataForPath: 从 ${requestUrl} 获取影片数据失败，无响应数据`
      );
      throw new Error(`无法从 ${requestUrl} 获取影片数据`);
    }

    const $ = Widget.html.load(response.data);
    return await parseItems(currentBaseUrl, $, requestUrl);
  } catch (error) {
    console.error(
      `fetchDataForPath: 从 ${requestUrl} 获取或解析影片数据时出错:`,
      error
    );
    return [
      {
        id: `${path}-${page}`,
        type: "url",
        title: `列表加载失败: ${path} (页 ${page})`,
        description: error.message,
        link: requestUrl,
        posterPath: PLACEHOLDER_IMAGE,
        backdropPath: PLACEHOLDER_IMAGE,
      },
    ];
  }
}

async function getJAVRateContent(params = {}) {
  const baseUrl = params.baseUrl || "https://www.javrate.com";
  const categoryPath = params.categoryPath;
  return fetchDataForPath(baseUrl, categoryPath, params);
}

async function searchJAVRate(params = {}) {
  const baseUrl = params.baseUrl || "https://www.javrate.com";
  const query = params.query;
  const page = parseInt(params.page, 10) || 1;

  if (!query) {
    throw new Error("请输入搜索关键词");
  }

  const searchPath = `/search?q=${encodeURIComponent(query)}&p=${page}`;

  const requestUrl = baseUrl + searchPath;
  console.log(`searchJAVRate: 正在从 ${requestUrl} 搜索影片数据`);

  try {
    const response = await Widget.http.get(requestUrl, {
      headers: getCommonHeaders(baseUrl),
    });
    if (!response || !response.data) {
      console.error(
        `searchJAVRate: 从 ${requestUrl} 获取搜索结果失败，无响应数据`
      );
      throw new Error(`无法从 ${requestUrl} 获取搜索结果列表`);
    }
    const $ = Widget.html.load(response.data);
    return await parseItems(baseUrl, $, requestUrl);
  } catch (error) {
    console.error(
      `searchJAVRate: 从 ${requestUrl} 获取或解析搜索结果时出错:`,
      error
    );
    return [
      {
        id: `${query}-${page}`,
        type: "url",
        title: `搜索失败: ${query}`,
        description: error.message,
        link: requestUrl,
        posterPath: PLACEHOLDER_IMAGE,
        backdropPath: PLACEHOLDER_IMAGE,
      },
    ];
  }
}

async function loadDetail(linkValue) {
  let currentBaseUrl = "https://www.javrate.com";
  try {
    const urlParts = linkValue.match(/^(https?:\/\/[^/]+)/);
    if (urlParts && urlParts[1]) {
      currentBaseUrl = urlParts[1];
    }
  } catch (e) {
    console.warn(
      `loadDetail: 无法从链接 ${linkValue} 中解析baseUrl，将使用默认值`
    );
  }

  console.log(
    `loadDetail: 正在加载详情: ${linkValue} (使用baseUrl: ${currentBaseUrl})`
  );
  try {
    const response = await Widget.http.get(linkValue, {
      headers: getCommonHeaders(currentBaseUrl),
    });
    if (!response || !response.data) {
      throw new Error("无法加载详情页面: " + linkValue);
    }
    const detailData = parseDetailPage(
      response.data,
      linkValue,
      currentBaseUrl
    );

    return {
      id: linkValue,
      type: "url",
      title: detailData.title,
      videoUrl: detailData.videoUrl,
      description: detailData.description,
      releaseDate: detailData.releaseDate,
      durationText: detailData.durationText,
      duration: detailData.duration,
      genreTitle: detailData.genreTitle,
      posterPath: detailData.posterPath,
      backdropPath: detailData.backdropPath,
      link: detailData.link,
      customHeaders: detailData.videoUrl
        ? { Referer: VIDEO_PLAY_REFERER }
        : undefined,
      relatedItems: detailData.relatedItems || [],
    };
  } catch (error) {
    console.error(`loadDetail: 加载详情失败 ${linkValue}:`, error);
    return {
      id: linkValue,
      type: "url",
      title: "加载详情失败",
      description: error.message,
      link: linkValue,
      posterPath: PLACEHOLDER_IMAGE,
      backdropPath: PLACEHOLDER_IMAGE,
    };
  }
}