define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
	, "RWidgets/Utilities"
	, "put-selector/put"
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
	, Utilities
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
					REMOVE_ITEM: "removeItem"
				},

				idProperty: 'id',
				_rows: {},

				definitionRow: [Row],

				initialDataSave: false
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_addData", lang.hitch(this, this._emitEvt, 'REFRESH_COMPLETE'));
			aspect.after(this, "_addItem", lang.hitch(this, this._emitEvt, 'DATA_ADDED'));
			aspect.after(this, "_removeItem", lang.hitch(this, this._emitEvt, 'DATA_REMOVED'));
			aspect.after(this, "_clearData", lang.hitch(this, this._emitEvt, 'CLEARED'));
			aspect.after(this, "_updateTemplate", lang.hitch(this, this._emitEvt, 'TEMPLATE_UPDATED'));

			aspect.before(this, "_addItem", lang.hitch(this, this._addReplaceHighlightInItem));
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
				channel: this.getChannel("REFRESHED")
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

			this._createContainer();

			this.inherited(arguments);
		},

		_createContainer: function() {

			this.contentListNode = put(this._getNodeBaseList(), "div." + this.listContentClass);
			this.rowsContainerNode = put(this.contentListNode, "div." + this.rowsContainerClass);
		},

		_getNodeBaseList: function() {

			return this.domNode;
		},

		_subRefresh: function(res) {

			if (res && res.initData && this._initData) {
				this._dataAvailable(lang.clone(this._initData));
			}
		},

		_subClear: function() {

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

			var rowInstance;

			this._definitionRow();

			this._configRow(item);

			rowInstance = new declare(this._defRow)(this.rowConfig);

			this._setRow(idProperty, {
				instance: rowInstance,
				data: item
			});
		},

		_definitionRow: function() {

			this._defRow = [];

			this._defRow = lang.clone(this.definitionRow);

			if (this._defRow instanceof Array) {
				return this._defRow;
			}

			this._defRow = [this._defRow];

			return this._defRow;
		},

		_configRow: function(item) {

			this.rowConfig = this._merge([this.rowConfig || {}, {
				parentChannel: this.getChannel(),
				template: this._getTemplate(item),
				idProperty: this.idProperty
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

		_getNodeToShow: function() {

			return this.domNode;
		},

		_beforeShow: function(req) {

			if (req && req.node) {
				put(req.node.domNode || req.node, ".flex");
				this._addFlexInNode = true;
			}
		},

		_afterHide: function() {

			if (this._addFlexInNode) {
				put(this.currentNode.domNode || this.currentNode, "!flex");
				this._addFlexInNode = false;
			}
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

		_addReplaceHighlightInItem: function(item) {

			if (item && item._meta) {
				var highlight = item._meta.highlight;

				for (var content in highlight) {
					var value = '',
						attr = highlight[content];

					for (var i = 0; i < attr.length; i++) {
						value += attr[i];
					}

					Utilities.setDeepProp(item, content, value);
				}
			}
		}
	});
});
