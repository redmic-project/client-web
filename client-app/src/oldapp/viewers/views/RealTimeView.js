define([
	'app/designs/mapWithSideContent/Controller'
	, 'app/designs/mapWithSideContent/layout/MapAndContent'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/atlas/Atlas'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/browser/ListImpl'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_GeoJsonParser'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/bars/Total'
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, 'redmic/modules/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
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
	, declare
	, lang
	, Atlas
	, _Filter
	, ListImpl
	, _ButtonsInRow
	, _GeoJsonParser
	, _Framework
	, Total
	, MapCenteringGatewayImpl
	, GenericWithTopbarDisplayerImpl
	, TabsDisplayer
	, PruneClusterLayerImpl
	, QueryOnMap
	, TextImpl
	, TemplateList
	, TemplatePopup
) {

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

			this._createBrowser();

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

		_createBrowser: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _GeoJsonParser, _ButtonsInRow]);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._browserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n['real-time']
			});

			this._publish(this._browserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n['real-time'],
				iconClass: 'fa fa-clock-o',
				channel: this._browserWithTopbar.getChannel()
			});

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

			this._queryOnMap = new QueryOnMap({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				tabsDisplayerChannel: this._tabsDisplayer.getChannel()
			});
		}
	});
});
