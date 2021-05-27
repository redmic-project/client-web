define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/form/input/Input"
], function(
	declare
	, lang
	, aspect
	, put
	, _ShowInTooltip
	, Input
){
	return declare(Input, {
		//	summary:
		//		Base para input textBox con expandir en tooltip.

		constructor: function(args) {

			this.config = {
				classInputInTooltip: '',
				propertyNameInputInTooltip: 'propertyNameInputInTooltip',
				timeClose: 500
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setBaseWidthExpandTooltipConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeBaseWidthExpandTooltip));

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineBaseWidthExpandTooltipSubscriptions));
			aspect.before(this, "_createInputInstance", lang.hitch(this, this._createAdditionalContent));
		},

		_setBaseWidthExpandTooltipConfigurations: function() {

			this.inputInTooltipConfig = this._merge([{
				parentChannel: this.getChannel(),
				classTooltip: "tooltipButtonMenu tooltipButtonChart",
				propertyName: this.propertyNameInputInTooltip,
				timeClose: this.timeClose,
				inputProps: {
					valueTimeDefault: this._inputProps.valueTimeDefault
				}
			}, this.inputInTooltipConfig || {}]);
		},

		_initializeBaseWidthExpandTooltip: function() {

			this.inputInTooltip = new declare(this.inputInTooltipDef).extend(_ShowInTooltip)(this.inputInTooltipConfig);
		},

		_defineBaseWidthExpandTooltipSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.inputInTooltip.getChannel("VALUE_CHANGED"),
				callback: "_subInputInTooltipValueChanged"
			});
		},

		_createAdditionalContent: function() {

			this.containerInput = put(this.containerInput, 'div');

			this.containerInput.className += " textBoxModWidthExpand " + this.classInputInTooltip;

			this.additionalNode = put(this.containerInput, 'div.additionalOptionInput');

			this.clearNode = put(this.additionalNode, 'div.contentClear');
			this.clearIconNode = put(this.clearNode, 'i.fa.fa-close.hidden');

			this.expandNode = put(this.additionalNode, 'div.contentClick');
			put(this.expandNode, 'i.fa.fa-caret-down');
			this.expandNode.onclick = lang.hitch(this, this._eventExpandOnclick);
		},

		_eventClearOnclick: function() {

			this._doClear();
		},

		_eventExpandOnclick: function() {

			this._once(this.inputInTooltip.getChannel("GOT_PROPS"),
				lang.hitch(this, this._subGotPropsInputInTooltip));

			this._publish(this.inputInTooltip.getChannel("GET_PROPS"), {
				statusFlags: true
			});
		},

		_subGotPropsInputInTooltip: function(res) {

			if (res.statusFlags.shown)
				this._publish(this.inputInTooltip.getChannel("HIDE"));
			else
				this._publish(this.inputInTooltip.getChannel("SHOW"), {
					node: this._getNodeInputInTooltip()
				});
		},

		_getNodeInputInTooltip: function() {

			return this.containerInput.children[1];
		},

		_subInputInTooltipValueChanged: function(res) {

			this._setValue(res.value);
		},

		_valueChanged: function(res) {

			this._valueChangedInputInTooltip(res);

			this.inherited(arguments);
		},

		_valueChangedInputInTooltip: function(res) {

			var value = res.value || res[this.propertyName];

			this._checkConditionIcon(value);

			var obj = {};
			obj[this.propertyNameInputInTooltip] = value;

			this._publish(this.inputInTooltip.getChannel("SET_VALUE"), obj);
		},

		_chkValueForInputInTooltip: function(value) {

			return !!this._isValid;
		},

		_checkConditionIcon: function(value) {

			if (value) {
				this.clearNode.onclick = lang.hitch(this, this._eventClearOnclick);
				put(this.clearIconNode, '!hidden');
			} else {
				this.clearNode.onclick = null;
				put(this.clearIconNode, '.hidden');
			}
		},

		_enable: function() {

			this.inherited(arguments);

			this.expandNode.onclick = lang.hitch(this, this._eventExpandOnclick);

			put(this.additionalNode, '!disable');
		},

		_disable: function() {

			this.inherited(arguments);

			this.expandNode.onclick = null;

			put(this.additionalNode, '.disable');
		}
	});
});
