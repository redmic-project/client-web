define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "dijit/layout/LayoutContainer"
	, "dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/map/OpenLayers"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/map/Atlas"
	, "redmic/modules/search/TextImpl"
	, "templates/CitationList"
], function(
	_LocalSelectionView
	, _Main
	, Controller
	, Layout
	, LayoutContainer
	, ContentPane
	, TabContainer
	, declare
	, lang
	, aspect
	, OpenLayers
	, _Filter
	, _Store
	, MapCenteringGatewayImpl
	, Total
	, _ButtonsInRow
	, _Framework
	, _GeoJsonParser
	, ListImpl
	, Atlas
	, TextImpl
	, TemplateList
){
	return declare([Layout, Controller, _Main, _Store, _Filter, _LocalSelectionView], {
		//	summary:
		//		Vista base para todas las vistas de geográfica.
		//	description:
		//		Permite mostrar datos geográficos.

		constructor: function (args) {

			this.config = {
				browserExts: [],
				idProperty: 'id',

				mainEvents: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					UPDATE_TARGET: "updateTarget",
					CLEAR: "clear"
				},

				notTextSearch: false,

				mainActions: {
					CLEAR: "clear",
					REFRESH: "refresh"
				}
			};

			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeShowMain));

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._getTarget(),
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				selectorChannel: this.getChannel(),
				target: this._getTarget(),
				template: TemplateList,
				idProperty: this.idProperty,
				bars: [{
					instance: Total
				}]
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_initializeMain: function() {

			if (!this.notTextSearch) {
				this.searchConfig.queryChannel = this.queryChannel;
				this.textSearch = new TextImpl(this.searchConfig);
			}

			var exts = this.browserExts;

			exts.unshift(ListImpl, _Framework, _ButtonsInRow, _GeoJsonParser);

			this.browserConfig.queryChannel = this.queryChannel;
			this.browser = new declare(exts)(this.browserConfig);

			this._mapCenteringGateway();
		},

		_mapCenteringGateway: function() {

			this.mapCenteringGateway = new MapCenteringGatewayImpl({
				parentChannel: this.getChannel()
			});
		},

		_defineMainSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClearView"
			},{
				channel : this.getChannel("REFRESH"),
				callback: "_subRefresh"
			});
		},

		_defineMainPublications: function () {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.browser.getChannel("UPDATE_TARGET")
			});

			if (!this.notTextSearch) {
				this.publicationsConfig.push({
					event: 'CLEAR',
					channel: this.textSearch.getChannel("RESET")
				},{
					event: 'UPDATE_TARGET',
					channel: this.textSearch.getChannel("UPDATE_TARGET")
				});
			}
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._onGeographicMainShown));
			this._onEvt('RESIZE', lang.hitch(this, this._onGeographicMainResized));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createBrowserNode();

			if (!this.notTextSearch) {
				this._createTextSearchNode();
			}

			this._createTabContainers();
		},

		_createTextSearchNode: function() {

			this.textSearchNode = new ContentPane({
				'class': "topZone topZoneCitation",
				region: "top"
			});

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode.domNode
			});

			this.buttonsNode = this.textSearchNode;

			this.browserAndSearchContainer.addChild(this.textSearchNode);
		},

		_createBrowserNode: function() {

			this.browserAndSearchContainer = new LayoutContainer({
				title: "<i class='fa fa-table'></i>",
				'class': "marginedContainer noScrolledContainer"
			});

			this.gridNode = new ContentPane({
				'class': this.notTextSearch ? 'rightZone' : 'stretchZone',
				region: "center"
			});

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.gridNode.domNode
			});

			this.browserAndSearchContainer.addChild(this.gridNode);
		},

		_createTabContainers: function() {

			this.tabs = new TabContainer({
				tabPosition: "top",
				region: "center",
				'class': "mediumSolidContainer sideTabContainer borderRadiusTabContainer"
			});

			this.tabs.addChild(this.browserAndSearchContainer);
			this.tabs.addChild(this._createAtlas());

			this.tabs.placeAt(this.contentNode);
			this.tabs.startup();
		},

		_createAtlas: function() {

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: lang.hitch(this.map, this.map.getChannel)
			});

			var cp = new ContentPane({
				title: this.i18n.themes,
				region:"center"
			});

			this._publish(this.atlas.getChannel("SHOW"), {
				node: cp.domNode
			});

			return cp;
		},

		_beforeShowMain: function() {

			if (!this.pathVariableId) {
				return;
			}

			var newTarget = this._replaceVariablesInString(this.replaceTarget || this._getTarget()),
				target = this.target || [];

			if (target.length === 1) {
				target.unshift(newTarget);
			} else {
				target[0] = newTarget;
			}

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: target,
				refresh: true
			});
		},

		_updateTarget: function(obj) {

			this._publish(this.map.getChannel("SET_CENTER_AND_ZOOM"), {
				center: [28.5, -16.0],
				zoom: 7
			});
		},

		_replaceVariablesInString: function(target) {

			return lang.replace(target, {
				id: this.pathVariableId
			});
		},

		_subRefresh: function(req) {

			this._emitEvt('REFRESH');
		},

		_subClearView: function() {

			this._emitEvt('CLEAR');
		},

		_subListBtnEvent: function(evt) {

			var callback = evt.btnId + "Callback";
			this[callback] && this[callback](evt);

			callback = "_" + callback;
			this[callback] && this[callback](evt);
		},

		_localClearSelection: function(channel) {

			this._publish(channel, {
				selectionTarget: this._getTarget()
			});
		},

		_onGeographicMainShown: function() {

			this._resizeTabs();
		},

		_onGeographicMainResized: function() {

			this._resizeTabs();
		},

		_resizeTabs: function() {

			this.tabs.resize();
		}
	});
});
