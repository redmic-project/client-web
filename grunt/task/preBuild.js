module.exports = function(grunt) {

	grunt.registerTask('preBuild',
		['prepareDependences', 'addModules', 'buildModules', 'jshint']);
};
