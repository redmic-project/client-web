module.exports = function(grunt) {

	grunt.registerTask('prepareDependences',
		'Comprueba, limpia e instala las dependencias del proyecto',
		function() {

		grunt.config('shell.checkGlobalDependences', {
			options: {
				stdout: true
			},
			command: [
				'type yarn'
			].join(' && ')
		});

		grunt.config('shell.installDependences', {
			options: {
				stdout: true
			},
			command: [
				'yarn install --prod=false'
			].join('; ')
		});

		grunt.task.run(['shell:checkGlobalDependences', 'shell:installDependences']);
	});
};
