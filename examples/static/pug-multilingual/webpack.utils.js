const fs = require('fs');
const path = require('path');

function isDirectory(source) {
	return fs.lstatSync(source).isDirectory();
}

module.exports.getDirectories = (source) => {
	return fs
		.readdirSync(source)
		.filter((name) => isDirectory(path.join(source, name)));
};
