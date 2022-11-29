module.exports = function(grunt) {

	var path = require('path'),

		srcPath = grunt.config('redmicConfig.srcPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		destDir = grunt.config('redmicConfig.destDir'),

		destPath = path.join(distPath, destDir, '/'),
		dojoConfigSrcPath = path.join(srcPath, 'dojoConfigBuild.js'),
		dojoConfigDestPath = path.join(destPath, 'dojoConfig.js'),
		filesObj = {};

	filesObj[dojoConfigDestPath] = dojoConfigSrcPath;

	grunt.config('uglify.dojoConfig', {
		files: [filesObj]
	});
};
