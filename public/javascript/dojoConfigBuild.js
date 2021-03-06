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
			'd3': 'd3/d3.min'
		},
		'leaflet-wms/leaflet.wms': {
			'leaflet': 'leaflet/leaflet'
		},
		'L-miniMap/Control.MiniMap.min': {
			'leaflet': 'leaflet/leaflet'
		},
		'pruneCluster/PruneCluster.amd.min': {
			'leaflet': 'leaflet/leaflet'
		}
	},

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
