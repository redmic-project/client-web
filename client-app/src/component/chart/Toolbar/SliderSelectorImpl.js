define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "src/component/base/_ShowInTooltip"
	, "src/component/base/_ShowOnEvt"
	, "src/component/form/input/SliderImpl"
	, "put-selector/put"
	, "./Toolbar"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, SliderImpl
	, put
	, Toolbar
){
	return declare(Toolbar, {
		//	summary:
		//		Herramienta para elegir un valor de ajuste para las gráficas mediante un slider.

		constructor: function(args) {

			this.config = {
				ownChannel: 'sliderSelector',
				iconClass: 'fa-sliders',
				_closeOnValueSetTimeout: 800,
				value: 1,
				range: [1, 3],
				labels: null
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineSliderSelectorSubscriptions));
		},

		_setConfigurations: function() {

			this.sliderConfig = this._merge([{
				parentChannel: this.getChannel(),
				_inputProps: {
					style: 'width:200px',
					labels: this.labels,
					valueDefault: this.value,
					valueMinMax: this.range
				},
				classTooltip: 'sliderInput'
			}, this.sliderConfig || {}]);
		},

		_initialize: function() {

			this.slider = new declare([SliderImpl, _ShowOnEvt]).extend(_ShowInTooltip)(this.sliderConfig);
		},

		_defineSliderSelectorSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.slider.getChannel('VALUE_CHANGED'),
				callback: '_subSliderValueChanged'
			},{
				channel : this.slider.getChannel('HIDDEN'),
				callback: '_subSliderHidden'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var classNames = '.icon.' + this._getIconClassNames(),
				title = this.title || this.i18n.sliderSelector;

			this.sliderNode = put(this.domNode, 'i' + classNames + '[title=' + title + ']');

			this._publish(this.slider.getChannel('ADD_EVT'), {
				sourceNode: this.sliderNode
			});
		},

		_getIconClassNames: function() {

			var iconClassPrefix = this.iconClass.split('-')[0];

			return iconClassPrefix + '.' + this.iconClass;
		},

		_subSliderValueChanged: function(res) {

			this._publish(this.slider.getChannel('DISABLE'));
			setTimeout(lang.hitch(this, this._publish, this.slider.getChannel('HIDE')), this._closeOnValueSetTimeout);

			this._emitEvt('TOOL_ACTUATED', {
				value: res.value
			});
		},

		_subSliderHidden: function(res) {

			this._publish(this.slider.getChannel('ENABLE'));
		}
	});
});
