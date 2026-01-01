class Normalizer {
  /**
   * Normalize TikTok data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeTikTok(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: data.author || null,
        downloads: {
          video: Array.isArray(data.video) ? data.video : [],
          audio: Array.isArray(data.audio) ? data.audio : [],
          image: Array.isArray(data.image) ? data.image : []
        },
        metadata: {
          audio_title: data.title_audio || null
        }
      };
    }
    
    let videoDownloads = [];
    let audioDownloads = [];
    let imageDownloads = [];
    
    if (Array.isArray(data.downloads)) {
      videoDownloads = data.downloads;
    } else if (data.downloads && typeof data.downloads === 'object') {
      if (data.downloads.video) {
        const videos = Array.isArray(data.downloads.video) ? data.downloads.video : [data.downloads.video];
        videos.forEach(url => {
          if (typeof url === 'string') {
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.includes('.jpeg') || lowerUrl.includes('.jpg') || lowerUrl.includes('.png') || lowerUrl.includes('.webp')) {
              imageDownloads.push(url);
            } else {
              videoDownloads.push(url);
            }
          } else {
            videoDownloads.push(url);
          }
        });
      }
      audioDownloads = Array.isArray(data.downloads.audio) ? data.downloads.audio : [];
      if (data.downloads.image) {
        imageDownloads = Array.isArray(data.downloads.image) ? data.downloads.image : [data.downloads.image];
      }
    } else if (data.video) {
      videoDownloads = Array.isArray(data.video) ? data.video : [data.video];
    }
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || null,
      downloads: {
        video: videoDownloads,
        audio: audioDownloads,
        image: imageDownloads
      },
      metadata: {
        audio_title: data.title_audio || data.metadata?.audio_title || null
      }
    };
  }

  /**
   * Normalize Facebook data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeFacebook(data, source = 'primary') {
    if (source === 'v1') {
      return {
        quality: {
          sd: data.sd || null,
          hd: data.hd || null
        },
        downloads: [
          data.sd && { quality: 'SD', url: data.sd },
          data.hd && { quality: 'HD', url: data.hd }
        ].filter(Boolean)
      };
    }
    
    let downloads = [];
    if (Array.isArray(data)) {
      downloads = data;
    } else if (data && typeof data === 'object') {
      if (data.downloads) {
        downloads = Array.isArray(data.downloads) ? data.downloads : [data.downloads];
      } else if (data.sd || data.hd) {
        downloads = [
          data.sd && { quality: 'SD', url: data.sd, resolution: 'SD' },
          data.hd && { quality: 'HD', url: data.hd, resolution: 'HD' }
        ].filter(Boolean);
      } else {
        downloads = [data];
      }
    }
    
    return {
      quality: {},
      downloads: downloads
    };
  }

  /**
   * Normalize Instagram data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeInstagram(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: 'Instagram Media',
        author: null,
        thumbnail: null,
        downloads: {
          video: [],
          image: []
        },
        metadata: {}
      };
    }
    
    let videoDownloads = [];
    let imageDownloads = [];
    let thumbnail = null;
    
    // Handle array of media
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.thumbnail && !thumbnail) {
          thumbnail = item.thumbnail;
        }
        if (item.url) {
          const urlLower = item.url.toLowerCase();
          // Check if it's an image
          if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
              urlLower.includes('.png') || urlLower.includes('.webp') ||
              urlLower.includes('image') || item.type === 'image') {
            imageDownloads.push({
              url: item.url,
              quality: 'original',
              thumbnail: item.thumbnail || null
            });
          } else {
            // Assume it's a video
            videoDownloads.push({
              url: item.url,
              quality: 'original',
              thumbnail: item.thumbnail || null
            });
          }
        }
      });
    } 
    // Handle object with media array
    else if (data && typeof data === 'object') {
      if (data.media && Array.isArray(data.media)) {
        data.media.forEach(item => {
          if (item.thumbnail && !thumbnail) {
            thumbnail = item.thumbnail;
          }
          if (item.url) {
            const urlLower = item.url.toLowerCase();
            // Check if it's an image
            if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
                urlLower.includes('.png') || urlLower.includes('.webp') ||
                urlLower.includes('image') || item.type === 'image') {
              imageDownloads.push({
                url: item.url,
                quality: 'original',
                thumbnail: item.thumbnail || null
              });
            } else {
              // Assume it's a video
              videoDownloads.push({
                url: item.url,
                quality: 'original',
                thumbnail: item.thumbnail || null
              });
            }
          }
        });
      } else if (data.url) {
        // Single media item
        if (data.thumbnail) {
          thumbnail = data.thumbnail;
        }
        const urlLower = data.url.toLowerCase();
        if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
            urlLower.includes('.png') || urlLower.includes('.webp') ||
            urlLower.includes('image') || data.type === 'image') {
          imageDownloads.push({
            url: data.url,
            quality: 'original',
            thumbnail: data.thumbnail || null
          });
        } else {
          videoDownloads.push({
            url: data.url,
            quality: 'original',
            thumbnail: data.thumbnail || null
          });
        }
      }
    }
    
    return {
      title: 'Instagram Media',
      author: null,
      thumbnail: thumbnail,
      downloads: {
        video: videoDownloads,
        image: imageDownloads
      },
      metadata: {
        total_media: videoDownloads.length + imageDownloads.length
      }
    };
  }

  /**
   * Normalize YouTube data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeYouTube(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: data.author || null,
        duration: null,
        downloads: {
          video: data.mp4 ? [{ quality: 'auto', url: data.mp4, format: 'mp4' }] : [],
          audio: data.mp3 ? [{ quality: '128kbps', url: data.mp3, format: 'mp3' }] : []
        }
      };
    }

    let formats = data.formats || data.downloads || [];
    if (!Array.isArray(formats)) {
      if (formats.video || formats.audio) {
        return {
          title: data.title || null,
          thumbnail: data.thumbnail || null,
          author: data.author || null,
          duration: data.duration || null,
          downloads: {
            video: Array.isArray(formats.video) ? formats.video : [],
            audio: Array.isArray(formats.audio) ? formats.audio : []
          }
        };
      }
      formats = [];
    }
    
    const normalizeFormat = (f) => {
      const normalized = { ...f };
      if (normalized.extension && !normalized.ext) {
        normalized.ext = normalized.extension;
      }
      
      if (!normalized.format && !normalized.ext) {
        if (normalized.type === 'audio') {
          normalized.format = normalized.codec || 'mp3';
        } else if (normalized.type === 'video' || normalized.type === 'video_with_audio') {
          normalized.format = normalized.codec || 'mp4';
        } else if (normalized.quality && normalized.quality.toLowerCase().includes('audio')) {
          normalized.format = normalized.codec || 'mp3';
        } else if (normalized.quality && (normalized.quality.toLowerCase().includes('kbps') || normalized.quality.toLowerCase().includes('k'))) {
          normalized.format = normalized.codec || 'mp3';
        } else {
          normalized.format = 'mp4';
        }
      } else if (normalized.ext && !normalized.format) {
        normalized.format = normalized.ext;
      }
      return normalized;
    };
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || null,
      duration: data.duration || null,
      downloads: {
        video: formats
          .filter(f => f.type === 'video' || f.type === 'video_with_audio' || (!f.type && f.format && f.format.includes('mp4')))
          .map(normalizeFormat),
        audio: formats
          .filter(f => f.type === 'audio' || (!f.type && f.format && (f.format.includes('mp3') || f.format.includes('m4a'))))
          .map(normalizeFormat)
      }
    };
  }

  /**
   * Normalize Spotify data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeSpotify(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: null,
        duration: data.duration || null,
        album: null,
        downloads: data.formats?.map(f => ({
          url: f.url,
          quality: f.quality || 'unknown',
          format: f.ext || 'mp3'
        })) || []
      };
    }
    
    let downloads = [];
    if (data.downloadLinks && Array.isArray(data.downloadLinks)) {
      downloads = data.downloadLinks.map(link => ({
        url: link.url,
        quality: link.quality || 'unknown',
        format: link.extension || 'mp3'
      }));
    } else if (data.downloads && Array.isArray(data.downloads)) {
      downloads = data.downloads.map(d => ({
        url: d.url,
        quality: d.quality || 'unknown',
        format: d.format || d.ext || 'mp3'
      }));
    } else if (data.formats && Array.isArray(data.formats)) {
      downloads = data.formats.map(f => ({
        url: f.url,
        quality: f.quality || 'unknown',
        format: f.ext || f.format || 'mp3'
      }));
    } else if (data.url) {
      downloads = [{
        url: data.url,
        quality: 'default',
        format: 'mp3'
      }];
    }
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || data.artist || null,
      duration: data.duration || null,
      album: data.album || null,
      downloads: downloads
    };
  }

  /**
   * Normalize Douyin data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeDouyin(data) {
    let videoDownloads = [];
    
    // Handle videoLinks array from Douyin API
    if (data.videoLinks && Array.isArray(data.videoLinks)) {
      videoDownloads = data.videoLinks.map((item, index) => {
        // Extract quality from label (e.g., "Download MP4 HD" -> "HD")
        let quality = 'default';
        if (item.label) {
          const labelUpper = item.label.toUpperCase();
          if (labelUpper.includes('HD')) {
            quality = 'HD';
          } else if (labelUpper.includes('[1]') || labelUpper.includes('SD')) {
            quality = 'SD';
          } else {
            // Use the label as-is
            quality = item.label.replace(/Download |MP4 /gi, '').trim() || `Quality ${index + 1}`;
          }
        }
        
        return {
          url: item.url,
          quality: quality,
          label: item.label || `Video ${index + 1}`
        };
      });
    } 
    // Fallback: handle downloads object format
    else if (data.downloads && typeof data.downloads === 'object') {
      if (data.downloads.video && Array.isArray(data.downloads.video)) {
        videoDownloads = data.downloads.video;
      }
    }
    
    return {
      title: data.title || 'Douyin Video',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: {
        video: videoDownloads,
        audio: [],
        image: []
      },
      metadata: {
        timestamp: data.timestamp || null
      }
    };
  }

  /**
   * Normalize Twitter data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeTwitter(data) {
    let videoDownloads = [];
    let imageDownloads = [];
    
    // Handle media array from Twitter API
    if (data.media && Array.isArray(data.media)) {
      data.media.forEach(item => {
        if (item.type === 'video' || item.url.includes('.mp4')) {
          videoDownloads.push({
            url: item.url,
            quality: item.quality || item.resolution || 'default',
            bitrate: item.bitrate || null
          });
        } else if (item.type === 'image' || item.url.match(/\.(jpg|jpeg|png|webp)$/i)) {
          imageDownloads.push({
            url: item.url,
            quality: item.quality || 'original'
          });
        }
      });
    }
    // Fallback: handle downloads object
    else if (data.downloads && typeof data.downloads === 'object') {
      videoDownloads = data.downloads.video || [];
      imageDownloads = data.downloads.image || [];
    }
    
    return {
      title: data.title || 'Twitter Media',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: {
        video: videoDownloads,
        audio: [],
        image: imageDownloads
      },
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Pinterest data from any source
   * @param {Object} data - Raw data from API
   */
  normalizePinterest(data) {
    let videoDownloads = [];
    let imageDownloads = [];
    
    // Handle downloads array from Pinterest API
    if (data.downloads && Array.isArray(data.downloads)) {
      data.downloads.forEach(item => {
        const urlLower = item.url.toLowerCase();
        if (urlLower.includes('.mp4') || urlLower.includes('video') || item.format === 'mp4') {
          videoDownloads.push({
            url: item.url,
            quality: item.quality || 'default',
            format: item.format || 'mp4'
          });
        } else {
          imageDownloads.push({
            url: item.url,
            quality: item.quality || 'original',
            format: item.format || 'jpg'
          });
        }
      });
    }
    // Fallback: handle nested data.downloads
    else if (data.downloads && typeof data.downloads === 'object' && !Array.isArray(data.downloads)) {
      videoDownloads = data.downloads.video || [];
      imageDownloads = data.downloads.image || [];
    }
    
    return {
      title: data.title || 'Pinterest Pin',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: {
        video: videoDownloads,
        audio: [],
        image: imageDownloads
      },
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Apple Music data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeAppleMusic(data) {
    return {
      title: data.songTitle || data.title || 'Apple Music Track',
      author: data.artist || data.author || null,
      thumbnail: data.coverDownloadLink || data.thumbnail || null,
      downloads: {
        audio: data.mp3DownloadLink ? [{ url: data.mp3DownloadLink, quality: 'original', format: 'mp3' }] : [],
        image: data.coverDownloadLink ? [{ url: data.coverDownloadLink, quality: 'original' }] : []
      },
      metadata: {
        pageTitle: data.pageTitle || null
      }
    };
  }

  /**
   * Normalize CapCut data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeCapcut(data) {
    return {
      title: data.title || 'CapCut Template',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Bluesky data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeBluesky(data) {
    return {
      title: data.title || 'Bluesky Post',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize RedNote data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeRedNote(data) {
    return {
      title: data.title || 'RedNote Post',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Threads data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeThreads(data) {
    return {
      title: data.title || 'Threads Post',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Kuaishou data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeKuaishou(data) {
    return {
      title: data.title || 'Kuaishou Video',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Normalize Weibo data from any source
   * @param {Object} data - Raw data from API
   */
  normalizeWeibo(data) {
    return {
      title: data.title || 'Weibo Post',
      author: data.author || null,
      thumbnail: data.thumbnail || null,
      downloads: data.downloads || {},
      metadata: data.metadata || {}
    };
  }

  /**
   * Auto-detect and normalize data based on platform
   * @param {string} platform - Platform name (tiktok, facebook, instagram, youtube, spotify)
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalize(platform, data, source = 'primary') {
    const normalizers = {
      tiktok: this.normalizeTikTok,
      facebook: this.normalizeFacebook,
      instagram: this.normalizeInstagram,
      youtube: this.normalizeYouTube,
      spotify: this.normalizeSpotify,
      douyin: this.normalizeDouyin,
      twitter: this.normalizeTwitter,
      pinterest: this.normalizePinterest,
      applemusic: this.normalizeAppleMusic,
      capcut: this.normalizeCapcut,
      bluesky: this.normalizeBluesky,
      rednote: this.normalizeRedNote,
      threads: this.normalizeThreads,
      kuaishou: this.normalizeKuaishou,
      weibo: this.normalizeWeibo
    };

    const normalizer = normalizers[platform.toLowerCase()];
    if (!normalizer) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return normalizer.call(this, data, source);
  }
}

module.exports = new Normalizer();
