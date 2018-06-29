define([
	"dijit/form/CheckBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
], function(
	CheckBox
	, declare
	, lang
	, put
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input CheckBox.

		constructor: function(args) {

			this.config = {
				propertyName: "name",
				ownChannel: "checkBox",
				valuePropertyName: "checked",
				noRequiredActive: true
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			put(this.containerInput, '.nowrap');

			var widget = new CheckBox(this._inputProps).placeAt(this.containerInput);

			if (this._inputProps.description)
				put(this.containerInput, 'span[title=$].separateLeft.fa.fa-info-circle', this._inputProps.description);

			return widget;
		},

		_getValueToSet: function(value) {

			if (value)
				return this._inputProps.value || value;

			return this._inputProps.value !== undefined ? null : false;
		}
	});
});