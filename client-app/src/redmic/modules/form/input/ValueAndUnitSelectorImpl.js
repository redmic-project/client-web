define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/Input"
	, "RWidgets/ValueAndUnitSelector"
], function(
	declare
	, lang
	, Input
	, ValueAndUnitSelector
){
	return declare(Input, {
		//	summary:
		//		Implementación de input ValueAndUnitSelector.

		constructor: function(args) {

			this.config = {
				_inputProps: {
					minSlider: 0,
					delta: 0.01,
					i18n: this.i18n
				},
				propertyName: "name",
				ownChannel: "valueAndUnitSelector"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var widget = new ValueAndUnitSelector(this._inputProps).placeAt(this.containerInput);

			widget.on('changeValue', lang.hitch(this, this._setValueIntermediate));

			return widget;
		},

		_setValueIntermediate: function(obj) {

			this._setValue(obj.value);
		},

		_valueChanged: function(obj) {

			this._inputInstance.emit('setValue', obj[this.propertyName]);
			this._emitChanged(obj[this.propertyName]);
		},

		_reset: function() {

			this._inputInstance.emit('reset');
			this._enable();
		},

		_clear: function() {

			this._inputInstance.emit('clear');
			this._enable();
		}
	});
});