const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const next = require('next');
const cors = require('cors');

const corsOptions = {
  origin: "http://localhost:3000",
};



const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
  const server = express();
  server.use(cors(corsOptions));
  // Proxy API requests to the Cloud Run service
  server.use('/api', createProxyMiddleware({
    target: 'https://docker-deploy-a6kp5qopha-uw.a.run.app/',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  }));
  console.log(server);

  // Handle other requests
  server.all('*', (req, res) => handle(req, res));

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
