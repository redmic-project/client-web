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
	, _BaseWidthExpandTooltipImpl
){
	return declare(_BaseWidthExpandTooltipImpl, {
		//	summary:
		//		Implementación de input Color.

		constructor: function(args) {

			this.config = {
				propertyName: "colour",
				ownChannel: "color",
				classInputInTooltip: ''
			};

			lang.mixin(this, this.config, args);

			this.inputInTooltipDef = ColorPickerImpl;
		},

		_createInputInstance: function() {

			put(this.containerInput, '.colorSelect');

			this.contentVisibleNode = put(this.containerInput, 'div.contentClick');

			this.contentTemplateNode = put(this.contentVisibleNode, 'div.value');

			return false;
		},

		_createAdditionalContent: function() {

			this.expandNode = this.containerInput;

			this.expandNode.onclick = lang.hitch(this, this._eventExpandOnclick);
		},

		_getNodeInputInTooltip: function() {

			return this.containerInput;
		},

		_checkConditionIcon: function(value) {

			this.contentTemplateNode.style.background = value;
		}
	});
});
