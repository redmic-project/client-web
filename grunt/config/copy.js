module.exports = function(grunt) {

	var path = require('path'),

		srcPath = grunt.config('redmicConfig.srcPath'),
		depPath = grunt.config('redmicConfig.depPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		destDir = grunt.config('redmicConfig.destDir'),
		publicPath = srcPath.split('/')[0],

		stylesPath = publicPath + '/style',
		stylesDistPath = stylesPath + '/dist',
		distStylesSubPath = distPath + '/style',

		leafletPath = 'leaflet',
		srcLeafletPath = path.join(depPath, leafletPath),
		distLeafletPath = path.join(distPath, destDir, leafletPath),

		pdfjsPath = 'pdfjs/build/generic',
		srcPdfjsPath = path.join(depPath, pdfjsPath),
		distPdfjsPath = path.join(distPath, destDir, pdfjsPath),
		pdfjsWebName = 'web',
		pdfjsBuildName = 'build';

	grunt.config('copy', {
		stylesDist: {
			files: [{
				cwd: stylesDistPath,
				src: '**',
				dest: distStylesSubPath,
				expand: true
			}]
		},
		leaflet: {
			files: [{
				cwd: srcLeafletPath,
				src: ['dist/images/marker-*.png'],
				dest: distLeafletPath,
				expand: true
			}]
		},
		pdfjs: {
			files: [{
				cwd: path.join(srcPdfjsPath, pdfjsWebName),
				src: [
					'viewer*[^.map]', 'images/*', 'locale/locale.json',
					'locale/es-ES/*', 'locale/en-GB/*', 'locale/en-US/*'
				],
				dest: path.join(distPdfjsPath, pdfjsWebName),
				expand: true
			},{
				cwd: path.join(srcPdfjsPath, pdfjsBuildName),
				src: ['pdf.mjs', 'pdf.worker.mjs'],
				dest: path.join(distPdfjsPath, pdfjsBuildName),
				expand: true
			}]
		}
	});
};
