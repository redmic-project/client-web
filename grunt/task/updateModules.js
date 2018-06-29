module.exports = function(grunt) {

	grunt.registerTask('updateModules',
		'Actualiza los submódulos git del proyecto ("--remote" para buscar nuevas versiones, "--module=moduleId" para uno concreto)',
		function() {

		var module = grunt.option('module'),
			remote = grunt.option('remote');

		grunt.config('shell.updateModules', {
			options: {
				stdout: true
			},
			command: function() {

				var cmd = 'scripts/updateModules.sh';

				if (remote) {
					cmd += ' remote';
				}

				if (module) {
					cmd += ' ' + module;
				}

				return cmd;
			}
		});

		grunt.task.run('shell:updateModules');
	});
};
