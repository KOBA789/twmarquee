import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {},
  plugins: [reactRefresh()],
  server: {
    hmr: {
      // port: 443,
    },
    proxy: {
      "/api/stream": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env": {},
  },
});
