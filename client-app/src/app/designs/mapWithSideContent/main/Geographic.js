define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/atlas/Atlas"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, 'redmic/modules/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'redmic/modules/layout/TabsDisplayer'
	, "redmic/modules/mapQuery/QueryOnMap"
	, "redmic/modules/search/TextImpl"
	, "templates/CitationList"
], function(
	_LocalSelectionView
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, aspect
	, Atlas
	, _Filter
	, _Store
	, Total
	, _ButtonsInRow
	, _Framework
	, _GeoJsonParser
	, ListImpl
	, MapCenteringGatewayImpl
	, GenericWithTopbarDisplayerImpl
	, TabsDisplayer
	, QueryOnMap
	, TextImpl
	, TemplateList
) {

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

			this._createBrowser();

			if (!this.notTextSearch) {
				this._createTextSearch();
			}

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			this.mapCenteringGateway = new MapCenteringGatewayImpl({
				parentChannel: this.getChannel()
			});
		},

		_createBrowser: function() {

			this.browserConfig.queryChannel = this.queryChannel;

			var exts = this.browserExts;
			exts.unshift(ListImpl, _Framework, _ButtonsInRow, _GeoJsonParser);
			var BrowserDefinition = declare(exts);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._browserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n.geographicData
			});
		},

		_createTextSearch: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this._publish(this._browserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
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

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n.geographicData,
				iconClass: 'fa fa-table',
				channel: this._browserWithTopbar.getChannel()
			});

			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
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
		}
	});
});
