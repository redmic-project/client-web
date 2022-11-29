module.exports = function(grunt) {

	grunt.registerTask('build',
		['buildStyles', 'copy:resources', 'copy:pdfjs', 'buildApp', 'packageApp']);
};
