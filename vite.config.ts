import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "plotscape5",
    },
  },
  plugins: [
    libInjectCss(),
    dts({
      include: ["lib"],
      rollupTypes: true,
    }),
  ],
});
