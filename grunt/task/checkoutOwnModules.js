module.exports = function(grunt) {

	grunt.registerTask('checkoutOwnModules',
		'Mueve los submódulos git especificados a la rama definida para cada uno',
		function() {

		var modules = grunt.config('redmicConfig.ownModules'),
			mergeFlag = grunt.option('merge'),
			subTasks = [];

		for (var i = 0; i < modules.length; i++) {
			var module = modules[i],
				taskId = 'checkoutOwnModules-' + module;

			grunt.config('shell.' + taskId, {
				options: {
					stdout: true
				},
				command: [
					'branch=$(git config -f .gitmodules submodule.' + module + '.branch || echo master)',
					'cd ' + module,
					'git fetch -t',
					'git checkout $branch',
					mergeFlag ? 'git merge FETCH_HEAD' : ':',
					'cd -'
				].join('; ')
			});

			subTasks.push('shell:' + taskId);
		}

		grunt.task.run(subTasks);
	});
};
