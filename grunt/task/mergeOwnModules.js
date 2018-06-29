module.exports = function(grunt) {

	grunt.registerTask('mergeOwnModules',
		'Mezcla los submódulos git especificados desde la rama indicada hacia la actual',
		function() {

		var branch = grunt.option('branch');

		if (!branch) {
			console.log('Es necesario indicar la rama a mezclar (--branch=<branchName>)');
			return;
		}

		grunt.config('shell.mergeOwnModules', {
			options: {
				stdout: true,
				callback: function(err, stdout, stderr, cb) {

					if (err) {
						cb(err);
						return;
					}

					var modules = grunt.config('redmicConfig.ownModules'),
						currentBranch = grunt.option('currentBranch'),
						subTasks = [];

					for (var i = 0; i < modules.length; i++) {
						var module = modules[i],
							taskId = 'mergeOwnModules-' + module;

						grunt.config('gitpull.' + taskId, {
							options: {
								verbose: true,
								cwd: module
							}
						});

						grunt.config('gitreset.' + taskId, {
							options: {
								verbose: true,
								cwd: module,
								mode: 'hard',
								commit: 'origin/' + currentBranch
							}
						});

						grunt.config('gitmerge.' + taskId, {
							options: {
								verbose: true,
								cwd: module,
								branch: branch,
								noff: true,
								noEdit: true
							}
						});

						grunt.config('gitpush.' + taskId, {
							options: {
								verbose: true,
								cwd: module
							}
						});

						subTasks.push('gitpull:' + taskId, 'gitreset:' + taskId, 'gitmerge:' + taskId,
							'gitpush:' + taskId);
					}

					grunt.task.run(subTasks);

					cb();
				}
			},
			command: ':'
		});

		grunt.task.run(['shell:getCurrentBranch', 'shell:mergeOwnModules']);
	});
};
