define([
	"RWidgets/RangeSlider"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
], function(
	RangeSlider
	, declare
	, lang
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Button.

		constructor: function(args) {

			this.config = {
				ownChannel: "rangeSlider"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new RangeSlider(this._inputProps).placeAt(this.containerInput);
		},

		_disable: function() {

			this._inputInstance && this._inputInstance.disabled();
		},

		_enable: function() {

			this._inputInstance && this._inputInstance.enabled();
		},

		_getValueToSet: function(value) {

			if (this._inputDisabled || !value || !(value instanceof Array))
				return null;

			return {
				min: value[0],
				max: value[1]
			};
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			value && this._inputInstance && this._inputInstance.setValueRangeSlider([value.min, value.max]);
			this._emitChanged(value);
		}
	});
});
