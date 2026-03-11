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
				insertInFront: false,
				pathProperty: 'path'
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

			if (itemId === undefined && this.pathProperty) {
				var itemPath = item[this.pathProperty];
				if (itemPath) {
					itemId = itemPath.split(this.pathSeparator).pop();
				}
			}

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

			const idProperty = this._getItemIdProperty(item),
				rowInstance = this._addOrUpdateRow(item);

			if (!rowInstance) {
				return;
			}

			const rowData = this._merge([this._getRowData(idProperty), item]);

			if (rowInstance._getShown()) {
				this._publish(rowInstance.getChannel('UPDATE_DATA'), {
					data: rowData
				});
				return;
			}

			const showProps = {
				node: this.rowsContainerNode,
				data: rowData,
				inFront: !!this.insertInFront
			};

			this._publish(rowInstance.getChannel('SHOW'), showProps);
		},

		_addOrUpdateRow: function(item) {

			const idProperty = this._getItemIdProperty(item);

			let rowInstance = this._getRowInstance(idProperty);
			if (!rowInstance) {
				this._addRow(idProperty, item);
				rowInstance = this._getRowInstance(idProperty);
			} else {
				this._publish(rowInstance.getChannel('UPDATE_TEMPLATE'), {
					template: this._getTemplate(this._mergeRowData(idProperty, item))
				});
			}

			return rowInstance;
		}
	});
});
