define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/base/_Store"
	, 'put-selector'
	, "./_BrowserItfc"
	, "./_NoDataTemplate"
	, "./row/Row"
], function(
	declare
	, lang
	, aspect
	, _Module
	, _Show
	, _Store
	, put
	, _BrowserItfc
	, _NoDataTemplate
	, Row
){
	return declare([_Module, _BrowserItfc, _Store, _Show, _NoDataTemplate], {
		//	summary:
		//		Todo lo necesario para trabajar con browser.
		//	description:
		//		Proporciona métodos y contenedor para el browser.

		constructor: function(args) {

			this.config = {
				// own events

				"class": "containerList bottomListBorder",
				listContentClass: "contentList",
				rowsContainerClass: "rowsContainer",
				rowContainerClass: "containerRow",

				events: {
					CLEARED: "cleared",
					DATA_ADDED: "dataAdded",
					DATA_REMOVED: "dataRemoved",
					GOT_DATA: "gotData",
					GOT_ITEM: "gotItem",
					GOT_ROW_CHANNEL: "gotRowChannel",
					REFRESH_COMPLETE: "refreshComplete",
					UPDATE_TEMPLATE: "updateTemplate",
					TEMPLATE_UPDATED: "templateUpdated"
				},
				// own actions
				actions: {
					CLEAR: "clear",
					CLEARED: "cleared",
					DATA_ADDED: "dataAdded",
					DATA_REMOVED: "dataRemoved",
					GET_DATA: "getData",
					GET_ITEM: "getItem",
					GET_ROW_CHANNEL: "getRowChannel",
					GOT_DATA: "gotData",
					GOT_ITEM: "gotItem",
					GOT_ROW_CHANNEL: "gotRowChannel",
					REFRESH: "refresh",
					REFRESHED: "refreshed",
					UPDATE_TEMPLATE_ROW: "updateTemplateRow",
					UPDATE_TEMPLATE: "updateTemplate",
					TEMPLATE_UPDATED: "templateUpdated",
					REMOVE_ITEM: "removeItem",
					REMOVE: "remove"
				},

				idProperty: 'id',
				_rows: {},

				_rowDefinitionComponents: [Row],

				initialDataSave: false
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_addData", lang.hitch(this, function(originalReturn, originalArgs) {

				this._emitEvt('REFRESH_COMPLETE', originalArgs[0]);
			}));

			aspect.after(this, "_addItem", lang.hitch(this, function(originalReturn, originalArgs) {

				this._emitEvt('DATA_ADDED', originalArgs[0]);
			}));

			aspect.after(this, "_removeItem", lang.hitch(this, function(originalReturn, originalArgs) {

				this._emitEvt('DATA_REMOVED', { idProperty: originalArgs[0] });
			}));

			aspect.after(this, "_clearData", lang.hitch(this, this._emitEvt, 'CLEARED'));

			aspect.after(this, "_updateTemplate", lang.hitch(this, function(originalReturn, originalArgs) {

				this._emitEvt('TEMPLATE_UPDATED', {
					template: originalArgs[0]
				});
			}));
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.getChannel("GET_DATA"),
				callback: "_subGetData"
			},{
				channel : this.getChannel("GET_ITEM"),
				callback: "_subGetItem"
			},{
				channel : this.getChannel("GET_ROW_CHANNEL"),
				callback: "_subGetRowChannel"
			},{
				channel : this.getChannel("UPDATE_TEMPLATE"),
				callback: "_subUpdateTemplate"
			},{
				channel : this.getChannel("REMOVE_ITEM"),
				callback: "_subRemoveItem"
			},{
				channel : this.getChannel('REMOVE'),
				callback: '_subRemove'
			},{
				channel : this.getChannel("REFRESH"),
				callback: "_subRefresh"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'CLEARED',
				channel: this.getChannel("CLEARED")
			},{
				event: 'REFRESH_COMPLETE',
				channel: this.getChannel("REFRESHED"),
				callback: "_pubRefreshed"
			},{
				event: 'DATA_ADDED',
				channel: this.getChannel("DATA_ADDED")
			},{
				event: 'DATA_REMOVED',
				channel: this.getChannel("DATA_REMOVED")
			},{
				event: 'TEMPLATE_UPDATED',
				channel: this.getChannel("TEMPLATE_UPDATED")
			},{
				event: 'GOT_DATA',
				channel: this.getChannel("GOT_DATA")
			},{
				event: 'GOT_ITEM',
				channel: this.getChannel("GOT_ITEM")
			},{
				event: 'GOT_ROW_CHANNEL',
				channel: this.getChannel("GOT_ROW_CHANNEL")
			},{
				event: 'UPDATE_TEMPLATE',
				channel: this.getChannel("UPDATE_TEMPLATE_ROW")
			});
		},

		postCreate: function() {

			this._createBrowserContainer();
			this._definitionRow();

			this.inherited(arguments);
		},

		_createBrowserContainer: function() {

			this.contentListNode = put(this._getNodeBaseList(), "div." + this.listContentClass);
			this.rowsContainerNode = put(this.contentListNode, "div." + this.rowsContainerClass);
		},

		_getNodeBaseList: function() {

			return this.domNode;
		},

		_pubRefreshed: function(channel) {

			this._publish(channel, {
				total: Object.keys(this._rows).length
			});
		},

		_subRefresh: function(res) {

			if (res && res.initData && this._initData) {
				this._dataAvailable(lang.clone(this._initData));
			}
		},

		_subClear: function() {

			this._clear();
		},

		_clear: function() {

			this._clearData();
		},

		_subGetData: function() {

			this._emitEvt("GOT_DATA", {
				data: this._getData()
			});
		},

		_subGetItem: function(req) {

			this._emitEvt("GOT_ITEM", {
				item: this._getRowData(req.idProperty)
			});
		},

		_subGetRowChannel: function(req) {

			this._emitEvt("GOT_ROW_CHANNEL", {
				channel: this._getRowChannel(req.idProperty)
			});
		},

		_subUpdateTemplate: function(req) {

			var template = req.template;

			if (!template) {
				return;
			}

			this._updateTemplate(template);
		},

		_subRemoveItem: function(req) {

			this._removeItem(req.idProperty);
		},

		_subRemove: function(req) {

			this._removeData(req.ids);
		},

		_clearData: function() {

			for (var key in this._rows) {
				this._removeRow(key);
			}
		},

		_dataAvailable: function(response) {

			if (!this._initData && this.initialDataSave) {
				this._initData = lang.clone(response);
			}

			this._addData(response);
		},

		_itemAvailable: function(response) {

			this._addItem(response.data.length ? response.data[0] : response.data);
		},

		_removeData: function(ids) {

			for (var i = 0; i < ids.length; i++) {
				this._removeItem(ids[i]);
			}
		},

		_removeRow: function(idProperty) {

			var instanceRow = this._getRowInstance(idProperty);

			if (instanceRow) {
				this._removeRowInstance(instanceRow);
			}

			delete this._rows[idProperty];
		},

		_removeRowInstance: function(instanceRow) {

			this._publish(instanceRow.getChannel('HIDE'));
			this._publish(instanceRow.getChannel('DISCONNECT'));
			this._publish(instanceRow.getChannel('DESTROY'));
		},

		_addRow: function(idProperty, item) {

			this._configRow(item);

			var RowDefinition = declare(this._defRow),
				rowInstance = new RowDefinition(this.rowConfig);

			this._setRow(idProperty, {
				instance: rowInstance,
				data: item
			});
		},

		_definitionRow: function() {

			this._defRow = this._rowDefinitionComponents;

			if (!(this._defRow instanceof Array)) {
				this._defRow = [this._defRow];
			}
		},

		_configRow: function(item) {

			this.rowConfig = this._merge([this.rowConfig || {}, {
				parentChannel: this.getChannel(),
				template: this._getTemplate(item),
				idProperty: this.idProperty,
				pathSeparator: this.pathSeparator
			}]);
		},

		_getTemplate: function(item) {

			return this.template;
		},

		_removeItem: function(idProperty) {

			this._removeRow(idProperty);
		},

		_updateTemplate: function(template) {

			this.template = template;
		},

		getNodeToShow: function() {

			return this.domNode;
		},

		_getData: function() {

			var data = [];

			for (var key in this._rows) {

				data.push(this._getRowData(key));
			}

			return data;
		},

		_setRow: function(idProperty, obj) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			this._rows[idProperty] = this._merge([this._rows[idProperty] || {}, obj || {}]);
		},

		_setRowData: function(idProperty, data) {

			if (!this._isIdProperty(idProperty) || !this._rows[idProperty]) {
				return;
			}

			this._rows[idProperty].data = data;
		},

		_mergeRowData: function(idProperty, data) {

			if (!this._isIdProperty(idProperty) || !this._rows[idProperty]) {
				return;
			}

			data = this._merge([this._rows[idProperty].data, data]);

			this._rows[idProperty].data = data;

			return data;
		},

		_setRowInstance: function(idProperty, instance) {

			if (!this._isIdProperty(idProperty) || !this._rows[idProperty]) {
				return;
			}

			this._rows[idProperty].instance = instance;
		},

		_getRow: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			return this._rows[idProperty];
		},

		_getRowData: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var row = this._getRow(idProperty);

			if (!row) {
				return;
			}

			return row.data;
		},

		_getRowInstance: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var row = this._getRow(idProperty);

			if (!row) {
				return;
			}

			return row.instance;
		},

		_getRowChannel: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			return instance.getChannel();
		},

		_isIdProperty: function(idProperty) {

			if (idProperty === undefined || idProperty === null) {
				return false;
			}

			return true;
		},

		_parserIndexData: function(response) {

			var data = response.data;

			if (data.data) {
				data = data.data;
			}

			return data;
		},

		_processNewData: function(response) {

			var data = this._parserIndexData(response);

			for (var i = 0; i < data.length; i++) {
				this._addItem(data[i]);
			}
		}
	});
});
