define([
	"RWidgets/Slider"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	Slider
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Button.

		constructor: function(args) {

			this.config = {
				ownChannel: "slider"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new Slider(this._inputProps).placeAt(this.containerInput);
		},

		_disable: function() {

			this._inputInstance && this._inputInstance.disable();
		},

		_enable: function() {

			this._inputInstance && this._inputInstance.enable();
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			this._inputInstance && this._inputInstance.setValueSlider(value);
			this._emitChanged(value);
		}
	});
});
