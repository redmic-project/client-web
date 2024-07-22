define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'moment/moment.min'
	, "put-selector/put"
	, "redmic/modules/components/Keypad/TrizoneKeypadImpl"
	, "redmic/modules/form/input/_Dependence"
	, "redmic/modules/form/input/DateTimeImpl"
	, "redmic/modules/form/input/Input"
	, "redmic/modules/form/input/TextBoxImpl"
], function(
	declare
	, lang
	, aspect
	, moment
	, put
	, TrizoneKeypadImpl
	, _Dependence
	, DateTimeImpl
	, Input
	, TextBoxImpl
){
	return declare(Input, {
		//	summary:
		//		Implementación de input para rango de fecha.

		constructor: function(args) {

			this.config = {
				_defaultOptionInput: 'rangeDate',
				nameStartDate: 'startDate',
				nameEndDate: 'endDate',
				dateFormatExit: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
				dateTimeFormatVisibility: 'YYYY-MM-DD HH:mm:ss',
				_optionsInputs: {
					rangeDate: {
						inputs: ['startDate', 'endDate'],
						label: "interval"
					},
					simpleDate: {
						inputs: ['startDate'],
						classContainer: 'simpleDate',
						callbackInSubmit: lang.hitch(this, this._submitByDate),
						format: 'YYYY-MM-DD'
					},
					greaterThan: {
						inputs: ['startDate']
					},
					smallerThan: {
						inputs: ['endDate']
					}
				},
				_optionsValue: {
					last24Hours: {
						value: 1
					},
					last7Days:  {
						value: 7
					},
					last30Days:  {
						value: 30
					},
					lastYear:  {
						value: 365
					}
				},
				buttons: {
					cancel: {
						zone: 'right',
						props: {
							'class': 'danger',
							label: this.i18n.cancel
						}
					},
					submit: {
						zone: 'right',
						props: {
							'class': 'success',
							label: this.i18n.submit
						}
					}
				},
				dateRangeComplexEvents: {
					SET_VALUE_START_DATE: 'setValueStartDate',
					SET_VALUE_END_DATE: 'setValueEndDate'
				},

				_value: {
					startDate: null,
					endDate: null
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_setConfigurations', lang.hitch(this, this._setDateRangeComplexConfigurations));
			aspect.before(this, '_initialize', lang.hitch(this, this._initializeDateRangeComplex));
			aspect.before(this, '_setOwnCallbacksForEvents', lang.hitch(this, this._setDateRangeComplexOwnCallbacksForEvents));
			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixDateRangeComplexEventsAndActions));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineDateRangeComplexSubscriptions));
			//aspect.after(this, '_definePublications', lang.hitch(this, this._defineDateRangeComplexPublications));
		},

		_setDateRangeComplexOwnCallbacksForEvents: function () {

			this._onEvt('HIDE', lang.hitch(this, this._afterHide));
		},

		_mixDateRangeComplexEventsAndActions: function () {

			lang.mixin(this.events, this.dateRangeComplexEvents);

			delete this.dateRangeComplexEvents;
		},

		_setDateRangeComplexConfigurations: function() {

			this.startDateConfig = this._merge([{
				parentChannel: this.getChannel(),
				propertyName: this.nameStartDate
			}, this.startDateConfig || {}]);

			this.dateTimeStartDateConfig = this._merge([{
				inputProps: {
					propertyNameDependence: this.nameEndDate,
					dependenceType: 'startDate'
				}
			}, this.startDateConfig || {}]);

			this.endDateConfig = this._merge([{
				parentChannel: this.getChannel(),
				propertyName: this.nameEndDate
			}, this.endDateConfig || {}]);

			this.dateTimeEndDateConfig = this._merge([{
				inputProps: {
					propertyNameDependence: this.nameStartDate,
					dependenceType: 'endDate'
				}
			}, this.endDateConfig || {}]);

			this.keypadConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: this.buttons
			}, this.keypadConfig || {}]);
		},

		_defineDateRangeComplexSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.keypad.getChannel('KEYPAD_INPUT'),
				callback: '_subKeypadInput'
			},{
				channel: this.textBoxStartDate.getChannel('VALUE_CHANGED'),
				callback: '_subTextBoxStartDateValueChanged'
			},{
				channel: this.dateTimeStartDate.getChannel('VALUE_CHANGED'),
				callback: '_subDateTimeStartDateValueChanged'
			},{
				channel: this.textBoxEndDate.getChannel('VALUE_CHANGED'),
				callback: '_subTextBoxEndDateValueChanged'
			},{
				channel: this.dateTimeEndDate.getChannel('VALUE_CHANGED'),
				callback: '_subDateTimeEndDateValueChanged'
			});
		},

		/*_defineDateRangeComplexPublications: function() {

			this.publicationsConfig.push();
		},*/

		_initializeDateRangeComplex: function() {

			this.textBoxStartDate = new TextBoxImpl(this.startDateConfig);
			this.dateTimeStartDate = new declare([DateTimeImpl, _Dependence])(this.dateTimeStartDateConfig);

			this.textBoxEndDate = new TextBoxImpl(this.endDateConfig);
			this.dateTimeEndDate = new declare([DateTimeImpl, _Dependence])(this.dateTimeEndDateConfig);

			this.keypad = new TrizoneKeypadImpl(this.keypadConfig);
		},

		_createInputInstance: function() {

			this.containerInput.className += ' dateRangeComplex';

			this.leftNode = put(this.containerInput, 'div.containerOptions');
			var containerCenterNode = put(this.containerInput, 'div.containerCenter');
			var containerInputsNode = put(containerCenterNode, 'div.containerInputs');
			this.keypadNode = put(containerCenterNode, 'div.containerKeypad');

			this.leftInputsNode = put(containerInputsNode, 'div.containerInput');
			this.rigthInputsNode = put(containerInputsNode, 'div.containerInput');

			return false;
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createOptions();
			this._changeInputOption(this._defaultOptionInput);

			this._publish(this.keypad.getChannel('SHOW'), {
				node: this.keypadNode
			});

			this._publish(this.textBoxStartDate.getChannel('SHOW'), {
				node: this.leftInputsNode
			});

			this._publish(this.dateTimeStartDate.getChannel('SHOW'), {
				node: this.leftInputsNode
			});

			this._publish(this.textBoxEndDate.getChannel('SHOW'), {
				node: this.rigthInputsNode
			});

			this._publish(this.dateTimeEndDate.getChannel('SHOW'), {
				node: this.rigthInputsNode
			});
		},

		_createOptions: function() {

			this.valueOptionsNode = put(this.leftNode, 'div.valueOptions');
			this.inputOptionsNode = put(this.leftNode, 'div.inputOptions');

			this._createValueOptions();
			this._createInputOptions();
		},

		_createValueOptions: function() {

			for (var key in this._optionsValue) {
				this._createValueOption(key);
			}
		},

		_createValueOption: function(key) {

			var option = this._optionsValue[key],
				label = option.label || key,
				title = option.title || this.i18n[key + 'Title'] ? this.i18n[key + 'Title'] : null;

			label = this.i18n[label] ? this.i18n[label] : label;

			this[key + 'ValueNode'] = put(this.valueOptionsNode, 'span.item', label);

			if (title) {
				title = this.i18n[title] ? this.i18n[title] : title;
				put(this[key + 'ValueNode'], '[title="$"]', title);
			}

			this[key + 'ValueNode'].onclick = lang.hitch(this, this._clickValueOption, key);
		},

		_clickValueOption: function(key) {

			this._changeInputOption('rangeDate');

			this._showValueOption(key);
		},

		_showValueOption: function(key) {

			if (!key) {
				return;
			}

			var valueEndDate = moment().format(this.dateFormatExit),
				valueStartDate = moment().subtract(this._optionsValue[key].value, 'days').format(this.dateFormatExit);

			this._setValueInInput(this.dateTimeStartDate, this.nameStartDate, valueStartDate);
			this._setValueInInput(this.dateTimeEndDate, this.nameEndDate, valueEndDate);
		},

		_createInputOptions: function() {

			for (var key in this._optionsInputs) {
				this._createInputOption(key);
			}
		},

		_createInputOption: function(key) {

			var option = this._optionsInputs[key],
				label = option.label || key,
				title = option.title || this.i18n[key + 'Title'] ? this.i18n[key + 'Title'] : null;

			label = this.i18n[label] ? this.i18n[label] : label;

			this[key + 'OptionNode'] = put(this.inputOptionsNode, 'span.item', label);

			if (title) {
				title = this.i18n[title] ? this.i18n[title] : title;
				put(this[key + 'OptionNode'], '[title="$"]', title);
			}

			this[key + 'OptionNode'].onclick = lang.hitch(this, this._changeInputOption, key);
		},

		_changeInputOption: function(key) {

			if (this._inputOptionsActive === key) {
				return;
			}

			this._hideInputOption();

			this._showInputOption(key);

			this._showInputs(key);
		},

		_hideInputOption: function() {

			var key = this._inputOptionsActive;

			if (key) {
				put(this[key + 'OptionNode'], '!active');

				var classContainer = this._optionsInputs[key].classContainer;

				if (classContainer) {
					put(this.leftInputsNode, '!' + classContainer);
				}

				this._hideInputs(key);

				this._inputOptionsActive = null;
			}
		},

		_showInputOption: function(key) {

			if (!key) {
				return;
			}

			put(this[key + 'OptionNode'], '.active');

			var classContainer = this._optionsInputs[key].classContainer;

			if (classContainer) {
				put(this.leftInputsNode, '.' + classContainer);
			}

			this._inputOptionsActive = key;
		},

		_showInputs: function(key) {

			if (!key) {
				return;
			}

			var option = this._optionsInputs[key],
				inputs = option.inputs;

			option.callbackInShow && option.callbackInShow();

			this._clear();

			for (var i = 0; i < inputs.length; i++) {
				var node = this.rigthInputsNode;

				if (inputs[i] === 'startDate') {
					node = this.leftInputsNode;
				}

				put(node, '!hidden');
			}
		},

		_hideInputs: function(key) {

			if (!key) {
				return;
			}

			var option = this._optionsInputs[key],
				inputs = option.inputs;

			for (var i = 0; i < inputs.length; i++) {
				var node = this.rigthInputsNode;

				if (inputs[i] === 'startDate') {
					node = this.leftInputsNode;
				}

				put(node, '.hidden');
			}
		},

		_subKeypadInput: function(req) {

			if (req.inputKey === 'submit') {
				this._submit();
			} else if (req.inputKey === 'cancel') {
				this._cancel();
			}
		},

		_subTextBoxStartDateValueChanged: function(req) {

			var value = this._parseDateExitTextBox(req.value),
				endDate = this._value.endDate;

			if (!endDate || moment(endDate).isAfter(value)) {
				this._setValueInInput(this.dateTimeStartDate, this.nameStartDate, value);
			} else {
				this._setValueInInput(this.textBoxStartDate, this.nameStartDate, null);
				this._setValueInInput(this.dateTimeStartDate, this.nameStartDate, null);
			}
		},

		_subDateTimeStartDateValueChanged: function(req) {

			this._setValueInInput(this.textBoxStartDate, this.nameStartDate, this._parseDateVisibilityTextBox(req.value));
		},

		_subTextBoxEndDateValueChanged: function(req) {

			var value = this._parseDateExitTextBox(req.value),
				startDate = this._value.startDate;

			if (!startDate || moment(startDate).isBefore(value)) {
				this._setValueInInput(this.dateTimeEndDate, this.nameEndDate, value);
			} else {
				this._setValueInInput(this.textBoxEndDate, this.nameEndDate, null);
				this._setValueInInput(this.dateTimeEndDate, this.nameEndDate, null);
			}
		},

		_subDateTimeEndDateValueChanged: function(req) {

			this._setValueInInput(this.textBoxEndDate, this.nameEndDate, this._parseDateVisibilityTextBox(req.value));
		},

		_parseDateExitTextBox: function(value) {

			if (!value) {
				return null;
			}

			var format = this.dateTimeFormatVisibility;

			if (this._optionsInputs[this._inputOptionsActive].format) {
				format = this._optionsInputs[this._inputOptionsActive].format;
			}

			return moment(value, format, true).format(this.dateFormatExit);
		},

		_parseDateVisibilityTextBox: function(value) {

			if (!value) {
				return null;
			}

			var format = this.dateTimeFormatVisibility;

			if (this._optionsInputs[this._inputOptionsActive].format) {
				format = this._optionsInputs[this._inputOptionsActive].format;
			}

			return moment(value, this.dateFormatExit, true).format(format);
		},

		_setValueInInput: function(input, key, value) {

			var obj = {};

			obj[key] = value;

			if (value) {
				this._publish(input.getChannel('SET_VALUE'), obj);
			} else {
				this._publish(input.getChannel('CLEAR'));
			}

			var objDependence =  {
				value: value
			};

			if (key === this.nameStartDate) {
				this._publish(this.dateTimeEndDate.getChannel('DEPENDENCE_VALUE_CHANGED'), objDependence);
			} else {
				this._publish(this.dateTimeStartDate.getChannel('DEPENDENCE_VALUE_CHANGED'), objDependence);
			}

			this._value[key] = value;
		},

		_submit: function() {

			var option = this._optionsInputs && this._inputOptionsActive && this._optionsInputs[this._inputOptionsActive];

			option.callbackInSubmit && option.callbackInSubmit();

			this._submitted = true;

			this._setValue(lang.clone(this._value));

			this._oldValue = lang.clone(this._value);

			this._emitEvt('HIDE');
		},

		_submitByDate: function() {

			var startDate = moment(this._value[this.nameStartDate]),
				endDate = moment(this._value[this.nameStartDate]);

			startDate.set({
				'hour': 0,
				'minute': 0,
				'second': 0
			});

			this._value.startDate = startDate.format(this.dateFormatExit);

			endDate.set({
				'hour': 23,
				'minute': 59,
				'second': 59
			});

			this._value.endDate = endDate.format(this.dateFormatExit);
		},

		_cancel: function() {

			this._emitEvt('HIDE');
		},

		_clear: function() {

			this._setValueInInputs({
				startDate: null,
				endDate: null
			});
		},

		_shown: function() {

			this._oldValue = lang.clone(this._value);

			this._setValueInInputs();
		},

		_setValueInInputs: function(value) {

			if (!value) {
				value = this._value;
			}

			var valueEndDate = value[this.nameEndDate],
				valueStartDate = value[this.nameStartDate];

			this._setValueInInput(this.textBoxStartDate, this.nameStartDate, this._parseDateVisibilityTextBox(valueStartDate));
			this._setValueInInput(this.dateTimeStartDate, this.nameStartDate, valueStartDate);

			this._setValueInInput(this.textBoxEndDate, this.nameEndDate, this._parseDateVisibilityTextBox(valueEndDate));
			this._setValueInInput(this.dateTimeEndDate, this.nameEndDate, valueEndDate);
		},

		_afterHide: function() {

			this._value = lang.clone(this._oldValue);
		},

		_valueChanged: function(res) {

			if (this._submitted) {
				this._submitted = false;
				this.inherited(arguments);
				return;
			}

			var value = res[this.propertyName];

			if (value !== undefined) {
				var endDate, startDate;

				if (value) {
					startDate = value.startDate;
					endDate = value.endDate;
				}

				this._value[this.nameStartDate] = startDate;
				this._value[this.nameEndDate] = endDate;

				this._oldValue = lang.clone(this._value);

				this._setValueInInputs();
			}
		}
	});
});
