define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/NumberSpinnerImpl"
	, "src/component/form/input/NumberTextBoxImpl"
	, "src/component/form/input/_BaseRange"
], function(
	declare
	, lang
	, NumberSpinnerImpl
	, NumberTextBoxImpl
	, _BaseRange
){
	return declare(_BaseRange, {
		//	summary:
		//		Implementación de input GeographicCoordinate.

		constructor: function(args) {

			this.config = {
				_inputProps: {
				},
				_minInputProps: {
					inputProps: {
					}
				},
				_maxInputProps: {
					inputProps: {
					}
				},
				ownChannel: "range"
			};

			lang.mixin(this, this.config, args);

			if (this.inputProps.useSpinner) {
				this.inputDef = NumberSpinnerImpl;
			} else {
				this.inputDef = NumberTextBoxImpl;
			}

			var constraints = this.inputProps.constraints;
			if (constraints) {
				this._minInputProps.inputProps.constraints = constraints;
				this._maxInputProps.inputProps.constraints = constraints;
			}

			if (this.inputProps.minInputProps) {
				lang.mixin(this._minInputProps.inputProps, this.inputProps.minInputProps);
			}
			if (this.inputProps.maxInputProps) {
				lang.mixin(this._maxInputProps.inputProps, this.inputProps.maxInputProps);
			}
		}
	});
});
