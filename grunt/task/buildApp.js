module.exports = function(grunt) {

	grunt.registerTask('buildApp',
		'Construye los módulos de la aplicación con las herramientas de Dojo',
		function() {

		var path = require('path'),

			rootPath = grunt.config('redmicConfig.rootPath'),
			depPath = grunt.config('redmicConfig.depPath'),
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

		grunt.config('shell.cleanBuiltApp', {
			options: {
				stdout: true
			},
			command: function() {

				var filesToKeep = resourcesToClean.filesToKeep,
					directoriesToClean = resourcesToClean.directories,
					recursiveDirectoriesToClean = resourcesToClean.recursiveDirectories,
					filesToClean = resourcesToClean.files,

					createDirectoriesToKeepFilesCmd = 'mkdir -p',
					createDirectoriesToRestoreFilesCmd = 'mkdir -p',
					keepFilesCmds = [],
					restoreFilesCmds = [],
					cleanDirectoriesCmd = 'rm -rf',
					cleanRecursiveDirsCmd = 'find ' + destPath + ' -type d',
					cleanFilesCmd = 'find ' + destPath + ' -type f',
					temporalBasePath = path.join(destPath, '.temp'),
					i;

				for (i = 0; i < filesToKeep.length; i++) {
					var fileToKeep = filesToKeep[i],
						fileName = path.basename(fileToKeep),
						filePath = path.dirname(fileToKeep),
						absoluteFileName = path.join(destPath, fileToKeep),
						absoluteFilePath = path.join(destPath, filePath);

					createDirectoriesToRestoreFilesCmd += ' ' + absoluteFilePath;

					var absoluteTemporalPath = path.join(temporalBasePath, i.toString(), filePath),
						absoluteTemporalFileName = path.join(absoluteTemporalPath, fileName);

					createDirectoriesToKeepFilesCmd += ' ' + absoluteTemporalPath;

					var keepCmd = 'mv ' + absoluteFileName + ' ' + absoluteTemporalPath,
						restoreCmd = 'mv ' + absoluteTemporalFileName + ' ' + absoluteFilePath;

					keepFilesCmds.push(keepCmd);
					restoreFilesCmds.push(restoreCmd);
				}

				restoreFilesCmds.push('rm -r ' + temporalBasePath);

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
					createDirectoriesToKeepFilesCmd,
					keepFilesCmds.join('; '),
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
