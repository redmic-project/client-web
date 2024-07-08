module.exports = function(grunt) {

	grunt.registerTask('build',
		['buildStyles', 'copy:resources', 'copy:leaflet', 'copy:pdfjs', 'buildApp', 'packageApp']);
};
