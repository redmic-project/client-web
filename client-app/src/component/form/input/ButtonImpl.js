define([
	"dijit/form/Button"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	Button
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Button.

		constructor: function(args) {

			this.config = {
				ownChannel: "button"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new Button(this._inputProps).placeAt(this.containerInput);
		}
	});
});
