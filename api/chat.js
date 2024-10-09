import { createProxyMiddleware } from 'http-proxy-middleware';

const deepseekProxy = createProxyMiddleware({
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/chat': '/v1/chat/completions',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.DEEPSEEK_API_KEY}`);
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Cache-Control'] = 'no-cache';
  },
});

export default function handler(req, res) {
  deepseekProxy(req, res, (err) => {
    if (err) {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: 'Proxy Error' });
    }
  });
}