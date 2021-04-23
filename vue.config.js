var path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  pages: {
    index: {
      entry: "examples/main.js",
      template: "public/index.html",
      filename: "index.html",
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        src: resolve("src"),
        utils: resolve("src/utils"),
        packages: resolve("packages"),
      },
    },
  },
};
