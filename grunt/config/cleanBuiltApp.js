module.exports = function(grunt) {

	grunt.config('redmicConfig.cleanBuiltApp', {
		directoriesToClean: [
			'alertify', 'awesome-markers', 'cbtree', 'd3', 'd3Tip', 'deepmerge', 'dijit', 'dojo', 'dojox',
			'draggabilly', 'dropzone', 'handlebars', 'iso8601-js-period', 'json-schema-ref-parser', 'L-areaselect',
			'L-coordinates', 'L-draw', 'L-miniMap', 'L-navBar', 'L-timeDimension', 'leaflet', 'leaflet-nontiledlayer',
			'mediatorjs', 'moment', 'packery', 'proj4', 'pruneCluster', 'put-selector', 'RWidgets', 'sockjs',
			'stomp-websocket', 'templates', 'tv4', 'uuid', 'superset-sdk', 'wicket'
		],
		recursiveDirectoriesToClean: [
			'nls'
		],
		filesToKeep: [
			'dojo/dojo.js', 'dojo/resources/blank.gif', 'dojox/widget/ColorPicker/images/*.png',
			'leaflet/dist/images/*.png'
		],
		cleanSrcFileExceptions: [
			'App.js', '*[A-Za-z0-9]View.js', '_Edition.js', '*Form.html', '404.js', 'ActivateAccount.js',
			'NoSupportBrowser.js'
		]
	});
};
