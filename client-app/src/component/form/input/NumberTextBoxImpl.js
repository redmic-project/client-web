define([
	"dijit/form/NumberTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	NumberTextBox
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input NumberTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: "name",
				ownChannel: "numberTextBox"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var widget = new NumberTextBox(this._inputProps).placeAt(this.containerInput);

			return widget;
		},

		_setValue: function(value) {

			if (isNaN(value) && value !== undefined && value !== null)
				value = null;

			var obj = {};
			obj[this.propertyName] = value;

			this._emitSetValue(obj);
		},

		_valueChanged: function(res) {

			/*this._emitEvt('IS_VALID', {
				propertyName: this.propertyName
			});*/

			var value = res.value || res[this.propertyName];

			this._inputInstance.set(this.valuePropertyName, (value || value === 0) ? Number(value) : value);
			this._emitChanged(value);
		}
	});
});
