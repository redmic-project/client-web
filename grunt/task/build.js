module.exports = function(grunt) {

	grunt.registerTask('build',
		['clean:build', 'buildStyles', 'copy:resources', 'copy:leaflet', 'copy:pdfjs', 'buildApp']);
};
