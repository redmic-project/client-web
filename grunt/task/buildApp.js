module.exports = function(grunt) {

	grunt.registerTask('buildApp',
		'Construye los módulos de la aplicación con las herramientas de Dojo',
		function() {

		var path = require('path'),

			rootPath = grunt.config('redmicConfig.rootPath'),
			srcPath = grunt.config('redmicConfig.srcPath'),
			distPath = grunt.config('redmicConfig.distPath'),
			destDir = grunt.config('redmicConfig.destDir'),
			resourcesToClean = grunt.config('redmicConfig.resourcesToCleanInBuiltApp'),
			pkg = grunt.config('pkg'),
			destPath = path.join(distPath, destDir, '/');

		grunt.config('shell.buildApp', {
			options: {
				stdout: true
			},
			command: function() {

				var profile = pkg.dojoBuild,
					scriptPath = path.join(srcPath, 'dojo/dojo.js'),
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

		grunt.config('shell.cleanBuiltApp', {
			options: {
				stdout: true
			},
			command: function() {

				var filesToKeep = resourcesToClean.filesToKeep,
					directoriesToClean = resourcesToClean.directories,
					recursiveDirectoriesToClean = resourcesToClean.recursiveDirectories,
					filesToClean = resourcesToClean.files,

					keepFilesCmd = 'mv',
					createDirectoriesToRestoreFilesCmd = 'mkdir -p',
					restoreFilesCmds = [],
					cleanDirectoriesCmd = 'rm -rf',
					cleanRecursiveDirsCmd = 'find ' + destPath + ' -type d',
					cleanFilesCmd = 'find ' + destPath + ' -type f',
					i;

				for (i = 0; i < filesToKeep.length; i++) {
					var fileToKeep = filesToKeep[i],
						fileName = path.basename(fileToKeep),
						filePath = path.dirname(fileToKeep),
						absoluteFileName = path.join(destPath, fileToKeep),
						absoluteFilePath = path.join(destPath, filePath),
						absoluteTemporalFileName = path.join(destPath, fileName),
						restoreCmd = 'mv ' + absoluteTemporalFileName + ' ' + absoluteFilePath;

					keepFilesCmd += ' ' + absoluteFileName;
					createDirectoriesToRestoreFilesCmd += ' ' + absoluteFilePath;

					restoreFilesCmds.push(restoreCmd);
				}
				keepFilesCmd += ' ' + destPath;

				for (i = 0; i < directoriesToClean.length; i++) {
					var directory = directoriesToClean[i];

					cleanDirectoriesCmd += ' ' + destPath + directory;
				}

				var optionPrefix;
				for (i = 0; i < recursiveDirectoriesToClean.length; i++) {
					var recursiveDirectory = recursiveDirectoriesToClean[i];

					optionPrefix = (!i ? '' : ' -o');

					cleanRecursiveDirsCmd += optionPrefix + ' -name "' + recursiveDirectory + '" -exec rm -rf {} +';
				}

				for (i = 0; i < filesToClean.length; i++) {
					var file = filesToClean[i];

					optionPrefix = (!i ? '' : ' -o');

					cleanFilesCmd += optionPrefix + ' -name "' + file + '" -delete';
				}

				var appDir = destPath + 'app',
					cleanUnusedAppFilesCmd = 'find ' + appDir + ' -maxdepth 1 -type f -name "*.js" -delete';

				return [
					'echo "\nCleaning build and debug resources from built application at ' + destPath + '\n"',
					keepFilesCmd,
					cleanDirectoriesCmd,
					cleanRecursiveDirsCmd,
					createDirectoriesToRestoreFilesCmd,
					restoreFilesCmds.join('; '),
					cleanFilesCmd,
					cleanUnusedAppFilesCmd
				].join('; ');
			}
		});

		grunt.task.run(['shell:buildApp', 'shell:cleanBuiltApp', 'uglify:dojoConfig']);
	});
};
