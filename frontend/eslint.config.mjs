import { defineConfig } from "eslint/config";
import nextConfig from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "**/page copy*.jsx",
      "**/page copy*.js",
    ],
  },
]);
