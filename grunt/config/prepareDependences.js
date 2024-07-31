module.exports = function(grunt) {

	grunt.config('shell.checkGlobalDependences', {
		options: {
			stdout: true
		},
		command: [
			'type yarn'
		].join(' && ')
	});

	grunt.config('shell.installDependences', {
		options: {
			stdout: true
		},
		command: [
			'yarn install --prod=false --ignore-optional --ignore-scripts'
		].join('; ')
	});
};
