dojoConfig = {
	baseUrl: '/client-app',

	packages: [{
		name: 'src',
		location: 'src'
	},{
		name: 'test',
		location: 'test'
	},{
		name: 'app',
		location: 'src/oldapp'
	},{
		name: 'RWidgets',
		location: 'src/util/widgets'
	},{
		name: 'dojo',
		location: 'dep/dojo'
	},{
		name: 'dijit',
		location: 'dep/dijit'
	},{
		name: 'dojox',
		location: 'dep/dojox'
	},{
		name: 'put-selector',
		location: 'dep/put-selector'
	},{
		name: 'alertify',
		location: 'dep/alertify/build'
	},{
		name: 'dropzone',
		location: 'dep/dropzone/dist/min'
	},{
		name: 'leaflet',
		location: 'dep/leaflet/dist'
	},{
		name: 'L-draw',
		location: 'dep/leaflet-draw/dist'
	},{
		name: 'L-miniMap',
		location: 'dep/leaflet-minimap/dist'
	},{
		name: 'L-coordinates',
		location: 'dep/leaflet-coordinates/dist'
	},{
		name: 'L-navBar',
		location: 'dep/leaflet-nav'
	},{
		name: 'L-areaselect',
		location: 'dep/leaflet-areaselect/src'
	},{
		name: 'd3',
		location: 'dep/d3/dist'
	},{
		name: 'd3Tip',
		location: 'dep/d3-v6-tip/build'
	},{
		name: 'tv4',
		location: 'dep/tv4'
	},{
		name: 'mediatorjs',
		location: 'dep/mediatorjs'
	},{
		name: 'cbtree',
		location: 'dep/cbtree'
	},{
		name: 'proj4',
		location: 'dep/proj4/dist'
	},{
		name: 'handlebars',
		location: 'dep/handlebars/dist'
	},{
		name: 'awesome-markers',
		location: 'dep/leaflet.awesome-markers/dist'
	},{
		name: 'pruneCluster',
		location: 'dep/pruneCluster/dist'
	},{
		name: 'templates',
		location: 'dep/templates/dist'
	},{
		name: 'packery',
		location: 'dep/packery/dist'
	},{
		name: 'draggabilly',
		location: 'dep/draggabilly/dist'
	},{
		name: 'moment',
		location: 'dep/moment/min'
	},{
		name: 'leaflet-measure',
		location: 'dep/leaflet-measure/dist'
	},{
		name: 'sockjs',
		location: 'dep/sockjs/dist'
	},{
		name: 'stomp-websocket',
		location: 'dep/stomp-websocket/lib'
	},{
		name: 'deepmerge',
		location: 'dep/deepmerge/dist'
	},{
		name: 'colorjs',
		location: 'dep/color-js'
	},{
		name: 'uuid',
		location: 'dep/uuid/dist/umd'
	},{
		name: 'json-schema-ref-parser',
		location: 'dep/json-schema-ref-parser/dist'
	},{
		name: 'leaflet-nontiledlayer',
		location: 'dep/leaflet-nontiledlayer/dist'
	},{
		name: 'wicket',
		location: 'dep/wicket'
	}],

	map: {
		'd3Tip/d3-v6-tip.min': {
			'd3-selection': 'd3/d3.min'
		},
		'leaflet-nontiledlayer/NonTiledLayer': {
			'leaflet': 'leaflet/leaflet'
		},
		'L-miniMap/Control.MiniMap.min': {
			'leaflet': 'leaflet/leaflet'
		},
		'pruneCluster/PruneCluster.amd.min': {
			'leaflet': 'leaflet/leaflet'
		},
		'wicket': {
			'wicket': 'wicket/wicket.min'
		}
	},

	deps: ['leaflet/leaflet'],

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
