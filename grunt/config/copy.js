module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		publicPath = srcPath.split('/')[0],

		resourcesPath = 'resources/**',

		stylesPath = publicPath + '/stylesheets',
		stylesDistPath = stylesPath + '/dist',
		distStylesSubPath = distPath + '/stylesheets',

		leafletPath = '/javascript/leaflet/',
		srcLeafletPath = publicPath + leafletPath,
		distLeafletPath = distPath + leafletPath,

		pdfjsPath = '/javascript/pdfjs/',
		srcPdfjsPath = publicPath + pdfjsPath,
		distPdfjsPath = distPath + pdfjsPath,
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
				cwd: srcPdfjsPath + pdfjsWebName,
				src: ['v*[^.map]', 'pdf.viewer.js', 'images/*', 'locale/es-ES/*', 'locale/en-GB/*'],
				dest: distPdfjsPath + pdfjsWebName,
				expand: true
			},{
				cwd: srcPdfjsPath + pdfjsBuildName,
				src: 'pdf.worker.js',
				dest: distPdfjsPath + pdfjsBuildName,
				expand: true
			}]
		}
	});
};
