var webpack = require('webpack');
var path = require('path');
var HotMiddleWareConfig = 'webpack-hot-middleware/client?reload=true';


module.exports = {
    entry: [
        HotMiddleWareConfig,
        './public/client.js'
    ],
    output: {
        path: path.resolve('./public'),
        publicPath: '',
        filename: './bundle.js'
    },
    devtool: '#source-map',
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }, 
            { test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader'},
            { test: /\.json$/, loader: 'json-loader' }
        ]
    },
};
