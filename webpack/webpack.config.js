const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const gitRevisionPlugin = new GitRevisionPlugin();
const package = require("../package.json");

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

module.exports = {
    mode: "production",
    devtool: "source-map",
    optimization: {
        minimize: false // Preferred to help accelerate the extension's validation process.
    },
    target: "web",
    entry: {
        background: path.resolve(__dirname, "..", "src", "background.ts"),
        plugin_extensions: path.resolve(__dirname, "..", "src", "plugins-extensions", "index.ts"),
        in_page_extensions: path.resolve(__dirname, "..", "src", "in-page-extensions", "index.ts"),
        content_script: path.resolve(__dirname, "..", "src", "content_script.ts"),
        popup: path.resolve(__dirname, "..", "src", "popup", "popup.ts")
    },
    output: {
        path: path.join(__dirname, "../build"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: {
                    loader: "html-loader",
                    options: {
                        esModule: false
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader", // creates style nodes from JS  strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: ".", context: "public" }]
        }),
        new HtmlWebpackPlugin({
            template: "./src/popup/popup.ejs", // Your HTML template
            filename: "popup.html",
            chunks: ["popup"],
            //scriptLoading: "blocking", // avoid adding defer="defer" to script tag
            APP_NAME: "HybridTV Dev Environment",
            APP_VERSION: package.version,
            GIT_VERSION: gitRevisionPlugin.version(),
            GIT_HASH: gitRevisionPlugin.commithash(),
            GIT_BRANCH: gitRevisionPlugin.branch(),
            GIT_LASTCOMMITDATETIME: gitRevisionPlugin.lastcommitdatetime().substring(0, 10)
        })
    ]
};
