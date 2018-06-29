module.exports = function(grunt) {

	grunt.registerTask('build',
		['buildStyles', 'copy:resources', 'buildPdfjs', 'buildApp', 'packageApp']);
};
