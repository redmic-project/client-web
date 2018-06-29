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

	var pdfPath = path.join(destPath, 'pdfjs/'),
		pdfWebPath = pdfPath + 'web/',
		pdfBuiltPath = pdfPath + 'build/',
		pdfFilePath = pdfBuiltPath + 'pdf.js',
		pdfWorkerFilePath = pdfBuiltPath + 'pdf.worker.js',
		pdfViewerFilePath = pdfWebPath + 'viewer.js',
		filesPdfObj = {};

	filesPdfObj[pdfFilePath] = pdfFilePath;
	filesPdfObj[pdfWorkerFilePath] = pdfWorkerFilePath;
	filesPdfObj[pdfViewerFilePath] = pdfViewerFilePath;

	grunt.config('uglify.pdfjs', {
		files: [filesPdfObj]
	});
};
