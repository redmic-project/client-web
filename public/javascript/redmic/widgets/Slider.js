define([
	'dijit/_WidgetBase'
	, 'dijit/form/HorizontalSlider'
	, 'dijit/form/HorizontalRule'
	, 'dijit/form/HorizontalRuleLabels'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Evented'
	, 'put-selector/put'
	, './Utilities'
], function(
	_WidgetBase
	, HorizontalSlider
	, HorizontalRule
	, HorizontalRuleLabels
	, declare
	, lang
	, Evented
	, put
	, Utilities
) {

	return declare([_WidgetBase, Evented], {

		constructor: function(args) {

			this.config = {
				countRuleLabels: 7,
				events: {
					SET_MIN_MAX: 'setMinMax',
					SET_VALUE: 'setValue',
					INITIALIZE: 'initialize'
				},
				precision: 2,
				_changeValueTimeout: 200,
				unit: '',
				valueMinMax: [],
				valueDefault: null
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.SET_MIN_MAX, lang.hitch(this, this.setMinMaxSlider));
			this.on(this.events.SET_VALUE, lang.hitch(this, this.setValueSlider));
			this.on(this.events.INITIALIZE, lang.hitch(this, this.initializeSlider));
		},

		postCreate: function() {

			this.domNode.removeAttribute('widgetId');

			this.inherited(arguments);

			this.slider = new HorizontalSlider({
				'class': 'sliderForm',
				showButtons: false,
				discreteValues: this.labels ? this.labels.length : null,
				onChange: lang.hitch(this, this._changeSlider)
			}).placeAt(this.domNode);

			this.rule = new HorizontalRule({
				'class': 'horizontalRuleForm',
				count: this.labels ? this.labels.length : this.countRuleLabels
			}).placeAt(this.domNode);

			this.ruleLabels = new HorizontalRuleLabels({
				'class': 'horizontalRuleLabelsForm',
				count: this.labels ? this.labels.length : this.countRuleLabels
			}).placeAt(this.domNode);

			if (this.valueMinMax.length) {
				this.setMinMaxSlider(this.valueMinMax);
			}

			if (this.valueDefault || this.valueMinMax) {
				this.setValueSlider(this.valueDefault || this.valueMinMax[1]);
			}
		},

		initializeSlider: function(valueMinMax, valueDefault) {

			this.setMinMaxSlider(valueMinMax);
			this.setValueSlider(valueDefault ? valueDefault : valueMinMax[1]);
		},

		setMinMaxSlider: function(value) {

			this.slider.set('minimum', value[0]);
			this.slider.set('maximum', value[1]);

			var obj = [];
			obj[0] = this._calc(value[0]);
			obj[1] = this._calc((value[0] + value[1]) / 2);
			obj[2] = this._calc(value[1]);

			this.setHorizontalRuleLabelsForm(this.labels || obj);
		},

		_calc: function(num) {

			if (Math.abs(num) >= 1000) {
				return (num / 1000) + 'K';
			} else {
				return num;
			}
		},

		setHorizontalRuleLabelsForm: function(labels) {

			this.ruleLabels.setAttribute('labels', labels);

			for (var i = 0; i < labels.length; i++) {
				this.ruleLabels.domNode.children[i].innerText = labels[i] + this.unit;
			}
		},

		_changeSlider: function(evt) {

			if (this._lastValue && Utilities.isEqual(this._lastValue, evt)) {
				return;
			}

			clearTimeout(this._changeValueTimeoutHandler);
			this._changeValueTimeoutHandler = setTimeout(lang.hitch(this, function(evt) {

				this.setValueTextSlider();
				this._lastValue = evt;
				this.onChange(this._fixValues(this.slider.value), evt);
			}, evt), this._changeValueTimeout);
		},

		setValueSlider: function(value) {

			this.slider.set('value', value);

			this.setValueTextSlider(value);
		},

		getValueSlider: function(value) {

			return this.slider.get('value');
		},

		setValueTextSlider: function(value) {

			if (!value) {
				value = this._fixValues(this.slider.value);
			}

			if (this.labels && this.labels[value - 1] !== undefined) {
				value = this.labels[value - 1];
			}

			this.slider.sliderHandle.setAttribute('title', value + this.unit);
		},

		_fixValues: function(value) {

			if (!value) {
				return value;
			}

			return parseFloat(value.toFixed(this.precision));
		},

		disable: function(value) {

			this.slider.set('disabled', true);
			this.rule.set('disabled', true);
			this.ruleLabels.set('disabled', true);

			put(this.domNode, '.dijitSliderDisabled');
		},

		enable: function(value) {

			this.slider.set('disabled', false);
			this.rule.set('disabled', false);
			this.ruleLabels.set('disabled', false);

			put(this.domNode, '!dijitSliderDisabled');
		}
	});
});