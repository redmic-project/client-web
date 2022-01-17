define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_ShowInPopup'
	, 'redmic/modules/layout/dataDisplayer/DataDisplayer'
], function(
	declare
	, lang
	, put
	, _ShowInPopup
	, DataDisplayer
) {

	return declare(null, {
		//	summary:
		//		Gestión de leyenda de capas para el módulo Atlas.

		constructor: function(args) {

			this.config = {
				_layersDataContainers: {}, // contenedores de info y legend de las capas
				_legendInstances: {} // instancias de módulo visualizador de leyendas
			};

			lang.mixin(this, this.config, args);
		},

		_removeLegendOfRemovedLayer: function(layerId) {

			var infoContainer = this._layersDataContainers[layerId],
				legendContent = infoContainer ? infoContainer.legend : null;

			legendContent && put('!', legendContent);
			delete this._layersDataContainers[layerId];
		},

		_createLegendSubAndPubsForLayer: function(layerInstance) {

			this._setSubscription({
				channel : layerInstance.getChannel('LAYER_LEGEND'),
				callback: '_subLayerLegend'
			});
		},

		_removeLegendSubAndPubsForLayer: function(layerInstance) {

			this._removeSubscription(layerInstance.getChannel('LAYER_LEGEND'));
		},

		_subLayerLegend: function(response) {

			var layerId = response.layerId,
				layerLabel = response.layerLabel,
				layerLegend = response.legend,
				container = this._layersDataContainers[layerId];

			if (!container) {
				container = this._layersDataContainers[layerId] = {};
			}

			if (container.legend) {
				put('!', container.legend);
			}

			container.legend = put('div.atlasLayerInfoMessage');

			var legendContent = put(container.legend, 'div.layerLegend');
			put(legendContent, 'div.layerLegendTitle', layerLabel);

			var legendContentImg = put(legendContent, 'div.imageContainer');
			legendContentImg.innerHTML = layerLegend;
		},

		_showLayerLegend: function(layerId) {

			var container = this._layersDataContainers[layerId],
				legend = container ? container.legend : null;

			if (legend) {
				if (!this._legendInstances[layerId]) {
					this._legendInstances[layerId] = new declare(DataDisplayer).extend(_ShowInPopup)({
						parentChannel: this.getChannel(),
						ownChannel: 'legend' + layerId,
						title: this.i18n.legend,
						width: 5,
						height: 'sm'
					});
				}

				this._publish(this._legendInstances[layerId].getChannel('TOGGLE_SHOW'), {
					data: legend.innerHTML
				});
			} else {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noLegendAvailable
				});
			}
		}
	});
});
