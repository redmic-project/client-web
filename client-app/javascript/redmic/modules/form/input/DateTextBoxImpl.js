define([
	"dijit/form/DateTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/Input"
], function(
	DateTextBox
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input DateTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: "date",
				ownChannel: "dateTextBox",
				timeClose: null
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			this.containerInput.className += " inputLittleWidth";

			return new DateTextBox(this._inputProps).placeAt(this.containerInput);
		}
	});
});