define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dijit/form/NumberSpinner"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "RWidgets/ValueAndUnitSelector"
	, "put-selector/put"
], function(
	declare
	, lang
	, NumberSpinner
	, _Module
	, _Show
	, ValueAndUnitSelector
	, put
){
	return declare([_Module, _Show], {
		//	summary:
		//
		//	description:
		//
		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				valueRate: 1,
				convertToBase: 1000,
				minSlider: 0.25,
				delta: 0.25,
				props: {
					'class': "valueAndUnitSelector",
					i18n: this.i18n
				},
				events: {
					CHANGE_VALUE: "changeValue",
					CHANGE_VALUE_AND_UNIT: "changeValueAndUnit"
				},
				actions: {
					CHANGE_VALUE: "changeValue",
					DISABLED_INTERVAL: "disabledInterval",
					ENABLED_INTERVAL: "enabledInterval",
					GET_VALUE: "getValue"
				},
				ownChannel: "stepAndRateEditor"
			};

			lang.mixin(this, this.config, args);

			this._onEvt('CHANGE_VALUE_AND_UNIT', this._changeValueAndUnit);
		},

		_initialize: function() {

			this.domNode = put('div.stepAndRateEditor');

			put(this.domNode, "span", this.i18n.rateEditor);

			var numberTextBoxNode = put(this.domNode, "div.rate");

			this.numberTextBox = new NumberSpinner({
				onChange: lang.hitch(this, this._changeValueRate),
				value: this.valueRate,
				constraints: { min: this.minSlider},
				smallDelta: this.delta
			}).placeAt(numberTextBoxNode);

			put(numberTextBoxNode, "span", this.i18n.seconds);

			this.spanValueAndUnitSelectorNode = put(this.domNode, "span", this.i18n.valueAndUnitSelector);

			this.valueAndUnitSelectorNode = put(this.domNode, "div");

			this.valueAndUnitSelector = new ValueAndUnitSelector(this.props).placeAt(this.valueAndUnitSelectorNode);
		},

		_doEvtFacade: function() {

			this.valueAndUnitSelector.on(this.valueAndUnitSelector.events.CHANGE_VALUE, lang.hitch(this, this._groupEventArgs, 'CHANGE_VALUE_AND_UNIT'));
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("DISABLED_INTERVAL"),
				callback: "_subDisabledInterval"
			},{
				channel : this.getChannel("ENABLED_INTERVAL"),
				callback: "_subEnabledInterval"
			},{
				channel : this.getChannel("GET_VALUE"),
				callback: "_subGetValue"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'CHANGE_VALUE',
				channel: this.getChannel("CHANGE_VALUE")
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_changeValueAndUnit: function(obj) {

			var objValues = {};
			objValues.valueAndUnitSelector = obj.value;
			objValues.valueRate = this.numberTextBox.get("value") * this.convertToBase;

			if (objValues.valueRate > 0)
				this._emitEvt('CHANGE_VALUE', objValues);
		},

		_changeValueRate: function(value) {

			if (value > 0) {
				this.valueRate = value;
				this.valueAndUnitSelector.emit(this.valueAndUnitSelector.events.GET_VALUE);
			} else
				this.numberTextBox.set("value", this.valueRate);
		},

		_subDisabledInterval: function() {

			this.valueAndUnitSelectorNode.classList.add("hidden");
			this.spanValueAndUnitSelectorNode.classList.add("hidden");

			this.valueAndUnitSelector.emit(this.valueAndUnitSelector.events.DISABLED);
		},

		_subEnabledInterval: function() {

			this.valueAndUnitSelectorNode.classList.remove("hidden");
			this.spanValueAndUnitSelectorNode.classList.remove("hidden");

			this.valueAndUnitSelector.emit(this.valueAndUnitSelector.events.ENABLED);
		},

		_subGetValue: function() {

			this.valueAndUnitSelector.emit(this.valueAndUnitSelector.events.GET_VALUE);
		}
	});
});