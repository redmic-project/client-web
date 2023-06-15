define([
	'app/designs/mapWithSideContent/Controller'
	, 'app/designs/mapWithSideContent/layout/MapAndContent'
	, 'app/redmicConfig'
	, 'dijit/layout/LayoutContainer'
	, 'dijit/layout/ContentPane'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/browser/ListImpl'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_GeoJsonParser'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/bars/Total'
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, 'redmic/modules/atlas/Atlas'
	, "redmic/modules/base/_ShowInPopup"
	, 'redmic/modules/layout/TabsDisplayer'
	, 'redmic/modules/map/layer/PruneClusterLayerImpl'
	, "redmic/modules/mapQuery/QueryOnMap"
	, 'redmic/modules/search/TextImpl'
	, 'templates/SurveyStationList'
	, 'templates/SurveyStationPopup'
], function(
	Controller
	, Layout
	, redmicConfig
	, LayoutContainer
	, ContentPane
	, declare
	, lang
	, _Filter
	, ListImpl
	, _ButtonsInRow
	, _GeoJsonParser
	, _Framework
	, Total
	, MapCenteringGatewayImpl
	, Atlas
	, _ShowInPopup
	, TabsDisplayer
	, PruneClusterLayerImpl
	, QueryOnMap
	, TextImpl
	, TemplateList
	, TemplatePopup
){
	return declare([Layout, Controller, _Filter], {
		//	summary:
		//		Vista de Realtime.
		//	description:
		//		Permite visualizar estaciones que emiten datos en tiempo real.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n['real-time'],
				'class': '',

				templatePopup: TemplatePopup,

				target: redmicConfig.services.timeSeriesStations,

				_layerInstance: null,

				ownChannel: 'realTime',

				filterConfig: {
					initQuery: {
						terms: {
							'properties.site.dashboard': true
						},
						size: null,
						from: null
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				initialQuery: this.filterConfig.initQuery,
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				perms: this.perms,
				selectionIdProperty: 'id',
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-tachometer',
							btnId: 'goToDashboard',
							title: 'Go to dashboard',
							href: redmicConfig.viewPaths.realTimeDashboard
						},{
							icon: 'fa-map-marker',
							title: 'map centering',
							btnId: 'mapCentering',
							returnItem: true
						}]
					}
				},
				bars: [{
					instance: Total
				}]
			}, this.browserConfig || {}]);
		},

		_initialize: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			this.browser = new declare([ListImpl, _Framework, _GeoJsonParser, _ButtonsInRow])(this.browserConfig);

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			this.modelChannel = this.filter.modelChannel;

			this._layerInstance = new PruneClusterLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				target: this.target,
				idProperty: 'uuid',
				getPopupContent: lang.hitch(this, this._getPopupContent)
			});

			this.mapCenteringGateway = new MapCenteringGatewayImpl({
				parentChannel: this.getChannel()
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var browserAndSearchContainer = new LayoutContainer({
				title: this.i18n.list,
				'class': 'marginedContainer noScrolledContainer'
			});

			this.gridNode = new ContentPane({
				region: 'center',
				'class': 'stretchZone'
			});

			this._publish(this.browser.getChannel('SHOW'), {
				node: this.gridNode.domNode
			});

			this.textSearchNode = new ContentPane({
				'class': 'topZone',
				region: 'top'
			});

			this._publish(this.textSearch.getChannel('SHOW'), {
				node: this.textSearchNode.domNode
			});

			browserAndSearchContainer.addChild(this.textSearchNode);
			browserAndSearchContainer.addChild(this.gridNode);

			// TODO acceso a lo bruto, hasta que se simplifique la estructura de contenedores
			this.tabs = this._tabsDisplayer._container;

			this.tabs.addChild(browserAndSearchContainer);
			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});

			this._emitEvt('ADD_LAYER', {layer: this._layerInstance});

			this._publish(this.mapCenteringGateway.getChannel('ADD_CHANNELS_DEFINITION'), {
				channelsDefinition: [{
					input: this.browser.getChannel('BUTTON_EVENT'),
					output: this._layerInstance.getChannel('SET_CENTER'),
					subMethod: 'setCenter'
				},{
					input: this.browser.getChannel('BUTTON_EVENT'),
					output: this._layerInstance.getChannel("ANIMATE_MARKER"),
					subMethod: 'animateMarker'
				}]
			});
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH');
		},

		_getPopupContent: function(data) {

			return this.templatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		},

		_createAtlas: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: getMapChannel,
				addTabChannel: this._tabsDisplayer.getChannel('ADD_TAB')
			});

			var QueryOnMapPopup = declare(QueryOnMap).extend(_ShowInPopup);
			this._queryOnMap = new QueryOnMapPopup({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				title: this.i18n.layersQueryResults,
				width: 5,
				height: "md"
			});
		}
	});
});
