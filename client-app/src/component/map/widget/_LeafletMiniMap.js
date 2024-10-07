define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'L-miniMap'
], function(
	declare
	, lang
	, aspect
	, MiniMap
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widget Leaflet-MiniMap para Leaflet.

		constructor: function(args) {

			this.config = {
				miniMap: true
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_addMapWidgets', lang.hitch(this, this._addMiniMapMapWidgets));
			aspect.after(this, 'invalidateSize', lang.hitch(this, this._miniMapInvalidateSize));
		},

		_addMiniMapMapWidgets: function() {

			if (!this.miniMap) {
				return;
			}

			this._addMiniMap();
		},

		_addMiniMap: function() {

			var baseLayer = this._getStaticLayerInstance('eoc-map');

			var miniMapConfig = {
				position: 'topright',
				collapsedWidth: 28,
				collapsedHeight: 28,
				toggleDisplay: true,
				minimized: true,
				strings: {
					showText: this.i18n.miniMapShowText,
					hideText: this.i18n.miniMapHideText
				}
			};

			this._miniMapInstance = new MiniMap(baseLayer, miniMapConfig);
			this._miniMapInstance.addTo(this.map);
		},

		_miniMapInvalidateSize: function() {

			if (!this.miniMap || !this._miniMapInstance) {
				return;
			}

			this._miniMapInstance.addTo(this.map);
		}
	});
});
