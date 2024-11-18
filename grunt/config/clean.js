module.exports = function(grunt) {

	var distPath = grunt.config('redmicConfig.distPath');

	grunt.config('clean', {
		build: [distPath],
		test: ['test_reports']
	});
};
