define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "dijit/form/NumberSpinner"
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, NumberSpinner
	, put
) {
	return declare([_WidgetBase, Evented], {
		//	summary:
		//		Widget
		//
		// description:
		//

		constructor: function(args) {

			this.config = {
				value: 1,
				delta: 0.25,
				minSlider: 0.25,
				optionDefault: 3,
				difConvertToBase: 1,
				options: [{
					name: "ms",
					convertToBase: 1
				},{
					name: "sec",
					convertToBase: 1000
				},{
					name: "minute",
					convertToBase: 60000
				},{
					name: "hour",
					convertToBase: 3600000
				},{
					name: "day",
					convertToBase: 86400000
				},{
					name: "week",
					convertToBase: 604800000
				},{
					name: "month",
					convertToBase: 2592000000
				},{
					name: "quarter",
					convertToBase: 7776000000
				},{
					name: "year",
					convertToBase: 31104000000
				}],
				events: {
					SET_VALUE: "setValue",
					GET_VALUE: "getValue",
					CHANGE_VALUE: "changeValue",
					DISABLED: "disabled",
					ENABLED: "enabled",
					RESET: "reset",
					CLEAR: "clearData"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.SET_VALUE, lang.hitch(this, this._setValue));
			this.on(this.events.DISABLED, lang.hitch(this, this._disabled));
			this.on(this.events.ENABLED, lang.hitch(this, this._enabled));
			this.on(this.events.RESET, lang.hitch(this, this._reset));
			this.on(this.events.CLEAR, lang.hitch(this, this._clear));
		},

		postCreate: function() {

			this._initialize();
		},

		_initialize: function() {

			this.numberTextBox = new NumberSpinner({
				onChange: lang.hitch(this, this._changeValue),
				value: this.value,
				constraints: { min: this.minSlider},
				smallDelta: this.delta
			}).placeAt(this.domNode);

			this.on(this.events.GET_VALUE, lang.hitch(this, this._changeValue, this.numberTextBox.get("Value")));

			this._selectorOptionsStructure();
		},

		_selectorOptionsStructure: function() {

			var name;

			if (this.options.length === 1) {
				name = this.options[0].name;
				name = this.i18n[name] ? this.i18n[name]: name;
				this.selectNode = put(this.domNode, 'div.selectOption', name);

				this.selectOption = 0;
			} else {
				var divNode = put(this.domNode, 'div.selectOption');

				this.selectNode = put(divNode, 'select.form-control');

				this.selectNode.onchange = lang.hitch(this, this._eventOptionClick);

				for (var i = 0; i < this.options.length; i++ ) {
					this.options[i].convertToBase = this.options[i].convertToBase / this.difConvertToBase;
					name = this.options[i].name;
					name = this.i18n[name] ? this.i18n[name]: name;

					if (i == this.optionDefault) {
						this.selectOption = i;
						this.options[i].node = put(this.selectNode, "option[selected][value=$]", i, name);
					} else
						this.options[i].node = put(this.selectNode, "option[value=$]", i, name);
				}
			}
		},

		_eventOptionClick: function() {

			this.selectOption = parseInt(this.selectNode.selectedIndex, 10);

			this._setValue(this.value);
		},

		_changeValue: function(value) {

			if (value > 0 || (!this.value && !value)) {
				this.value = this._convertValueToBase(value);

				this.emit(this.events.CHANGE_VALUE, {
					value: this.value
				});
			} else
				this.numberTextBox.set("value", this._convertBaseToValue(this.value));
		},

		_disabled: function() {

			this.selectNode.classList.add("class", "hidden");
			this.numberTextBox.domNode.classList.add("class", "hidden");
		},

		_enabled: function() {

			this.selectNode.classList.remove("hidden");
			this.numberTextBox.domNode.classList.remove("hidden");

			this.emit(this.events.CHANGE_VALUE, {
				value: this.value
			});
		},

		_convertValueToBase: function(value) {

			return this._ajustDecimal(value * this.options[this.selectOption].convertToBase);
		},

		_convertBaseToValue: function(value) {

			return this._ajustDecimal(value / this.options[this.selectOption].convertToBase);
		},

		_ajustDecimal: function(value) {

			var range = 0.0001,
				valueRound = Math.round(value),
				dif = Math.abs(valueRound - value);

			if (dif <= range)
				return valueRound;

			return value;
		},

		_setValue: function(value) {

			if (value == undefined)
				value = 0;

			this.value = value;

			this.numberTextBox.set("value", this._convertBaseToValue(value));
		},

		_reset: function() {

			this._clear();
		},

		_clear: function() {

			this._setValue(0);
		}
	});
});