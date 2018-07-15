const webpack = require("webpack");
const path = require("path");

const convert = require("koa-connect");
const history = require("connect-history-api-fallback");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const setupApp = require("./backend/app");

const nodeEnv = process.env.NODE_ENV || "production";
const devMode = nodeEnv === "development";

const contentPath = path.resolve(__dirname, "frontend/build");

module.exports = {
  mode: devMode ? "development" : "production",
  entry: {
    index: "./frontend/src/index.js"
  },
  output: {
    path: contentPath,
    filename: "[name].bundle.js"
  },
  serve: {
    content: contentPath,
    clipboard: false,
    add: (app, middleware, options) => {
      middleware.webpack();
      setupApp(app, app.server);
      middleware.content();
      app.use(convert(history()));
    }
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${nodeEnv}"`
    }),
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [
              ["@babel/preset-env", { modules: false }],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-proposal-object-rest-spread",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  }
};
