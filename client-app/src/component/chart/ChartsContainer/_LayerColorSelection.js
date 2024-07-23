define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "src/component/chart/ChartsContainer/_ColorSelection"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ColorSelection
) {
	return declare(_ColorSelection, {
		//	summary:
		//		Extensión para que el contenedor gestione los colores de las gráficas.

		constructor: function(args) {

			this.config = {
				layerColorSelectionEvents: {},
				layerColorSelectionActions: {
					SET_LAYER_COLOR: "setLayerColor",
					COPY_CHART_COLOR: "copyChartColor"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixLayerColorSelectionEventsAndActions));
			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setLayerColorSelectionOwnCallbacksForEvents));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineLayerColorSelectionSubscriptions));
		},

		_mixLayerColorSelectionEventsAndActions: function() {

			lang.mixin(this.events, this.layerColorSelectionEvents);
			lang.mixin(this.actions, this.layerColorSelectionActions);
			delete this.layerColorSelectionEvents;
			delete this.layerColorSelectionActions;
		},

		_setLayerColorSelectionOwnCallbacksForEvents: function() {

			this._onEvt("LAYER_ADDED", lang.hitch(this, this._selectColorForLayer));
			this._onEvt("LAYER_CLEARED", lang.hitch(this, this._removeLayerColorUsage));
		},

		_defineLayerColorSelectionSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("SET_LAYER_COLOR"),
				callback: "_subSetLayerColor"
			},{
				channel: this.getChannel("COPY_CHART_COLOR"),
				callback: "_subCopyChartColor"
			});
		},

		_getAvailableColors: function() {

			// Material Design colors (https://www.materialui.co/colors)
			return [
				'#F44336', '#3F51B5', '#009688', '#FF9800', '#795548', '#F06292', '#2196F3',
				'#4CAF50', '#FFC107', '#9E9E9E', '#9C27B0', '#29B6F6', '#9CCC65', '#FDD835',
				'#607D8B', '#9575CD', '#00BCD4', '#CDDC39', '#FF7043', '#424242'
			];
		},

		_selectColorForLayer: function(res) {

			var colorsNeeded = res.colorsNeeded;

			if (!colorsNeeded) {
				return;
			}

			var layerId = res.chart,
				layerInstance = this._layers[layerId],
				color = this._getFreeColor(layerId, colorsNeeded);

			this._publishToLayer(layerInstance, "SET_COLOR", {
				color: color
			});
		},

		_removeLayerColorUsage: function(res) {

			var layerId = res.chart;
			this._removeColorUsage(layerId);
		},

		_subSetLayerColor: function(req) {

			this._setLayerColor(req);
		},

		_setLayerColor: function(req) {

			var layerId = req.layerId,
				color = req.color,
				oldColor = req.oldColor,
				colorIndex = req.colorIndex,
				layerInstance = this._layers[layerId];

			if (!layerInstance || color === oldColor) {
				return;
			}

			this._removeColorUsage(layerId, colorIndex);

			var pubObj = {
				color: color
			};

			if (Utilities.isValidNumber(colorIndex)) {
				pubObj.colorIndex = colorIndex;
			}

			this._publishToLayer(layerInstance, "SET_COLOR", pubObj);
		},

		_subCopyChartColor: function(req) {

			var sourceId = req.sourceChartId,
				targetId = req.targetChartId,
				layerInstance = this._layers[targetId],
				colorId = this._getColorUsage(sourceId),
				color = this._getColor(colorId);

			this._removeColorUsage(targetId);
			this._publishToLayer(layerInstance, "SET_COLOR", {
				color: color
			});
		}
	});
});
