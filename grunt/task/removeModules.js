module.exports = function(grunt) {

	grunt.registerTask('removeModules',
		'Elimina los submódulos git del proyecto ("--module=moduleId" para uno concreto)',
		function() {

		var module = grunt.option('module');

		grunt.config('shell.removeModules', {
			options: {
				stdout: true
			},
			command: function() {

				var cmd = 'scripts/removeModules.sh';

				if (module) {
					cmd += ' ' + module;
				}

				return cmd;
			}
		});

		grunt.task.run('shell:removeModules');
	});
};
