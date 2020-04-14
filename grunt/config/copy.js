module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		publicPath = srcPath.split('/')[0],
		resourcesPath = 'resources/**',
		stylesPath = publicPath + '/stylesheets',
		stylesDistPath = stylesPath + '/dist',
		distStylesSubPath = distPath + '/stylesheets',

		pdfjsPath = '/javascript/pdfjs/',
		pdfjsBuildPath = 'build/generic/',
		srcPdfjsPath = publicPath + pdfjsPath + pdfjsBuildPath,
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
		pdfjs: {
			files: [{
				cwd: srcPdfjsPath + pdfjsWebName,
				src: ['v*[^.map]', 'images/*', 'locale/es-ES/*', 'locale/en-GB/*'],
				dest: distPdfjsPath + pdfjsWebName,
				expand: true
			},{
				cwd: srcPdfjsPath + pdfjsBuildName,
				src: '*.js',
				dest: distPdfjsPath + pdfjsBuildName,
				expand: true
			}]
		}
	});
};
