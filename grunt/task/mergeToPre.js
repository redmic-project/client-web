module.exports = function(grunt) {

	grunt.registerTask('mergeToPre',
		'Mezcla el proyecto desde la rama "dev" a la rama "pre", y retorna a "dev"',
		function() {

		grunt.config('shell.mergeToPre', {
			options: {
				stdout: true
			},
			command: [
				'git checkout pre',
				'git branch -u origin/pre',
				'grunt checkoutOwnModules --merge',
				'git pull',
				'grunt merge --branch=dev',
				'git checkout dev',
				'grunt checkoutOwnModules'
			].join('; ')
		});

		grunt.task.run('shell:mergeToPre');
	});
};
