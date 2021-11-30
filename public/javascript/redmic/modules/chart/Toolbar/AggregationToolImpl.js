define([
	"app/base/views/extensions/_ProcessInterval"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "put-selector/put"
	, "./Toolbar"
], function(
	_ProcessInterval
	, declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, put
	, Toolbar
){
	return declare([Toolbar, _ProcessInterval], {
		//	summary:
		//		Herramienta para elegir los tipos de agregaciones aplicados a las gráficas.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: "aggregationTool",
				notShowIntervalList: false,
				aggregationsToolEvents: {
					DATA_DEFINITIONS_SET: "dataDefinitionsSet"
				},
				selection: {
					interval: ["raw"],
					metrics: ["avg"]
				},

				elementClass: "aggregationToolElement"
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineAggregationToolSubscriptions));
			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixAggregationsToolEventsAndActions));
		},

		_setConfigurations: function() {

			this.intervalConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: this._generateOptionsIntervalDefault(),
				classTooltip: "tooltipButtonMenu tooltipButtonChart"
			}, this.intervalConfig || {}]);

			this.metricsConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: [{
					'labelKey': 'avg',
					'value': 'avg'
				},{
					'labelKey': 'min',
					'value': 'min'
				},{
					'labelKey': 'max',
					'value': 'max'
				},{
					'labelKey': 'sum',
					'value': 'sum'
				/*},{
					'labelKey': 'count',
					'value': 'count'*/
				}],
				incompatible: {
					"raw": true
				},
				multipleSelected: true,
				forbidEmptySelection: true,
				groups: {
					1: {
						0: true,
						1: true,
						2: true
					},
					2: {
						3: true/*,
						4: true*/
					}
				},
				classTooltip: "tooltipButtonMenu tooltipButtonChart"
			}, this.metricsConfig || {}]);
		},

		_initialize: function() {

			this._initializeSelectDefault();

			this.intervalListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.intervalConfig);

			if (!this.notShowIntervalList) {
				this.intervalListNode = put(this.domNode, "span.titleButton", this.i18n.interval);
				put(this.intervalListNode, "i.fa.fa-angle-down");
			}

			this.metricsListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.metricsConfig);

			this.metricsListNode = put(this.domNode, "span.titleButton", this.i18n.metrics);
			put(this.metricsListNode, "i.fa.fa-angle-down");
		},

		_initializeSelectDefault: function() {

			this._processSelectionItemsDefault(this.intervalConfig, this.selection.interval);

			this._processSelectionItemsDefault(this.metricsConfig, this.selection.metrics);
		},

		_processSelectionItemsDefault: function(config, option) {

			config.select = {};

			if (config.multipleSelected) {
				config.select['default'] = {};
			} else {
				config.select['default'] = null;
			}

			for (var i = 0; i < option.length; i++) {
				var labelSelect = option[i];
				for (var n = 0; n < config.items.length; n++) {
					var item = config.items[n];
					if (this._getValueInObj(item) === labelSelect) {
						if (!config.multipleSelected) {
							config.select['default'] = n;
						} else {
							config.select['default'][n] = true;
						}

						break;
					}
				}
			}
		},

		_mixAggregationsToolEventsAndActions: function() {

			lang.mixin(this.events, this.aggregationsToolEvents);

			delete this.aggregationsToolEvents;
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('DATA_DEFINITIONS_SET', lang.hitch(this, this._onDataDefinitionsSet));
		},

		_defineAggregationToolSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.intervalListMenu.getChannel("EVENT_ITEM"),
				callback: "_subIntervalListEventItem"
			},{
				channel : this.metricsListMenu.getChannel("EVENT_ITEM"),
				callback: "_subMetricsListEventItem"
			});
		},

		postCreate: function() {

			!this.notShowIntervalList && this._publish(this.intervalListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.intervalListNode
			});

			this._publish(this.metricsListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.metricsListNode
			});

			this._showOrHideTool(this.metricsConfig, this.selection.interval[0], this.metricsListNode);
		},

		_subIntervalListEventItem: function(res) {

			var returnObj = {},
				value = this._getValueInObj(res);

			this._showOrHideTool(this.metricsConfig, value, this.metricsListNode);

			if (this.intervalConfig.multipleSelected) {
				returnObj.value = res;
			} else {
				returnObj.value = [value];
			}

			if (res.labelKey) {
				returnObj.labelKey = res.labelKey;
			} else if (res.label) {
				returnObj.label = res.label;
			}

			this._onSelectionChange("interval", returnObj);
		},

		_onDataDefinitionsSet: function(obj) {

			var items = this._processDataAndOptionsInterval(obj.value);

			this._publish(this.intervalListMenu.getChannel("CHANGE_ITEMS"), {
				items: items
			});

			this._publish(this.intervalListMenu.getChannel("SELECT_ITEM"), {
				valueItem: items[0].value
			});

			// TODO parche para seleccionar al tener datos cuando no hay selección predefinida, mejorar en el futuro
			// su planteamiento
			if (!this.selection.interval) {
				this.selection.interval = [items[0].value];
				this._onSelectionChange("interval", {
					value: this.selection.interval,
					labelKey: items[0].labelKey
				});
			}
		},

		_getValueInObj: function(obj) {

			return obj.value ? obj.value : obj.label;
		},

		_showOrHideTool: function(tool, label, node) {

			if (!tool.incompatible[label]) {
				put(node, "!hidden");
			} else {
				put(node, ".hidden");
			}
		},

		_subMetricsListEventItem: function(res) {

			var returnValue;

			if (this.metricsConfig.multipleSelected) {
				returnValue = res.selection;
			} else {
				returnValue = [this._getValueInObj(res)];
			}

			this._onSelectionChange("metrics", returnValue);
		},

		_onSelectionChange: function(item, arraySelect) {

			this.selection[item] = arraySelect;

			this._sendToolChange();
		},

		_sendToolChange: function() {

			this._emitEvt('TOOL_ACTUATED', this.selection);
		}
	});
});
