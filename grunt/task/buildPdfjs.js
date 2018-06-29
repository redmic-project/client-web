module.exports = function(grunt) {

	grunt.registerTask('buildPdfjs', 'Añade pdfjs al compilado', function() {

		grunt.task.run(['copy:pdfjs', 'uglify:pdfjs']);
	});
};
