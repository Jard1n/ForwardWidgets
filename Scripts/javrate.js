// 引用地址：https://gist.githubusercontent.com/bemarkt/17e04f66b772d4ab9ab839c12a8ad608/raw/javrate.js
var WidgetMetadata = {
  id: "ti.bemarkt.javrate",
  title: "JAVRate",
  description: "获取 JAVRate 推荐",
  author: "Ti",
  site: "https://www.javrate.com/",
  version: "1.2.0",
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
            { title: "热门排行", value: "/movie/hot/" },
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
 * 从原始标题中解析出纯净标题和演员列表
 */
function parseTitleAndActors(rawTitle) {
  let title = rawTitle;
  let actors = "";
  const separator = " ~ ";
  if (rawTitle && rawTitle.includes(separator)) {
    const parts = rawTitle.split(separator);
    title = parts[0].trim();
    actors = parts[1].trim();
    if (actors.endsWith(";")) {
      actors = actors.slice(0, -1).trim();
    }
  }
  return { title, actors };
}

/**
 * 转换时间文本为分钟数
 */
function parseDurationToMinutes(durationText) {
  if (!durationText || typeof durationText !== "string") return null;
  const parts = durationText
    .split(":")
    .map((part) => parseInt(part.trim(), 10));

  let totalMinutes = 0;

  if (parts.some(isNaN)) return null;

  if (parts.length === 3) {
    // HH : MM : SS
    totalMinutes = parts[0] * 60 + parts[1] + parts[2] / 60;
  } else if (parts.length === 2) {
    // MM : SS
    totalMinutes = parts[0] + parts[1] / 60;
  } else {
    return null;
  }
  return totalMinutes;
}

/**
 * 解析影片详情页的HTML内容。
 */
function parseDetailPage(detailPageHtml, detailPageUrl, currentBaseUrl) {
  const $ = Widget.html.load(detailPageHtml);

  let rawTitle = "";
  const titleH1 = $("h1.fw-bolder.fs-3");
  const movieNumber = titleH1.find("label.fg-main").text().trim();
  let mainTitle = "";
  titleH1.contents().each(function () {
    if (this.type === "text" && $(this).text().trim()) {
      mainTitle += $(this).text().trim() + " ";
    }
  });
  mainTitle = mainTitle.trim();
  rawTitle = movieNumber ? `${movieNumber} ${mainTitle}` : mainTitle;
  if (!rawTitle) {
    rawTitle = $("title").text().split("|")[0].trim();
  }

  const { title, actors } = parseTitleAndActors(rawTitle);

  let videoUrl = null;
  let dplayerPoster = null;
  const scripts = $("script");
  const dplayerRegex = /new DPlayer\(\s*(\{[\s\S]*?\})\s*\);/m;
  const videoUrlRegex = /url:\s*'([^']+)'/;
  const picRegex = /pic:\s*'([^']+)'/;

  scripts.each((i, script) => {
    const scriptContent = $(script).html();
    if (scriptContent) {
      const match = scriptContent.match(dplayerRegex);
      if (match && match[1]) {
        const dplayerConfig = match[1];
        const videoUrlMatch = dplayerConfig.match(videoUrlRegex);
        if (videoUrlMatch && videoUrlMatch[1]) {
          videoUrl = videoUrlMatch[1];
        }
        const picMatch = dplayerConfig.match(picRegex);
        if (picMatch && picMatch[1]) {
          dplayerPoster = picMatch[1].replace(/\\/g, "/");
        }
      }
    }
  });

  if (!videoUrl) {
    videoUrl = $('section[style*="padding-top:56.25%"] iframe').attr("src");
  }

  const baseDescription = $(
    ".movie-detail-main .col-xl-10.col-12.fg-light4.text-line-height"
  )
    .text()
    .trim();

  let releaseDate = "";
  $("aside .row.justify-content-start.mt-4").each((i, el) => {
    const h4Elements = $(el).find("h4");
    if (h4Elements.length >= 2) {
      const labelText = h4Elements.first().text().trim();
      if (labelText.includes("发片日期")) {
        releaseDate = h4Elements.eq(1).text().trim();
      }
    }
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

  let durationText = "";
  let durationMinutes = null;
  $("aside div.row.justify-content-start.mt-3").each((i, rowElement) => {
    const firstColLabel = $(rowElement).find(
      "div.col-auto:first-child label.fs-4"
    );
    if (firstColLabel.text().includes("播放時長")) {
      const durationLabel = $(rowElement).find(
        "div.col-auto:nth-child(2) label.fs-4"
      );
      if (durationLabel.length > 0) {
        durationText = durationLabel.text().trim();
        durationMinutes = parseDurationToMinutes(durationText);
        return false;
      }
    }
  });

  const tags = [];
  $(".d-flex.flex-wrap.justify-content-start.mt-3 h3 span.badge a").each(
    (i, el) => {
      tags.push($(el).text().trim());
    }
  );
  const genreTitle = tags.join(", ");

  let fullDescription = baseDescription;
  if (actors) {
    fullDescription += `\n\n女优：${actors}`;
  }

  let studio = "";
  const studioElement = $("aside .company-tag a").first();
  if (studioElement.length > 0) {
    studio = studioElement.text().trim();
  }
  if (studio) {
    fullDescription += `\n厂商: ${studio}`;
  }

  let backdropPath = $(".movie-detail-bg").css("background-image");
  if (backdropPath) {
    backdropPath = backdropPath
      .replace(/^url\(["']?/, "")
      .replace(/["']?\)$/, "");
    backdropPath = backdropPath.replace(/\\/g, "/");
  }

  let posterPath = dplayerPoster;
  if (!posterPath) {
    try {
      const schemaScript = $('script[type="application/ld+json"]').html();
      if (schemaScript) {
        const schemaData = JSON.parse(schemaScript);
        if (schemaData && schemaData.thumbnailUrl) {
          posterPath = schemaData.thumbnailUrl.replace(/\\/g, "/");
        }
      }
    } catch (e) {
      console.warn(
        `parseDetailPage: 解析海报图失败，位于 ${detailPageUrl}:`,
        e
      );
    }
  }
  if (!posterPath && backdropPath) {
    posterPath = backdropPath;
  }

  const childItems = [];
  $('article.col-xl-7 div.row.me-2.mt-5 div[class*="col-xl-3"]').each(
    (idx, el) => {
      const childItem = $(el);
      const linkElement = childItem.find(".movie-box-default > a");
      const childRelativeLink = linkElement.attr("href");

      if (!childRelativeLink) return;

      let childAbsoluteLink = childRelativeLink;
      if (childRelativeLink.startsWith("/")) {
        childAbsoluteLink = currentBaseUrl + childRelativeLink;
      } else if (!childRelativeLink.startsWith("http")) {
        console.warn(
          `parseDetailPage: 发现不符合标准的子项链接: ${childRelativeLink} 位于 ${detailPageUrl}`
        );
        childAbsoluteLink = currentBaseUrl + "/" + childRelativeLink;
      }

      const childPosterPath = childItem
        .find(".movie-box-default > a > img")
        .attr("src");

      const titleElement = childItem.find(".movie-box-title a").last();
      let rawChildTitle = titleElement.text().trim();
      if (!rawChildTitle) {
        rawChildTitle = childItem
          .find(".movie-box-default > a > img")
          .attr("alt");
      }

      const { title: childTitle, actors: childActors } =
        parseTitleAndActors(rawChildTitle);

      const childIdPart = childItem
        .find(".movie-box-title label.fg-main a")
        .text()
        .trim();

      const finalTitle = childIdPart
        ? `${childIdPart} ${childTitle}`.trim()
        : childTitle;

      let childDescription = "";
      if (childActors) {
        childDescription = `女优：${childActors}`;
      }

      let childReleaseDate = "";
      const dateLabelChild = childItem.find(
        ".d-flex.justify-content-between > label.fg-light5"
      );
      if (dateLabelChild.length > 0) {
        const tempDateLabelChild = dateLabelChild.clone();
        tempDateLabelChild.find("i").remove();
        childReleaseDate = tempDateLabelChild.text().trim();
        const dateParts = childReleaseDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateParts) {
          childReleaseDate = `${dateParts[3]}-${dateParts[1]}-${dateParts[2]}`;
        } else {
          const ymdParts = childReleaseDate.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (ymdParts) {
            childReleaseDate = `${ymdParts[1]}-${ymdParts[2]}-${ymdParts[3]}`;
          } else {
            childReleaseDate = "";
          }
        }
      }

      let childRating = "";
      const ratingDiv = childItem
        .find("div.d-flex.justify-content-between > div.fg-light5")
        .first();
      if (ratingDiv.length > 0) {
        let ratingLabelElement = ratingDiv.find(
          "label[style*='vertical-align:middle']"
        );
        if (ratingLabelElement.length === 0) {
          ratingLabelElement = ratingDiv.find("label");
        }
        if (ratingLabelElement.length > 0) {
          const text = ratingLabelElement.text().trim();
          if (text) {
            childRating = "5.0";
          }
        }
      }

      if (finalTitle && childAbsoluteLink) {
        childItems.push({
          id: childAbsoluteLink,
          type: "url",
          title: finalTitle,
          posterPath: childPosterPath,
          backdropPath: childPosterPath,
          link: childAbsoluteLink,
          releaseDate: childReleaseDate || null,
          rating: childRating,
          mediaType: "movie",
          description: childDescription,
        });
      }
    }
  );

  return {
    id: detailPageUrl,
    type: "url",
    title: title,
    videoUrl: videoUrl,
    description: fullDescription || "暂无简介",
    releaseDate: releaseDate,
    durationText: durationText,
    duration: durationMinutes,
    genreTitle: genreTitle,
    posterPath: posterPath,
    backdropPath: backdropPath,
    link: detailPageUrl,
    childItems: childItems,
    // relatedItems: childItems, // relatedItems 目前无法使用
  };
}

/**
 * 解析列表页面中的影片条目，并构建基本信息列表
 */
async function parseItems(currentBaseUrl, $, listPageUrl) {
  const videoItems = [];
  const itemSelectors = [
    '.body-container .container-fluid .row > div[class*="col-xl-2"]',
    '.container-fluid .row > div[class*="col-xl-2"]',
    'div.row > div[class*="col-"]',
  ];

  let items = $(itemSelectors[0]);
  if (items.length === 0) items = $(itemSelectors[1]);
  if (items.length === 0) items = $(itemSelectors[2]);

  console.log(`parseItems: 在 ${listPageUrl} 发现 ${items.length} 条影片条目`);

  items.each((index, element) => {
    const item = $(element);
    const movieBox = item.find(".movie-box-default");
    if (movieBox.length === 0) return;

    const relativeLink = movieBox.find("> a").attr("href");
    let posterPath = movieBox.find("> a > img").attr("src");
    if (posterPath) posterPath = posterPath.replace(/\\/g, "/");

    const titleElement = item.find(".movie-box-title a");
    let rawTitle = titleElement.text().trim();
    if (!rawTitle) {
      rawTitle = movieBox.find("> a > img").attr("alt");
    }

    if (!relativeLink || !rawTitle) {
      console.warn(
        `parseItems: 因缺少链接或标题，跳过列表页 ${listPageUrl} 上的一条影片条目`
      );
      return;
    }

    const { title } = parseTitleAndActors(rawTitle);

    const absoluteLink = currentBaseUrl + relativeLink;
    const rating = item.find(".d-lg-flex .fg-light5 label").text().trim();

    const genre = item
      .find(".movie-box-default .box-top .badge.bg-danger label")
      .text()
      .trim();

    let releaseDate = "";
    const dateLabel = item.find(
      ".d-flex.justify-content-between > label.fg-light5"
    );
    if (dateLabel.length > 0) {
      const tempDateLabel = dateLabel.clone();
      tempDateLabel.find("i").remove();
      releaseDate = tempDateLabel.text().trim();
      const dateParts = releaseDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (dateParts) {
        releaseDate = `${dateParts[3]}-${dateParts[1]}-${dateParts[2]}`;
      } else {
        releaseDate = "";
      }
    }

    videoItems.push({
      id: absoluteLink,
      type: "url",
      title: title,
      posterPath: posterPath,
      backdropPath: posterPath,
      link: absoluteLink,
      releaseDate: releaseDate || null,
      rating: rating || null,
      genreTitle: genre || null,
      mediaType: "movie",
      description: "加载详情中，等待UI刷新...",
    });
  });

  console.log(
    `parseItems: 从 ${listPageUrl} 解析了 ${videoItems.length} 条影片条目`
  );
  return videoItems;
}

async function fetchDataForPath(currentBaseUrl, path, params = {}) {
  const page = parseInt(params.page, 10) || 1;
  let requestUrl;
  const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const MENU_PATHS_PREFIX = "/menu/";
  const DEFAULT_MENU_PAGINATION_PREFIX = "5-2-";
  const HOT_TOP_PATHS = ["/movie/hot/", "/movie/top/"];

  if (HOT_TOP_PATHS.includes(path)) {
    requestUrl = `${currentBaseUrl}${path}`;
    if (page > 1) {
      requestUrl += `?page=${page}`;
    }
  } else if (path.startsWith(MENU_PATHS_PREFIX)) {
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
        id: `error-list-${path}-${page}`,
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

  let searchPath = `/Search/${encodeURIComponent(query)}`;
  if (page === 1) {
    searchPath += ".html";
  } else {
    searchPath += `/${page}.html`;
  }

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
        id: `error-search-list-${query}-${page}`,
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
      childItems: detailData.childItems || [],
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