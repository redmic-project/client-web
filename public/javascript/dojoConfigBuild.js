dojoConfig = {
	locale: typeof lang !== 'undefined' ? lang : 'es',
	extraLocale: ['en'],

	packages: [{
		name: 'dojo',
		location: '../dojo'
	},{
		name: 'dojox',
		location: '../dojox'
	},{
		name: 'app',
		location: '../app'
	},{
		name: 'json-schema-ref-parser',
		location: '../json-schema-ref-parser'
	},{
		name: 'packery',
		location: '../packery'
	},{
		name: 'draggabilly',
		location: '../draggabilly'
	},{
		name: 'colorjs',
		location: '../colorjs'
	}],

	map: {
		'd3Tip/index': {
			'd3-collection': 'd3/d3.min',
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
			'wicket': 'wicket/wicket'
		}
	},

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
