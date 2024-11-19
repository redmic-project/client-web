module.exports = function(grunt) {

	var path = require('path'),

		rootPath = grunt.config('redmicConfig.rootPath'),
		depPath = grunt.config('redmicConfig.depPath'),
		distPath = grunt.config('redmicConfig.distPath'),
		pkg = grunt.config('pkg');

	grunt.config('shell.buildApp', {
		options: {
			stdout: true
		},
		command: function() {

			var profile = pkg.dojoBuild,
				scriptPath = path.join(depPath, 'dojo/dojo.js'),
				releaseDir = path.join(rootPath, distPath),
				nodeParams = ' --optimize_for_size --max_old_space_size=3000 --gc_interval=100 ',
				buildParams = ' load=build --profile "' + profile + '" --releaseDir "' + releaseDir + '"';

			return [
				'echo "\nBuilding application with ' + profile + ' to ' + releaseDir + '\n"',
				'node' + nodeParams + scriptPath + buildParams,
				'echo "\nBuild complete"'
			].join('; ');
		}
	});
};
