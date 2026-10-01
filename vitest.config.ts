import {defineConfig} from "vitest/config";
import vue from "@vitejs/plugin-vue";
import {fileURLToPath, URL} from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/web", import.meta.url))
    }
  },
  define: {
    // 编译期常量：测试环境按开发构建处理（__DEV__ = true）
    __DEV__: "true",
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"]
  }
});
