module.exports = function(grunt) {

	grunt.registerTask('buildStyles',
		'Manda a construir el módulo de estilos y recoge el resultado',
		function() {

		grunt.task.run(['shell:buildStyles', 'copy:stylesDist']);
	});
};
