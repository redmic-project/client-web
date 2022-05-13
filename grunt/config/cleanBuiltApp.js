module.exports = function(grunt) {

	var directoriesToDelete = [
		'alertify', 'awesome-markers', 'cbtree', 'd3Tip', 'dijit', 'dojo', 'dojox', 'deepmerge', 'dropzone',
		'handlebars', 'L-areaselect', 'L-coordinates', 'L-draw', 'L-miniMap', 'L-navBar', 'leaflet',
		'leaflet-measure', 'leaflet-nontiledlayer', 'mediatorjs', 'moment', 'uuid', 'proj4js', 'pruneCluster',
		'put-selector', 'redmic', 'RWidgets', 'sockjs', 'stomp-websocket', 'templates', 'tv4', 'wicket'
	];

	var recursiveDirectoriesToDelete = [
		'nls'
	];

	var fileExtension = '.js',
		strippedSuffix = 'consoleStripped' + fileExtension,
		uncompressedSuffix = 'uncompressed' + fileExtension,
		strippedFiles = '*.' + strippedSuffix,
		uncompressedFiles = '*.' + uncompressedSuffix,

		filesToDelete = [strippedFiles, uncompressedFiles, 'build-report.txt'],
		filesToKeep = ['dojo/dojo.js', 'dojo/resources/blank.gif', 'dojox/widget/ColorPicker/images/*.png'];

	grunt.config('redmicConfig.resourcesToCleanInBuiltApp', {
		filesToKeep: filesToKeep,
		directories: directoriesToDelete,
		recursiveDirectories: recursiveDirectoriesToDelete,
		files: filesToDelete
	});
};
