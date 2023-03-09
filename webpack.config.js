'use strict';

module.exports = {

    entry: './src/index.js',

    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },

		vendor: [
		        'xlsx',
		        'file-saver'
		],

		node: {
		  fs: 'empty'
		},

    module: {
    		noParse: [/jszip.js$/],
        loaders: [
			      {
				        test: /\.js$/,
				        include: /src/,
				        enforce: 'post',
				        loader: 'obfuscator-loader',
			      },
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react'],
                    plugins: ["transform-object-rest-spread"]
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
