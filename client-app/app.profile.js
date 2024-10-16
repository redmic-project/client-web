var includeLocales = ['es', 'en'];

var packagesMap = {
	'd3Tip/d3-v6-tip.min': {
		'd3-selection': 'd3'
	},
	'wicket': {
		'wicket': 'wicket/wicket.min'
	}
};

var amdTagger = function(filename) {

	return /\.js$/.test(filename);
};

var copyOnlyTagger = function() {

	return true;
};

var ignoreAllButExceptionsTagger = function(desiredModuleId, _filename, mid) {

	if (desiredModuleId instanceof Array) {
		return desiredModuleId.indexOf(mid) === -1;
	}

	return mid !== desiredModuleId;
};

var declarativeTagger = function(filename) {

	return /\.htm(l)?$/.test(filename);
};

var profileObj = {
	basePath: '.',
	releaseDir: 'dist',
	releaseName: 'js',
	action: 'release',
	layerOptimize: 'closure',
	optimize: 'closure',
	optimizeOptions: {
		languageIn: 'ECMASCRIPT_2017',
		languageOut: 'ECMASCRIPT_2015',
		compilationLevel: 'SIMPLE_OPTIMIZATIONS'
	},
	cssOptimize: 'comments',
	mini: true,
	stripConsole: 'warn',
	selectorEngine: 'lite',
	useSourceMaps: false,
	buildReportDir: '../..',
	maxOptimizationProcesses: 1,

	resourceTags: {
		amd: amdTagger,
		declarative: declarativeTagger
	},

	defaultConfig: {
		hasCache:{
			'dojo-built': 1,
			'dojo-loader': 1,
			'dom': 1,
			'host-browser': 1,
			'config-selectorEngine': 'lite'
		},

		// Configuraciones de dojoConfig, definidas estáticamente en tiempo de compilación ('packages' no funciona)
		baseUrl: '/client-app/dist/js',
		map: packagesMap,
		async: true,
		waitSeconds: 5,
		requestProvider: 'dojo/request/registry',
		selectorEngine: 'lite'
	},

	staticHasFeatures: {
		'config-deferredInstrumentation': 0
		, 'config-dojo-loader-catches': 0
		, 'config-tlmSiblingOfDojo': 0
		, 'dojo-amd-factory-scan': 0
		, 'dojo-combo-api': 0
		, 'dojo-config-api': 1
		, 'dojo-config-require': 0
		, 'dojo-debug-messages': 0
		, 'dojo-dom-ready-api': 0
		, 'dojo-firebug': 0
		, 'dojo-guarantee-console': 0
		, 'dojo-has-api': 1
		, 'dojo-inject-api': 1
		, 'dojo-loader': 1
		, 'dojo-log-api': 0
		, 'dojo-modulePaths': 0
		, 'dojo-moduleUrl': 0
		, 'dojo-publish-privates': 0
		, 'dojo-requirejs-api': 0
		, 'dojo-sniff': 1
		, 'dojo-sync-loader': 0
		, 'dojo-test-sniff': 0
		, 'dojo-timeout-api': 0
		, 'dojo-trace-api': 0
		, 'dojo-undef-api': 0
		, 'dojo-v1x-i18n-Api': 1
		, 'dom': 1
		, 'host-browser': 1
		, 'extend-dojo': 1
	},

	packages: [{
		name: 'dijit',
		location: 'dep/dijit'
	},{
		name: 'dojo',
		location: 'dep/dojo'
	},{
		name: 'dojox',
		location: 'dep/dojox'
	},{
		name: 'cbtree',
		location: 'dep/cbtree',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, [
				'cbtree/Tree'
				, 'cbtree/store/ObjectStore'
				, 'cbtree/model/ForestStoreModel'
				, 'cbtree/model/_base/BaseStoreModel'
				, 'cbtree/model/_base/CheckedStoreModel'
				, 'cbtree/model/_base/Parents'
				, 'cbtree/model/_base/Prologue'
				, 'cbtree/errors/createError'
				, 'cbtree/errors/CBTErrors'
				, 'cbtree/store/Memory'
				, 'cbtree/store/Natural'
				, 'cbtree/store/Hierarchy'
				, 'cbtree/Evented'
				, 'cbtree/CheckBox'
				, 'cbtree/util/shim/Array'
				, 'cbtree/util/QueryEngine'
				, 'cbtree/util/IE8_Event'
			])
		}
	},{
		name: 'put-selector',
		location: 'dep/put-selector',
		main: 'put'
	},{
		name: 'wicket',
		location: 'dep/wicket',
		main: 'wicket-leaflet.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, ['wicket/wicket.min', 'wicket/wicket-leaflet.min'])
		}
	},{
		name: 'mediatorjs',
		location: 'dep/mediatorjs',
		main: 'mediator.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'mediatorjs/mediator.min')
		}
	},{
		name: 'moment',
		location: 'dep/moment/min',
		main: 'moment.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'moment/moment.min')
		}
	},{
		name: 'deepmerge',
		location: 'dep/deepmerge/dist',
		main: 'umd',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'deepmerge/umd')
		}
	},{
		name: 'leaflet',
		location: 'dep/leaflet/dist',
		main: 'leaflet',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'leaflet/leaflet')
		}
	},{
		name: 'leaflet-nontiledlayer',
		location: 'dep/leaflet-nontiledlayer/dist',
		main: 'NonTiledLayer',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'leaflet-nontiledlayer/NonTiledLayer')
		}
	},{
		name: 'awesome-markers',
		location: 'dep/leaflet.awesome-markers/dist',
		main: 'leaflet.awesome-markers.min',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'awesome-markers/leaflet.awesome-markers.min')
		}
	},{
		name: 'L-coordinates',
		location: 'dep/leaflet-coordinates/dist',
		main: 'Leaflet.Coordinates-0.1.5.min',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-coordinates/Leaflet.Coordinates-0.1.5.min')
		}
	},{
		name: 'L-draw',
		location: 'dep/leaflet-draw/dist',
		main: 'leaflet.draw',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-draw/leaflet.draw')
		}
	},{
		name: 'L-miniMap',
		location: 'dep/leaflet-minimap/dist',
		main: 'Control.MiniMap.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-miniMap/Control.MiniMap.min')
		}
	},{
		name: 'L-navBar',
		location: 'dep/leaflet-nav',
		main: 'index',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-navBar/index')
		}
	},{
		name: 'L-areaselect',
		location: 'dep/leaflet-areaselect/src',
		main: 'leaflet-areaselect',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-areaselect/leaflet-areaselect')
		}
	},{
		name: 'iso8601-js-period',
		location: 'dep/iso8601-js-period',
		main: 'iso8601',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'iso8601-js-period/iso8601')
		}
	},{
		name: 'L-timeDimension',
		location: 'dep/leaflet-timedimension/dist',
		main: 'leaflet.timedimension.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'L-timeDimension/leaflet.timedimension.min')
		}
	},{
		name: 'leaflet-measure',
		location: 'dep/leaflet-measure/dist',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, [
				'leaflet-measure/leaflet-measure.es',
				'leaflet-measure/leaflet-measure.en'
			])
		}
	},{
		name: 'pruneCluster',
		location: 'dep/pruneCluster/dist',
		main: 'PruneCluster.amd.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'pruneCluster/PruneCluster.amd.min')
		}
	},{
		name: 'sockjs',
		location: 'dep/sockjs/dist',
		main: 'sockjs.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'sockjs/sockjs.min')
		}
	},{
		name: 'stomp-websocket',
		location: 'dep/stomp-websocket/lib',
		main: 'stomp.min',
		resourceTags: {
			ignore: ignoreAllButExceptionsTagger.bind(null, 'stomp-websocket/stomp.min')
		}
	},{
		name: 'alertify',
		location: 'dep/alertify/build',
		main: 'alertify.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'alertify/alertify.min')
		}
	},{
		name: 'd3',
		location: 'dep/d3/dist',
		main: 'd3.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'd3/d3.min')
		}
	},{
		name: 'd3Tip',
		location: 'dep/d3-v6-tip/build',
		main: 'd3-v6-tip.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'd3Tip/d3-v6-tip.min')
		}
	},{
		name: 'uuid',
		location: 'dep/uuid/dist/umd',
		main: 'uuidv4.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'uuid/uuidv4.min')
		}
	},{
		name: 'proj4',
		location: 'dep/proj4/dist',
		main: 'proj4',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'proj4/proj4')
		}
	},{
		name: 'dropzone',
		location: 'dep/dropzone/dist/min',
		main: 'dropzone-amd-module.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'dropzone/dropzone-amd-module.min')
		}
	},{
		name: 'tv4',
		location: 'dep/tv4',
		main: 'tv4',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'tv4/tv4')
		}
	},{
		name: 'colorjs',
		location: 'dep/color-js',
		main: 'color',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'colorjs/color')
		}
	},{
		name: 'json-schema-ref-parser',
		location: 'dep/json-schema-ref-parser/dist',
		main: 'ref-parser.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'json-schema-ref-parser/ref-parser.min')
		}
	},{
		name: 'packery',
		location: 'dep/packery/dist',
		main: 'packery.pkgd.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'packery/packery.pkgd.min')
		}
	},{
		name: 'draggabilly',
		location: 'dep/draggabilly/dist',
		main: 'draggabilly.pkgd.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'draggabilly/draggabilly.pkgd.min')
		}
	},{
		name: 'handlebars',
		location: 'dep/handlebars/dist',
		main: 'handlebars.runtime.min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreAllButExceptionsTagger.bind(null, 'handlebars/handlebars.runtime.min')
		}
	},{
		name: 'RWidgets',
		location: 'src/util/widgets',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'templates',
		location: 'dep/templates/dist',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'app',
		location: 'src/oldapp',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'src',
		location: 'src',
		resourceTags: {
			amd: amdTagger
		}
	}],

	map: packagesMap,

	layers: {
		'dojo/dojo': {
			customBase: true,
			boot: true,
			include: [
				'dojo/dojo'
				, 'dojo/_base/html'
				, 'dojo/_base/lang'
				, 'dojo/DeferredList'
				, 'dojo/dnd/autoscroll'
				, 'dojo/dnd/move'
				, 'dojo/dnd/Moveable'
				, 'dojo/dnd/Mover'
				, 'dojo/dnd/TimedMoveable'
				, 'dojo/dom'
				, 'dojo/dom-attr'
				, 'dojo/dom-class'
				, 'dojo/domReady'
				, 'dojo/_base/declare'
				, 'dojo/i18n'
				, 'dojo/io-query'
				, 'dojo/mouse'
				, 'dojo/NodeList-dom'
				, 'dojo/NodeList-manipulate'
				, 'dojo/NodeList-traverse'
				, 'dojo/request/notify'
				, 'dojo/request/registry'
				, 'dojo/store/Observable'
				, 'dojo/touch'
				, 'dojo/window'
			]
		},
		'src/component/base/_Module': {
			discard: true,
			dependencies: [
				'src/component/base/_Show'
			]
		},
		'src/app/App': {
			includeLocales: includeLocales,
			layerDependencies: ['src/component/base/_Module']
		}
	}
};

var viewLayers = {
	// especiales
	'src/error/404': {}
	, 'src/error/NoSupportBrowser': {}
	, 'src/user/ActivateAccount': {}

	// catálogos
	, 'src/catalog/activity/ActivityCatalogView': {}
	, 'src/catalog/organisation/OrganisationCatalogView': {}
	, 'src/catalog/platform/PlatformCatalogView': {}
	, 'src/catalog/program/ProgramCatalogView': {}
	, 'src/catalog/project/ProjectCatalogView': {}
	, 'src/catalog/species/SpeciesCatalogView': {}

	// vistas detalle
	, 'src/detail/activity/ActivityDetailView': {}
	, 'src/detail/organisation/OrganisationDetailView': {}
	, 'src/detail/platform/PlatformDetailView': {}
	, 'src/detail/program/ProgramDetailView': {}
	, 'src/detail/project/ProjectDetailView': {}
	, 'src/detail/species/SpeciesDetailView': {}

	// mantenimiento
	, 'src/maintenance/domain/DomainMaintenanceView': {}

	// -------------------------------------------------------------------------

	, 'app/home/views/HomeView': {}

	, 'app/catalog/views/StacBrowserView': {}

	, 'app/administrative/views/ContactView': {}
	, 'app/administrative/views/DeviceView': {}
	, 'app/administrative/views/DocumentView': {}
	, 'app/administrative/views/AnimalView': {}

	, 'app/administrative/taxonomy/views/MisIdentificationView': {}
	, 'app/administrative/taxonomy/views/GenusView': {}
	, 'app/administrative/taxonomy/views/FamilyView': {}
	, 'app/administrative/taxonomy/views/OrderView': {}
	, 'app/administrative/taxonomy/views/ClassView': {}
	, 'app/administrative/taxonomy/views/SubphylumView': {}
	, 'app/administrative/taxonomy/views/PhylumView': {}
	, 'app/administrative/taxonomy/views/KingdomView': {}
	, 'app/administrative/taxonomy/views/TaxonomyView': {}

	, 'app/products/views/OpenMapView': {}
	, 'app/products/views/ServiceOGCCatalogView': {}

	, 'app/user/views/RegisterView': {}
	, 'app/user/views/ResettingView': {}
	, 'app/user/views/WhatIsRedmicView': {}
	, 'app/user/views/LoginView': {}
	, 'app/user/views/ConfirmResettingView': {}
	, 'app/user/views/TermsAndConditionsView': {}
	, 'app/user/views/InnerWhatIsRedmicView': {}
	, 'app/user/views/InnerTermsAndConditionsView': {}
	, 'app/user/views/FeedbackView': {}
	, 'app/user/views/UserProfileView': {}

	, 'app/maintenance/views/DomainView': {}
	, 'app/maintenance/views/ServiceOGCView': {}
	, 'app/maintenance/views/PermissionsView': {}

	, 'app/viewers/views/SpeciesDistributionView': {}
	, 'app/viewers/views/BibliographyView': {}
	, 'app/viewers/views/TrackingView': {}
	, 'app/viewers/views/TrashCollectionView': {}
	, 'app/viewers/views/ChartsView': {}
	, 'app/viewers/views/RealTimeView': {}
	, 'app/viewers/views/RealTimeDashboardView': {}

	, 'app/details/views/ServiceOGCCatalogDetailsView': {}
	, 'app/details/views/DocumentDetailsView': {}
	, 'app/details/views/BibliographyDetailsView': {}
	, 'app/details/views/ContactDetailsView': {}
	, 'app/details/views/ServiceOGCDetailsView': {}
	, 'app/details/views/StatisticsDetailsView': {}

	, 'app/edition/views/ActivityEditionView': {}
	, 'app/edition/views/DeviceEditionView': {}
	, 'app/edition/views/DocumentEditionView': {}
	, 'app/edition/views/ProgramEditionView': {}
	, 'app/edition/views/ProjectEditionView': {}
	, 'app/edition/views/SpeciesEditionView': {}
	, 'app/edition/views/ContactEditionView': {}
	, 'app/edition/views/OrganisationEditionView': {}
	, 'app/edition/views/PlatformEditionView': {}
	, 'app/edition/views/UnitEditionView': {}
	, 'app/edition/views/MetricsDefinitionEditionView': {}
	, 'app/edition/views/ParameterEditionView': {}
	, 'app/edition/views/ServiceOGCEditionView': {}
	, 'app/edition/views/AnimalEditionView': {}
	, 'app/edition/views/PermissionsEditionView': {}
	, 'app/edition/views/MisIdentificationEditionView': {}
	, 'app/edition/views/LoadDataToActivityEditionView': {}
	, 'app/edition/views/LoadDataDocumentEditionView': {}

	/*, 'app/dataLoader/citation/views/CitationView': {}
	, 'app/dataLoader/surveyParameters/views/SurveyStationView': {}
	, 'app/dataLoader/surveyParameters/views/ObjectCollectionView': {}
	, 'app/dataLoader/surveyParameters/views/SurveyStationSeriesDataView': {}
	, 'app/dataLoader/surveyParameters/views/ObjectCollectingSeriesDataView': {}
	, 'app/dataLoader/tracking/views/TrackingView': {}
	, 'app/dataLoader/tracking/views/TrackingDataView': {}
	, 'app/dataLoader/infrastructure/views/InfrastructureView': {}
	, 'app/dataLoader/infrastructure/views/InfrastructureAttributesView': {}
	, 'app/dataLoader/areas/views/AreaView': {}*/
};

var viewLayerDefaultConfig = {
	includeLocales: includeLocales,
	layerDependencies: ['src/component/base/_Module']
};

var profile = (function() {

	for (var viewLayer in viewLayers) {
		var viewLayerConfig = viewLayers[viewLayer];
		profileObj.layers[viewLayer] = { ...viewLayerConfig, ...viewLayerDefaultConfig };
	}

	return profileObj;
})();
