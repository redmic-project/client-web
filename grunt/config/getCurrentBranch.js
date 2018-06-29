module.exports = function(grunt) {

	grunt.config('shell.getCurrentBranch', {
		options: {
			stdout: true,
			callback: function(err, stdout, stderr, cb) {

				if (err) {
					cb(err);
					return;
				}

				var currentBranch = stdout.trim();
				grunt.option('currentBranch', currentBranch);

				cb();
			}
		},
		command: 'git symbolic-ref --short HEAD'
	});
};
