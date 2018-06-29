define([
	"app/base/views/extensions/_ProcessInterval"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/form/input/SelectImpl"
	, "redmic/modules/layout/dataDisplayer/DataDisplayer"
	, "put-selector/put"
], function(
	_ProcessInterval
	, declare
	, lang
	, aspect
	, SelectImpl
	, DataDisplayer
	, put
){
	return declare(_ProcessInterval, {
		//	summary:
		//		Extensión para la vista de trash.
		//	description:
		//		Añade funcionalidades de manejo de timeInterval.

		constructor: function(args) {

			this.config = {
				defaultIntervalOptions: [],
				_intervalLabelKeysByValue: {}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_afterSetConfigurations",
				lang.hitch(this, this._setSelectAndProcessTimeIntervalConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeSelectAndProcessTimeInterval));
			aspect.after(this, "_defineSubscriptions",
				lang.hitch(this, this._defineSelectAndProcessTimeIntervalSubscriptions));
		},

		_setSelectAndProcessTimeIntervalConfigurations: function() {

			this.timeIntervalSelectConfig = this._merge([{
				parentChannel: this.getChannel(),
				includeEmptyValue: false,
				idProperty: this.idProperty
			}, this.formSelectorInputConfig || {}]);

			this.timeIntervalSelectContainerConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.timeIntervalSelectContainerConfig || {}]);
		},

		_initializeSelectAndProcessTimeInterval: function() {

			this.timeIntervalSelect = new SelectImpl(this.timeIntervalSelectConfig);

			this.timeIntervalSelectContainer = new DataDisplayer(this.timeIntervalSelectContainerConfig);
		},

		_defineSelectAndProcessTimeIntervalSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.timeIntervalSelect.getChannel("VALUE_CHANGED"),
				callback: "_subTimeIntervalChanged"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var selectContainerNode = put("div.inputContainer.selectTimeInterval.mediumSolidContainer.selectZone"),
				labelNode = put(selectContainerNode, "div.leftContainer .span", this.i18n.groupedBy),

				selectNode = put(selectContainerNode, "div.rightContainer");

			this._publish(this.timeIntervalSelect.getChannel("SHOW"), {
				node: selectNode
			});

			this._publish(this.timeIntervalSelectContainer.getChannel("SET_PROPS"), {
				data: selectContainerNode
			});
		},

		_subTimeIntervalChanged: function(res) {

			var value = res.value;

			this.intervalValue = value;
			this._intervalLabelKey = this._intervalLabelKeysByValue[value];

			this._onIntervalChanged(value);
		},

		_addOptionsSelectTimeInterval: function(data) {

			this._optionsTimeInterval = this._processDataAndOptionsInterval(data);

			for (var i = 0; i < this._optionsTimeInterval.length; i++) {
				var option = this._optionsTimeInterval[i];
				this._intervalLabelKeysByValue[option.value] = option.labelKey;
			}

			this._publish(this.timeIntervalSelect.getChannel("SET_OPTIONS"), {
				options: this._optionsTimeInterval
			});

			this._publish(this.timeIntervalSelect.getChannel("SET_VALUE"), {
				name: this.intervalValue
			});
		}
	});
});
