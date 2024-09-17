module.exports = function(grunt) {

	grunt.config('redmicConfig.cleanBuiltApp', {
		directoriesToClean: [
			'alertify', 'awesome-markers', 'cbtree', 'd3Tip', 'dijit', 'dojo', 'dojox', 'deepmerge', 'dropzone',
			'handlebars', 'L-areaselect', 'L-coordinates', 'L-draw', 'L-miniMap', 'L-navBar', 'leaflet',
			'leaflet-nontiledlayer', 'mediatorjs', 'moment', 'uuid', 'proj4', 'pruneCluster', 'put-selector',
			'RWidgets', 'sockjs', 'stomp-websocket', 'templates', 'tv4', 'wicket'
		],
		recursiveDirectoriesToClean: [
			'nls'
		],
		filesToKeep: [
			'dojo/dojo.js', 'dojo/resources/blank.gif', 'dojox/widget/ColorPicker/images/*.png',
			'leaflet/dist/images/*.png'
		],
		cleanSrcFileExceptions: [
			'App.js', '*View.js', '*Form.html', '404.js', 'ActivateAccount.js', 'NoSupportBrowser.js'
		]
	});
};
