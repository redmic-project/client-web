module.exports = function(grunt) {

	grunt.registerTask('mergeToMaster',
		'Mezcla el proyecto desde la rama "pre" a la rama "master", y retorna a "dev"',
		function() {

		grunt.config('shell.mergeToMaster', {
			options: {
				stdout: true
			},
			command: [
				'git checkout master',
				'git branch -u origin/master',
				'grunt checkoutOwnModules --merge',
				'git pull',
				'grunt merge --branch=pre',
				'git checkout dev',
				'grunt checkoutOwnModules'
			].join('; ')
		});

		grunt.task.run('shell:mergeToMaster');
	});
};
