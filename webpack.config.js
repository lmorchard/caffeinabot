require("dotenv").config();

const webpack = require("webpack");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = require("./lib/config")();

const contentPath = path.resolve(__dirname, "frontend/build");

module.exports = {
  mode: config.NODE_ENV === "development" ? "development" : "production",
  entry: {
    index: "./frontend/src/index.js"
  },
  output: {
    path: contentPath,
    filename: "[name].bundle.js"
  },
  devtool: "cheap-eval-source-map",
  serve: {
    host: config.HOST,
    port: config.PORT,
    hotClient: {
      host: config.HOST,
      port: Number.parseInt(config.PORT, 10) + 10
    },
    content: contentPath,
    clipboard: false,
    add: (app, middleware, options) =>
      require("./backend")({ config, app, server: app.server })
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${config.NODE_ENV}"`
    }),
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
        test: /\.css$/,
        use: ["css-hot-loader", MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.scss$/,
        use: [
          "css-hot-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              hash: "sha512",
              digest: "hex",
              name: "fonts/[name]-[hash].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              hash: "sha512",
              digest: "hex",
              name: "images/[name]-[hash].[ext]"
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
