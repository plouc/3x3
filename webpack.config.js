const path       = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const pkg        = require('./package.json')

module.exports = {
    entry: './src/examples/circle-pack.js',
    output: {
        path:      path.resolve(__dirname, `build/`),
        filename: 'bundle.js',
    },
    node: {
        fs: 'empty',
    },
    module: {
        rules: [
            {
                test:   /\.json$/,
                loader: 'json-loader',
            },
            {
                test:    /.*/,
                loader:  'transform-loader?brfs',
                enforce: 'post',
                include: [
                    path.resolve(__dirname, 'node_modules/pixi.js'),
                ],
            },
            {
                test:    /\.js$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader:  'babel-loader',
                        options: {
                            presets: ['es2015', 'stage-3', 'react'],
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use:  [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test:    /\.jpe?g$|\.svg$|\.png$/,
                exclude: /node_modules/,
                loader:  'file-loader?name=[name].[ext]&outputPath=assets/graphics/&publicPath=assets/graphics/',
            },
            {
                test:    /\.dae$/,
                loader:  'file-loader',
            },
        ],
    },
    plugins: [
        new HtmlPlugin({
            title:    pkg.name,
            template: 'src/examples/index.html',
        }),
    ],
    devtool:   'source-map',
    devServer: {
        contentBase: path.resolve(__dirname, './build'),
    },
}
