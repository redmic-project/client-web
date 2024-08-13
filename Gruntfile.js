module.exports = function(grunt) {

	var glob = require('glob'),
		path = require('path'),
		loadGruntTasks = require('load-grunt-tasks');

	// Lee todas dependencias que aportan tareas y las carga
	loadGruntTasks(grunt, {
		pattern: ['grunt-*', '@*/grunt-*', 'intern']
	});

	grunt.initConfig({
		redmicConfig: {
			rootPath: __dirname,
			srcPath: 'client-app/src',
			depPath: 'client-app/dep',
			testPath: 'client-app/test',
			distPath: 'dist',
			destDir: 'js'
		},
		pkg: grunt.file.readJSON('package.json')
	});

	// Lee los ficheros con configuraciones para las tareas a ejecutar (propias o de terceros)
	glob.globSync('./grunt/config/*.js').forEach(function(file) {

		require(path.resolve(file))(grunt);
	});

	// Lee los ficheros con las tareas propias a ejecutar
	grunt.loadTasks('./grunt/task');

	grunt.registerTask('default', ['preBuild', 'build']);
};
