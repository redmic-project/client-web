define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/NumberTextBoxImpl"
	, "redmic/modules/form/input/_BaseRange"
], function(
	declare
	, lang
	, NumberTextBoxImpl
	, _BaseRange
){
	return declare(_BaseRange, {
		//	summary:
		//		Implementación de input GeographicCoordinate.

		constructor: function(args) {

			this.config = {
				inputDef: NumberTextBoxImpl,
				_inputProps: {

				},
				_minInputProps: {
					inputProps: {
						intermediateChanges: true
					}
				},
				_maxInputProps: {
					inputProps: {
						intermediateChanges: true
					}
				},
				ownChannel: "range"
			};

			lang.mixin(this, this.config, args);
		}
	});
});