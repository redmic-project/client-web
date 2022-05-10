define([
	"dijit/form/ValidationTextBox"
	, "dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "dojox/form/HorizontalRangeSlider"
	, "dijit/form/HorizontalRule"
	, "dijit/form/HorizontalRuleLabels"
	, "put-selector/put"
	, "./Utilities"
], function(
	ValidationTextBox
	, declare
	, _WidgetBase
	, lang
	, Evented
	, RangeSlider
	, Rule
	, RuleLabels
	, put
	, Utilities
) {
	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		constructor: function(args) {

			this.config = {
				countRuleLabels: 7,
				events: {
					SET_MIN_MAX: "setMinMax",
					SET_VALUES: "setValues",
					INITIALIZE: "initialize"
				},
				precision: 2,
				_changeValueTimeout: 200,
				unit: "",
				valueMinMax: null,
				valueDefault: null,
				isTextBoxValue: false
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.SET_MIN_MAX, lang.hitch(this, this.setMinMaxRangeSlider));
			this.on(this.events.SET_VALUES, lang.hitch(this, this.setValueRangeSlider));
			this.on(this.events.INITIALIZE, lang.hitch(this, this.initializeRangeSlider));
		},

		postCreate: function() {

			this._initialize();
		},

		_initialize: function() {

			this.containerNode = put(this.domNode, 'div.containerWidget');

			if (this.isTextBoxValue)
				this.textBoxMin = new ValidationTextBox({
					onChange: lang.hitch(this, this._changeMinRangeSlider)
				}).placeAt(this.containerNode);

			this.containerSliderNode = put(this.containerNode, 'div.containerSlider');

			if (this.isTextBoxValue)
				this.textBoxMax = new ValidationTextBox({
					onChange: lang.hitch(this, this._changeMaxRangeSlider)
				}).placeAt(this.containerNode);

			this.rangeSlider = new RangeSlider({
				'class': 'sliderForm',
				showButtons: false,
				onChange: lang.hitch(this, this._changeRangeSlider)
			}).placeAt(this.containerSliderNode);

			this.rule = new Rule({
				'class': 'horizontalRuleForm',
				count: this.countRuleLabels
			}).placeAt(this.containerSliderNode);

			this.ruleLabels = new RuleLabels({
				'class': 'horizontalRuleLabelsForm'
			}).placeAt(this.containerSliderNode);

			if (this.valueMinMax)
				this.setMinMaxRangeSlider(this.valueMinMax);

			if (this.valueDefault || this.valueMinMax)
				this.setValueRangeSlider(this.valueDefault || this.valueMinMax);
		},

		initializeRangeSlider: function(valueMinMax, valueDefault) {

			this.setMinMaxRangeSlider(valueMinMax);
			this.setValueRangeSlider(valueDefault ? valueDefault : valueMinMax);
		},

		setMinMaxRangeSlider: function(value) {

			this.rangeSlider.set('minimum', value[0]);
			this.rangeSlider.set('maximum', value[1]);

			var obj = [];
			obj[0] = this._calc(value[0]);
			obj[1] = this._calc((value[0] + value[1]) / 2);
			obj[2] = this._calc(value[1]);

			this.setHorizontalRuleLabelsForm(obj);
		},

		_calc: function(num) {

			if (Math.abs(num) >= 1000)
				return (num / 1000) + "K";
			else
				return num;
		},

		setHorizontalRuleLabelsForm: function(labels) {

			this.ruleLabels.setAttribute('labels', labels);

			for (var i = 0; i < labels.length; i++)
				this.ruleLabels.domNode.children[i].innerText = labels[i] + this.unit;
		},

		_changeRangeSlider: function(evt) {

			if (this._lastValue && Utilities.isEqual(this._lastValue, evt))
				return;

			clearTimeout(this._changeValueTimeoutHandler);
			this._changeValueTimeoutHandler = setTimeout(lang.hitch(this, function(evt) {
				this.setValueTextRangeSlider();
				this.setValueTextBoxRangeSlider();
				this._lastValue = evt;
				this.onChange(this._fixValues(this.rangeSlider.value), evt);
			}, evt), this._changeValueTimeout);
		},

		_changeMaxRangeSlider: function(evt) {

			var newValue = parseFloat(evt),
				value = this.rangeSlider.get('value');

			if (!isNaN(newValue) && newValue > value[0]) {
				this.setValueRangeSlider([value[0], newValue]);
			} else
				this.textBoxMax.setAttribute('value', value[1]);
		},

		_changeMinRangeSlider: function(evt) {

			var newValue = parseFloat(evt),
				value = this.rangeSlider.get('value');

			if (!isNaN(newValue) && newValue < value[1]) {
				this.setValueRangeSlider([newValue, value[1]]);
			} else
				this.textBoxMin.setAttribute('value', value[0]);
		},

		setValueRangeSlider: function(value) {

			this.rangeSlider.set('value', value);

			this.setValueTextRangeSlider(value);
			this.setValueTextBoxRangeSlider(value);
		},

		getValueRangeSlider: function(value) {

			return this.rangeSlider.get('value');
		},

		setValueTextRangeSlider: function(value) {

			if (!value)
				value = this._fixValues(this.rangeSlider.value);

			this.rangeSlider.sliderHandle.setAttribute('title', value[0] + this.unit);
			this.rangeSlider.sliderHandleMax.setAttribute('title', value[1] + this.unit);
		},

		setValueTextBoxRangeSlider: function(value) {

			if (!this.textBoxMin || !this.textBoxMax)
				return;

			if (!value)
				value = this._fixValues(this.rangeSlider.value);

			this.textBoxMin.setAttribute('value', value[0]);
			this.textBoxMax.setAttribute('value', value[1]);
		},

		_fixValues: function(value) {

			if (!value)
				return value;

			return [
				parseFloat(value[0] && value[0].toFixed(this.precision)),
				parseFloat(value[1] && value[1].toFixed(this.precision))
			];
		},

		disabled: function(value) {

			this.rangeSlider.set('disabled', true);
			this.rule.set('disabled', true);
			this.ruleLabels.set('disabled', true);

			put(this.domNode, ".dijitSliderDisabled");
		},

		enabled: function(value) {

			this.rangeSlider.set('disabled', false);
			this.rule.set('disabled', false);
			this.ruleLabels.set('disabled', false);

			put(this.domNode, "!dijitSliderDisabled");
		}
	});
});