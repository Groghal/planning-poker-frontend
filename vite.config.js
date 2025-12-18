import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: false,
        proxy: {
            '/planning-poker-frontend/api/': {
                target: 'http://localhost:3222/',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/planning-poker-frontend\/api/, '/api'); },
                secure: false,
                ws: true,
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        },
    },
    base: '/planning-poker-frontend'
});
