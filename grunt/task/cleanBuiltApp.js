module.exports = function(grunt) {

	var path = require('path'),

		distPath = grunt.config('redmicConfig.distPath'),
		destDir = grunt.config('redmicConfig.destDir'),
		destPath = path.join(distPath, destDir, '/'),

		cleanBuiltAppConfig = grunt.config('redmicConfig.cleanBuiltApp');

	var getKeepAndRestoreFilesCmds = function(files) {

		var mkdirCmd = 'mkdir -p',
			createDirectoriesToKeepFilesCmd = mkdirCmd,
			createDirectoriesToRestoreFilesCmd = mkdirCmd,
			keepFilesCmds = [],
			restoreFilesCmds = [],
			temporalBasePath = path.join(destPath, '.temp'),
			cleanTemporalPathCmd = 'rm -r ' + temporalBasePath;

		for (var i = 0; i < files.length; i++) {
			var fileToKeep = files[i],
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

		keepFilesCmds.unshift(createDirectoriesToKeepFilesCmd);

		restoreFilesCmds.unshift(createDirectoriesToRestoreFilesCmd);
		restoreFilesCmds.push(cleanTemporalPathCmd);

		return {
			keepFilesCmds: keepFilesCmds.join('; '),
			restoreFilesCmds: restoreFilesCmds.join('; ')
		};
	};

	var getCleanDirectoriesCmd = function(dirs) {

		var cleanDirectoriesCmd = 'rm -rf';

		for (var i = 0; i < dirs.length; i++) {
			cleanDirectoriesCmd += ' ' + destPath + dirs[i];
		}

		return cleanDirectoriesCmd;
	};

	var getCleanRecursiveDirectoriesCmd = function(dirs) {

		var cleanRecursiveDirsCmd = 'find ' + destPath + ' -type d';

		for (var i = 0; i < dirs.length; i++) {
			cleanRecursiveDirsCmd += (i === 0 ? '' : ' -o') + ' -name "' + dirs[i] + '" -exec rm -rf {} +';
		}

		return cleanRecursiveDirsCmd;
	};

	// TODO desaparecerá cuando todo vaya por src/
	var oldGetCleanAppFilesCmds = function() {

		var fileExtension = '.js',
			strippedSuffix = 'consoleStripped' + fileExtension,
			uncompressedSuffix = 'uncompressed' + fileExtension,
			strippedFiles = '*.' + strippedSuffix,
			uncompressedFiles = '*.' + uncompressedSuffix,
			filesToClean = [strippedFiles, uncompressedFiles];

		var cleanAppFilesCmd = 'find ' + path.join(destPath, 'app', '/') + ' -type f';

		for (var j = 0; j < filesToClean.length; j++) {
			cleanAppFilesCmd += (j === 0 ? '' : ' -o') + ' -name "' + filesToClean[j] + '" -delete';
		}

		return cleanAppFilesCmd;
	};

	// TODO desaparecerá cuando todo vaya por src/
	var getCleanAppFilesCmds = function(fileExceptions) {

		var appDir = path.join(destPath, 'app', '/'),
			cleanAppFilesCmd = 'find ' + appDir + ' -type f';

		for (var i = 0; i < fileExceptions.length; i++) {
			cleanAppFilesCmd += ' \! -name "' + fileExceptions[i] + '"';
		}

		cleanAppFilesCmd += ' -delete';

		return cleanAppFilesCmd;
	};

	var getCleanSrcFilesCmds = function(fileExceptions) {

		var srcDir = path.join(destPath, 'src', '/'),
			cleanSrcFilesCmd = 'find ' + srcDir + ' -type f';

		for (var i = 0; i < fileExceptions.length; i++) {
			cleanSrcFilesCmd += ' \! -name "' + fileExceptions[i] + '"';
		}

		cleanSrcFilesCmd += ' -delete';

		return cleanSrcFilesCmd;
	};

	getCleanEmptyDirectoriesCmds = function() {

		var cleanEmptyDirsCmd = 'find ' + destPath + ' -type d -empty -delete';

		return cleanEmptyDirsCmd;
	};

	grunt.config('shell.cleanBuiltApp', {
		options: {
			stdout: true
		},
		command: function() {

			var keepAndRestoreCmds = getKeepAndRestoreFilesCmds(cleanBuiltAppConfig.filesToKeep);

			return [
				'echo "\nCleaning build and debug resources from built application at ' + destPath + '\n"',
				keepAndRestoreCmds.keepFilesCmds,
				getCleanDirectoriesCmd(cleanBuiltAppConfig.directoriesToClean),
				getCleanRecursiveDirectoriesCmd(cleanBuiltAppConfig.recursiveDirectoriesToClean),
				keepAndRestoreCmds.restoreFilesCmds,
				//oldGetCleanAppFilesCmds(),
				getCleanAppFilesCmds(cleanBuiltAppConfig.cleanSrcFileExceptions),
				getCleanSrcFilesCmds(cleanBuiltAppConfig.cleanSrcFileExceptions),
				getCleanEmptyDirectoriesCmds()
			].join('; ');
		}
	});
};
