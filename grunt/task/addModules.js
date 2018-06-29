module.exports = function(grunt) {

	grunt.registerTask('addModules',
		'Añade los submódulos git del proyecto',
		function() {

		grunt.config('shell.addModules', {
			options: {
				stdout: true
			},
			command: function() {

				return 'scripts/addModules.sh';
			}
		});

		grunt.task.run('shell:addModules');
	});
};
