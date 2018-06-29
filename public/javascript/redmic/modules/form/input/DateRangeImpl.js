define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/DateTimeTextBoxImpl"
	, "redmic/modules/form/input/_BaseRange"
], function(
	declare
	, lang
	, DateTimeTextBoxImpl
	, _BaseRange
){
	return declare(_BaseRange, {
		//	summary:
		//		Implementación de input para rango de fecha.

		constructor: function(args) {

			this.config = {
				inputDef: DateTimeTextBoxImpl,
				_inputProps: {

				},
				_minInputProps: {
					labelProperty: 'startDate',
					inputProps: {
						propertyNameDependence: 'endDate',
						dependenceType: 'startDate'
					},
					classInputInTooltip: 'textBoxLittleWidth'
				},
				_maxInputProps: {
					labelProperty: 'endDate',
					inputProps: {
						propertyNameDependence: 'startDate',
						dependenceType: 'endDate'
					},
					classInputInTooltip: 'textBoxLittleWidth'
				},
				ownChannel: "dateRange"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var retInherited = this.inherited(arguments);

			this.containerInput.className += " dateRange";

			return retInherited;
		},

		_subValueChangedWidget: function(key, res) {

			if (this.channelModel){
				this.inherited(arguments);
				return;
			}

			this._parseValueChangedWidget(key, res);

			this._setValue({
				startDate: this.startDateValue,
				endDate: this.endDateValue
			});
		},

		_parseValueChangedWidget: function(key, res) {

			if (key === "min") {
				this.startDateValue = res.value;
			} else {
				this.endDateValue = res.value;
			}
		}
	});
});
