module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath');

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
		tests: {
			options: {
				esversion: 6,
				ignores: ['tests/sockTest/*.js']
			},
			files: {
				src: ['tests/**/*.js']
			}
		},
		options: {
			laxcomma: true,
			expr: true,
			esversion: 3
		}
	});
};
