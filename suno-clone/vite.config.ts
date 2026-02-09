import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @를 'app' 폴더로 지정 (ESM 환경에서 __dirname 대신 process.cwd() 사용)
      "@": path.resolve(process.cwd(), "app"),
    },
  },
});
