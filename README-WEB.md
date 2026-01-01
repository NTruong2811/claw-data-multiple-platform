# PRENIVDL Web Application

Web interface for the PRENIVDL Universal Social Media Downloader.

## 🌐 Features

- **Modern Web Interface** - Beautiful dark mode design with glassmorphism effects
- **Universal Platform Support** - All 16 platforms from the CLI version
- **Auto-Detection** - Automatically detects platform from URL
- **REST API** - Clean RESTful API for programmatic access
- **Real-time Feedback** - Loading states, error handling, and download progress
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Running the Web Server

```bash
# Start the web application
npm run start:web

# The server will start on http://localhost:3000
```

### Running the CLI (Original)

```bash
# Start the CLI version
npm run start:cli
# or
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Get Supported Platforms

**GET** `/api/platforms`

Returns a list of all supported platforms with metadata.

**Response:**
```json
{
  "success": true,
  "count": 16,
  "platforms": [
    {
      "name": "TikTok",
      "command": "tiktok",
      "alias": null,
      "domains": ["tiktok.com"],
      "mediaType": "video",
      "exampleUrl": "https://www.tiktok.com/@username/video/1234567890"
    }
    // ... more platforms
  ]
}
```

#### 2. Download Media

**POST** `/api/download`

Universal download endpoint that auto-detects platform and returns media data.

**Request Body:**
```json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

**Success Response:**
```json
{
  "success": true,
  "platform": {
    "name": "TikTok",
    "command": "tiktok",
    "mediaType": "video"
  },
  "data": {
    "title": "Video Title",
    "author": "Username",
    "thumbnail": "https://...",
    "metadata": {
      "duration": "0:30",
      "views": 1000000,
      "likes": 50000
    },
    "downloads": {
      "video": ["https://..."],
      "audio": ["https://..."],
      "image": []
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Platform not supported. Please check the URL and try again.",
  "supportedPlatforms": ["TikTok", "Instagram", ...]
}
```

#### 3. Health Check

**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-01-01T14:50:00.000Z",
  "uptime": 123.456
}
```

## 🎨 Supported Platforms

The web application supports all platforms from the CLI version:

1. **TikTok** - Videos, images, and audio
2. **Facebook** - Videos in multiple qualities
3. **Instagram** - Photos and videos from posts
4. **Twitter/X** - Videos with quality selection
5. **YouTube** - Videos and audio in various formats
6. **Douyin** - Chinese TikTok videos
7. **Spotify** - Tracks (MP3) and cover images
8. **Pinterest** - Images in multiple qualities
9. **Apple Music** - Tracks and cover images
10. **CapCut** - Videos with quality options
11. **Bluesky** - Images and videos from posts
12. **RedNote/Xiaohongshu** - Videos and images
13. **Threads** - Videos from posts
14. **Kuaishou** - Videos from posts
15. **Weibo** - Videos and images

## 🛠️ Configuration

### Environment Variables

You can configure the server port using environment variables:

```bash
# Set custom port (default: 3000)
PORT=8080 npm run start:web
```

### CORS Configuration

CORS is enabled by default for all origins. To restrict access, modify `server.js`:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## 📁 Project Structure

```
prenivdlapp-cli/
├── api/
│   ├── handlers.js       # Platform API handlers
│   └── routes.js         # REST API routes
├── public/
│   ├── index.html        # Web interface
│   ├── styles.css        # Styling
│   └── app.js            # Client JavaScript
├── routes/               # CLI platform handlers (reused)
├── utils/                # Utility functions (reused)
├── server.js             # Express server
├── index.js              # CLI entry point
└── package.json          # Dependencies
```

## 🔧 Development

### Testing the API

Using curl:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test platforms endpoint
curl http://localhost:3000/api/platforms

# Test download endpoint
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@username/video/1234567890"}'
```

Using JavaScript fetch:

```javascript
// Download media
const response = await fetch('http://localhost:3000/api/download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://www.tiktok.com/@username/video/1234567890' 
  })
});

const data = await response.json();
console.log(data);
```

## ⚠️ Troubleshooting

### Port Already in Use

If you get an error that port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run start:web
```

### Dependencies Not Installed

Make sure you've installed all dependencies:

```bash
npm install
```

### API Returns Errors

1. Check your internet connection
2. Verify the URL is valid and from a supported platform
3. Check the server console for detailed error messages
4. Some platforms may have rate limits or temporary issues

## 📝 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

> [!IMPORTANT]
> This project is free and open-source. You may use, modify, and distribute it under the terms of the GPL-3.0 license. Any modifications must also be open-sourced under the same license.

> [!NOTE]
> This tool is for educational purposes only. Please respect the terms of service of the respective social media platforms and only download content you have permission to download.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Star this repository

## 🔗 Links

- [GitHub Repository](https://github.com/arsya371/prenivdlapp-cli)
- [CLI Documentation](README.md)
- [API Documentation](https://prenivapi.vercel.app)
