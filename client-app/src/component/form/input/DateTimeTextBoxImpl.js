define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'moment'
	, "src/component/form/input/DateTimeImpl"
	, "src/component/form/input/_BaseDateTime"
	, "src/component/form/input/_BaseTextBoxWidthExpandTooltipImpl"
], function(
	declare
	, lang
	, aspect
	, moment
	, DateTimeImpl
	, _BaseDateTime
	, _BaseTextBoxWidthExpandTooltipImpl
){
	return declare([_BaseDateTime, _BaseTextBoxWidthExpandTooltipImpl], {
		//	summary:
		//		Implementación de input DateTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: "date",
				ownChannel: "dateTimeTextBox",
				classInputInTooltip: 'textBoxLittleWidth',
				formatYear: 'YYYY',
				formatMonthAndYear: 'MM/YYYY',
				formatDate: 'DD/MM/YYYY',
				formatTime: 'HH:mm:ss',
				formatDateTimeModel: "YYYY-MM-DDTHH:mm:ss.SSSZ",
				timeClose: null
			};

			lang.mixin(this, this.config, args);

			this.inputInTooltipDef = DateTimeImpl;

			var obj = {
				valueTimeDefault: 'currentDate'
			};

			if (this._inputProps.valueOfLastTime) {
				obj = {
					valueMonthDefault: 'lastMonth',
					valueDayDefault: 'lastDay',
					valueTimeDefault: 'lastMomentDay'
				};
			}

			this._inputProps = this._merge([obj, this._inputProps || {}]);
		},

		_valueChanged: function(res) {

			this._valueChangedInputInTooltip(res);

			var value = res.value || res[this.propertyName],
				valueInput = value,
				isValidValue = true;

			if (valueInput) {
				valueInput = moment(valueInput);
				isValidValue = valueInput.isValid();
				valueInput = valueInput.format(this.formatDateTime);
			}

			if (isValidValue && this._inputInstance && this._inputInstance.get(this.valuePropertyName) !== valueInput) {
				this._lastValueInputInstance = valueInput;
				this._inputInstance.set(this.valuePropertyName, valueInput);
			}

			this._emitChanged(value);
		},

		_subInputInTooltipValueChanged: function(res) {

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(res.value);

			this._emitSetValue(obj);
		},

		_setValue: function(value) {

			if (this._lastValueInputInstance === value) {
				return;
			}

			var valueMoment = value;

			if (value) {

				valueMoment = moment(value, this.formatDateTime, true);

				if (!this._isValidDate(valueMoment)) {
					valueMoment = this._setValueTimeDefault(valueMoment, value);
				}

				if (!this._isValidDate(valueMoment)) {
					valueMoment = this._setValueWithMonthAndYear(valueMoment, value);
				}

				if (!this._isValidDate(valueMoment)) {
					valueMoment = this._setValueWithYear(valueMoment, value);
				}

				valueMoment = valueMoment.format(this.formatDateTimeModel);
			}

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(valueMoment);

			this._emitSetValue(obj);
		},

		_isValidDate: function(valueMoment) {

			return valueMoment.format(this.formatDateTimeModel) !== 'Invalid date';
		},

		_setValueTimeDefault: function(valueMoment, value) {

			if (value) {
				valueMoment = moment(value, this.formatDate, true);
			}

			if (!this._inputProps.valueTimeDefault) {
				return valueMoment;
			}

			if (this._inputProps.valueTimeDefault === 'currentDate') {
				this._setTimeWithValueTimeDefaultIsCurrentTime(valueMoment);
			} else {
				this._setTimeWithValueTimeDefault(valueMoment);
			}

			return valueMoment;
		},

		_setValueWithMonthAndYear: function(valueMoment, value) {

			var valueDay = this._inputProps.valueDayDefault;

			if (value) {
				valueMoment = moment(value, this.formatMonthAndYear, true);
			}

			if (!valueDay) {
				return valueMoment;
			}

			if (valueDay === 'lastDay') {
				valueMoment.endOf('month');
			} else {
				valueMoment.set({
					'date': valueDay
				});
			}

			return this._setValueTimeDefault(valueMoment);
		},

		_setValueWithYear: function(valueMoment, value) {

			var valueMonth = this._inputProps.valueMonthDefault;

			if (value) {
				valueMoment = moment(value, this.formatYear, true);
			}

			if (!valueMonth) {
				return valueMoment;
			}

			if (valueMonth === 'lastMonth') {
				valueMoment.endOf('year');
			} else {
				valueMoment.set({
					'date': valueMonth
				});
			}

			return this._setValueWithMonthAndYear(valueMoment);
		},

		_dependenceValueChangedWithStartDateOrEndDate: function(res, type) {

			if (this.inputInTooltip && this.valueDependence) {
				if (type === "endDate") {
					this._setIsDisabledDateInCalendar(this.inputInTooltip.calendar, 'isSameOrAfter');
				} else if (type === "startDate") {
					this._setIsDisabledDateInCalendar(this.inputInTooltip.calendar, 'isSameOrBefore');
				}

				this._lastEmitSetValue && this._emitChanged(this._lastEmitSetValue[this.propertyName]);
			}

			this._recalculateIsDisableDateInCalendar(this.inputInTooltip.calendar);

			return true;
		}
	});
});
