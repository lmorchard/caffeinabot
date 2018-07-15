const webpack = require("webpack");
const path = require("path");

const convert = require('koa-connect');
const history = require('connect-history-api-fallback');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const nodeEnv = process.env.NODE_ENV || "production";
const devMode = nodeEnv === "development";

module.exports = {
  mode: devMode ? "development" : "production",
  entry: {
    index: "./frontend/src/index.js"
  },
  output: {
    path: path.resolve(__dirname, "frontend/build"),
    filename: "[name].bundle.js"
  },
  serve: {
    content: [ path.join(__dirname, "frontend/build") ],
    clipboard: false,
    add: (app, middleware, options) => {
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

