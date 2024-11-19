define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
], function(
	declare
	, lang
	, moment
){
	return declare(null, {
		//	summary:
		//		Implementación de input DateTextBox.

		constructor: function(args) {

			this.config = {
				formatDate: 'DD/MM/YYYY',
				formatTime: 'HH:mm:ss',
				formatDateTimeModel: "YYYY-MM-DDTHH:mm:ss.SSSZ"
			};

			lang.mixin(this, this.config, args);

			this.formatDateTime = this.formatDate + ' ' + this.formatTime;
		},

		_setTimeWithValueTimeDefault: function(valueMoment) {

			var valueTime = this._inputProps.valueTimeDefault;

			if (valueTime === 'lastMomentDay') {
				valueMoment.endOf('day');
			} else {
				var momentTime = moment(valueTime, this.formatTime);

				valueMoment.set({
					'hour': momentTime.hour(),
					'minute': momentTime.minute(),
					'second': momentTime.second()
				});
			}
		},

		_setTimeWithValueTimeDefaultIsCurrentTime: function(valueMoment) {

			var momentTime = moment();

			if (momentTime.format(this.formatDate) !== valueMoment.format(this.formatDate)) {
				return;
			}

			valueMoment.set({
				'hour': momentTime.hour(),
				'minute': momentTime.minute(),
				'second': momentTime.second()
			});
		},

		_setIsDisabledDateInCalendar: function(instance, method) {

			instance.isDisabledDate = lang.hitch(this, function(d) {
				var valueDependence = moment(this.valueDependence),
					date = moment(d);

				if (method.includes('After')) {
					date.hour(23);
					date.minute(59);
					date.second(59);
				} else {
					date.hour(0);
				}

				return this.valueDependence && valueDependence[method](date, 'second');
			});
		},

		_recalculateIsDisableDateInCalendar: function(instance) {

			if (instance) {
				//TODO se llama a los métodos privado por un bug del CalendarLite
				var value = instance.get('value');
				instance._populateGrid();
				instance._populateControls();
				instance._markSelectedDates([instance.get('value')]);
				if (!value && this.valueDependence) {
					instance.set('currentFocus', this.valueDependence);
					instance.focus();
				}
			}
		}
	});
});
