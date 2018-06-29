module.exports = function(grunt) {

	grunt.registerTask('buildModules',
		'Construye los submódulos git especificados con los comandos definidos para cada uno ("--module=moduleId" para uno concreto, "--ownModules" para omitir módulos de terceros)',
		function() {

		var modulesToBuild = grunt.config('redmicConfig.buildModules'),
			ownModules = grunt.config('redmicConfig.ownModules'),
			ownModulesFlag = grunt.option('ownModules'),
			moduleOption = grunt.option('module'),
			getCmd = function(args) {

				var module = args.modulePath,
					cmds = args.moduleCmds,
					firstCmd = 'cd ' + module,
					lastCmd = 'cd -';

				cmds.unshift(firstCmd);
				cmds.push(lastCmd);

				return cmds.join('; ');
			},
			subTasks = [];

		for (var modulePath in modulesToBuild) {
			if (moduleOption) {
				if (moduleOption !== modulePath) {
					continue;
				}
			} else if (ownModulesFlag && ownModules.indexOf(modulePath) === -1) {
				continue;
			}

			var moduleCmds = modulesToBuild[modulePath],
				taskId = 'buildModules-' + modulePath;

			grunt.config('shell.' + taskId, {
				options: {
					stdout: true
				},
				command: getCmd.bind(null, {
					modulePath: modulePath,
					moduleCmds: moduleCmds
				})
			});

			subTasks.push('shell:' + taskId);
		}

		grunt.task.run(subTasks);
	});
};
