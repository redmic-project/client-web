module.exports = function(grunt) {

	grunt.registerTask('packageApp',
		'Empaqueta la aplicación construida con todo lo necesario para distribución',
		function() {

		grunt.config('shell.packageApp', {
			options: {
				stdout: true
			},
			command: [
				'version=$(node -p "require(\'./package.json\').version")',
				'tar -acf dist-v$version.tar.gz dist/ views/ app/ package.json yarn.lock'
			].join('; ')
		});

		grunt.task.run(['shell:packageApp']);
	});
};
