const path = require('path'),
	nib = require('nib'),
	stylus = require('stylus');

function compileStylus(str, filePath) {

	const style = stylus(str)
		.set('filename', filePath)
		.set('include css', true)
		.set('compress', true)
		.set('resolve url', true)
		.define('url', stylus.resolver())
		.use(nib());

	style.render(function(err) {

		if (err) {
			throw err;
		}
	});

	return style;
}

function generateStylesheets(app) {

	const stylesParentPath = path.join(__dirname, '..', 'public');

	app.use(stylus.middleware({
		src: stylesParentPath,
		dest: stylesParentPath,
		compile: compileStylus
	}));
}

module.exports = generateStylesheets;
