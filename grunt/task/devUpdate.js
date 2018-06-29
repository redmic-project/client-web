module.exports = function(grunt) {

	grunt.registerTask('devUpdate',
		'Actualiza el proyecto (módulos incluidos) y coloca y construye los módulos propios en la rama actual',
		function() {

		grunt.config('shell.devUpdate', {
			options: {
				stdout: true
			},
			command: 'grunt update --ownModules'
		});

		grunt.task.run('shell:devUpdate');
	});
};
