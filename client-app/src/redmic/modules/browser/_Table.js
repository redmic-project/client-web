define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "put-selector/put"
	, "./row/_Table"
], function(
	declare
	, lang
	, aspect
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, put
	, _Table
){
	return declare(null, {
		//	summary:
		//		Implementación de listado en formato de tabla.
		//	description:
		//		Añade funcionalidades para listado en formato tablas.

		constructor: function(args) {

			this.config = {
				tableActions: {},
				tableEvents: {
					SHOW_ITEM: "showItemGrid",
					HIDE_ITEM: "hideItemGrid",
					ADD_ITEM: "addItemGrid",
					REMOVE_ITEM: "removeItemGrid",
					CLEAR_ITEMS: "clearItems"
				},

				_paddingHeaderRow: 45,
				_correctionHeaderRow: -20,
				_valueRow: 25,
				tableConfig: {}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setTableConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeTable));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixTableEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineTableSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineTablePublications));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionTableRow));
			aspect.before(this, "_configRow", lang.hitch(this, this._configTableRow));
			aspect.before(this, "_clear", lang.hitch(this, this._clearTable));
		},

		_setTableConfigurations: function() {

			this.headerOptionConfig = this._merge([{
				parentChannel: this.getChannel(),
				select: {
					'default': {}
				},
				multipleSelected: true,
				hideOnClickItem: false,
				classTooltip: "tooltipButtonMenu"
			}, this.headerOptionConfig || {}]);

			this.tableConfig = this._merge([{
				header: {},
				columns: {}
			}, this.tableConfig || {}]);
		},

		_mixTableEventsAndActions: function () {

			lang.mixin(this.events, this.tableEvents);
			lang.mixin(this.actions, this.tableActions);

			delete this.tableEvents;
			delete this.tableActions;
		},

		_defineTableSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.headerOptionListMenu.getChannel("EVENT_ITEM"),
				callback: "_subListEventItem"
			});
		},

		_defineTablePublications: function() {

			this.publicationsConfig.push({
				event: "SHOW_ITEM",
				channel: this.headerOptionListMenu.getChannel("SHOW_ITEM")
			},{
				event: "HIDE_ITEM",
				channel: this.headerOptionListMenu.getChannel("HIDE_ITEM")
			},{
				event: "ADD_ITEM",
				channel: this.headerOptionListMenu.getChannel("ADD_ITEM")
			},{
				event: "REMOVE_ITEM",
				channel: this.headerOptionListMenu.getChannel("REMOVE_ITEM")
			},{
				event: "CLEAR_ITEMS",
				channel: this.headerOptionListMenu.getChannel("CLEAR_ITEMS")
			});
		},

		_initializeTable: function() {

			this.headerOptionListMenu = new declare([ListMenu, _ShowOnEvt])
				.extend(_ShowInTooltip)(this.headerOptionConfig);
		},

		postCreate: function() {

			if (this._selection) {
				this._paddingHeaderRow -= 10;
				this._correctionHeaderRow += 10;
			}

			this.containerScroll = put(this.domNode, "div.containerScroll");

			this.headersNode = put(this._getNodeBaseList(), "div.headerList.table-row");

			this.inherited(arguments);

			this._tableStyle = document.createElement("style");

			document.head.appendChild(this._tableStyle);

			this._tableStyle = this._tableStyle.sheet;
		},

		_subListEventItem: function(res) {

			var rules = this._tableStyle.rules,
				value = res.value;

			this._tableStyle.rules[rules.length - value].style.display = res.actionSelect ? "flex" : "none";

			this._updateWidth();
		},

		_getNodeBaseList: function() {

			return this.containerScroll;
		},

		_addData: function(res) {

			this._clear();

			this._processNewData(res);

			this._addOthers();
		},

		_clearTable: function() {

			this._clearHeaders();
			this._setStyleInNodes(0);
		},

		_parserIndexData: function(res) {

			var headers = res.headers || res.header,
				data = res.data;

			if (!data.length && data.data) {
				headers = data.headers || data.header;
				data = data.data;
			} else if (!data.length && data.features) {
				headers = data.headers || data.header;
				data = data.features;
			}

			this._headers = headers;

			return data;
		},

		_addOthers: function() {

			this._createHeaders();
			this._showListMenu();
			this._addClassColumns();

			setTimeout(lang.hitch(this, this._updateWidth), 200);
		},

		_updateWidth: function() {

			if (!this.rowsContainerNode.firstChild) {
				return;
			}

			this._setStyleInNodes(this._calculateWidthCount());
		},

		_calculateWidthCount: function() {

			var nodeRow = this.rowsContainerNode.firstChild.firstChild,
				children = nodeRow.children;
				widthCount = 0;

			for (var i = 0; i < children.length; i++) {
				if (children[i]) {
					widthCount += children[i].clientWidth;
				}
			}

			return widthCount;
		},

		_setStyleInNodes: function(widthCount) {

			this._calculateMinWidthAndPaddingRightHeaders(widthCount);

			this._setStyleInHeaders(widthCount);
			this._setStyleInContentList(widthCount);
		},

		_setStyleInHeaders: function(widthCount) {

			var style = "min-width:" + this._minWidthHeaders + "px; padding-right: " + this._paddingRightHeaders + "px;";

			this.headersNode.setAttribute("style", style);
		},

		_calculateMinWidthAndPaddingRightHeaders: function(widthCount) {

			if (!this.rowsContainerNode.firstChild) {
				return;
			}

			var buttonsWidth = 0,
				nodeRow = this.rowsContainerNode.firstChild.firstChild,
				children = nodeRow.children;

			if (this._definitionButtonsRow) {
				buttonsWidth = children[children.length - 1].clientWidth;
			}

			this._minWidthHeaders = widthCount + this._correctionHeaderRow - buttonsWidth;
			this._paddingRightHeaders = this._paddingHeaderRow + buttonsWidth;
		},

		_setStyleInContentList: function(widthCount) {

			var style = "min-width:" + (widthCount + this._valueRow) + "px;";

			this.contentListNode.setAttribute("style", style);
		},

		_afterShow: function(obj) {

			setTimeout(lang.hitch(this, this._updateWidth), 200);
		},

		_addClassColumns: function() {

			var columns = this.tableConfig.columns;

			this._clearTableStyle();

			for (var i = 0; i < columns.length; i++) {
				this._addClassColumnType(columns[i]);
			}
		},

		_clearTableStyle: function() {

			this._classCount = 1;

			while (this._tableStyle.rules.length) {
				this._tableStyle.deleteRule(0);
			}
		},

		_addClassColumnType: function(column) {

			this._currentColumn = column;

			if (this._isTypeArrayColumns()) {
				this._addClassArrayColumns();
			} else {
				this._addClassColumn();
			}
		},

		_addClassColumn: function() {

			var styleBasic = "min-width: 5rem; width: 5rem; display: flex; justify-content: center;",
				style = this._currentColumn.style || "";

			this._tableStyle.insertRule(".table-col-" + (this._classCount) + " { " + styleBasic + style + " } ");

			this._classCount ++;
		},

		_addClassArrayColumns: function() {

			var value = this._currentColumn.countData;

			for (var n = 0; n < value; n++) {
				this._addClassColumn(this._currentColumn);
			}
		},

		_showListMenu: function() {

			this._emitEvt('CLEAR_ITEMS');

			var headerConfig = this.tableConfig.header;

			if ((headerConfig && headerConfig.notMenuColumns) || !this._headersData.length) {
				return;
			}

			this.optionHeaderList = put(this.headersNode.firstChild, "-i.iconOptionHeader.fa.fa-columns");

			for (var i = 0; i < this._headersData.length; i++) {
				this._emitEvt('ADD_ITEM', this._headersData[i]);
			}

			this._publish(this.headerOptionListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.optionHeaderList
			});
		},

		_definitionTableRow: function() {

			this._defRow.push(_Table);
		},

		_configTableRow: function(item) {

			this.rowConfig = this._merge([this.rowConfig || {}, {
				columns: this.tableConfig.columns
			}]);
		},

		_createHeaders: function() {

			var columns = this.tableConfig.columns,
				totalColumns = columns.length;

			for (var i = 0; i < totalColumns; i++) {
				this._createHeaderWithType(columns[i]);
			}
		},

		_clearHeaders: function() {

			this._headersData = [];

			while (this.headersNode.firstChild) {
				put(this.headersNode.firstChild, '!');
			}
		},

		_createHeaderWithType: function(column) {

			var propHeader = column.propertyHeader;

			this._currentColumn = column;

			if (this._isTypeArrayColumns() && this._headers[propHeader]) {
				column.countData = this._headers[propHeader].length;
				this._createHeadersArrayColumns(this._headers[propHeader]);
			} else {
				this._createHeader(this._getContentHeader(), this.tableConfig.header || {});
			}
		},

		_createHeadersArrayColumns: function(dataHeader) {

			for (var i = 0; i < dataHeader.length; i++) {
				var content = dataHeader[i].label || this._getContentHeader();

				this._createHeader(content, this.tableConfig.header || {});
			}
		},

		_createHeader: function(content, headerConfig) {

			this._addHeaderInData(content);

			var node = this._addNodeHeader();

			if (this._isConfigWithTemplate()) {
				node.innerHTML = content;
			} else {
				node.innerText = this._formatContent(content, headerConfig.format);
			}
		},

		_addNodeHeader: function() {

			return put(this.headersNode, 'span' + this._getClassHeader());
		},

		_getClassHeader: function() {

			var children = this.headersNode.children.length,
				colClass = '.table-cell.table-col-' + (children + 1);

			if (!children) {
				colClass += '.table-cell-header-1';
			}

			return colClass;
		},

		_formatContent: function(content, format) {

			if (format) {
				return format(content);
			}

			return content;
		},

		_isConfigWithTemplate: function() {

			if (this._currentColumn.template) {
				return true;
			}

			return false;
		},

		_addHeaderInData: function(content) {

			this._headersData.push(this._getPropertiesHeaders(content));
		},

		_getPropertiesHeaders: function(content) {

			var obj = {
					item: {
						value: this.headersNode.children.length + 1,
						label: content
					},
					select: true
				};

			if (this._currentColumn.noDisabled) {
				obj.item.noDisabled = true;
			}

			if (this._currentColumn.noSelect) {
				obj.select = false;
			}

			return obj;
		},

		_getContentHeader: function() {

			var label = this._currentColumn.label || this._currentColumn.property;

			return this.i18n[label] || label;
		},

		_isTypeArrayColumns: function() {

			if (this._currentColumn.type == "arrayColumns") {
				return true;
			}

			return false;
		}
	});
});
