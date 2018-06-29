define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'RWidgets/Utilities'
	, "put-selector/put"
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

			put(this.tableRowNode, "[data-redmic-id=$]", this._getId(item));

			while (this.tableRowNode.firstChild) {
				put(this.tableRowNode.firstChild, '!');
			}

			if (this.columns) {

				for (var i = 0; i < this.columns.length; i++) {
					var column = this.columns[i],
						content = this._getContent(item, column);

					if (!column.type) {
						this._createCell({
							config: column,
							content: content
						});
					} else if (column.type === "arrayColumns") {
						this.columns[i].countData = 16;
						this._generatorColumnsWithArray(column, content);
					}
				}
			}
		},

		_getContent: function(item, config, property) {

			var template = false;

			if (!config.type) {
				if (!config.template) {
					property = "property";
				} else {
					template = true;
				}
			} else if (config.type === "arrayColumns") {
				if (!property) {
					property = "property";
				} else if (config.template) {
					template = true;
				}
			}

			if (template) {
				return config.template({
					data: item,
					i18n: this.i18n
				});
			}

			var content = Utilities.getDeepProp(item, config[property], this.pathSeparator);

			if (content !== null && content !== undefined) {
				return content;
			}

			return config.notContent || "";
		},

		_createCell: function(obj) {

			var itemConfig = obj.config,
				content = obj.content,
				colClass = 'table-col-' + (this.tableRowNode.children.length + 1),
				nodeItem = put(this.tableRowNode, 'span.table-cell.' + colClass +
					"[data-redmic-property=$]", this._generatePropertyRow(itemConfig)),
				format = itemConfig.format;

			if (!itemConfig.template) {
				if (format) {
					content = format(content);
				}

				nodeItem.innerText = content;
			} else {
				nodeItem.innerHTML = content;
			}
		},

		_generatorColumnsWithArray: function(itemConfig, data) {

			for (var i = 0; i < data.length; i++) {

				this._createCell({
					config: itemConfig,
					content: this._getContent(data[i], itemConfig, "propertyInArrayItem")
				});
			}
		},

		_generatePropertyRow: function(itemConfig) {

			if (!itemConfig.type) {
				return itemConfig.property;
			} else if (itemConfig.type == "arrayColumns") {
				return itemConfig.propertyInArrayItem;
			}
		}
	});
});
