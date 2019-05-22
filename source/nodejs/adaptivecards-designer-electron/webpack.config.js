const path = require("path");
const nodeExternals = require("webpack-node-externals");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const merge = require("webpack-merge");
const translateEnvToMode = env => {
  if (env === "production") {
    return "production";
  }
  return "development";
};

const base = env => ({
  mode: translateEnvToMode(env),
  output: {
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /(node_modules|__tests__)/
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          //MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin({
      clearConsole: env === "development"
    })
  ]
});

const serverConfig = env =>
  merge(base(env), {
    node: {
      __dirname: false,
      __filename: false
    },
    target: "electron-main",
    entry: {
      background: "./src/main/index.ts"
    },
    devtool: "source-map",

    externals: [nodeExternals()],
    plugins: [new CleanWebpackPlugin()]
  });

const rendererConfig = env =>
  merge(base(env), {
    entry: {
      app: "./src/renderer/index.ts"
    },
    target: "electron-renderer",
    plugins: [
      new CopyWebpackPlugin([
        {
          from:
            "../adaptivecards-designer/dist/containers/*",
          to: "containers/",
          flatten: true
        },

        {
          from:
            "../adaptivecards-designer/dist/adaptivecards-designer.css"
        },
        {
          from:
            "../adaptivecards-designer-app/sample-catalogue.json"
        },
        {
          from:
            "../adaptivecards-designer-app/samples/*",
          to: "samples/",
          flatten: true
        }
      ]),
      new HtmlWebpackPlugin({
        chunks: ["app"],
        title: "Adaptive Cards Designer",
        template: "./src/renderer/index.html"
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css"
      }),

      new MonacoWebpackPlugin({
        languages: ["json"]
      })
    ]
  });

module.exports = env => [serverConfig(env), rendererConfig(env)];
