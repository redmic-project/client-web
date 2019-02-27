define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/map/Atlas"
	, "redmic/modules/map/layer/PruneClusterLayerImpl"
	, "redmic/modules/map/layer/_AddFilter"
	, "redmic/modules/search/TextImpl"
	, "templates/SurveyStationList"
	, "templates/SurveyStationPopup"
], function(
	_CompositeInTooltipFromIconKeypad
	, Controller
	, Layout
	, redmicConfig
	, BorderContainer
	, ContentPane
	, TabContainer
	, declare
	, lang
	, _Filter
	, _Selection
	, _ShowInPopup
	, _Store
	, ListImpl
	, _GeoJsonParser
	, _Framework
	, _Select
	, SelectionBox
	, Total
	, Atlas
	, PruneClusterLayerImpl
	, _AddFilter
	, TextImpl
	, TemplateList
	, TemplatePopup
){
	return declare([Layout, Controller, _Filter, _CompositeInTooltipFromIconKeypad, _Selection], {
		//	summary:
		//		Vista de Realtime.
		//	description:
		//		Permite visualizar estaciones que emiten datos en tiempo real.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				title: this.i18n["real-time"],
				"class": "",

				templatePopup: TemplatePopup,

				target: redmicConfig.services.timeSeriesStations,
				layersTarget: redmicConfig.services.timeSeriesStations,

				_layerInstances: {},
				_layerIdPrefix: "realTime",
				layerIdSeparator: "_",

				ownChannel: "realTime",

				filterConfig: {
					initQuery: {
						terms: {
							"properties.site.dashboard": true
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
				highlightField: ['properties.site.name'],
				suggestFields: ["properties.site.name", "properties.site.code"],
				searchFields: ["properties.site.name", "properties.site.code"],
				initialQuery: this.filterConfig.initQuery,
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				perms: this.perms,
				selectionIdProperty: "id",
				template: TemplateList,
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				}]
			}, this.browserConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.filter.getChannel("CHANGED_MODEL"),
				callback: "_subChangedModelFilter"
			},{
				channel: this.filter.getChannel("REQUEST_FILTER"),
				callback: "_subRequestFilter"
			});
		},

		_initialize: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new declare([TextImpl])(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			this.browser = new declare([ListImpl, _Framework, _GeoJsonParser, _Select])(this.browserConfig);

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: lang.hitch(this.map, this.map.getChannel)
			});

			this.modelChannel = this.filter.modelChannel;
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onHide));
		},

		postCreate: function() {

			this.inherited(arguments);

			var browserAndSearchContainer = new BorderContainer({
				title: this.i18n.list,
				'class': "marginedContainer noScrolledContainer"
			});

			this.gridNode = new ContentPane({
				region: "center",
				'class': 'stretchZone'
			});

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.gridNode.domNode
			});

			this.textSearchNode = new ContentPane({
				'class': "topZone",
				region: "top"
			});

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode.domNode
			});

			browserAndSearchContainer.addChild(this.textSearchNode);
			browserAndSearchContainer.addChild(this.gridNode);

			this.tabs = new TabContainer({
				tabPosition: "top",
				splitter: true,
				region: "right",
				'class': "col-xs-6 col-sm-6 col-md-6 col-lg-5 col-xl-4 mediumTexturedContainer sideTabContainer"
			});
			this.tabs.addChild(browserAndSearchContainer);
			this.tabs.addChild(this._createAtlas());

			this.contentNode.addChild(this.tabs);
		},

		_subChangedModelFilter: function(obj) {

			this.modelChannel = obj.modelChannel;
		},

		_subRequestFilter: function(obj) {
			console.debug("_subRequestFilter " + obj);
			for (var key in this._layerInstances)
				this._publish(this._layerInstances[key].getChildChannel('filter', "REQUEST_FILTER"), obj);
		},

		_select: function(item) {

			item && this._addDataLayer(this._getIdFromPath(item));
		},

		_deselect: function(item) {

			item && this._removeDataLayer(this._getIdFromPath(item));
		},

		_getIdFromPath: function(path) {

			return path.split(this.pathSeparator).pop();
		},

		_clearSelection: function(response) {

			for (var key in this._layerInstances) {
				this._removeDataLayer(key);
			}
		},

		_addDataLayer: function(item) {

			console.debug("_addDataLayer " + item);

			if (!this._layerInstances[item]) {
				this._createLayerInstance(item);
			}

			this._emitEvt('ADD_LAYER', {layer: this._layerInstances[item]});

			this._publish(this._layerInstances[item].getChannel('REFRESH'));
		},

		_createLayerInstance: function(item) {

			console.debug("_createLayerInstance " + item);

			var layerId = this._layerIdPrefix + this.layerIdSeparator + item;

			this._layerInstances[item] =  new declare([PruneClusterLayerImpl, _AddFilter])({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				geoJsonStyle: {
					color: "red",
					weight: 5
				},
				target: this.layersTarget,
				infoTarget: this.layersTarget,
				layerId: layerId,
				layerLabel: layerId,
				filterConfig: {
					modelChannel: this.modelChannel
				},
				getPopupContent: lang.hitch(this, this._getPopupContent),
			});
		},

		_getPopupContent: function(data) {

			return this.templatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		},

		_removeDataLayer: function(item) {

			this._removeLayerInstance(item);
		},

		_removeLayerInstance: function(item) {

			this._publish(this._layerInstances[item].getChannel("CLEAR"));
			this._emitEvt('REMOVE_LAYER', {
				layer: this._layerInstances[item]
			});
			this._publish(this._layerInstances[item].getChannel("DISCONNECT"));

			this._layerInstances[item].destroy();
			delete this._layerInstances[item];
		},

		_createAtlas: function() {

			var cp = new ContentPane({
				title: this.i18n.themes,
				region:"center"
			});

			this._publish(this.atlas.getChannel("SHOW"), {
				node: cp.domNode
			});

			return cp;
		},

		_onHide: function() {

			//this._publish(this.realTimeSurveyDetails.getChannel("HIDE"));
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH');
		},

		_getIconKeypadNode: function() {

			return this.textSearchNode.domNode;
		}
	});
});
