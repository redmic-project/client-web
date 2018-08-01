define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "put-selector/put"
	, "./Browser"
	, "./row/_Table"
], function(
	declare
	, lang
	, aspect
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, put
	, Browser
	, _Table
){
	return declare([Browser], {
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
				tableConfig: {

				}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setTableConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeTable));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixTableEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineTableSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineTablePublications));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionTableRow));
			aspect.before(this, "_configRow", lang.hitch(this, this._configTableRow));
		},

		_setTableConfigurations: function() {

			this.headerOptionConfig = this._merge([{
				parentChannel: this.getChannel(),
				select: {
					'default': {}
				},
				multipleSelected: true,
				hideOnClickItem: false,
				indicatorLeft: true,
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

		_subListEventItem: function(res) {

			var rules = this._tableStyle.rules,
				value = res.value;

			this._tableStyle.rules[rules.length - value].style.display = res.actionSelect ? "flex" : "none";

			this._updateWidth();
		},

		_initializeTable: function() {

			this.headerOptionListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.headerOptionConfig);
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

		_getNodeBaseList: function() {

			return this.containerScroll;
		},

		_addData: function(res) {

			this._clearData();

			this._proccesNewData(res);

			this._createHeaders();
			this._showListMenu();
			this._addClassCols();

			this._updateWidth();
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

		_proccesNewData: function(res) {

			var data = this._parserIndexData(res);

			for (var i= 0; i < data.length; i++) {
				this._addItem(data[i]);
			}
		},

		_updateWidth: function() {

			if (!this.rowsContainerNode.firstChild) {
				return;
			}

			var nodeRow = this.rowsContainerNode.firstChild.firstChild,
				children = nodeRow.children;
				widthCount = 0;

			for (var i = 0; i < children.length; i++) {

				if (children[i]) {
					widthCount += children[i].clientWidth;
				}
			}

			var minWidthHeaders = widthCount + this._correctionHeaderRow,
				paddingHeaders = this._paddingHeaderRow;

			if (this._definitionButtonsRow) {
				var buttonsWidth = children[children.length - 1].clientWidth;
				minWidthHeaders -= buttonsWidth;
				paddingHeaders += buttonsWidth;
			}

			this.headersNode.setAttribute("style", "min-width:" + minWidthHeaders +
				"px; padding-right: " + paddingHeaders + "px;");

			this.contentListNode.setAttribute("style", "min-width:" + (widthCount + this._valueRow) + "px;");
		},

		_afterShow: function(obj) {

			setTimeout(lang.hitch(this, this._updateWidth), 200);
		},

		_addClassCols: function() {

			var columns = this.tableConfig.columns;

			this._classCount = 1;

			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];

				if (!column.type) {
					this._addClassCol(columns[i]);
				} else if (column.type === "arrayColumns") {
					this._addClassArrayColumns(columns[i]);
				}
			}
		},

		_addClassCol: function(column) {

			var styleBasic = "min-width: 5rem; width: 5rem; display: flex; justify-content: center;",
				style = column.style || "";

			this._tableStyle.insertRule(".table-col-" + (this._classCount) + " { " + styleBasic + style + " } ");

			this._classCount ++;
		},

		_addClassArrayColumns: function(column, i) {

			var value = column.countData;

			for (var n = 0; n < value; n++) {
				this._addClassCol(column);
			}
		},

		_showListMenu: function() {

			this._emitEvt('CLEAR_ITEMS');

			var headerConfig = this.tableConfig.header;

			if (headerConfig.notMenuColumns || !this._headersData.length) {
				return;
			}

			this.optionHeaderList = put(this.headersNode.firstChild, "-i.iconOptionHeader.fa.fa-columns");

			for (var i= 0; i < this._headersData.length; i++) {
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

			this._headersData = [];

			while (this.headersNode.firstChild) {
				put(this.headersNode.firstChild, '!');
			}

			var columns = this.tableConfig.columns,
				totalColumns = columns.length,
				headerConfig = this.tableConfig.header || {};

			for (var i = 0; i < totalColumns; i++) {
				var column = columns[i],
					type = column.type,
					propHeader = column.propertyHeader;

				if (!type) {
					this._createHeader(column, this._getContentHeader(column), headerConfig);
				} else if (type == "arrayColumns" && this._headers[propHeader]) {
					this._createHeadersArrayColumns(column, this._headers[propHeader]);
				}
			}
		},

		_createHeadersArrayColumns: function(column, dataHeader) {

			var headerConfig = this.tableConfig.header || {},
				itemHeader,	content, label;

			for (var i = 0; i < dataHeader.length; i++) {
				itemHeader = dataHeader[i];

				content = itemHeader.label || this._getContentHeader(column);

				this._createHeader(column, content, headerConfig);
			}
		},

		_createHeader: function(column, content, headerConfig) {

			this._addHeaderInData(column, content);

			var children = this.headersNode.children.length,
				colClass = 'table-col-' + (children + 1);

			if (!children) {
				colClass += '.table-cell-header-1';
			}

			var node = put(this.headersNode, 'span.table-cell.' + colClass),
				format = headerConfig.format;

			if (!column.template) {
				if (format) {
					content = format(content);
				}

				node.innerText = content;
			} else {
				node.innerHTML = content;
			}
		},

		_addHeaderInData: function(column, content) {

			var obj = {
					item: {
						value: this.headersNode.children.length + 1,
						label: content
					},
					select: true
				};

			if (column.noDisabled) {
				obj.item.noDisabled = true;
			}

			if (column.noSelect) {
				obj.select = false;
			}

			this._headersData.push(obj);
		},

		_getContentHeader: function(obj) {

			var label = obj.label || obj.property;

			return this.i18n[label] || label;
		}
	});
});
