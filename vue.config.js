const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: ["github"],
        nsis: {
          allowToChangeInstallationDirectory: true,
          oneClick: false,
        },
        productName: "崩坏：星穹铁道工具箱",
      },
    },
  },
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
  },
});
