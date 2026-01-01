const { fetchJson } = require('../utils/functions');
const { getApi, normalizer } = require('../routes/api');

/**
 * Generic handler to fetch data from any platform API
 * This wraps the CLI handlers to work with REST API
 */
async function fetchPlatformData(platform, url) {
  const platformHandlers = {
    tiktok: async (url) => {
      try {
        const response = await fetchJson(`${getApi.tiktok}${encodeURIComponent(url)}`, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36'
          }
        });
        
        if (response && response.status && response.data) {
          return normalizer.normalizeTikTok(response.data, 'primary');
        }
        throw new Error(response?.message || 'Failed to fetch TikTok data');
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch TikTok data');
      }
    },

    facebook: async (url) => {
      const response = await fetchJson(`${getApi.facebook}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeFacebook(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Facebook data');
    },

    instagram: async (url) => {
      const response = await fetchJson(`${getApi.instagram}${encodeURIComponent(url)}`, {
        timeout: 30000
      });

      
      if (response && response.status && response.data) {
        return normalizer.normalizeInstagram(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Instagram data');
    },

    twitter: async (url) => {
      const response = await fetchJson(`${getApi.twitter}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeTwitter(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Twitter data');
    },

    youtube: async (url) => {
      const response = await fetchJson(`${getApi.youtube}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeYouTube(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch YouTube data');
    },

    douyin: async (url) => {
      const response = await fetchJson(`${getApi.douyin}${encodeURIComponent(url)}`, {
        timeout: 30000
      });

      
      if (response && response.status && response.data) {
        return normalizer.normalizeDouyin(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Douyin data');
    },

    spotify: async (url) => {
      const response = await fetchJson(`${getApi.spotify}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeSpotify(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Spotify data');
    },

    pinterest: async (url) => {
      const response = await fetchJson(`${getApi.pinterest}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizePinterest(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Pinterest data');
    },

    applemusic: async (url) => {
      const response = await fetchJson(`${getApi.applemusic}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeAppleMusic(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Apple Music data');
    },

    capcut: async (url) => {
      const response = await fetchJson(`${getApi.capcut}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeCapcut(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch CapCut data');
    },

    bluesky: async (url) => {
      const response = await fetchJson(`${getApi.bluesky}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeBluesky(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Bluesky data');
    },

    rednote: async (url) => {
      const response = await fetchJson(`${getApi.rednote}${encodeURIComponent(url)}`, {
        timeout: 30000
      });

      console.log(JSON.stringify(response));
      
      if (response && response.status && response.data) {
        return normalizer.normalizeRedNote(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch RedNote data');
    },

    threads: async (url) => {
      const response = await fetchJson(`${getApi.threads}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeThreads(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Threads data');
    },

    kuaishou: async (url) => {
      const response = await fetchJson(`${getApi.kuaishou}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeKuaishou(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Kuaishou data');
    },

    weibo: async (url) => {
      const response = await fetchJson(`${getApi.weibo}${encodeURIComponent(url)}`, {
        timeout: 30000
      });
      
      if (response && response.status && response.data) {
        return normalizer.normalizeWeibo(response.data);
      }
      throw new Error(response?.message || 'Failed to fetch Weibo data');
    }
  };

  const handler = platformHandlers[platform.toLowerCase()];
  if (!handler) {
    throw new Error(`Platform ${platform} is not supported`);
  }

  return await handler(url);
}

module.exports = { fetchPlatformData };
