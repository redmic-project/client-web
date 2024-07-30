module.exports = function(grunt) {

	grunt.registerTask('prepareDependences',
		'Comprueba, limpia e instala las dependencias del proyecto',
		function() {

		grunt.task.run(['shell:checkGlobalDependences', 'shell:installDependences']);
	});
};
