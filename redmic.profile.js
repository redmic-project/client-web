var includeLocales = ['es', 'en'];

var amdTagger = function(filename, mid) {

	return /\.js$/.test(filename);
};

var copyOnlyTagger = function(filename, mid) {

	return true;
};

var ignoreTagger = function(desiredModuleId, filename, mid) {

	return mid !== desiredModuleId;
};

var profile = {
	basePath: './public/javascript',
	releaseDir: '../../dist',
	releaseName: 'javascript',
	action: 'release',
	layerOptimize: 'closure',
	optimize: 'closure',
	optimizeOptions: {
		languageIn: 'ES5'/*,
		compilationLevel: 'WHITESPACE_ONLY'*/
	},
	cssOptimize: 'comments',
	mini: true,
	stripConsole: 'warn',
	selectorEngine: 'lite',
	locale: includeLocales[0],
	localeList: includeLocales.join(','),
	useSourceMaps: false,

	resourceTags: {
		amd: amdTagger
	},

	//depsDumpDotFilename: 'redmic.dot',
	//dotModules: false,

	staticHasFeatures: {
		'config-deferredInstrumentation': 0,
		'config-dojo-loader-catches': 0,
		'config-tlmSiblingOfDojo': 0,
		'dojo-amd-factory-scan': 1,
		'dojo-combo-api': 0,
		'dojo-config-api': 1,
		'dojo-config-require': 0,
		'dojo-debug-messages': 0,
		'dojo-dom-ready-api': 1,
		'dojo-firebug': 0,
		'dojo-guarantee-console': 1,
		'dojo-has-api': 1,
		'dojo-inject-api': 1,
		'dojo-loader': 1,
		'dojo-log-api': 0,
		'dojo-modulePaths': 0,
		'dojo-moduleUrl': 0,
		'dojo-publish-privates': 0,
		'dojo-requirejs-api': 0,
		'dojo-sniff': 1,
		'dojo-sync-loader': 0,
		'dojo-test-sniff': 0,
		'dojo-timeout-api': 0,
		'dojo-trace-api': 0,
		'dojo-undef-api': 0,
		'dojo-v1x-i18n-Api': 1,
		'dom': 1,
		'host-browser': 1,
		'extend-dojo': 1
	},

	packages: [{
		name: 'dstore',
		location: 'dstore'
	},{
		name: 'dijit',
		location: 'dijit'
	},{
		name: 'dojo',
		location: 'dojo'
	},{
		name: 'dojox',
		location: 'dojox'
	},{
		name: 'cbtree',
		location: 'cbtree'
	},{
		name: 'put-selector',
		location: 'put-selector'
	},{
		name: 'app',
		location: 'app',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'redmic',
		location: 'redmic',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'RWidgets',
		location: 'redmic-widgets/src/app',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'mediatorjs',
		location: 'mediatorjs',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'mediatorjs/mediator.min')
		}
	},{
		name: 'moment',
		location: 'moment/min',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'moment/moment.min')
		}
	},{
		name: 'deepmerge',
		location: 'deepmerge/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'deepmerge/umd')
		}
	},{
		name: 'leaflet',
		location: 'leaflet/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'leaflet/leaflet')
		}
	},{
		name: 'leaflet-wms',
		location: 'leaflet-wms/dist',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'awesome-markers',
		location: 'leaflet-awesome-markers/dist',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'awesome-markers/leaflet.awesome-markers.min')
		}
	},{
		name: 'L-coordinates',
		location: 'leaflet-coordinates/dist',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'L-coordinates/Leaflet.Coordinates-0.1.5.min')
		}
	},{
		name: 'L-draw',
		location: 'leaflet-draw/dist',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'L-draw/leaflet.draw')
		}
	},{
		name: 'L-miniMap',
		location: 'leaflet-minimap/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'L-miniMap/Control.MiniMap.min')
		}
	},{
		name: 'L-navBar',
		location: 'leaflet-navbar/src',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'L-navBar/Leaflet.NavBar')
		}
	},{
		name: 'L-areaselect',
		location: 'leaflet-areaselect/src',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'L-areaselect/leaflet-areaselect')
		}
	},{
		name: 'leaflet-measure',
		location: 'leaflet-measure/dist',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'leaflet-measure/leaflet-measure.min')
		}
	},{
		name: 'pruneCluster',
		location: 'pruneCluster/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'pruneCluster/PruneCluster.amd.min')
		}
	},{
		name: 'sockjs',
		location: 'sockjs/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'sockjs/sockjs.min')
		}
	},{
		name: 'stompjs',
		location: 'stompjs/lib',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'stompjs/stomp.min')
		}
	},{
		name: 'alertify',
		location: 'alertify/build',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'alertify/alertify.min')
		}
	},{
		name: 'templates',
		location: 'templates/dist',
		resourceTags: {
			amd: amdTagger
		}
	},{
		name: 'd3',
		location: 'd3/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'd3/d3.min')
		}
	},{
		name: 'd3Tip',
		location: 'd3-tip',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'd3Tip/index')
		}
	},{
		name: 'node-uuid',
		location: 'node-uuid',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'node-uuid/uuid')
		}
	},{
		name: 'proj4js',
		location: 'proj4js/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'proj4js/proj4')
		}
	},{
		name: 'dropzone',
		location: 'dropzone/dist/min',
		resourceTags: {
			ignore: ignoreTagger.bind(null, 'dropzone/dropzone.min')
		}
	},{
		name: 'tv4',
		location: 'tv4',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'tv4/tv4.min')
		}
	},{
		name: 'colorjs',
		location: 'color-js',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreTagger.bind(null, 'colorjs/color')
		}
	},{
		name: 'json-schema-ref-parser',
		location: 'json-schema-ref-parser/dist',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreTagger.bind(null, 'json-schema-ref-parser/ref-parser.min')
		}
	},{
		name: 'packery',
		location: 'packery/dist',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreTagger.bind(null, 'packery/packery.pkgd.min')
		}
	},{
		name: 'draggabilly',
		location: 'draggabilly/dist',
		resourceTags: {
			copyOnly: copyOnlyTagger,
			ignore: ignoreTagger.bind(null, 'draggabilly/draggabilly.pkgd.min')
		}
	},{
		name: 'handlebars',
		location: 'handlebars/dist',
		resourceTags: {
			amd: amdTagger,
			ignore: ignoreTagger.bind(null, 'handlebars/handlebars.min')
		}
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

	layers: {
		'dojo/dojo': {
			customBase: true,
			boot: true,
			include: [
				'dojo/dojo'
				, 'dojo/domReady'
				, 'dojo/dom'
				, 'dojo/dom-class'
				, 'dojo/dom-attr'
				, 'dojo/_base/declare'
				, 'dojo/_base/html'
				, 'dojo/i18n'
				, 'dojo/_base/lang'
				, 'dojo/io-query'
				, 'dojo/mouse'
				, 'dojo/request/registry'
				, 'dojo/request/notify'
				, 'dojo/store/Observable'
				, 'dojo/DeferredList'
				, 'dojo/NodeList-manipulate'
				, 'dojo/NodeList-traverse'
				, 'dojo/dnd/Moveable'
				, 'dojo/dnd/TimedMoveable'
				, 'dojo/dnd/Mover'
				, 'dojo/dnd/move'
				, 'dojo/dnd/autoscroll'
			]
		}
	}
};

var viewLayers = {
	'app/components/Router': {}

	, 'app/views/404': {}
	, 'app/views/ActivateAccount': {}
	, 'app/views/NoSupportBrowser': {}
	, 'app/views/UnderConstructionView': {}

	, 'app/home/views/HomeView': {}

	, 'app/catalog/views/ActivitiesCatalogView': {}
	, 'app/catalog/views/PlatformsCatalogView': {}
	, 'app/catalog/views/ProjectsCatalogView': {}
	, 'app/catalog/views/SpeciesCatalogView': {}
	, 'app/catalog/views/ProgramsCatalogView': {}
	, 'app/catalog/views/OrganisationsCatalogView': {}

	, 'app/administrative/views/ActivityView': {}
	, 'app/administrative/views/ProjectView': {}
	, 'app/administrative/views/ProgramView': {}
	, 'app/administrative/views/OrganisationView': {}
	, 'app/administrative/views/ContactView': {}
	, 'app/administrative/views/PlatformView': {}
	, 'app/administrative/views/DeviceView': {}
	, 'app/administrative/views/DocumentView': {}
	, 'app/administrative/views/AnimalView': {}

	, 'app/maintenance/domains/admin/views/AccessibilityView': {}
	, 'app/maintenance/domains/admin/views/ActivityFieldsView': {}
	, 'app/maintenance/domains/admin/views/ActivityTypesView': {}
	, 'app/maintenance/domains/admin/views/ContactRolesView': {}
	, 'app/maintenance/domains/admin/views/CountriesView': {}
	, 'app/maintenance/domains/admin/views/DeviceTypesView': {}
	, 'app/maintenance/domains/admin/views/DocumentTypesView': {}
	, 'app/maintenance/domains/admin/views/OrganisationRolesView': {}
	, 'app/maintenance/domains/admin/views/OrganisationTypesView': {}
	, 'app/maintenance/domains/admin/views/PlatformTypesView': {}
	, 'app/maintenance/domains/admin/views/ProjectGroupsView': {}
	, 'app/maintenance/domains/admin/views/ScopesView': {}

	//, 'app/maintenance/domains/geometry/views/AreaTypesView': {}
	, 'app/maintenance/domains/geometry/views/DestinyView': {}
	, 'app/maintenance/domains/geometry/views/EndingView': {}
	, 'app/maintenance/domains/geometry/views/InspireThemesView': {}
	, 'app/maintenance/domains/geometry/views/LineTypesView': {}
	//, 'app/maintenance/domains/geometry/views/MeshTypesView': {}
	//, 'app/maintenance/domains/geometry/views/RasterTypesView': {}
	//, 'app/maintenance/domains/geometry/views/RecordingTypesView': {}
	//, 'app/maintenance/domains/geometry/views/ShorelineTypesView': {}
	, 'app/maintenance/domains/geometry/views/ThematicTypeView': {}
	, 'app/maintenance/domains/geometry/views/ToponymTypesView': {}

	, 'app/maintenance/domains/observations/views/AttributeTypesView': {}
	, 'app/maintenance/domains/observations/views/CensingStatusView': {}
	, 'app/maintenance/domains/observations/views/ConfidenceView': {}
	//, 'app/maintenance/domains/observations/views/EventGroupsView': {}
	, 'app/maintenance/domains/observations/views/InfrastructureTypeView': {}
	//, 'app/maintenance/domains/observations/views/MetricGroupsView': {}
	//, 'app/maintenance/domains/observations/views/MetricsDefinitionsView': {}
	, 'app/maintenance/domains/observations/views/ObjectTypesView': {}
	//, 'app/maintenance/domains/observations/views/ObservationTypesView': {}
	, 'app/maintenance/domains/observations/views/ParametersView': {}
	, 'app/maintenance/domains/observations/views/ParameterTypesView': {}
	, 'app/maintenance/domains/observations/views/SampleTypesView': {}
	, 'app/maintenance/domains/observations/views/SeaConditionsView': {}
	, 'app/maintenance/domains/observations/views/UnitsView': {}
	, 'app/maintenance/domains/observations/views/UnitTypesView': {}

	, 'app/maintenance/domains/taxon/views/CanaryProtectionView': {}
	, 'app/maintenance/domains/taxon/views/EcologyView': {}
	, 'app/maintenance/domains/taxon/views/EndemicityView': {}
	, 'app/maintenance/domains/taxon/views/EUProtectionView': {}
	, 'app/maintenance/domains/taxon/views/InterestView': {}
	, 'app/maintenance/domains/taxon/views/LifeStagesView': {}
	, 'app/maintenance/domains/taxon/views/OriginView': {}
	, 'app/maintenance/domains/taxon/views/PermanenceView': {}
	, 'app/maintenance/domains/taxon/views/RankView': {}
	, 'app/maintenance/domains/taxon/views/SexView': {}
	, 'app/maintenance/domains/taxon/views/SpainProtectionView': {}
	, 'app/maintenance/domains/taxon/views/StatusView': {}
	, 'app/maintenance/domains/taxon/views/TrophicRegimeView': {}

	, 'app/administrative/taxonomy/views/MisIdentificationView': {}
	, 'app/administrative/taxonomy/views/SpeciesView': {}
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

	, 'app/details/views/ProjectCatalogDetailsView': {}
	, 'app/details/views/ProgramCatalogDetailsView': {}
	, 'app/details/views/PlatformDetailsView': {}
	, 'app/details/views/ActivityDetailsView': {}
	, 'app/details/views/SpeciesDetailsView': {}
	, 'app/details/views/ActivityCatalogDetailsView': {}
	, 'app/details/views/PlatformCatalogDetailsView': {}
	, 'app/details/views/ProjectDetailsView': {}
	, 'app/details/views/ServiceOGCCatalogDetailsView': {}
	, 'app/details/views/ProgramDetailsView': {}
	, 'app/details/views/DocumentDetailsView': {}
	, 'app/details/views/BibliographyDetailsView': {}
	, 'app/details/views/ContactDetailsView': {}
	, 'app/details/views/ActivityCatalogInfrastructureMapView': {}
	, 'app/details/views/ActivityInfrastructureMapView': {}
	, 'app/details/views/ActivityCatalogAreaMapView': {}
	, 'app/details/views/ActivityAreaMapView': {}
	, 'app/details/views/ActivityCatalogLayerMapView': {}
	, 'app/details/views/ActivityLayerMapView': {}
	, 'app/details/views/ServiceOGCDetailsView': {}
	, 'app/details/views/StatisticsDetailsView': {}
	, 'app/details/views/OrganisationDetailsView': {}
	, 'app/details/views/BibliographyPDFView': {}
	, 'app/details/views/DocumentPDFView': {}
	, 'app/details/views/SpeciesCatalogLocationView': {}
	, 'app/details/views/SpeciesLocationView': {}
	, 'app/details/views/ActivityCatalogCitationMapView': {}
	, 'app/details/views/OrganisationCatalogDetailsView': {}
	, 'app/details/views/ActivityCitationMapView': {}
	, 'app/details/views/ActivityTrackingMapView': {}
	, 'app/details/views/ActivityCatalogTrackingMapView': {}
	, 'app/details/views/SpeciesCatalogDetailsView': {}

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

	, 'app/dataLoader/citation/views/CitationView': {}
	, 'app/dataLoader/surveyParameters/views/SurveyStationView': {}
	, 'app/dataLoader/surveyParameters/views/ObjectCollectionView': {}
	, 'app/dataLoader/surveyParameters/views/SurveyStationSeriesDataView': {}
	, 'app/dataLoader/surveyParameters/views/ObjectCollectingSeriesDataView': {}
	, 'app/dataLoader/tracking/views/TrackingView': {}
	, 'app/dataLoader/tracking/views/TrackingDataView': {}
	, 'app/dataLoader/infrastructure/views/InfrastructureView': {}
	, 'app/dataLoader/infrastructure/views/InfrastructureAttributesView': {}
	, 'app/dataLoader/areas/views/AreaView': {}
};

var viewLayerDefaultConfig = {
	includeLocales: includeLocales
};

(function() {

	for (var viewLayer in viewLayers) {
		var viewLayerConfig = viewLayers[viewLayer];

		for (var viewLayerConfigProp in viewLayerDefaultConfig) {
			var viewLayerConfigValue = viewLayerDefaultConfig[viewLayerConfigProp];

			viewLayerConfig[viewLayerConfigProp] = viewLayerConfigValue;
		}

		profile.layers[viewLayer] = viewLayerConfig;
	}

	return profile;
})();
