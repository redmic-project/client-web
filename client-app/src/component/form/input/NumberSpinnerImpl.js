define([
	"dijit/form/NumberSpinner"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	NumberSpinner
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input NumberSpinner.

		constructor: function(args) {

			this.config = {
				propertyName: "name",
				ownChannel: "numberSpinner"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var widget = new NumberSpinner(this._inputProps).placeAt(this.containerInput);

			return widget;
		},

		_setValue: function(value) {

			if (isNaN(value) && value !== undefined && value !== null)
				value = null;

			var obj = {};
			obj[this.propertyName] = value;

			this._emitSetValue(obj);
		}
	});
});
