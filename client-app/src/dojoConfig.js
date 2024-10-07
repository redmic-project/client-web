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
		location: 'dep/put-selector',
		main: 'put'
	},{
		name: 'alertify',
		location: 'dep/alertify/build',
		main: 'alertify.min'
	},{
		name: 'dropzone',
		location: 'dep/dropzone/dist/min',
		main: 'dropzone-amd-module.min'
	},{
		name: 'leaflet',
		location: 'dep/leaflet/dist',
		main: 'leaflet'
	},{
		name: 'L-draw',
		location: 'dep/leaflet-draw/dist',
		main: 'leaflet.draw'
	},{
		name: 'L-miniMap',
		location: 'dep/leaflet-minimap/dist',
		main: 'Control.MiniMap.min'
	},{
		name: 'L-coordinates',
		location: 'dep/leaflet-coordinates/dist',
		main: 'Leaflet.Coordinates-0.1.5.min'
	},{
		name: 'L-navBar',
		location: 'dep/leaflet-nav',
		main: 'index'
	},{
		name: 'L-areaselect',
		location: 'dep/leaflet-areaselect/src',
		main: 'leaflet-areaselect'
	},{
		name: 'L-timeDimension',
		location: 'dep/leaflet-timedimension/dist',
		main: 'leaflet.timedimension.min'
	},{
		name: 'iso8601-js-period',
		location: 'dep/iso8601-js-period',
		main: 'iso8601'
	},{
		name: 'd3',
		location: 'dep/d3/dist',
		main: 'd3.min'
	},{
		name: 'd3Tip',
		location: 'dep/d3-v6-tip/build',
		main: 'd3-v6-tip.min'
	},{
		name: 'tv4',
		location: 'dep/tv4',
		main: 'tv4'
	},{
		name: 'mediatorjs',
		location: 'dep/mediatorjs',
		main: 'mediator.min'
	},{
		name: 'cbtree',
		location: 'dep/cbtree'
	},{
		name: 'proj4',
		location: 'dep/proj4/dist',
		main: 'proj4'
	},{
		name: 'handlebars',
		location: 'dep/handlebars/dist',
		main: 'handlebars.runtime.min'
	},{
		name: 'awesome-markers',
		location: 'dep/leaflet.awesome-markers/dist',
		main: 'leaflet.awesome-markers.min'
	},{
		name: 'pruneCluster',
		location: 'dep/pruneCluster/dist',
		main: 'PruneCluster.amd.min'
	},{
		name: 'templates',
		location: 'dep/templates/dist'
	},{
		name: 'packery',
		location: 'dep/packery/dist',
		main: 'packery.pkgd.min'
	},{
		name: 'draggabilly',
		location: 'dep/draggabilly/dist',
		main: 'draggabilly.pkgd.min'
	},{
		name: 'moment',
		location: 'dep/moment/min',
		main: 'moment.min'
	},{
		name: 'leaflet-measure',
		location: 'dep/leaflet-measure/dist'
	},{
		name: 'sockjs',
		location: 'dep/sockjs/dist',
		main: 'sockjs.min'
	},{
		name: 'stomp-websocket',
		location: 'dep/stomp-websocket/lib',
		main: 'stomp.min'
	},{
		name: 'deepmerge',
		location: 'dep/deepmerge/dist',
		main: 'umd'
	},{
		name: 'colorjs',
		location: 'dep/color-js',
		main: 'color'
	},{
		name: 'uuid',
		location: 'dep/uuid/dist/umd',
		main: 'uuidv4.min'
	},{
		name: 'json-schema-ref-parser',
		location: 'dep/json-schema-ref-parser/dist',
		main: 'ref-parser.min'
	},{
		name: 'leaflet-nontiledlayer',
		location: 'dep/leaflet-nontiledlayer/dist',
		main: 'NonTiledLayer'
	},{
		name: 'wicket',
		location: 'dep/wicket',
		main: 'wicket-leaflet.min'
	}],

	map: {
		'd3Tip/d3-v6-tip.min': {
			'd3-selection': 'd3'
		},
		'wicket': {
			'wicket': 'wicket/wicket.min'
		}
	},

	deps: ['leaflet'],

	async: true,
	waitSeconds: 5,
	requestProvider: 'dojo/request/registry',
	selectorEngine: 'lite'
};
