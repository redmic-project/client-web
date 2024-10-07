define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
], function(
	declare
	, lang
	, put
) {

	return declare(null, {
		//	summary:
		//		Gestión de leyenda de capas para el módulo Atlas.

		constructor: function(args) {

			this.config = {
				legendClass: 'legendContainer',
				_legendByLayerId: {},
				_legendShownByLayerId: {}
			};

			lang.mixin(this, this.config, args);
		},

		_removeLegendOfRemovedLayer: function(layerId) {

			var legend = this._legendByLayerId[layerId];

			if (legend) {
				put('!', legend);
				delete this._legendByLayerId[layerId];
			}
		},

		_createLegendSubsAndPubsForLayer: function(layerInstance) {

			this._setSubscription({
				channel : layerInstance.getChannel('LAYER_LEGEND'),
				callback: '_subLayerLegend'
			});
		},

		_removeLegendSubsAndPubsForLayer: function(layerInstance) {

			this._removeSubscription(layerInstance.getChannel('LAYER_LEGEND'));
		},

		_subLayerLegend: function(response) {

			var layerId = response.layerId,
				layerLegend = response.legend;

			if (!this._legendByLayerId[layerId]) {
				var legend = put('span.' + this.legendClass);
				legend.innerHTML = layerLegend;

				this._legendByLayerId[layerId] = legend;
			}
		},

		_showLayerLegend: function(browserButtonObj) {

			var container = browserButtonObj.node,
				legendContainer = container.children[1],
				item = browserButtonObj.item.originalItem,
				layerId = this._createLayerId(item),
				legend = this._legendByLayerId[layerId],
				legendShown = this._legendShownByLayerId[layerId];

			if (legendShown === undefined) {
				legendShown = this._legendShownByLayerId[layerId] = false;
			}

			if (!legend) {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noLegendAvailable
				});

				return;
			}

			if (!legendShown) {
				put(legendContainer, legend);
				this._legendShownByLayerId[layerId] = true;
			} else {
				put('!', legend);
				this._legendShownByLayerId[layerId] = false;
			}
		}
	});
});
