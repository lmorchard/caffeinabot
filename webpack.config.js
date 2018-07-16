const webpack = require("webpack");
const path = require("path");
const config = require("config");

const convert = require("koa-connect");
const history = require("connect-history-api-fallback");

const ConfigWebpackPlugin = require("config-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const setupApp = require("./backend/app");

const host = config.get("host") || "127.0.0.1";
const port = config.get("port") || "80";
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
  devtool: "cheap-eval-source-map",
  serve: {
    host,
    port,
    hotClient: {
      host,
      port: Number.parseInt(port, 10) + 1
    },
    content: contentPath,
    clipboard: false,
    add: (app, middleware, options) => {
      setupApp(app, app.server);
      app.use(convert(history()));
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${nodeEnv}"`
    }),
    new ConfigWebpackPlugin(),
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin()
  ],
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
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              hash: "sha512",
              digest: "hex",
              name: "[name]-[hash].[ext]"
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true
            }
          }
        ]
      }
    ]
  }
};
