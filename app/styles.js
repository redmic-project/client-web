var path = require('path'),
	nib = require('nib'),
	stylus = require('stylus');

function compileStylus(str, path) {

	var style = stylus(str)
		.set('filename', path)
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

	var stylesParentPath = path.join(__dirname, '..', 'public');

	app.use(stylus.middleware({
		src: stylesParentPath,
		dest: stylesParentPath,
		compile: compileStylus
	}));
}

module.exports = generateStylesheets;
