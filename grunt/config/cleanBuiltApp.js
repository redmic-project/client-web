module.exports = function(grunt) {

	var directoriesToDelete = [
		'alertify', 'awesome-markers', 'cbtree', 'd3Tip', 'dijit', 'dojo', 'dojox', 'deepmerge', 'dropzone',
		'handlebars', 'L-areaselect', 'L-coordinates', 'L-draw', 'L-miniMap', 'L-navBar', 'leaflet',
		'leaflet-nontiledlayer', 'mediatorjs', 'moment', 'uuid', 'proj4', 'pruneCluster', 'put-selector',
		'RWidgets', 'sockjs', 'stomp-websocket', 'src', 'templates', 'tv4', 'wicket'
	];

	var recursiveDirectoriesToDelete = [
		'nls'
	];

	var fileExtension = '.js',
		strippedSuffix = 'consoleStripped' + fileExtension,
		uncompressedSuffix = 'uncompressed' + fileExtension,
		strippedFiles = '*.' + strippedSuffix,
		uncompressedFiles = '*.' + uncompressedSuffix,

		filesToDelete = [strippedFiles, uncompressedFiles],
		filesToKeep = [
			'dojo/dojo.js', 'dojo/resources/blank.gif', 'dojox/widget/ColorPicker/images/*.png',
			'leaflet/dist/images/*.png', 'src/app/App.js'
		];

	var resourcesToClean = {
		filesToKeep: filesToKeep,
		directories: directoriesToDelete,
		recursiveDirectories: recursiveDirectoriesToDelete,
		files: filesToDelete
	};

	var path = require('path'),

		distPath = grunt.config('redmicConfig.distPath'),
		destDir = grunt.config('redmicConfig.destDir'),
		destPath = path.join(distPath, destDir, '/');

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
};
