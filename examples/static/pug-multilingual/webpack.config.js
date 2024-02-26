const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { getWebpackDevRoutes } = require('./webpack.pages.routes');
const webpack = require('webpack');
const { getDirectories } = require('./webpack.utils');

const allHtmlPlugins = [];
const locales = [
	{ code: 'en', file: 'en.json' },
	{ code: 'ua', file: 'ua.json' },
	{ code: 'fr', file: 'fr.json' },
];

const getLocalesData = (locale) => {
	const { code, file } = locale;
	const langFilePath = path.resolve(__dirname, `./locales/${file}`);
	const data = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));

	return data;
};

const pagesDirectory = path.join(__dirname, 'views', 'pages');
const pageFolders = getDirectories(pagesDirectory);

const webpackPageRoutes = getWebpackDevRoutes({
	indexFolder: 'home',
	notFoundFolder: 'notfound',

	langDir: 'locales',
	defaultLocale: 'en',
	locales: [
		{ code: 'ua', file: 'ua.json' },
		{ code: 'en', file: 'en.json' },
		{ code: 'fr', file: 'fr.json' },
	],
});

locales.forEach((locale) => {
	const { code, file } = locale;
	const data = getLocalesData(locale);

	const htmlPlugin = new HtmlWebpackPlugin({
		template:
			path.resolve(__dirname, 'views', 'pages', 'home', 'index.pug') +
			`?lang=${code}`, // <=
		filename: `${code}/index.html`,
		data: data,
		cache: false,
	});
	const htmlPlugin2 = new HtmlWebpackPlugin({
		template:
			path.resolve(__dirname, 'views', 'pages', 'home', 'index.pug') +
			`?lang=${code}`, // <=
		filename: `${code}/home.html`,
		data: data,
		cache: false,
	});
	const htmlPlugin3 = new HtmlWebpackPlugin({
		template:
			path.resolve(__dirname, 'views', 'pages', 'about', 'index.pug') +
			`?lang=${code}`, // <=
		filename: `${code}/about.html`,
		data: data,
		cache: false,
	});
	allHtmlPlugins.push(htmlPlugin);
	allHtmlPlugins.push(htmlPlugin2);
	allHtmlPlugins.push(htmlPlugin3);
});

module.exports = {
	mode: 'production',
	resolve: {
		alias: {
			'@averyano/core': path.resolve(__dirname, '../../../src/'),
		},
	},
	entry: [
		path.resolve(__dirname, 'app', 'index.js'),
		path.resolve(__dirname, 'styles', 'index.css'),
	],
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[name][contenthash].js',
		assetModuleFilename: '[name][ext]',
		publicPath: '/',
	},

	devtool: 'inline-source-map',

	devServer: {
		// headers: {
		// 	'Cache-Control': 'public, max-age=31536000',
		// },
		static: {
			directory: path.join(__dirname, 'public'),
		},
		port: 3000,
		open: false,
		hot: true,
		compress: true,
		historyApiFallback: { rewrites: webpackPageRoutes.rewrites },
		// historyApiFallback: {
		// 	rewrites: [
		// 		{ from: '/ua/home', to: '/ua/home.html' },
		// 		{ from: '/ua/about', to: '/ua/about.html' },
		// 	],
		// },
	},

	plugins: [
		new CleanWebpackPlugin(),
		new webpack.DefinePlugin({
			IS_DEVELOPMENT: true,
			IS_WEBP: false,
			LOCALES: JSON.stringify(locales),
		}),
		...allHtmlPlugins,
	],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.pug$/,
				use: [
					{
						loader: '@webdiscus/pug-loader',
						options: {
							method: 'render',
						},
					},
				],
			},
		],
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'public'),
	},
};
