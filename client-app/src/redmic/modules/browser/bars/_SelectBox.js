define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function(
	declare
	, lang
	, put
){
	return declare(null, {
		//	summary:
		//		Base para las extensiones que necesiten un select en el listado.
		//	description:
		//		Añade funcionalidades de select a la vista.

		constructor: function(args) {

			this.config = {
				labelSelect: null,
				pathSeparate: ".",
				selectOptions: [],
				optionDefault: null
			};

			lang.mixin(this, this.config);
		},

		_generateSelectBox: function() {

			put(this.getNodeSelect(), ".containerSelectionBox");

			this.containerSelect = put(this.getNodeSelect(), "div.seeSelection");

			this.labelSelect && put(this.containerSelect, "span", this.labelSelect);
		},

		getNodeSelect: function() {

		},

		_createSelect: function() {

			if (!this.containerSelect) {
				this._generateSelectBox();
			}

			this._removeSelectOption();

			this._createSelectOption();
		},

		_removeSelectOption: function() {

			this.selectNode && put(this.selectNode, "!");
		},

		_createSelectOption: function() {

			this.selectNode = put(this.containerSelect, 'select.form-control');

			this.selectNode.onchange = lang.hitch(this, this._evtOnChangeSelect);

			for (var i = 0; i < this.selectOptions.length; i++ ) {
				var item = this.selectOptions[i],
					selected = "";

				if (item.value == this.selectOptions) {
					selected = "[selected]";
				}

				var optionNode = put(this.selectNode, "option" + selected +
					"[value=$]", item.value, item.label || this.i18n[item.value] || item.value);
			}
		},

		_evtOnChangeSelect: function(evt) {

			var optionSelect = this.selectNode.options[this.selectNode.selectedIndex].value;

			this._changeSelect(optionSelect, this.selectNode.selectedIndex);
		},

		_changeSelect: function(optionSelect, indexOption) {

		}
	});
});
