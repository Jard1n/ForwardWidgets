// 引用：https://gist.githubusercontent.com/bemarkt/17e04f66b772d4ab9ab839c12a8ad608/raw/javday.js
var WidgetMetadata = {
  id: "ti.bemarkt.javday",
  title: "JAVDay",
  description: "获取 JAVDay 推荐",
  author: "Ti",
  version: "1.0.1", // 版本号增加，因为功能更新
  requiredVersion: "0.0.1",
  site: "https://javday.app",
  modules: [
    {
      title: "按分类浏览",
      description: "根据选择的分类浏览 JAVDay 上的视频。",
      functionName: "getJavDayCategory",
      params: [
        {
          name: "baseUrl",
          title: "JAVDay 网址",
          type: "input",
          value: "https://javday.app",
          description: "JAVDay 可用网址，例如 https://javday.app",
        },
        {
          name: "categoryPath",
          title: "选择分类",
          type: "enumeration",
          value: "/label/hot/",
          enumOptions: [
            { title: "最新更新", value: "/label/new/" },
            { title: "人氣系列", value: "/label/hot/" },
            { title: "新作上市", value: "/category/new-release/" },
            { title: "國產AV", value: "/category/chinese-av/" },
            { title: "糖心VLOG", value: "/index.php/category/txvlog/" },
            { title: "蘿莉社", value: "/index.php/category/luolisheus/" },
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
};

const JAVDAY_LOG_PREFIX = "ForwardWidget: JAVDay -";
const JAVDAY_DEFAULT_BASE_URL = "https://javday.app";
const JAVDAY_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36";

/**
 * 从 DPlayer 初始化脚本内容中提取视频 URL。
 * @param {string} scriptContent
 * @returns {string|null}
 */
function extractVideoUrlFromDPlayerScript(scriptContent) {
  if (!scriptContent) {
    return null;
  }
  const videoUrlRegex = /video\s*:\s*{\s*[^}]*url\s*:\s*['"]([^'"]+)['"]/;
  const match = scriptContent.match(videoUrlRegex);
  return match && match[1] ? match[1] : null;
}

/**
 * 获取 JAVDay 指定分类下的视频列表。
 * @param {object} params
 * @param {string} params.baseUrl
 * @param {string} params.categoryPath
 * @param {string|number} params.page
 * @returns {Promise<Array<object>>}
 */
async function getJavDayCategory(params = {}) {
  const javdayBaseUrl = params.baseUrl || JAVDAY_DEFAULT_BASE_URL;
  const cleanJavdayBaseUrl = javdayBaseUrl.replace(/\/+$/, "");

  const categoryPath = params.categoryPath;
  const page = parseInt(params.page, 10) || 1;

  let targetUrl = `${cleanJavdayBaseUrl}${categoryPath.replace(/\/$/, "")}/`;
  if (page > 1) {
    targetUrl = `${targetUrl}page/${page}/`;
  }
  console.log(`${JAVDAY_LOG_PREFIX} Fetching category: ${targetUrl}`);

  try {
    const response = await Widget.http.get(targetUrl, {
      headers: {
        "User-Agent": JAVDAY_USER_AGENT,
        Referer: cleanJavdayBaseUrl + "/",
      },
    });

    if (!response || !response.data) {
      console.error(
        `${JAVDAY_LOG_PREFIX} Failed to fetch page content or response data is empty for ${targetUrl}.`
      );
      throw new Error("未能获取到网页内容或响应数据为空。");
    }

    const htmlContent = response.data;
    const $ = Widget.html.load(htmlContent);
    const videoItems = [];

    $(".video-wrapper .videoBox").each((index, element) => {
      const $item = $(element);
      const relativeLink = $item.attr("href");
      let fullLink = "";

      if (relativeLink) {
        // 确保链接是绝对路径
        if (relativeLink.startsWith("http")) {
          fullLink = relativeLink;
        } else if (relativeLink.startsWith("//")) {
          fullLink = `https:${relativeLink}`; // 假设是 https
        } else {
          fullLink = `${cleanJavdayBaseUrl}${
            relativeLink.startsWith("/") ? "" : "/"
          }${relativeLink}`;
        }
      }

      const title = $item.find(".videoBox-info .title").text().trim();
      const coverElement = $item.find(".videoBox-cover");
      const styleAttr = coverElement.attr("style");
      let posterPath = "";

      if (styleAttr) {
        const match = styleAttr.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (match && match[1]) {
          let extractedUrl = match[1];
          if (extractedUrl.startsWith("//")) {
            posterPath = `https:${extractedUrl}`;
          } else if (extractedUrl.startsWith("/")) {
            posterPath = cleanJavdayBaseUrl + extractedUrl;
          } else if (!extractedUrl.startsWith("http")) {
            // 尝试判断是否是相对路径或需要拼接的路径
            try {
              new URL(extractedUrl); // 如果是完整 URL (例如 data:image)，直接使用
              posterPath = extractedUrl;
            } catch (_) {
              // 否则认为是相对路径
              posterPath = `${cleanJavdayBaseUrl}/${extractedUrl.replace(
                /^\/+/,
                ""
              )}`;
            }
          } else {
            posterPath = extractedUrl;
          }
        }
      }

      if (title && fullLink) {
        videoItems.push({
          id: fullLink,
          type: "url",
          title: title,
          posterPath: posterPath,
          backdropPath: posterPath,
          link: fullLink,
          description: "N/A",
          mediaType: "movie",
        });
      } else {
        console.warn(
          `${JAVDAY_LOG_PREFIX} Skipped item due to missing title or link. Index: ${index}`
        );
      }
    });
    console.log(
      `${JAVDAY_LOG_PREFIX} Found ${videoItems.length} video items from ${targetUrl}.`
    );
    return videoItems;
  } catch (error) {
    console.error(
      `${JAVDAY_LOG_PREFIX} Error in getJavDayCategory for ${targetUrl}: ${error.message}`
    );
    throw error;
  }
}

/**
 * 从视频详情页加载实际的视频播放链接。
 * @param {string} link
 * @returns {Promise<object>}
 */
async function loadDetail(link) {
  console.log(
    `${JAVDAY_LOG_PREFIX} Attempting to load detail for link: ${link}`
  );
  try {
    const response = await Widget.http.get(link, {
      headers: {
        "User-Agent": JAVDAY_USER_AGENT,
        Referer: link,
      },
    });

    if (!response || !response.data) {
      console.error(
        `${JAVDAY_LOG_PREFIX} Failed to fetch detail page content for ${link}.`
      );
      throw new Error(`未能获取详情页内容: ${link}`);
    }

    const htmlContent = response.data;
    const $ = Widget.html.load(htmlContent);

    let dplayerScriptContent = null;
    $("script").each((i, scriptEl) => {
      const scriptText = $(scriptEl).html();
      if (scriptText && scriptText.includes("new DPlayer")) {
        dplayerScriptContent = scriptText;
        return false;
      }
    });

    if (!dplayerScriptContent) {
      console.error(
        `${JAVDAY_LOG_PREFIX} DPlayer script not found on page: ${link}. Trying to find video source directly.`
      );
      let videoSrc = null;
      $("video  id='J_prismPlayer'").each((i, el) => {
        videoSrc = $(el).attr("src");
        if (videoSrc) return false;
      });
      if (!videoSrc) {
        $("video").each((i, el) => {
          videoSrc = $(el).attr("src");
          if (videoSrc && videoSrc.includes(".m3u8")) return false;
          else videoSrc = null;
        });
      }

      if (videoSrc) {
        console.log(
          `${JAVDAY_LOG_PREFIX} Found direct video source: ${videoSrc} for link: ${link}`
        );
        return {
          id: link,
          type: "url",
          videoUrl: videoSrc,
          customHeaders: {
            Referer: link,
            "User-Agent": JAVDAY_USER_AGENT,
          },
        };
      }
      throw new Error(`无法在详情页找到 DPlayer 脚本或直接的视频源: ${link}`);
    }

    const videoUrl = extractVideoUrlFromDPlayerScript(dplayerScriptContent);

    if (!videoUrl) {
      console.error(
        `${JAVDAY_LOG_PREFIX} Could not extract video URL from DPlayer script for ${link}.`
      );
      throw new Error(`无法从 DPlayer 脚本中提取视频 URL: ${link}`);
    }

    console.log(
      `${JAVDAY_LOG_PREFIX} Extracted video URL: ${videoUrl} for link: ${link}`
    );
    return {
      id: link,
      type: "url",
      videoUrl: videoUrl,
      customHeaders: {
        Referer: link,
        "User-Agent": JAVDAY_USER_AGENT,
      },
    };
  } catch (error) {
    console.error(
      `${JAVDAY_LOG_PREFIX} Error in loadDetail for ${link}: ${error.message}`
    );
    throw error;
  }
}
