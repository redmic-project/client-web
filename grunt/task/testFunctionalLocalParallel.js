module.exports = function(grunt) {

	grunt.registerTask('test-functional-local-parallel',
		'Ejecuta los tests funcionales en entorno local de manera paralela',
		function() {

		grunt.task.run('shell:test-functional-local-parallel');
	});
};
