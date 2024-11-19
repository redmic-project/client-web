module.exports = function(grunt) {

	grunt.registerTask('build',
		['clean:build', 'buildStyles', 'copy:leaflet', 'copy:pdfjs', 'buildApp']);
};
