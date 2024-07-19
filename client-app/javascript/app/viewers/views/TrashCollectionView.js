define([
	'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/atlas/Atlas"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Total"
	, 'redmic/modules/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'redmic/modules/layout/TabsDisplayer'
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/layer/_AddFilter"
	, "redmic/modules/mapQuery/QueryOnMap"
	, "redmic/modules/search/TextImpl"
	, "templates/ActivityList"
	, "templates/FilterForm"
	, "./TrashDetails"
], function(
	_AddCompositeSearchInTooltipFromTextSearch
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, Atlas
	, _Filter
	, _Selection
	, _ShowInPopup
	, _Store
	, ListImpl
	, _Framework
	, _Select
	, SelectionBox
	, Total
	, GenericWithTopbarDisplayerImpl
	, TabsDisplayer
	, GeoJsonLayerImpl
	, _AddFilter
	, QueryOnMap
	, TextImpl
	, TemplateList
	, FilterForm
	, TrashDetails
) {

	return declare([Layout, Controller, _Filter, _AddCompositeSearchInTooltipFromTextSearch, _Selection], {
		//	summary:
		//		Vista de TrashCollection.
		//	description:
		//		Permite visualizar las recolecciones de basura.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				title: this.i18n["trash-collection"],
				"class": "",

				target: redmicConfig.services.objectCollectingSeriesActivities,
				layersTarget: redmicConfig.services.activityObjectCollectingSeriesStations,

				_layerInstances: {},
				_layerIdPrefix: "trashCollection",
				layerIdSeparator: "_",

				ownChannel: "trashCollection",

				filterConfig: {
					initQuery: {
						size: null,
						from: null
					}
				},

				compositeConfig: {
					template: FilterForm
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				itemLabel: null,
				showExpandIcon: true
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
				channel: this.filter.getChannel("SERIALIZE"),
				callback: "_subRequestFilter"
			});
		},

		_initialize: function() {

			this._createBrowser();

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			var TrashDetailsDefinition = declare(TrashDetails).extend(_ShowInPopup);
			this.trashDetails = new TrashDetailsDefinition({
				parentChannel: this.getChannel()
			});

			this.modelChannel = this.filter.modelChannel;
		},

		_createBrowser: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _Select]);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._browserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n['trash-collection']
			});

			this._publish(this._browserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onHide));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n['trash-collection'],
				iconClass: 'fa fa-recycle',
				channel: this._browserWithTopbar.getChannel()
			});

			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
		},

		_subChangedModelFilter: function(obj) {

			this.modelChannel = obj.modelChannel;
		},

		_subRequestFilter: function(obj) {

			for (var key in this._layerInstances)
				this._publish(this._layerInstances[key].getChildChannel('filter', "SERIALIZE"), obj);
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

			if (!this._layerInstances[item]) {
				this._createLayerInstance(item);
			}

			this._emitEvt('ADD_LAYER', {layer: this._layerInstances[item]});

			this._publish(this._layerInstances[item].getChannel('REFRESH'));
		},

		_createLayerInstance: function(item) {

			var target = lang.replace(this.layersTarget, {activityid: item}),
				infoTarget = target,
				layerId = this._layerIdPrefix + this.layerIdSeparator + item,
				LayerDefinition = declare([GeoJsonLayerImpl, _AddFilter]);

			this._layerInstances[item] = new LayerDefinition({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				geoJsonStyle: {
					color: "red",
					weight: 5
				},
				target: target,
				infoTarget: infoTarget,
				layerId: layerId,
				layerLabel: layerId,
				filterConfig: {
					modelChannel: this.modelChannel
				},
				onEachFeature: lang.hitch(this, function(feature, layer) {
					layer.on("click", lang.hitch(this, function(innerFeature) {
						this._publish(this.trashDetails.getChannel("SHOW"), {
							data: {
								id: innerFeature.id,
								parentId: innerFeature.uuid,
								grandparentId: innerFeature.properties.activityId,
								feature: innerFeature
							}
						});
					}, feature));
				})
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
		},

		_onHide: function() {

			this._publish(this.trashDetails.getChannel("HIDE"));
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH');
		},

		_getIconKeypadNode: function() {

			return this.textSearchNode.domNode;
		}
	});
});
