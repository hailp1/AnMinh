const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Backend chạy trên port 5000
      changeOrigin: true, // Đổi origin để proxy hoạt động đúng
      ws: false, // Tắt WebSocket proxy vì không cần
      logLevel: 'debug', // Tăng log để debug
      secure: false, // Không check SSL certificate trong dev
      timeout: 30000, // Timeout 30 giây
      proxyTimeout: 30000, // Proxy timeout 30 giây
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        console.error('[Proxy Error] Backend URL:', 'http://localhost:5000' + req.url);
        if (!res.headersSent) {
          res.status(502).json({ 
            error: 'Proxy error: Backend server không khả dụng',
            message: err.message,
            backend: 'http://localhost:5000',
            url: req.url
          });
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        // Forward Origin header từ browser
        if (req.headers.origin) {
          proxyReq.setHeader('Origin', req.headers.origin);
        }
        // Set timeout cho request
        proxyReq.setTimeout(30000);
        
        // Log chi tiết để debug
        console.log(`[Proxy] ${req.method} ${req.url} -> http://localhost:5000${req.url}`);
        console.log(`[Proxy] Request path: ${req.path}`);
        console.log(`[Proxy] Request originalUrl: ${req.originalUrl}`);
        
        if (req.headers.origin) {
          console.log(`[Proxy] Origin: ${req.headers.origin}`);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response để debug
        if (proxyRes.statusCode >= 500) {
          console.error(`[Proxy] Error response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        } else if (proxyRes.statusCode >= 400) {
          console.warn(`[Proxy] Client/Server error: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        } else {
          console.log(`[Proxy] Success: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        }
      },
    })
  );
};


