module.exports = function(grunt) {

	grunt.registerTask('update',
		'Actualiza el proyecto (módulos incluidos), construye módulos y coloca los módulos propios en la rama actual',
		function() {

		grunt.config('shell.update', {
			options: {
				stdout: true,
				callback: function(err, stdout, stderr, cb) {

					if (err) {
						cb(err);
						return;
					}

					var currentBranch = grunt.option('currentBranch');

					grunt.config('shell.setUpstream', {
						options: {
							stdout: true
						},
						command: 'git branch -u origin/' + currentBranch
					});

					grunt.config('gitpull.update', {
						options: {
							verbose: true
						}
					});

					grunt.config('shell.checkoutOwnModulesWithMerge', {
						options: {
							stdout: true
						},
						command: 'grunt checkoutOwnModules --merge'
					});

					grunt.task.run(['shell:setUpstream', 'gitpull:update', 'prepareDependences', 'addModules',
						'updateModules', 'shell:checkoutOwnModulesWithMerge', 'buildModules']);

					cb();
				}
			},
			command: ':'
		});

		grunt.task.run(['shell:getCurrentBranch', 'shell:update']);
	});
};
