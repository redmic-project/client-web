module.exports = function(grunt) {

	var path = require('path'),

		srcPath = grunt.config('redmicConfig.srcPath'),
		depsPath = grunt.config('redmicConfig.depsPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		destDir = grunt.config('redmicConfig.destDir'),
		publicPath = srcPath.split('/')[0],

		resourcesPath = 'resources/**',

		stylesPath = publicPath + '/style',
		stylesDistPath = stylesPath + '/dist',
		distStylesSubPath = distPath + '/style',

		leafletPath = 'leaflet',
		srcLeafletPath = path.join(depsPath, leafletPath),
		distLeafletPath = path.join(distPath, destDir, leafletPath),

		pdfjsPath = 'pdfjs',
		srcPdfjsPath = path.join(depsPath, pdfjsPath),
		distPdfjsPath = path.join(distPath, destDir, pdfjsPath),
		pdfjsWebName = 'web',
		pdfjsBuildName = 'build';

	grunt.config('copy', {
		resources: {
			files: [{
				cwd: publicPath,
				src: resourcesPath,
				dest: distPath + '/',
				expand: true
			}]
		},
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
				src: ['v*[^.map]', 'pdf.viewer.js', 'images/*', 'locale/es-ES/*', 'locale/en-GB/*'],
				dest: path.join(distPdfjsPath, pdfjsWebName),
				expand: true
			},{
				cwd: path.join(srcPdfjsPath, pdfjsBuildName),
				src: 'pdf.worker.js',
				dest: path.join(distPdfjsPath, pdfjsBuildName),
				expand: true
			}]
		}
	});
};
