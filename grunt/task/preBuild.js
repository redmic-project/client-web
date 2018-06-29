module.exports = function(grunt) {

	grunt.registerTask('preBuild',
		['prepareDependences', 'clean:build', 'addModules', 'buildModules', 'jshint']);
};
