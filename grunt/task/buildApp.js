module.exports = function(grunt) {

	grunt.registerTask('buildApp',
		'Construye los módulos de la aplicación con las herramientas de Dojo',
		function() {

		grunt.task.run(['shell:buildApp', 'shell:cleanBuiltApp', 'uglify:dojoConfig']);
	});
};
