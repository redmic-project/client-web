define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dijit/popup"
	, "dijit/TooltipDialog"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
	, "dijit/Calendar"
	, "dojo/date/locale"
	, "dijit/form/DateTextBox"
	, "dijit/form/ValidationTextBox"
], function(
	declare
	, _WidgetBase
	, popup
	, TooltipDialog
	, lang
	, Evented
	, put
	, Calendar
	, locale
	, DateTextBox
	, ValidationTextBox
) {
	var cleanSpace = function(text) {
		return text.trim();
	};

	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		//'class': 'datePicker',

		constructor: function(args) {

			this.config = {
				minDate: null,
				maxDate: null,
				notTooltip: false,
				events: {
					CHANGE_MIN_DATE: 'changeMinDate',
					CHANGE_MAX_DATE: 'changeMaxDate',
					SET_MIN_DATE: 'setMinDate',
					SET_MAX_DATE: 'setMaxDate',
					QUERYDATE: "queryDate",
					RESET: "reset"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.SET_MIN_DATE, this._setMinDate);
			this.on(this.events.SET_MAX_DATE, this._setMaxDate);

			this.on(this.events.CHANGE_MIN_DATE, this._setCalendarMin);
			this.on(this.events.CHANGE_MIN_DATE, this._setInputMin);
			this.on(this.events.CHANGE_MIN_DATE, this._setCalendarMaxConstraintMin);

			this.on(this.events.CHANGE_MAX_DATE, this._setCalendarMax);
			this.on(this.events.CHANGE_MAX_DATE, this._setInputMax);
			this.on(this.events.CHANGE_MAX_DATE, this._setCalendarMinConstraintMax);

			this.on(this.events.CHANGE_MIN_DATE, this._changeRangeDate);
			this.on(this.events.CHANGE_MAX_DATE, this._changeRangeDate);

			this.on(this.events.RESET, this._removeInput);
		},

		postCreate: function() {

			this._createInput();
			this._createOptions();

			if (this.notTooltip) {
				put(this.domNode, '.datePickerContainerNotDialog');
				put(this.domNode, this.dateOptionsNode);
			} else {
				put(this.domNode, this.containerInput);

				this._createDialog();
			}
		},

		_changeRangeDate: function() {

			if (!this.minDate & !this.maxDate) {
				put(this.removeNode, '.hidden');
				this.inputNode.value = '';
			}
			else {
				put(this.removeNode, '!hidden');
				var from = this._formarDate(this.minDate);
				var to = this._formarDate(this.maxDate);

				this.inputNode.value = from + ' - ' + to;
			}
		},

		_formarDate: function(date) {

			return date ? locale.format(date , {
				datePattern : "dd/MM/yyyy",
				selector : 'date'
			}) : '';
		},

		_setMinDate: function(value) {

			if ((value && !this.minDate)|| (!value && this.minDate) ||
				(value && this.minDate && dojo.date.compare(value, this.minDate) !== 0)) {
				this.minDate = value;
				this.emit(this.events.CHANGE_MIN_DATE, value);
				this._changeDateEmitQuery();
			}
		},

		_setMaxDate: function(value) {

			if ((value && !this.maxDate)|| (!value && this.maxDate) ||
				(value && this.maxDate && dojo.date.compare(value, this.maxDate) !== 0)) {
				this.maxDate = value;
				this.emit(this.events.CHANGE_MAX_DATE, value);
				this._changeDateEmitQuery();
			}
		},

		_changeDateEmitQuery: function() {

			if (this.minDate || this.maxDate)
				this.emit(this.events.QUERYDATE, {
					'startDate': this.minDate,
					'endDate': this.maxDate
				});
			else
				this.emit(this.events.QUERYDATE, null);
		},

		_setCalendarMin: function(value) {

			var oldValue = this.calendarFrom.get('value');
			if (dojo.date.compare(oldValue, value) !== 0)
				this.calendarFrom.set('value', value);
		},

		_setInputMin: function(value) {

			var oldValue = this.inputFrom.get('value');

			if (dojo.date.compare(oldValue, value) !== 0 || oldValue === undefined)
				this.inputFrom.set('value', value);

			if (value)
				put(this.inputFromRemove, '!hidden');
			else
				put(this.inputFromRemove, '.hidden');
		},

		_setCalendarMaxConstraintMin: function(value) {

			var valueMin = this.calendarTo.get('value');

			if (!valueMin && this.calendarTo.currentFocus)
				valueMin = this.calendarTo.currentFocus;
			else if (!value && this.calendarTo.currentFocus)
				value = this.calendarTo.currentFocus;

			var date = valueMin || value;

			this.calendarTo._onMonthSelect(date.getMonth() + 1);
			this.calendarTo._onMonthSelect(date.getMonth());
		},

		_setCalendarMax: function(value) {

			var oldValue = this.calendarTo.get('value');
			if (dojo.date.compare(oldValue, value) !== 0)
				this.calendarTo.set('value', value);
		},

		_setInputMax: function(value) {

			var oldValue = this.inputTo.get('value');
			if (dojo.date.compare(oldValue, value) !== 0 || oldValue === undefined)
				this.inputTo.set('value', value);

			if (value)
				put(this.inputToRemove, '!hidden');
			else
				put(this.inputToRemove, '.hidden');
		},

		_setCalendarMinConstraintMax: function(value) {

			var valueMax = this.calendarFrom.get('value');

			if (!valueMax && this.calendarFrom.currentFocus)
				valueMax = this.calendarFrom.currentFocus;
			else if (!value && this.calendarTo.currentFocus)
				value = this.calendarTo.currentFocus;

			var date = valueMax || value;

			this.calendarFrom._onMonthSelect(date.getMonth() + 1);
			this.calendarFrom._onMonthSelect(date.getMonth());
		},

		_createInput: function() {

			this.containerInput = put('div.datePicker');

			icon = put(this.containerInput, 'i.fa.fa-calendar.iconCalendar');

			this.inputNode = put(this.containerInput, "input[type=text]");

			this.removeNode = put(this.containerInput, 'i.fa.fa-times.remove.hidden');

			this.inputNode.setAttribute('readonly', 'readonly');

			this.inputNode.onclick = lang.hitch(this, this._clickInput);

			icon.onclick = lang.hitch(this, this._clickInput);

			this.removeNode.onclick = lang.hitch(this, this._removeInput);
		},

		_removeInput: function() {

			this.minDate = null;
			this.emit(this.events.CHANGE_MIN_DATE, null);

			this.maxDate = null;
			this.emit(this.events.CHANGE_MAX_DATE, null);

			this._changeDateEmitQuery();
		},

		_createDialog: function() {

			this.dateDialog = new TooltipDialog({
				onMouseLeave: lang.hitch(this, this._startTimeOut),
				onMouseEnter: lang.hitch(this, this._stopTimeOut)
			});

			put(this.dateDialog.containerNode, this.dateOptionsNode);
		},

		_createOptions: function() {

			this.dateOptionsNode = put('div.datePickerContent');

			// From

			this.fromNode = put(this.dateOptionsNode, 'div.from');

			var value = new Date();
			value = new Date(value.getFullYear(), 0, 1);

			this.calendarFrom = Calendar({
				value: value,
				isDisabledDate: lang.hitch(this, this._isDisableDateMin)
			}).placeAt(this.fromNode);

			this.fromTextNode = put(this.fromNode, 'div.text');

			put(this.fromTextNode, 'span', 'From');

			this.inputFrom = new DateTextBox({
				hasDownArrow: false,
				openDropDown: function(){},
				constraints: { datePattern : 'dd/MM/yyyy' }
				//intermediateChanges: true
			}).placeAt(this.fromTextNode);

			this.inputFromRemove = put(this.inputFrom.domNode.lastChild, 'i.fa.fa-times.remove.hidden');

			this.inputFromRemove.onclick = lang.hitch(this, this._setMinDate, null);

			// To

			this.toNode = put(this.dateOptionsNode, 'div.to');

			this.calendarTo = Calendar({
				isDisabledDate: lang.hitch(this, this._isDisableDateMax)
			}).placeAt(this.toNode);

			this.toTextNode = put(this.toNode, 'div.text');

			put(this.toTextNode, 'span', 'To');

			this.inputTo = new DateTextBox({
				hasDownArrow: false,
				openDropDown: function(){},
				constraints: { datePattern : 'dd/MM/yyyy' }
				//intermediateChanges: true
			}).placeAt(this.toTextNode);

			this.inputToRemove = put(this.inputTo.domNode.lastChild, 'i.fa.fa-times.remove.hidden');

			this.inputToRemove.onclick = lang.hitch(this, this._setMaxDate, null);

			// Watch's

			this.calendarFrom.watch('value', lang.hitch(this, this._changeCalendarMin));

			this.calendarTo.watch('value', lang.hitch(this, this._changeCalendarMax));

			this.inputFrom.watch('value', lang.hitch(this, this._changeInputMin));

			this.inputTo.watch('value', lang.hitch(this, this._changeInputMax));
		},

		_isDisableDateMax: function(d) {

			var d = new Date(d);
			if (this.minDate)
				return dojo.date.difference(this.minDate, d) < 0;
			else
				return false;
		},

		_isDisableDateMin: function(d) {

			var d = new Date(d);
			if (this.maxDate)
				return dojo.date.difference(this.maxDate, d) > 0;
			else
				return false;
		},

		_changeCalendarMin: function(name, oldValue, value) {

			if ((dojo.date.compare(this.minDate, value) !== 0 && this.minDate && value) ||
				(this.minDate && !value) || (!this.minDate && value))
				this.emit(this.events.SET_MIN_DATE, value);
		},

		_changeCalendarMax: function(name, oldValue, value) {

			if ((dojo.date.compare(this.maxDate, value) !== 0 && this.maxDate && value) ||
				(this.maxDate && !value) || (!this.maxDate && value))
				this.emit(this.events.SET_MAX_DATE, value);
		},

		_changeInputMin: function(name, oldValue, value) {

			if ((dojo.date.compare(this.minDate, value) !== 0 && this.minDate && value) ||
				(this.minDate && !value) || (!this.minDate && value)) {
				if (value === null || (value && !this.maxDate) || (value && this.maxDate &&
					(dojo.date.compare(this.maxDate, value) >= 0)))
					this.emit(this.events.SET_MIN_DATE, value);
				else if (!value || (this.maxDate && dojo.date.compare(this.maxDate, value) < 0))
					this.emit(this.events.SET_MIN_DATE, null);
			} else if (value === undefined)
				this._setInputMin(null);
		},

		_changeInputMax: function(name, oldValue, value) {

			if ((dojo.date.compare(this.maxDate, value) !== 0 && this.maxDate && value) ||
				(this.maxDate && !value) || (!this.maxDate && value)) {
				if (value === null || (value && !this.minDate) || (value && this.minDate && (dojo.date.compare(this.minDate, value) <= 0)))
					this.emit(this.events.SET_MAX_DATE, value);
				else if (!value || (this.minDate && dojo.date.compare(this.minDate, value) > 0))
					this.emit(this.events.SET_MAX_DATE, null);
			} else if (value === undefined)
				this._setInputMax(null);
		},

		_clickInput: function() {

			this._stopTimeOut();

			popup.open({
				popup: this.dateDialog,
				around: this.inputNode,
				orient: ["below"],
				onExecute: function(){},
				onCancel: function(){},
				onClose: function(){}
			});

			this._startTimeOut();
		},

		_closePopUp: function() {

			popup.close(this.dateDialog);
		},

		_startTimeOut: function() {

			this.timeOut = setTimeout(lang.hitch(this, this._closePopUp), 1000);
		},

		_stopTimeOut: function() {

			clearTimeout(this.timeOut);
		}
	});
});