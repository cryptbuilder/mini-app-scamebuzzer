import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  outDir: "dist",
  manifest: {
    name: "Scambuzzer",
    version: "1.0.8",
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      96: "icon/96.png",
      128: "icon/128.png",
    },
    description:
      "Scambuzzer is a browser extension that helps you avoid scams and phishing attacks.",
    permissions: ["storage", "tabs", "notifications"],
    host_permissions: [
      "<all_urls>",
      "https://mail.google.com/*",
      "https://www.whoisxmlapi.com/*",
      "https://*.x.com/*",
      "https://www.google-analytics.com/*",
      "https://hooks.slack.com/*",
    ],
    action: {
      default_popup: "popup/index.html",
    },
    web_accessible_resources: [
      {
        resources: [
          "phishing-warning.html",
          "/icon/ScamBuzzerAlert.gif",
          "/icon/ScamBuzzer.png",
        ],
        matches: ["<all_urls>"],
      },
    ],
    background: {
      service_worker: "background.ts",
      type: "module",
    },
  },

  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
