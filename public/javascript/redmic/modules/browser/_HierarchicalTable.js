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
			aspect.after(this, "_addClassColumns", lang.hitch(this, this._addClassHierarchicalColumns));
			aspect.before(this, "_clearTableStyle", lang.hitch(this, this._clearHierarchicalTableStyle));
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

		_clearHierarchicalTableStyle: function() {

			while (this._hierarchicalTableStyle.rules.length) {
				this._hierarchicalTableStyle.deleteRule(0);
			}
		},

		_addClassHierarchicalColumns: function() {

			for (var i = 1; i <= this._countPath; i++) {
				this._addClassHierarchicalColumn(i);
			}
		},

		_addClassHierarchicalColumn: function(position) {

			var value = (this._countPath * 2) - (2 * position - 1) + 0.5,
			style = "justify-content: flex-start;width: 30rem; padding-right: " + value +	"rem !important;";

			this._hierarchicalTableStyle.insertRule(".table-col-hierrarchical-" + position + " { " + style + " }");
		}
	});
});
