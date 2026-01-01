const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Root endpoint - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                                                    ║');
  console.log('║         PRENIVDL Web Application Started          ║');
  console.log('║                                                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`  📡 API Endpoint:  http://localhost:${PORT}/api`);
  console.log(`  ❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('  Press Ctrl+C to stop the server');
  console.log('');
});

module.exports = app;
