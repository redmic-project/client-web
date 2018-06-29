define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojox/widget/ColorPicker"
	, "redmic/modules/form/input/Input"
], function(
	declare
	, lang
	, aspect
	, ColorPicker
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input ColorPicker.

		constructor: function(args) {

			this.config = {
				propertyName: "colour",
				ownChannel: "colorPicker"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			this._inputProps.slideDuration = 0;

			var widget = new ColorPicker(this._inputProps).placeAt(this.containerInput);

			// TODO parchea bug de widget, no emite cambio cuando se pulsa sobre la barra de hue
			aspect.before(widget, "_updateColor", function() { return [true]; });

			return widget;
		},

		_valueChanged: function(obj) {

			this.inherited(arguments);

			if (obj[this.propertyName])
				this._inputInstance.setColor(obj[this.propertyName]);
		}
	});
});