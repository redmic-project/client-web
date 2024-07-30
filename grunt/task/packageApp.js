module.exports = function(grunt) {

	grunt.registerTask('packageApp',
		'Empaqueta la aplicación construida con todo lo necesario para distribución',
		function() {

		grunt.config('shell.packageApp', {
			options: {
				stdout: true
			},
			command: 'npm pack'
		});

		grunt.task.run(['shell:packageApp']);
	});
};
