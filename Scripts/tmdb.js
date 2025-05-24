WidgetMetadata = {
  id: "tmdb",
  title: "TMDB",
  description: "TMDB榜单",
  author: "Jard1n",
  site: "https://github.com/Jard1n/ForwardWidgets",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  modules: [
    // TMDB 模块定义保持不变
    // ... (原模块数组，省略以保持简洁)
  ]
};

// ===============辅助函数===============
const helpers = {
  /**
   * 格式化项目描述，优化为高效字符串操作。
   * @param {Object} item - 包含描述、评分和发布日期的项目。
   * @returns {string} 格式化后的描述字符串。
   */
  formatItemDescription(item) {
    let description = item.description || '';
    const rating = item.rating;
    const releaseDate = item.releaseDate;
    
    if (rating && !/评分|rating/i.test(description)) {
      description = `${description} | 评分: ${rating}`;
    }
    
    if (releaseDate && !/年份|year/i.test(description)) {
      const year = String(releaseDate).substring(0, 4);
      if (/^\d{4}$/.test(year)) {
        description = `${description} | 年份: ${year}`;
      }
    }
    
    return description
      .replace(/^\|\s*/, '')
      .replace(/\s*\|$/, '')
      .trim();
  },

  /**
   * 创建错误项，用于处理API调用失败。
   * @param {string} id - 错误项的唯一ID。
   * @param {string} title - 错误标题。
   * @param {Error|string} error - 错误对象或消息。
   * @returns {Object} 错误项对象。
   */
  createErrorItem(id, title, error) {
    const errorMessage = String(error?.message || error || '未知错误');
    const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    return {
      id: uniqueId,
      type: "error",
      title: title || "加载失败",
      description: errorMessage
    };
  },

  /**
   * 获取当前日期，格式为 YYYY-MM-DD。
   * @returns {string} 当前日期字符串。
   */
  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  },

  /**
   * 构建TMDB API参数，合并默认值和覆盖值。
   * @param {Object} baseParams - 基础参数。
   * @param {Object} overrides - 需要覆盖的参数。
   * @returns {Object} 合并后的参数对象。
   */
  buildTmdbParams(baseParams, overrides) {
    const defaults = {
      language: 'zh-CN',
      page: 1,
    };
    return { ...defaults, ...baseParams, ...overrides };
  }
};

//===============TMDB功能函数===============
class LRUCache {
  constructor(limit = 10) {
    this.limit = limit;
    this.cache = new Map();  // 使用Map存储键值对
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // 移动到末尾以标记为最近使用
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);  // 删除旧的
    }
    if (this.cache.size >= this.limit) {
      // 移除最旧的（第一个键）
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

const cache = new LRUCache(10);  // LRU缓存实例

/**
 * 从TMDB API获取数据，并应用缓存。
 * @param {string} api - TMDB API端点。
 * @param {Object} params - API参数。
 * @returns {Promise<Array>} 处理后的数据数组。
 */
async function fetchTmdbData(api, params) {
  const startTime = performance.now();  // 性能计时开始
  const cacheKey = `${api}-${JSON.stringify(params)}`;
  
  if (cache.get(cacheKey)) {
    console.log('从缓存中获取数据');
    const endTime = performance.now();  // 计时结束
    console.log(`缓存命中时间: ${(endTime - startTime).toFixed(2)}ms`);
    return cache.get(cacheKey);
  }
  
  try {
    const cleanedParams = { ...params };
    delete cleanedParams.type;
    delete cleanedParams.time_window;
    
    const response = await Widget.tmdb.get(api, { params: cleanedParams });
    if (!response?.results) {
      throw new Error(response?.status_message || "无效的API响应格式");
    }
    
    const results = response.results
      .map(item => {
        const isMovie = api.includes('movie') || item.media_type === 'movie';
        const mediaType = isMovie ? 'movie' : 'tv';
        return {
          id: item.id,
          type: "tmdb",
          mediaType,
          title: isMovie ? item.title : item.name,
          description: helpers.formatItemDescription({
            description: item.overview,
            rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined,
            releaseDate: isMovie ? item.release_date : item.first_air_date
          }),
          releaseDate: isMovie ? item.release_date : item.first_air_date,
          backdropPath: item.backdrop_path && `https://image.tmdb.org/t/p/w780${item.backdrop_path}`,
          posterPath: item.poster_path && `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined
        };
      })
      .filter(item => item.id && item.title);  // 过滤无效项
    
    cache.set(cacheKey, results);
    const endTime = performance.now();  // 计时结束
    console.log(`API调用和处理时间: ${(endTime - startTime).toFixed(2)}ms`);
    return results;
  } catch (error) {
    console.error(`API调用失败: ${api}`, error);
    const endTime = performance.now();
    console.log(`错误处理时间: ${(endTime - startTime).toFixed(2)}ms`);
    return [helpers.createErrorItem(api, '数据加载失败', error)];
  }
}

/**
 * 获取TMDB当前热映内容。
 * @param {Object} params - 参数对象，包括类型和页面。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbNowPlaying(params) {
  const type = params.type || 'movie';
  const api = type === 'movie' ? "movie/now_playing" : "tv/on_the_air";
  return await fetchTmdbData(api, params);
}

/**
 * 获取TMDB趋势内容。
 * @param {Object} params - 参数对象，包括时间窗口和页面。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbTrending(params) {
  const timeWindow = params.time_window || 'day';
  const api = `trending/all/${timeWindow}`;
  return await fetchTmdbData(api, params);
}

/**
 * 获取TMDB高分内容。
 * @param {Object} params - 参数对象，包括类型和页面。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbTopRated(params) {
  const type = params.type || 'movie';
  const api = type === 'movie' ? `movie/top_rated` : `tv/top_rated`;
  return await fetchTmdbData(api, params);
}

/**
 * 获取TMDB即将上映电影。
 * @param {Object} params - 参数对象，包括日期和筛选条件。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbUpcomingMovies(params) {
  if (params['primary_release_date.gte'] && !/^\d{4}-\d{2}-\d{2}$/.test(params['primary_release_date.gte'])) {
    return [helpers.createErrorItem('upcomingMovies', '无效日期格式', '起始日期必须是 YYYY-MM-DD 格式')];
  }
  if (params['primary_release_date.lte'] && !/^\d{4}-\d{2}-\d{2}$/.test(params['primary_release_date.lte'])) {
    return [helpers.createErrorItem('upcomingMovies', '无效日期格式', '结束日期必须是 YYYY-MM-DD 格式')];
  }
  if (params['vote_average.gte'] && (isNaN(params['vote_average.gte']) || params['vote_average.gte'] < 0 || params['vote_average.gte'] > 10)) {
    return [helpers.createErrorItem('upcomingMovies', '无效评分范围', '最低评分必须在0-10之间')];
  }
  
  const api = "discover/movie";
  const overrides = {
    sort_by: 'primary_release_date.asc',
    'primary_release_date.gte': params['primary_release_date.gte'] || helpers.getCurrentDate(),
    with_release_type: params.with_release_type || '2,3'
  };
  if (params['primary_release_date.lte']) overrides['primary_release_date.lte'] = params['primary_release_date.lte'];
  if (params.with_genres) overrides.with_genres = params.with_genres;
  if (params['vote_average.gte']) overrides['vote_average.gte'] = params['vote_average.gte'];
  if (params['vote_count.gte']) overrides['vote_count.gte'] = params['vote_count.gte'];
  if (params.with_keywords) overrides.with_keywords = params.with_keywords;
  
  const discoverParams = helpers.buildTmdbParams(params, overrides);
  return await fetchTmdbData(api, discoverParams);
}

/**
 * 获取TMDB按播出平台筛选的内容。
 * @param {Object} params - 参数对象，包括平台和筛选条件。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbDiscoverByNetwork(params = {}) {
  if (params.with_networks && isNaN(params.with_networks)) {
    return [helpers.createErrorItem('discoverByNetwork', '无效平台ID', '平台ID必须是数字')];
  }
  
  const api = "discover/tv";
  const overrides = {
    with_networks: params.with_networks,
    sort_by: params.sort_by,
    ...(params.air_status === 'released' && { 'first_air_date.lte': helpers.getCurrentDate() }),
    ...(params.air_status === 'upcoming' && { 'first_air_date.gte': helpers.getCurrentDate() }),
    ...(params.with_genres && { with_genres: params.with_genres })
  };
  
  const discoverParams = helpers.buildTmdbParams(params, overrides);
  return await fetchTmdbData(api, discoverParams);
}

/**
 * 获取TMDB按出品公司筛选的内容。
 * @param {Object} params - 参数对象，包括公司和筛选条件。
 * @returns {Promise<Array>} 数据数组。
 */
async function tmdbCompanies(params = {}) {
  if (params.with_companies && isNaN(params.with_companies)) {
    return [helpers.createErrorItem('companies', '无效公司ID', '公司ID必须是数字')];
  }
  
  const api = "discover/movie";
  const overrides = {
    sort_by: params.sort_by || "primary_release_date.desc",
  };
  if (params.with_companies) overrides.with_companies = params.with_companies;
  if (params.air_status === 'released') overrides['primary_release_date.lte'] = helpers.getCurrentDate();
  if (params.air_status === 'upcoming') overrides['primary_release_date.gte'] = helpers.getCurrentDate();
  if (params.with_genres) overrides.with_genres = params.with_genres;
  
  const discoverParams = helpers.buildTmdbParams(params, overrides);
  return await fetchTmdbData(api, discoverParams);
}
