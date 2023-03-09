var webpack = require('webpack');

module.exports = {

    entry: [
        './src/index.js',
        'webpack-dev-server/client?http://0.0.0.0:3001',
        'webpack/hot/only-dev-server'
    ],

    output: {
        path: '/',
        filename: 'bundle.js'
    },

    devServer: {
        hot: true,
        filename: 'bundle.js',
        publicPath: '/',
        historyApiFallback: true,
        contentBase: './public',
        proxy: {
            "*": "http://localhost:3000"
        }
    },

		vendor: [
		        'xlsx',
		        'file-saver'
		],

		node: {
			dns: 'mock',
			net: 'mock',
		  fs: 'empty'
		},

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    module: {
    		noParse: [/jszip.js$/],
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react'],
                    plugins: ["react-hot-loader/babel", "transform-object-rest-spread"]
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            },
            {
                test: /\.png$/,
                loader: 'file-loader',
            },
            {
                test: /\.bmp$/,
                loader: 'file-loader',
            },
            {
                test: /\.ico$/,
                loader: 'file-loader',
            }
        ]
    },
    
		externals: [
		    {'./cptable': 'var cptable'},
		    {'./jszip': 'jszip'}
		]
 
};
