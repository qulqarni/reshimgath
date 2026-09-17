import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react(),
      {
        name: 'razorpay-api-dev-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url ? req.url.split('?')[0] : '';
            if (url === '/api/create-order' || url === '/api/verify-payment') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  req.body = body ? JSON.parse(body) : {};
                } catch (e) {
                  req.body = {};
                }

                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                try {
                  if (url === '/api/create-order') {
                    await createOrderHandler(req, res);
                  } else if (url === '/api/verify-payment') {
                    await verifyPaymentHandler(req, res);
                  }
                } catch (err) {
                  console.error('API Dev Middleware Error:', err);
                  res.status(500).json({ error: err.message || 'Internal Dev Server Error' });
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    }
  };
});
