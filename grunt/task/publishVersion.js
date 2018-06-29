module.exports = function(grunt) {

	grunt.registerTask('publishVersion',
		'Publica nueva versión del proyecto y de los módulos propios (--ver=newVersion)',
		function() {

		var version = grunt.option('ver'),
			tagVersion = 'v' + version;

		if (!version) {
			console.log('Es necesario pasar el identificador de la nueva versión (--ver=newVersion)');
			return;
		}

		grunt.config('shell.editVersion', {
			options: {
				callback: function(err, stdout, stderr, cb) {

					err && console.error(stderr);
					cb();
				}
			},
			command: function() {

				return [
					'npm version ' + version,
					'git push'
				].join('&&');
			}
		});

		grunt.config('gitpush.publishVersion', {
			options: {
				verbose: true,
				branch: tagVersion
			}
		});

		var modules = grunt.config('redmicConfig.ownModules'),
			publishModuleCmd = 'grunt publishVersion --ver=' + version,
			cmds = [];

		for (var i = 0; i < modules.length; i++) {
			var modulePath = modules[i];
			cmds.push('cd ' + modulePath + '; ' + publishModuleCmd);
		}

		grunt.config('shell.publishModulesVersion', {
			options: {
				stdout: true
			},
			command: cmds.join('; cd -; ')
		});

		grunt.task.run(['shell:editVersion', 'gitpush:publishVersion', 'shell:publishModulesVersion']);
	});
};
