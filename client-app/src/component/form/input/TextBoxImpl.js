define([
	"dijit/form/ValidationTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	ValidationTextBox
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input TextBox.

		constructor: function(args) {

			this.config = {
				propertyName: "name",
				ownChannel: "textBox"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new ValidationTextBox(this._inputProps).placeAt(this.containerInput);
		}
	});
});
