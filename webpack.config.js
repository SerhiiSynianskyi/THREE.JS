const webpack = require("webpack")
const HTMLWebpackPlugin = require("html-webpack-plugin")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const CopyWebpackPlugin = require('copy-webpack-plugin');
let path = require('path'); // модель для абсолютных путей
let ExtractTextPlugin = require("extract-text-webpack-plugin");

let conf = {
	entry: {
		main: "./src/index.js"
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: "js/[name]-bundle.js"
	},
	devServer: {
		contentBase: "dist",
		overlay: true
	},
	module: {
		rules: [{
				test: /\.exec\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules'
			},
			{
				test: /\.css$/,
				// use: [
				// 	{ loader: "style-loader" }, // считывает данные с файла
				// 	{ loader: "css-loader" }
				// ]
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: {
						loader: "css-loader",
						options: {
							url: false,
							minimize: true,
							name: "./styles/[name].[ext]"
						}
					}
				})
			},
			{
				test: /\.styl$/,
				use: [{
						loader: "style-loader" // считывает данные с файла
					},
					{
						loader: "css-loader"
					},
					{ loader: "stylus-loader" }
				]
			},
			// {
			// 	test: /\.(woff|woff2|TTF)$/,
			// 	use: {
			// 		loader: "url-loader",
			// 		options: {
			// 			limit: 50000,
			// 			name: "./fonts/[name].[ext]",
			// 		}
			// 	},
			// },
			{
				test: /\.(mp3|mp4)$/,
				use: [{
					loader: "file-loader",
					options: {
						name: "./media/[name].[ext]",
						context: './media'
					}
				}]
			},
			{
				test: /\.html$/,
				use: [{
						loader: "file-loader",
						options: {
							name: "[name].[ext]"
						}
					},
					{
						loader: "extract-loader",
						options: {
							publicPath: "../"
						}
					},
					{
						loader: "html-loader"
					}
				]
			},
			{
				test: /\.pug$/,
				use: [{
					loader: "pug-loader"
				}]
			}
		]
	},
	plugins: [
		new HTMLWebpackPlugin({
			template: "./src/index.pug"
		}),
		new ExtractTextPlugin("styles/[name].css"),
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.css$/g,
			cssProcessor: require("cssnano"),
			cssProcessorOptions: { discardComments: { removeAll: true } },
			canPrint: true
		}),
		new webpack.ProvidePlugin({
			THREE: 'three',
			Ammo: 'ammonext',
			nipplejs: './vendor/nipplejs.min.js',
			Stats: 'stats-js'
		}),
		new CopyWebpackPlugin([
			{ from: 'src/manifest.json', to: 'manifest.json'},
			{ from: 'src/images', to: 'images' },
			{ from: 'src/model', to: 'model' },
			{ from: 'src/fonts', to: 'fonts' }
		])
	]
};

module.exports = (env, options) => {
	production = options.mode === 'production';
	conf.devtool = production ?
		false :
		'eval-sourcemap';
	return conf;
}