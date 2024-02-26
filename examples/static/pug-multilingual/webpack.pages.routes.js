/**
 * @description This file contains functions to generate html-webpack-plugin instances for each page in the pages directory
 * @param {string} indexFolder - The folder name of the index page. Defaults to the first folder in the pages directory
 * @param {string} directory - The directory of the pages. Defaults to the views/pages directory in the root of the project
 * @param {object} methods - The methods to be passed to the pug templates
 * @param {object} data - The data to be passed to the pug templates (JSON)
 */

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const PugPlugin = require('pug-plugin');

function isDirectory(source) {
	return fs.lstatSync(source).isDirectory();
}

function getDirectories(source) {
	return fs
		.readdirSync(source)
		.filter((name) => isDirectory(path.join(source, name)));
}

module.exports.getPagesHtmlPlugins = ({
	indexFolder,
	methods,
	data,
	langDir,
	defaultLocale,
	locales,
	directory,
}) => {
	const pagesDirectory = directory || path.join(__dirname, 'views', 'pages');
	console.log('locales', locales);
	const pageFolders = getDirectories(pagesDirectory);

	const pagePlugins = [];
	const defaultData = JSON.parse(
		fs.readFileSync(`./${langDir}/${defaultLocale}.json`, 'utf8')
	);
	// Build into /ua, /en, etc.
	if (locales && locales.length > 0) {
		if (!langDir) throw new Error('langDir must be defined');

		locales.forEach((locale) => {
			console.log('building locale: ', locale.code);
			const { code, file } = locale;
			const langFilePath = path.resolve(__dirname, `./${langDir}/${file}`);
			let langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));

			pageFolders.forEach((folder) => {
				let fileName = folder;

				const indexPath = path.join(pagesDirectory, folder, 'index.pug');
				if (fs.existsSync(indexPath)) {
					const htmlPlugin = new HtmlWebpackPlugin({
						template:
							path.join(pagesDirectory, folder, 'index.pug') + `?lang=${code}`,
						filename: `${code}/${fileName}.html`,
						methods: methods,
						data: langData,
						minify: {
							collapseWhitespace: true,
							keepClosingSlash: true,
							removeComments: true,
							removeRedundantAttributes: false,
							removeScriptTypeAttributes: true,
							removeStyleLinkTypeAttributes: true,
							useShortDoctype: true,
						},
						cache: false,
					});
					pagePlugins.push(htmlPlugin);
				} else {
					console.warn(`WARN: index.pug does not exist in ${folder}`);
				}
			});

			// Also add the index.html
			let startPageFolder = indexFolder || pageFolders[0];

			const indexHtmlPlugin = new HtmlWebpackPlugin({
				template: path.join(pagesDirectory, startPageFolder, 'index.pug'),
				filename: `${code}/index.html`,
				methods: methods,
				data: langData,
				minify: {
					collapseWhitespace: true,
					keepClosingSlash: true,
					removeComments: true,
					removeRedundantAttributes: false,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					useShortDoctype: true,
					cache: false,
				},
			});

			pagePlugins.push(indexHtmlPlugin);
		});
	}

	// Build into /
	console.log('Building locale: ', 'default');
	pageFolders.forEach((folder) => {
		let fileName = folder;

		const indexPath = path.join(pagesDirectory, folder, 'index.pug');
		if (fs.existsSync(indexPath)) {
			const htmlPlugin = new HtmlWebpackPlugin({
				template:
					path.join(pagesDirectory, folder, 'index.pug') + `?lang=default`,
				filename: `${fileName}.html`,
				methods: methods,
				data: defaultData,
				minify: {
					collapseWhitespace: true,
					keepClosingSlash: true,
					removeComments: true,
					removeRedundantAttributes: false,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					useShortDoctype: true,
					cache: false,
				},
			});

			pagePlugins.push(htmlPlugin);
		} else {
			console.warn(`WARN: index.pug does not exist in ${folder}`);
		}
	});

	// Also add the index.html
	let startPageFolder = indexFolder || pageFolders[0];

	const indexHtmlPlugin = new HtmlWebpackPlugin({
		template: path.join(pagesDirectory, startPageFolder, 'index.pug'),
		filename: `index.html`,
		methods: methods,
		data: defaultData,
		minify: {
			collapseWhitespace: true,
			keepClosingSlash: true,
			removeComments: true,
			removeRedundantAttributes: false,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
			cache: false,
		},
	});

	pagePlugins.push(indexHtmlPlugin);

	if (pagePlugins.length > 0) {
		return pagePlugins;
	} else {
		return [];
	}
};

module.exports.getWebpackDevRoutes = ({
	indexFolder,
	notFoundFolder,

	langDir,
	defaultLocale,
	locales,

	directory,
}) => {
	let webpackDevRoutes = {
		rewrites: [],
	};

	const pagesDirectory = directory || path.join(__dirname, 'views', 'pages');

	const pageFolders = getDirectories(pagesDirectory);

	// Build into /ua, /en, etc.
	if (locales && locales.length > 0) {
		if (!langDir) throw new Error('langDir must be defined');

		if (!defaultLocale) {
			console.warn(
				'WARN: defaultLocale is not defined. Using the first locale as default'
			);
			defaultLocale = locales[0].code;
		} else {
			const defaultLocaleExists = locales.find(
				(locale) => locale.code === defaultLocale
			);
			console.log('/ ', defaultLocaleExists);
			if (!defaultLocaleExists) {
				throw new Error('defaultLocale must be one of the locales');
			}
			defaultData = require(`./${langDir}/${defaultLocaleExists.file}`);
		}

		locales.forEach((locale) => {
			const { code } = locale;
			console.log('/' + code, ' ', locale);

			pageFolders.forEach((folder) => {
				webpackDevRoutes.rewrites.push({
					from: `/${code}/${folder}`,
					to: `/${code}/${folder}.html`,
				});
			});

			// Also add the index.html route
			webpackDevRoutes.rewrites.push({
				from: `/${code}`,
				to: `/${code}/index.html`,
			});
		});
	}

	// Build into /
	pageFolders.forEach((folder) => {
		const indexPath = path.join(pagesDirectory, folder, 'index.pug');
		if (fs.existsSync(indexPath)) {
			webpackDevRoutes.rewrites.push({
				from: `/${folder}`,
				to: `/${folder}.html`,
			});
		} else {
			console.log(`index.pug does not exist in ${folder}`);
		}
	});

	webpackDevRoutes.rewrites.push({
		from: `/ixa7as-d8`,
		to: '/index.html',
	});

	console.log(webpackDevRoutes);

	let startPageFolder = indexFolder || pageFolders[0];

	// Also add the index.html route
	webpackDevRoutes.rewrites.push({
		from: `/${startPageFolder}`,
		to: `/index.html`,
	});

	webpackDevRoutes.rewrites.push({
		from: `.`,
		to: `/${notFoundFolder}.html`,
	});

	console.log(webpackDevRoutes);
	return webpackDevRoutes;
	if (webpackDevRoutes.length > 0) {
		return webpackDevRoutes;
	} else {
		return [];
	}
};
