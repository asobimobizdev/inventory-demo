Package.describe({
  name: "asobicoin:solc",
  summary: "Compile solc packages",
  version: "0.4.23",
});

Package.registerBuildPlugin({
  name: "compileSol",
  use: ["caching-compiler@1.0.0"],
  sources: ["plugin/handler.js"],
  npmDependencies: {"solc": "0.4.23"},
});

Package.onUse((api) => api.use("isobuild:compiler-plugin@1.0.0"));
