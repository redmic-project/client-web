define([
	"dijit/form/ValidationTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/_BaseWidthExpandTooltipImpl"
], function(
	ValidationTextBox
	, declare
	, lang
	, _BaseWidthExpandTooltipImpl
){
	return declare(_BaseWidthExpandTooltipImpl, {
		//	summary:
		//		Base para input textBox con expandir en tooltip.

		constructor: function(args) {

			this.config = {
				classInputInTooltip: ''
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			return new ValidationTextBox(this._inputProps).placeAt(this.containerInput);
		}
	});
});