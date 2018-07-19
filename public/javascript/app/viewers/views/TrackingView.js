define([
	"app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingByFilter"
	, "app/designs/mapWithSideContent/main/_TrackingWithList"
	, "app/redmicConfig"
	, "dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_HierarchicalLazyLoad"
	, "redmic/modules/browser/_HierarchicalSelect"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/search/TextImpl"
	, "templates/ActivityList"
	, "templates/LoadingCustom"
], function(
	Tracking
	, _TrackingByFilter
	, _TrackingWithList
	, redmicConfig
	, BorderContainer
	, ContentPane
	, declare
	, lang
	, aspect
	, _Selection
	, _ButtonsInRow
	, _HierarchicalLazyLoad
	, _HierarchicalSelect
	, _Framework
	, _MultiTemplate
	, _Select
	, HierarchicalImpl
	, ListImpl
	, Pagination
	, SelectionBox
	, Total
	, TextImpl
	, templateActivityList
	, LoadingCustom
){
	return declare([Tracking, _TrackingWithList, _TrackingByFilter, _Selection], {
		//	summary:
		//		Vista de Tracking.
		//	description:
		//		Permite visualizar seguimientos.

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.pointTrackingActivities,
				pathSeparator: ".",
				targetBrowserWork: "browserWork",
				idProperty: 'id',
				browserWorkExts: [_ButtonsInRow, _HierarchicalSelect, _MultiTemplate],
				browserWorkBase: [HierarchicalImpl, _HierarchicalLazyLoad, _Framework]
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_serializedFilter", lang.hitch(this, this._beforeSerializedFilter));
		},

		_setConfigurations: function() {

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				highlightField: ['name'],
				suggestFields: ["name", "code"],
				searchFields: ["name^3", "code^3"],
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				template: templateActivityList,
				selectorChannel: this.selectorChannel,
				perms: this.perms,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: redmicConfig.viewPaths.activityCatalogDetails
						}]
					}
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Pagination
				}]
			}, this.browserConfig || {}]);

			this.browserWorkConfig = this._merge([{
				targetChildren: redmicConfig.services.elementsTrackingActivity,
				parentIdProperty: 'id',
				childrenIdProperty: 'uuid',
				conditionParentProperty: 'activityType',
				generatePath: true,
				noDataMessage: {
					definition: LoadingCustom,
					props: {
						message: this.i18n.selectActivitiesToTracking,
						iconClass: "fa fa-tasks",
						clickable: true
					}
				}
			}, this.browserWorkConfig || {}]);
		},

		_initialize: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new declare([TextImpl])(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			this.browser = new declare([ListImpl, _Framework, _Select])(this.browserConfig);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.browserWork.getChannel("NO_DATA_MSG_CLICKED"),
				callback: "_subBrowserWorkNoDataMsgClicked"
			});
		},

		_fillSideContent: function() {

			this.inherited(arguments);

			this.borderContainerActivities = this._createBrowserAndSearch();

			this.tabContainer.addChild(this.borderContainerActivities, 0);
		},

		_createBrowserAndSearch: function() {

			var browserAndSearchContainer = new BorderContainer({
				title: this.i18n.activities,
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

			return browserAndSearchContainer;
		},

		_select: function(item) {

			if (!item) {
				return;
			}

			this._itemInList(item);
		},

		_itemInList: function(item) {

			var id = this._getIdFromPath(item);

			this._once(this.browser.getChannel("GOT_ITEM"), lang.hitch(this, this._subGotItem, id));

			this._publish(this.browser.getChannel("GET_ITEM"), {
				idProperty: id
			});
		},

		_subGotItem: function(id, obj) {

			var item = obj.item;

			if (item) {
				this._injectItemInBrowserWork(item);
			} else {
				this._emitEvt('GET', {
					target: this.target,
					requesterId: this.getOwnChannel(),
					id: id
				});
			}
		},

		_deselect: function(item) {

			var obj = {},
				activityId = this._getIdFromPath(item);

			obj.idProperty = this._generatePath(activityId);

			this._cleanElementByActivity(activityId);
			this._publish(this.browserWork.getChannel("REMOVE_ITEM"), obj);
		},

		_cleanElementByActivity: function(activityId) {

			var items = [];

			for (var key in this._activityIdByUuid) {
				if (this._activityIdByUuid[key] === activityId) {
					items.push(this._generatePath(activityId, key));
				}
			}

			this._publish(this._buildChannel(this.selectorChannel, this.actions.DESELECT), {
				items: items,
				selectionTarget: this.targetBrowserWork
			});
		},

		_itemAvailable: function(item) {

			this._injectItemInBrowserWork(item.data);
		},

		_clearSelection: function(response) {

			this._clear();
		},

		_subBrowserWorkNoDataMsgClicked: function(res) {

			this.tabContainer.selectChild(this.borderContainerActivities);
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH');
		},

		_beforeSerializedFilter: function(req) {

			var data = req.data,
				queryDataChildren = {};

			for (var key in data) {
				if (data[key] !== null) {
					queryDataChildren[key] = data[key];
				}
			}

			this._publish(this.browserWork.getChannel("SET_QUERY_DATA_CHILDREN"), {
				query: queryDataChildren
			});
		}
	});
});
