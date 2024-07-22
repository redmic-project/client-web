module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath'),
		testPath = grunt.config('redmicConfig.testPath');

	grunt.config('jshint', {
		src: {
			options: {
				esversion: 6
			},
			files: {
				src: [
					srcPath + '/**/*.js'
					, 'server-app/**/*.js'
					, 'grunt/**/*.js'
					, '*.js'
				]
			}
		},
		test: {
			options: {
				esversion: 6,
				ignores: [testPath + '/sockTest/*.js']
			},
			files: {
				src: [testPath + '/**/*.js']
			}
		},
		options: {
			laxcomma: true,
			expr: true,
			esversion: 3
		}
	});
};
