define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector'
], function(
	declare
	, lang
	, aspect
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

			aspect.before(this, '_deactivateLayer', lang.hitch(this, this._atlasLegendDeactivateLayer));
			aspect.before(this, '_cleanRowSecondaryContainer', lang.hitch(this,
				this._atlasLegendCleanRowSecondaryContainer));
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

		_toggleShowLayerLegend: function(browserButtonObj) {

			var atlasLayerItem = browserButtonObj.item,
				layerId = atlasLayerItem.mapLayerId;

			if (!this._activeLayers[layerId]) {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.addLayerFirst
				});

				return;
			}

			var container = browserButtonObj.node,
				legendContainer = container.children[1],
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
				this._showLayerLegend(layerId, legendContainer, legend);
			} else {
				this._hideLayerLegend(layerId);
			}
		},

		_showLayerLegend: function(layerId, legendContainer, legend) {

			this._cleanRowSecondaryContainer(layerId, legendContainer);

			put(legendContainer, legend);
			this._legendShownByLayerId[layerId] = true;
		},

		_hideLayerLegend: function(layerId) {

			put('!', this._legendByLayerId[layerId]);
			this._legendShownByLayerId[layerId] = false;
		},

		_atlasLegendDeactivateLayer: function(atlasLayerItem) {

			if (!atlasLayerItem) {
				return;
			}

			var mapLayerId = atlasLayerItem.mapLayerId;

			this._legendShownByLayerId[mapLayerId] = false;
		},

		_atlasLegendCleanRowSecondaryContainer: function(layerId) {

			if (this._legendShownByLayerId[layerId]) {
				this._hideLayerLegend(layerId);
			}
		}
	});
});
