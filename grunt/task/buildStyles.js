module.exports = function(grunt) {

	grunt.registerTask('buildStyles',
		'Manda a construir el módulo de estilos y recoge el resultado',
		function() {

		var srcPath = grunt.config('redmicConfig.srcPath'),
			publicPath = srcPath.split('/')[0],
			stylesPath = publicPath + '/style';

		grunt.config('shell.buildStyles', {
			options: {
				stdout: true
			},
			command: function() {

				return [
					'cd ' + stylesPath,
					'grunt'
				].join('; ');
			}
		});

		grunt.task.run(['shell:buildStyles', 'copy:stylesDist']);
	});
};
