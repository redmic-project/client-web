define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector'
	, "./_Table"
], function(
	declare
	, lang
	, aspect
	, put
	, _Table
){
	return declare([_Table], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config);

			aspect.after(this, "_updateData", lang.hitch(this, this._updateHierarchicalTableData));
		},

		_updateHierarchicalTableData: function(retObj, args) {

			if (this.columns && this.tableRowNode.firstChild) {

				var item = args[0],
					pathProperty = item[this.pathProperty],
					pathSplit = pathProperty.split(this.pathSeparator);

				put(this.tableRowNode.firstChild, '.table-col-hierrarchical-' + (pathSplit.length - 1));
			}
		}
	});
});
