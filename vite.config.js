import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  const server = {
    port: 5173,
  };

  if (proxyTarget) {
    server.proxy = {
      '/auth': proxyTarget,
      '/users': proxyTarget,
      '/transactions': proxyTarget,
      '/summary': proxyTarget,
      '/categories': proxyTarget,
    };
  }

  return {
    plugins: [react()],
    server,
  };
});
