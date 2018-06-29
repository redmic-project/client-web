module.exports = function(grunt) {

	grunt.registerTask('fastUpdate',
		'Actualiza el proyecto (módulos incluidos), construye lo mínimo indispensable y coloca los módulos propios en la rama actual',
		function() {

		grunt.config('gitpull.fastUpdate', {
			options: {
				verbose: true
			}
		});

		grunt.config('shell.fastUpdate', {
			options: {
				stdout: true
			},
			command: [
				'grunt buildModules --module=public/javascript/templates'/*,
				'grunt checkoutOwnModules --merge'*/ // TODO borrar en caso de no echar de menos, producía fallos
			].join('; ')
		});

		grunt.task.run(['gitpull:fastUpdate', 'updateModules', 'shell:fastUpdate']);
	});
};
