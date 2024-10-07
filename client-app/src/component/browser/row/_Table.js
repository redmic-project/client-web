define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'RWidgets/Utilities'
	, 'put-selector'
], function(
	declare
	, lang
	, aspect
	, Utilities
	, put
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_createStructure", lang.hitch(this, this._createTableStructure));
			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setTableConfigurations));
		},

		_setTableConfigurations: function() {

			this.buttonsConfig = this._merge([{
				"class": "containerButtons"
			}, this.buttonsConfig || {}]);
		},

		_createTableStructure: function() {

			this.tableRowNode = put(this.rowTopNode, "div.table-row");

			put(this.templateNode, "!");
		},

		_updateData: function(item) {

			this.currentData = item;

			put(this.tableRowNode, "[data-redmic-id=$]", this._getId());

			this._clearTableRowNode();

			this._updateColumns();
		},

		_clearTableRowNode: function() {

			while (this.tableRowNode.firstChild) {
				put(this.tableRowNode.firstChild, '!');
			}
		},

		_updateColumns: function() {

			if (this.columns) {
				for (var i = 0; i < this.columns.length; i++) {
					this._updateColumn(this.columns[i]);
				}
			}
		},

		_updateColumn: function(column) {

			this._currentColumn = column;

			var content = this._getContent();

			if (this._isTypeArrayColumns()) {
				this._generatorColumnsWithArray(content);
			} else {
				this._createCell(content);
			}
		},

		_getContent: function(property) {

			if (this._isConfigWithTemplate() && !property) {
				return this._getContentTemplate();
			}

			return this._getContentWithPropertyInData(property);
		},

		_getContentWithPropertyInData: function(property) {

			var data = this.currentData;

			if (property) {
				data = this._currentDataArray;
			} else {
				property = "property";
			}

			var content = Utilities.getDeepProp(data, this._currentColumn[property], this.pathSeparator);

			if (this._isContent(content)) {
				return content;
			}

			return this._currentColumn.notContent || "";
		},

		_isContent: function(content) {

			if (content !== null && content !== undefined) {
				return true;
			}

			return false;
		},

		_getContentTemplate: function() {

			return this._currentColumn.template({
				data: this.currentData,
				i18n: this.i18n
			});
		},

		_createCell: function(content) {

			var nodeItem = this._createNodeCell();

			if (this._isConfigWithTemplate()) {
				nodeItem.innerHTML = content;
			} else {
				nodeItem.innerText = this._formatContent(content);
			}
		},

		_createNodeCell: function() {

			return put(this.tableRowNode, 'span' + this._classNewNodeCell() + this._attributeDataRemicProperty());
		},

		_classNewNodeCell: function() {

			return '.table-cell.table-col-' + (this.tableRowNode.children.length + 1);
		},

		_attributeDataRemicProperty: function() {

			return '[data-redmic-property="' + this._getProperty() + '"]';
		},

		_isConfigWithTemplate: function() {

			if (this._currentColumn.template) {
				return true;
			}

			return false;
		},

		_formatContent: function(content) {

			var format = this._currentColumn.format;

			if (format) {
				return format(content);
			}

			return content;
		},

		_generatorColumnsWithArray: function(data) {

			for (var i = 0; i < data.length; i++) {
				this._currentDataArray = data[i];

				var content = this._getContent("propertyInArrayItem");

				this._createCell(content);
			}
		},

		_getProperty: function() {

			if (this._isTypeArrayColumns()) {
				return this._getArrayColumnsType();
			} else {
				return this._currentColumn.property;
			}
		},

		_isTypeArrayColumns: function() {

			if (this._currentColumn.type == "arrayColumns") {
				return true;
			}

			return false;
		},

		_getArrayColumnsType: function() {

			return this._currentColumn.propertyInArrayItem;
		}
	});
});
