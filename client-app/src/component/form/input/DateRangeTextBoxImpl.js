define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
	, "src/component/form/input/DateRangeComplexImpl"
	, "src/component/form/input/_BaseTextBoxWidthExpandTooltipImpl"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, moment
	, DateRangeComplexImpl
	, _BaseTextBoxWidthExpandTooltipImpl
	, Utilities
){
	return declare(_BaseTextBoxWidthExpandTooltipImpl, {
		//	summary:
		//		Implementación de input DateTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: 'date',
				ownChannel: 'dateTimeTextBox',
				classInputInTooltip: 'textBoxLittleWidth',
				propertyNameInputInTooltip: 'dateLimits',
				_inputProps: {
					readOnly: true
				},
				timeClose: null
			};

			lang.mixin(this, this.config, args);

			this.inputInTooltipDef = DateRangeComplexImpl;
		},

		_valueChanged: function(res) {

			this._valueChangedInputInTooltip(res);

			var value = res.value || res[this.propertyName];

			this._parseValueAndSetValueInput(value);

			this._emitChanged(value);
		},

		_parseValueAndSetValueInput: function(value) {

			if (!value) {
				this._inputInstance.set(this.valuePropertyName, value);
				return;
			}

			var valueInput,
				startDate = value.startDate,
				endDate = value.endDate;

			if (startDate && endDate) {
				if (startDate === endDate) {
					value = 'Igual que: ' + this._formatDateTime(endDate);
				} else {
					value = this._formatDateTime(startDate) + " - " + this._formatDateTime(endDate);
				}
			} else if (!startDate && endDate) {
				value = 'Menor que: ' + this._formatDateTime(endDate);
			} else if (startDate && !endDate) {
				value = 'Mayor que: ' + this._formatDateTime(startDate);
			}

			this._inputInstance.set(this.valuePropertyName, value);
			this._inputInstance.set('title', value);
		},

		_formatDateTime: function(value) {

			var isValidValue = true;

			if (value) {
				value = moment(value).format('DD/MM/YYYY HH:mm:ss');
			}

			return value;
		},

		_subInputInTooltipValueChanged: function(res) {

			this._parseValueAndSetValueInput(res.value);

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(res.value);

			this._emitSetValue(obj);
		},

		_setValue: function(value) {

		}
	});
});
