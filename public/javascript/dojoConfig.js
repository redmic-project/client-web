dojoConfig = {
	packages: [{
		name: 'dojo',
		location: '../dojo'
	},{
		name: 'dijit',
		location: '../dijit'
	},{
		name: 'dojox',
		location: '../dojox'
	},{
		name: 'app',
		location: '../app'
	},{
		name: 'dstore',
		location: '../dstore'
	},{
		name: 'put-selector',
		location: '../put-selector'
	},{
		name: 'alertify',
		location: '../alertify/build'
	},{
		name: 'redmic',
		location: '../redmic'
	},{
		name: 'dropzone',
		location: '../dropzone/dist/min'
	},{
		name: 'leaflet',
		location: '../leaflet/dist'
	},{
		name: 'L-draw',
		location: '../leaflet-draw/dist'
	},{
		name: 'L-miniMap',
		location: '../leaflet-minimap/dist'
	},{
		name: 'L-coordinates',
		location: '../leaflet-coordinates/dist'
	},{
		name: 'L-navBar',
		location: '../leaflet-navbar/src'
	},{
		name: 'L-areaselect',
		location: '../leaflet-areaselect/src'
	},{
		name: 'd3',
		location: '../d3/dist'
	},{
		name: 'd3Tip',
		location: '../d3-tip'
	},{
		name: 'tv4',
		location: '../tv4'
	},{
		name: 'mediatorjs',
		location: '../mediatorjs'
	},{
		name: 'cbtree',
		location: '../cbtree'
	},{
		name: 'proj4js',
		location: '../proj4js/dist'
	},{
		name: 'RWidgets',
		location: '../redmic-widgets/src/app'
	},{
		name: 'handlebars',
		location: '../handlebars/dist'
	},{
		name: 'awesome-markers',
		location: '../leaflet-awesome-markers/dist'
	},{
		name: 'pruneCluster',
		location: '../pruneCluster/dist'
	},{
		name: 'templates',
		location: '../templates/dist'
	},{
		name: 'packery',
		location: '../packery/dist'
	},{
		name: 'draggabilly',
		location: '../draggabilly/dist'
	},{
		name: 'moment',
		location: '../moment/min'
	},{
		name: 'leaflet-measure',
		location: '../leaflet-measure/dist'
	},{
		name: 'sockjs',
		location: '../sockjs/dist'
	},{
		name: 'stompjs',
		location: '../stompjs/lib'
	},{
		name: 'deepmerge',
		location: '../deepmerge/dist'
	},{
		name: 'colorjs',
		location: '../color-js'
	},{
		name: 'node-uuid',
		location: '../node-uuid'
	},{
		name: 'json-schema-ref-parser',
		location: '../json-schema-ref-parser/dist'
	},{
		name: 'leaflet.nontiledlayer',
		location: '../leaflet.nontiledlayer/dist'
	},{
		name: 'wicket',
		location: '../wicket'
	}],

	map: {
		'd3Tip/index': {
			'd3': 'd3/d3.min'
		},
		'leaflet.nontiledlayer/NonTiledLayer': {
			'leaflet': 'leaflet/leaflet'
		},
		'L-miniMap/Control.MiniMap.min': {
			'leaflet': 'leaflet/leaflet'
		},
		'pruneCluster/PruneCluster.amd.min': {
			'leaflet': 'leaflet/leaflet'
		},
		'wicket': {
			'wicket': 'wicket/wicket'
		}
	},

	deps: ['leaflet/leaflet'],

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
