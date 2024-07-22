define([
	"dijit/Calendar"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'moment/moment.min'
	, "put-selector/put"
	, "redmic/modules/form/input/_BaseDateTime"
	, "redmic/modules/form/input/Input"
	, "RWidgets/TimeSelect"
], function(
	Calendar
	, declare
	, lang
	, aspect
	, moment
	, put
	, _BaseDateTime
	, Input
	, TimeSelect
){
	return declare([Input, _BaseDateTime], {
		//	summary:
		//		Implementación de input DateTextBox.

		constructor: function(args) {

			this.config = {
				propertyName: 'date',
				ownChannel: 'dateTimeTextBox',
				formatDateTime: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_initialize', lang.hitch(this, this._initializeDateTimeTextBox));
		},

		_initializeDateTimeTextBox: function() {

			this.calendar = new Calendar({
				onChange: lang.hitch(this, this._setValueDate)
			});

			this.timeSelect = new TimeSelect({
				onChange: lang.hitch(this, this._setValueTime)
			});
		},

		_createInputInstance: function() {

			this.containerInput.className += ' dateTime';

			this.calendar.placeAt(this.containerInput);
			this.timeSelect.placeAt(this.containerInput);

			return false;
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			if (value) {
				var momentValue = moment(value);

				if (momentValue.isValid()) {
					value = momentValue.format();
				} else {
					value = null;
				}
			}

			if (this._value !== value) {
				this._value = value;
				this.calendar.set('value', value);

				this.timeSelect.setValue(value);

				if (value) {
					this.timeSelect.enable();
				} else {
					this.timeSelect.disable();
				}

				this.inherited(arguments);
			}
		},

		_setValueTime: function(value) {

			this._setValue(moment(value).format(this.formatDateTime));
		},

		_setValueDate: function(value) {

			var momentValue = moment(value);

			if (this._value) {
				var momentOld = moment(this._value);

				momentOld.set({
					'year': momentValue.year(),
					'month': momentValue.month(),
					'date': momentValue.date()
				});

				momentValue = momentOld;
			} else if (this._inputProps.valueTimeDefault) {
				if (this._inputProps.valueTimeDefault === 'currentDate') {
					this._setTimeWithValueTimeDefaultIsCurrentTime(momentValue);
				} else {
					this._setTimeWithValueTimeDefault(momentValue);
				}
			}

			if (momentValue.format() !== this._value) {
				this._setValue(momentValue.format(this.formatDateTime));
			}
		},

		_clear: function() {

			this.calendar.set('value', null);
			this.timeSelect.clear();
		},

		_dependenceValueChangedWithStartDateOrEndDate: function(res, type) {

			if (type === "endDate") {
				this._setIsDisabledDateInCalendar(this.calendar, 'isSameOrAfter');
			} else if (type === "startDate") {
				this._setIsDisabledDateInCalendar(this.calendar, 'isSameOrBefore');
			}

			this._recalculateIsDisableDateInCalendar(this.calendar);

			return true;
		}
	});
});
