dojoConfig = {
	locale: typeof lang !== 'undefined' ? lang : 'es',
	extraLocale: ['en'],

	packages: [{
		name: 'app',
		location: '../app'
	},{
		name: 'src',
		location: '../src'
	},{
		name: 'dojo',
		location: '../dojo'
	},{
		name: 'dojox',
		location: '../dojox'
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
	},{
		name: 'd3',
		location: '../d3'
	},{
		name: 'leaflet-measure',
		location: '../leaflet-measure'
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

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
