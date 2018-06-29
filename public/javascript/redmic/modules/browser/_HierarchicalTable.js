define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_Table"
	, "./row/_HierarchicalTable"
], function(
	declare
	, lang
	, aspect
	, _Table
	, _HierarchicalTable
){
	return declare([_Table], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_paddingHeaderRow: 30,
				_correctionHeaderRow: -5
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_addItem", lang.hitch(this, this._addHierarchicalTableItem));
			aspect.before(this, "_addClassCols", lang.hitch(this, this._addClassHierarchicalCols));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._hierarchicalTableStyle = document.createElement("style");

			document.head.appendChild(this._hierarchicalTableStyle);

			this._hierarchicalTableStyle = this._hierarchicalTableStyle.sheet;
		},

		_definitionTableRow: function() {

			this._defRow.push(_HierarchicalTable);
		},

		_addHierarchicalTableItem: function(item) {

			var pathProperty = item[this.pathProperty],
				pathSplit = pathProperty.split(this.pathSeparator),
				value = pathSplit.length - 1;

			if (!this._countPath || this._countPath <= value) {
				this._countPath = value;
			}
		},

		_addClassHierarchicalCols: function() {

			for (var i = 1; i <= this._countPath; i++) {

				var value = (this._countPath * 2) - (2 * i - 1) + 0.5,
				style = "justify-content: flex-start;width: 30rem; padding-right: " + value +	"rem !important;";

				this._hierarchicalTableStyle.insertRule(".table-col-hierrarchical-" + i + " { " + style + " }");
			}
		}
	});
});
