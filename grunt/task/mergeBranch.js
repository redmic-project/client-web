module.exports = function(grunt) {

	grunt.registerTask('mergeBranch',
		'Mezcla desde la rama indicada hacia la actual',
		function() {

		var branch = grunt.option('branch');

		if (!branch) {
			console.log('Es necesario indicar la rama a mezclar (--branch=<branchName>)');
			return;
		}

		grunt.config('shell.mergeBranch', {
			options: {
				stdout: true,
				callback: function(err, stdout, stderr, cb) {

					if (err) {
						cb(err);
						return;
					}

					var modules = grunt.config('redmicConfig.ownModules'),
						currentBranch = grunt.option('currentBranch');

					grunt.config('gitreset.mergeBranch', {
						options: {
							verbose: true,
							mode: 'hard',
							commit: 'origin/' + currentBranch
						}
					});

					grunt.config('gitmerge.mergeBranch', {
						options: {
							verbose: true,
							branch: branch,
							noff: true,
							noEdit: true
						}
					});

					grunt.config('gitadd.mergeBranch', {
						options: {
							verbose: true
						},
						files: {
							src: modules
						}
					});

					grunt.config('gitcommit.mergeBranch', {
						options: {
							verbose: true,
							message: 'Actualiza módulos'
						}
					});

					grunt.config('gitpush.mergeBranch', {
						options: {
							verbose: true
						}
					});

					grunt.task.run(['gitreset:mergeBranch', 'force:gitmerge:mergeBranch', 'gitadd:mergeBranch',
						'force:gitcommit:mergeBranch', 'gitpush:mergeBranch']);

					cb();
				}
			},
			command: ':'
		});

		grunt.task.run(['shell:getCurrentBranch', 'shell:mergeBranch']);
	});
};
