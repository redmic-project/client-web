module.exports = function(grunt) {

	grunt.registerTask('preBuild',
		['addModules', 'buildModules', 'jshint']);
};
