const axios = require('axios');

/**
 * Proxy download endpoint
 * Downloads file from external URL and streams to client
 */
async function proxyDownload(req, res) {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    // Decode URL
    const fileUrl = decodeURIComponent(url);
    const fileName = filename || `download_${Date.now()}`;

    // Fetch file from CDN
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Get content type
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Determine file extension from content type if not in filename
    let finalFilename = fileName;
    if (!finalFilename.includes('.')) {
      const extMap = {
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'audio/mpeg': '.mp3',
        'audio/mp4': '.m4a',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
      };
      const ext = extMap[contentType] || '';
      finalFilename += ext;
    }

    // Set headers to force download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream file to client
    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy download error:', error.message);
    
    // If response already started, can't send JSON
    if (res.headersSent) {
      res.end();
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error.message
    });
  }
}

module.exports = { proxyDownload };
