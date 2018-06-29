define([
	"dijit/form/RadioButton"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
], function(
	RadioButton
	, declare
	, lang
	, put
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input RadioButton.

		constructor: function(args) {

			this.config = {
				preProps: {

				},
				propertyName: "name",
				ownChannel: "radioButton"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			put(this.containerInput, '.nowrap');

			var widget = new RadioButton(this.preProps).placeAt(this.containerInput);

			if (this.preProps.description)
				put(this.containerInput, 'span[title=$].separateLeft.fa.fa-info-circle', this.preProps.description);

			return widget;
		}
	});
});