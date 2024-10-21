define([
	"app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingByFilter"
	, "app/designs/mapWithSideContent/main/_TrackingWithList"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_Selection"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_HierarchicalLazyLoad"
	, "src/component/browser/_HierarchicalSelect"
	, "src/component/browser/_Framework"
	, "src/component/browser/_MultiTemplate"
	, "src/component/browser/_Select"
	, "src/component/browser/HierarchicalImpl"
	, "src/component/browser/ListImpl"
	, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Total"
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, "src/component/search/TextImpl"
	, "templates/ActivityList"
	, "templates/LoadingCustom"
], function(
	Tracking
	, _TrackingByFilter
	, _TrackingWithList
	, redmicConfig
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
	, GenericWithTopbarDisplayerImpl
	, TextImpl
	, templateActivityList
	, LoadingCustom
) {

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
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				template: templateActivityList,
				selectorChannel: this.selectorChannel,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: redmicConfig.viewPaths.activityDetails
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

			this._createActivityCatalog();
		},

		_createActivityCatalog: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _Select]);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._activityBrowserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n.activityCatalogView
			});

			this._publish(this._activityBrowserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
			});
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.browserWork.getChannel("NO_DATA_MSG_CLICKED"),
				callback: "_subBrowserWorkNoDataMsgClicked"
			});
		},

		_fillSideContent: function() {

			var addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');

			this._publish(addTabChannel, {
				title: this.i18n.activityCatalogView,
				iconClass: 'fa fa-tasks',
				channel: this._activityBrowserWithTopbar.getChannel()
			});

			this.inherited(arguments);
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
				target: this.targetBrowserWork
			});
		},

		_itemAvailable: function(item) {

			this._injectItemInBrowserWork(item.data);
		},

		_clearSelection: function(response) {

			this._clear();
		},

		_subBrowserWorkNoDataMsgClicked: function(res) {

			this._publish(this._tabsDisplayer.getChannel('SHOW_TAB'), {
				channel: this._activityBrowserWithTopbar.getChannel()
			});
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
