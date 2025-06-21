import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // força polling para captar mudanças em arquivos .html
      usePolling: true,
      interval: 1000,
    }
  }
});
