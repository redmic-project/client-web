define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'L-miniMap'
], function(
	declare
	, lang
	, MiniMap
) {

	return declare(null, {
		// summary:
		//   Incluye y configura widget Leaflet-MiniMap para Leaflet.

		postMixInProperties: function() {

			const defaultConfig = {
				miniMap: true,
				miniMapConfig: {
					position: 'topright',
					collapsedWidth: 28,
					collapsedHeight: 28,
					toggleDisplay: true,
					minimized: true,
					strings: {
						showText: this.i18n.miniMapShowText,
						hideText: this.i18n.miniMapHideText
					}
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_addMapWidgets: function() {

			this.inherited(arguments);

			if (!this.miniMap) {
				return;
			}

			const baseLayer = this._getStaticLayerInstance('eoc-map');

			if (baseLayer?.then) {
				baseLayer.then(baseLayerResolved => this._addMiniMap(baseLayerResolved));
			} else {
				this._addMiniMap(baseLayer);
			}
		},

		_addMiniMap: function(baseLayer) {

			if (!baseLayer) {
				return;
			}

			this._miniMapInstance = new MiniMap(baseLayer, this.miniMapConfig);
			this._miniMapInstance.addTo(this.map);
		},

		invalidateSize: function() {

			this.inherited(arguments);

			if (!this.miniMap || !this._miniMapInstance) {
				return;
			}

			this._miniMapInstance.addTo(this.map);
		}
	});
});
