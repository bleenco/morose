const ngtools = require('@ngtools/webpack');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: {
		server: './src/api/index.ts'
	},
	resolve: {
    extensions: ['.ts', '.js']
  },
	target: 'node',
	output: {
		path: join(__dirname, 'dist/api'),
		filename: '[name].js'
	},
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ],
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'awesome-typescript-loader' }
		]
	},
  stats: {
		warnings: false
	},
	node: {
		console: false,
		global: false,
		process: false,
		Buffer: false,
		__filename: false,
		__dirname: false
	}
}
