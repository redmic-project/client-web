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

			var rowsOld = this._rows,
				data = response.data;

			if (data.data) {
				data = data.data;
			}

			this._rows = {};

			for (var i = 0; i < data.length; i++) {

				var item = data[i],
					idProperty = item[this.idProperty];
					row = rowsOld[idProperty];
					rowInstance = row && row.instance;

				if (rowInstance) {
					this._setRow(idProperty, {
						instance: rowInstance,
						data: item
					});

					delete rowsOld[idProperty];
				}

				this._addItem(item);
			}

			for (var key in rowsOld) {
				this._removeRowInstance(rowsOld[key].instance);
			}
		},

		_addItem: function(item) {

			var idProperty = item[this.idProperty],
				rowInstance = this._getRowInstance(idProperty),
				obj = {
					node: this.rowsContainerNode
				};

			if (!rowInstance) {
				this._addRow(idProperty, item);
				rowInstance = this._getRowInstance(idProperty);
			} else {
				item = this._mergeRowData(idProperty, item);

				this._publish(rowInstance.getChannel('UPDATE_TEMPLATE'), {
					template: this._getTemplate(item)
				});
			}

			obj.data = this._getRowData(idProperty);

			if (this.insertInFront) {
				obj.inFront = true;
			}

			rowInstance && this._publish(rowInstance.getChannel('SHOW'), obj);
		}
	});
});
