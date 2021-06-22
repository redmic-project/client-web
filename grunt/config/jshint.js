module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath');

	grunt.config('jshint', {
		src: {
			options: {
				ignores: ['public/javascript/redmic/store/util/SimpleQueryEngine.js']
			},
			files: {
				src: [
					srcPath + '/app/**/*.js'
					, srcPath + '/redmic/**/*.js'
					, 'app/**/*.js'
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
			esversion: 6
		}
	});
};
