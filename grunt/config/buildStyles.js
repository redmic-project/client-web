module.exports = function(grunt) {

	var srcPath = grunt.config('redmicConfig.srcPath'),
		publicPath = srcPath.split('/')[0],
		stylesPath = publicPath + '/style';

	grunt.config('shell.buildStyles', {
		options: {
			stdout: true
		},
		command: function() {

			return [
				'cd ' + stylesPath,
				'grunt'
			].join('; ');
		}
	});
};
