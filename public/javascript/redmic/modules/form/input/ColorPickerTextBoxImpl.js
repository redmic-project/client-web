define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/ColorPickerImpl"
	, "redmic/modules/form/input/_BaseTextBoxWidthExpandTooltipImpl"
], function(
	declare
	, lang
	, put
	, ColorPickerImpl
	, _BaseTextBoxWidthExpandTooltipImpl
){
	return declare(_BaseTextBoxWidthExpandTooltipImpl, {
		//	summary:
		//		Implementación de input ColorPickerTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: "colour",
				ownChannel: "colorPickerTextBox",
				classInputInTooltip: 'textBoxLittleWidth'
			};

			lang.mixin(this, this.config, args);

			this.inputInTooltipDef = ColorPickerImpl;
		},

		_createAdditionalContent: function() {

			this.inherited(arguments);

			this.colorNode = put(this.additionalNode.firstChild, '-div.contentIcon');
			this.iconColorNode = put(this.colorNode, 'i.fa.fa-circle');
		},

		_checkConditionIcon: function(value) {

			this.inherited(arguments);

			this._checkConditionColorIcon(value);
		},

		_checkConditionColorIcon: function(value) {

			if (value && this._chkValueForInputInTooltip(value)) {
				this.iconColorNode.setAttribute("style", "color:" + value + "; text-shadow: 0px 0px 3px white;");

				put(this.iconColorNode, '!hidden');
			} else
				put(this.iconColorNode, '.hidden');
		}
	});
});
