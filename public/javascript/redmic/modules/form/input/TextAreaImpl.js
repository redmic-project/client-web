define([
	"dijit/form/Textarea"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/Input"
], function(
	Textarea
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input TextArea.

		constructor: function(args) {

			this.config = {
				propertyName: "note",
				ownChannel: "textArea"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new Textarea(this._inputProps).placeAt(this.containerInput);
		}
	});
});