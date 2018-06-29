define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "put-selector/put"
	, "./Toolbar"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, put
	, Toolbar
){
	return declare(Toolbar, {
		//	summary:
		//		Selector del índice de los datos que mostrarán las gráficas que contengan un array de datos que no sean
		//		capaces de representar combinados.

		constructor: function(args) {

			this.config = {
				ownChannel: "dataSelectorTool",
				dataSelectorEvents: {
					DATA_SET: "dataSet"
				},
				dataSelectorActions: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixDataSelectorEventsAndActions));
			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setDataSelectorOwnCallbacksForEvents));

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineDataSelectorSubscriptions));
		},

		_setConfigurations: function() {

			this.dataSelectorConfig = this._merge([{
				parentChannel: this.getChannel(),
				indicatorLeft: true,
				notIndicator: true,
				classTooltip: "tooltipButtonMenu tooltipButtonChart",
				select: {
					"default": 0
				}
			}, this.dataSelectorConfig || {}]);
		},

		_mixDataSelectorEventsAndActions: function () {

			lang.mixin(this.events, this.dataSelectorEvents);
			lang.mixin(this.actions, this.dataSelectorActions);
			delete this.dataSelectorEvents;
			delete this.dataSelectorActions;
		},

		_setDataSelectorOwnCallbacksForEvents: function() {

			this._onEvt('DATA_SET', lang.hitch(this, this._onDataSet));
		},

		_initialize: function() {

			this._dataSelector = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.dataSelectorConfig);

			this._dataSelectorNode = put(this.domNode, "span.titleButton", this.i18n.dataSelector);
			put(this._dataSelectorNode, "i.fa.fa-angle-down");
		},

		_defineDataSelectorSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._dataSelector.getChannel("EVENT_ITEM"),
				callback: "_subDataSelectorEventItem"
			});
		},

		postCreate: function() {

			this._publish(this._dataSelector.getChannel("ADD_EVT"), {
				sourceNode: this._dataSelectorNode
			});
		},

		_subDataSelectorEventItem: function(res) {

			this._emitEvt('TOOL_ACTUATED', this._getValueInObj(res));
		},

		_getValueInObj: function(obj) {

			var value;
			if (!obj) {
				value = null;
			} if (obj.value !== undefined) {
				value = obj.value;
			} else {
				value = obj.label;
			}

			return {
				value: value
			};
		},

		_onDataSet: function(changeObj) {

			this._publish(this._dataSelector.getChannel("CHANGE_ITEMS"), {
				items: this.data
			});
		}
	});
});
