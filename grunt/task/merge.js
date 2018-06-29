module.exports = function(grunt) {

	grunt.registerTask('merge',
		['mergeOwnModules', 'mergeBranch']);
};
