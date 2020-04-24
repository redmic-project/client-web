define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
	, "put-selector/put"
], function (
	declare
	, lang
	, aspect
	, _Selection
	, put
) {

	return declare(_Selection, {
		//	summary:
		//		Extensión para añadir selection al la vista de detalles

		constructor: function(args) {

			aspect.after(this, "_addDataInTitle", this._groupSelected);
			aspect.after(this, "_createTitle", this._createTitleSelection);
		},

		_createTitleSelection: function() {

			if (this._checkBoxNode) {
				return;
			}

			this._selectItem = false;
			this._classDefaultSelection = "selectionDetails fa fa-";
			this._checkBoxNode = put(this._titleLeftNode, "span");
			this._checkBoxNode.setAttribute("class", this._classDefaultSelection + "square-o");
			this._checkBoxNode.onclick = lang.hitch(this, this._onClickSelection);
		},

		_groupSelected: function() {

			this._emitEvt("GROUP_SELECTED");
		},

		_onClickSelection: function() {

			this._toggleSelectionItem();
		},

		_toggleSelectionItem: function() {

			if (this._selectItem) {
				if (this.data) {
					this._emitEvt("DESELECT", [this.data[this.idProperty]]);
				}
				this._checkBoxDeselect();
			} else {
				if (this.data) {
					this._emitEvt("SELECT", [this.data[this.idProperty]]);
				}
				this._checkBoxSelect();
			}
		},

		_select: function(id, total) {

			this.inherited(arguments);

			if (this.data && this.data[this.idProperty] == id) {
				this._checkBoxSelect();
			}
		},

		_deselect: function(id, total) {

			this.inherited(arguments);

			if (this.data && this.data[this.idProperty] == id) {
				this._checkBoxDeselect();
			}
		},

		_checkBoxSelect: function() {

			this._selectItem = true;
			this._checkBoxNode.setAttribute("class", this._classDefaultSelection + "check-square-o");
		},

		_checkBoxDeselect: function() {

			this._selectItem = false;
			this._checkBoxNode.setAttribute("class", this._classDefaultSelection + "square-o");
		}
	});
});
