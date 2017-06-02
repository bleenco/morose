const ngtools = require('@ngtools/webpack');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
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
	}
}
