// ============================================
// NTRUONG Web App - Client JavaScript
// ============================================

const API_BASE = window.location.origin;

// DOM Elements
const downloadForm = document.getElementById('downloadForm');
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const platformDetection = document.getElementById('platformDetection');
const detectedPlatform = document.getElementById('detectedPlatform');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const mediaTitle = document.getElementById('mediaTitle');
const mediaAuthor = document.getElementById('mediaAuthor');
const mediaThumbnail = document.getElementById('mediaThumbnail');
const mediaMetadata = document.getElementById('mediaMetadata');
const downloadChoices = document.getElementById('downloadChoices');
const platformsList = document.getElementById('platformsList');

// State
let currentMediaData = null;
let supportedPlatforms = [];

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadSupportedPlatforms();
  setupEventListeners();
});

function setupEventListeners() {
  downloadForm.addEventListener('submit', handleDownload);
  urlInput.addEventListener('input', handleUrlInput);
}

// ============================================
// URL Input Handler
// ============================================

function handleUrlInput(e) {
  const url = e.target.value.trim();
  
  if (!url) {
    platformDetection.style.display = 'none';
    return;
  }

  try {
    const urlObj = new URL(url);
    const platform = detectPlatform(urlObj.hostname);
    
    if (platform) {
      detectedPlatform.textContent = `Nền tảng: ${platform.name}`;
      platformDetection.style.display = 'block';
    } else {
      platformDetection.style.display = 'none';
    }
  } catch (error) {
    platformDetection.style.display = 'none';
  }
}

function detectPlatform(hostname) {
  if (!supportedPlatforms.length) return null;
  
  return supportedPlatforms.find(platform => {
    return platform.domains.some(domain => 
      hostname.endsWith(domain) || hostname === domain
    );
  });
}

// ============================================
// Download Handler
// ============================================

async function handleDownload(e) {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  
  if (!url) {
    showError('Đầu vào không hợp lệ', 'Vui lòng nhập URL hợp lệ');
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    showError('URL không hợp lệ', 'Vui lòng nhập định dạng URL hợp lệ');
    return;
  }

  // Hide previous states
  hideAllStates();
  
  // Show loading
  loadingState.style.display = 'block';
  downloadBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch media data');
    }

    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    // Store data and display results
    currentMediaData = data;
    displayResults(data);

  } catch (error) {
    console.error('Download error:', error);
    showError('Tải xuống thất bại', error.message);
  } finally {
    loadingState.style.display = 'none';
    downloadBtn.disabled = false;
  }
}

// ============================================
// Display Results
// ============================================

function displayResults(data) {
  hideAllStates();
  
  const { platform, data: mediaData } = data;

  // Set title
  mediaTitle.textContent = mediaData.title || 'Không có tiêu đề';

  // Set author
  if (mediaData.author) {
    mediaAuthor.textContent = `Bởi ${mediaData.author}`;
    mediaAuthor.style.display = 'block';
  } else {
    mediaAuthor.style.display = 'none';
  }

  // Set thumbnail
  if (mediaData.thumbnail) {
    mediaThumbnail.innerHTML = `<img src="${mediaData.thumbnail}" alt="Thumbnail" />`;
  } else {
    mediaThumbnail.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; opacity: 0.3;">🎬</div>`;
  }

  // Set metadata
  displayMetadata(mediaData.metadata, platform);

  // Build download choices
  buildDownloadChoices(mediaData.downloads, platform);

  // Show results
  resultsSection.style.display = 'block';
  
  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function displayMetadata(metadata, platform) {
  if (!metadata || Object.keys(metadata).length === 0) {
    mediaMetadata.innerHTML = '';
    return;
  }

  const tags = [];

  // Common metadata fields
  if (metadata.duration) {
    tags.push(`⏱️ ${metadata.duration}`);
  }
  if (metadata.views) {
    tags.push(`👁️ ${formatNumber(metadata.views)} views`);
  }
  if (metadata.likes) {
    tags.push(`❤️ ${formatNumber(metadata.likes)} likes`);
  }
  if (metadata.audio_title) {
    tags.push(`🎵 ${metadata.audio_title}`);
  }

  mediaMetadata.innerHTML = tags.map(tag => 
    `<span class="metadata-tag">${tag}</span>`
  ).join('');
}

function buildDownloadChoices(downloads, platform) {
  if (!downloads) {
    downloadChoices.innerHTML = '<p style="color: var(--color-text-muted);">Không có tùy chọn tải xuống</p>';
    return;
  }

  const choices = [];

  // Videos
  if (downloads.video && downloads.video.length > 0) {
    downloads.video.forEach((item, index) => {
      // Handle both object format (new) and string format (old)
      const url = typeof item === 'string' ? item : item.url;
      const quality = typeof item === 'object' && item.quality ? item.quality : '';
      const label = quality ? `Video - ${quality}` : `Video ${index + 1}`;
      
      choices.push({
        label: label,
        url: url,
        type: 'video',
        icon: '🎥'
      });
    });
  }

  // Audios
  if (downloads.audio && downloads.audio.length > 0) {
    downloads.audio.forEach((item, index) => {
      // Handle both object format (new) and string format (old)
      const url = typeof item === 'string' ? item : item.url;
      const quality = typeof item === 'object' && item.quality ? item.quality : '';
      const format = typeof item === 'object' && item.format ? item.format.toUpperCase() : 'MP3';
      const label = quality ? `Audio - ${quality} (${format})` : `Audio ${index + 1}`;
      
      choices.push({
        label: label,
        url: url,
        type: 'audio',
        icon: '🎵'
      });
    });
  }

  // Images
  if (downloads.image && downloads.image.length > 0) {
    downloads.image.forEach((item, index) => {
      // Handle both object format (new) and string format (old)
      const url = typeof item === 'string' ? item : item.url;
      const quality = typeof item === 'object' && item.quality ? item.quality : '';
      const label = quality ? `Image - ${quality}` : `Image ${index + 1}`;
      
      choices.push({
        label: label,
        url: url,
        type: 'image',
        icon: '🖼️'
      });
    });
  }

  // Handle other download formats (Facebook, YouTube, etc.)
  if (Array.isArray(downloads) && downloads.length > 0) {
    downloads.forEach((item, index) => {
      const label = item.quality || item.resolution || item.label || `Option ${index + 1}`;
      const url = item.url || item;
      choices.push({
        label: label,
        url: url,
        type: item.type || 'media',
        icon: getIconForType(item.type || 'video')
      });
    });
  }

  // Render choices
  if (choices.length === 0) {
    downloadChoices.innerHTML = '<p style="color: var(--color-text-muted);">Không có tùy chọn tải xuống</p>';
    return;
  }

  downloadChoices.innerHTML = choices.map(choice => `
    <div class="download-choice">
      <span class="choice-label">
        <span style="margin-right: 0.5rem;">${choice.icon}</span>
        ${choice.label}
      </span>
      <button class="choice-download-btn" onclick="downloadMedia('${encodeURIComponent(choice.url)}', '${choice.label}', '${choice.type}')">
        Tải xuống
      </button>
    </div>
  `).join('');
}

function getIconForType(type) {
  const icons = {
    video: '🎥',
    audio: '🎵',
    image: '🖼️',
    track: '🎵',
    pin: '📌',
    post: '📱'
  };
  return icons[type] || '📥';
}

// ============================================
// Download Media
// ============================================

function downloadMedia(encodedUrl, label, type) {
  const url = decodeURIComponent(encodedUrl);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(label)}_${Date.now()}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Show feedback
  showToast(`Đang tải xuống ${label}...`);
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// ============================================
// Load Supported Platforms
// ============================================

async function loadSupportedPlatforms() {
  try {
    const response = await fetch(`${API_BASE}/api/platforms`);
    const data = await response.json();

    if (data.success && data.platforms) {
      supportedPlatforms = data.platforms;
      displayPlatforms(data.platforms);
    }
  } catch (error) {
    console.error('Failed to load platforms:', error);
  }
}

function displayPlatforms(platforms) {
  const platformIcons = {
    'TikTok': '🎵',
    'Facebook': '📘',
    'Instagram': '📷',
    'Twitter': '🐦',
    'YouTube': '▶️',
    'Douyin': '🎶',
    'Spotify': '🎧',
    'Pinterest': '📌',
    'Apple Music': '🎵',
    'CapCut': '✂️',
    'Bluesky': '🦋',
    'RedNote/Xiaohongshu': '📕',
    'Threads': '🧵',
    'Kuaishou': '⚡',
    'Weibo': '💬'
  };

  // Only these platforms are currently working
  const activePlatforms = ['Instagram', 'Douyin'];

  platformsList.innerHTML = platforms.map(platform => {
    const isActive = activePlatforms.includes(platform.name);
    const statusBadge = isActive 
      ? '<span class="status-badge status-active">✓ Hoạt động</span>' 
      : '<span class="status-badge status-disabled">Sắp ra mắt</span>';
    
    return `
      <div class="platform-item ${isActive ? '' : 'platform-disabled'}">
        <div class="platform-icon">${platformIcons[platform.name] || '📱'}</div>
        <div class="platform-info">
          <div class="platform-name">${platform.name}</div>
          <div class="platform-type">${platform.mediaType}</div>
        </div>
        ${statusBadge}
      </div>
    `;
  }).join('');
}

// ============================================
// Utility Functions
// ============================================

function hideAllStates() {
  loadingState.style.display = 'none';
  errorState.style.display = 'none';
  resultsSection.style.display = 'none';
}

function showError(title, message) {
  hideAllStates();
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  errorState.style.display = 'block';
  
  // Scroll to error
  setTimeout(() => {
    errorState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
    font-weight: 500;
  `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Add toast animations to the page
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
