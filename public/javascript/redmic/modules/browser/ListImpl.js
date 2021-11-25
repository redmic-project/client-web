define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./Browser"
], function(
	declare
	, lang
	, Browser
){
	return declare([Browser], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				insertInFront: false
			};

			lang.mixin(this, this.config, args);
		},

		_addData: function(response) {

			this._clearRowsData();

			this._processNewData(response);

			this._clearOldRowsData();
		},

		_clearRowsData: function(response) {

			this._rowsOld = this._rows;
			this._rows = {};
		},

		_clearOldRowsData: function() {

			for (var key in this._rowsOld) {
				this._removeRowInstance(this._rowsOld[key].instance);
			}

			delete this._rowsOld;
		},

		_getItemIdProperty: function(item) {

			if (!item) {
				return;
			}

			var itemId = item[this.idProperty];

			if (typeof itemId === 'number') {
				return itemId.toString();
			}

			return itemId;
		},

		_rescueOldInstance: function(item) {

			if (!this._rowsOld) {
				return;
			}

			var idProperty = this._getItemIdProperty(item),
				row = this._rowsOld[idProperty],
				rowInstance = row && row.instance;

			if (rowInstance) {
				this._setRow(idProperty, {
					instance: rowInstance,
					data: item
				});

				if (this._rowsOld) {
					delete this._rowsOld[idProperty];
				}
			}
		},

		_addItem: function(item) {

			this._rescueOldInstance(item);

			var idProperty = this._getItemIdProperty(item),
				rowInstance = this._addOrUpdateRow(item),
				obj = {
					node: this.rowsContainerNode
				};

			obj.data = this._getRowData(idProperty);

			if (this.insertInFront) {
				obj.inFront = true;
			}

			rowInstance && this._publish(rowInstance.getChannel('SHOW'), obj);
		},

		_addOrUpdateRow: function(item) {

			var idProperty = this._getItemIdProperty(item),
				rowInstance = this._getRowInstance(idProperty);

			if (!rowInstance) {
				this._addRow(idProperty, item);
				rowInstance = this._getRowInstance(idProperty);
			} else {
				item = this._mergeRowData(idProperty, item);

				this._publish(rowInstance.getChannel('UPDATE_TEMPLATE'), {
					template: this._getTemplate(item)
				});
			}

			return rowInstance;
		}
	});
});
