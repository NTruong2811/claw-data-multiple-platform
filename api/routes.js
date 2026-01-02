const express = require('express');
const { PLATFORM_CONFIG, matchPlatform } = require('../utils/config');
const { fetchPlatformData } = require('./handlers');
const { proxyDownload } = require('./proxy');

// Import individual route handlers from old routes for reference
// Note: These are CLI-based handlers with interactive prompts, 
// so they cannot be used directly in the API but serve as reference
const { downloadAppleMusic } = require('../routes/applemusic');
const { downloadBluesky } = require('../routes/bluesky');
const { downloadCapcut } = require('../routes/capcut');
const { downloadDouyin } = require('../routes/douyin');
const { downloadFacebook } = require('../routes/facebook');
const { downloadInstagram } = require('../routes/instagram');
const { downloadKuaishou } = require('../routes/kuaishou');
const { downloadPinterest } = require('../routes/pinterest');
const { downloadRedNote } = require('../routes/rednote');
const { downloadSpotify } = require('../routes/spotify');
const { downloadThreads } = require('../routes/threads');
const { downloadTikTok } = require('../routes/tiktok');
const { downloadTwitter } = require('../routes/twitter');
const { downloadWeibo } = require('../routes/weibo');
const { downloadYouTube } = require('../routes/youtube');

const router = express.Router();

/**
 * GET /api/proxy-download
 * Proxy download endpoint - streams file from external CDN
 */
router.get('/proxy-download', proxyDownload);

/**
 * GET /api/platforms
 * Returns list of all supported platforms with metadata
 */
router.get('/platforms', (req, res) => {
  const platforms = PLATFORM_CONFIG.map(platform => ({
    name: platform.name,
    command: platform.command,
    alias: platform.alias,
    domains: platform.domains,
    mediaType: platform.mediaType,
    exampleUrl: platform.exampleUrl
  }));

  res.json({
    success: true,
    count: platforms.length,
    platforms
  });
});

/**
 * POST /api/download
 * Universal download endpoint that auto-detects platform
 * Body: { url: string }
 */
router.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL is required and must be a string'
      });
    }

    // Parse and validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Match platform
    const platform = matchPlatform(parsedUrl.hostname, url);
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform not supported. Please check the URL and try again.',
        supportedPlatforms: PLATFORM_CONFIG.map(p => p.name)
      });
    }

    // Fetch data from platform using API handlers
    // The handlers in api/handlers.js use the same logic as routes/* 
    // but adapted for API usage (no interactive prompts)
    const data = await fetchPlatformData(platform.command, url);

    // Return structured response
    res.json({
      success: true,
      platform: {
        name: platform.name,
        command: platform.command,
        mediaType: platform.mediaType
      },
      data: {
        title: data.title || 'Untitled',
        author: data.author || null,
        thumbnail: data.thumbnail || null,
        metadata: data.metadata || {},
        downloads: data.downloads || {}
      }
    });

  } catch (error) {
    console.error('Download API Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch media data',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
