define([
	'd3'
	, 'dojo/_base/declare'
], function(
	d3
	, declare
) {

	return declare(null, {
		// summary:
		//   Lógica de gestión de colores disponibles y uso por parte de elementos representados en mapa (y listado).

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				_availableColors: d3.schemePaired,
				_colorsUsage: {}
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_getFreeColor: function(itemId) {

			const color = this._availableColors.find(
				(_color, index) => !Object.values(this._colorsUsage).includes(index));

			if (color) {
				this._colorsUsage[itemId] = this._availableColors.indexOf(color);
			}
			return color;
		},

		_getUsedColor: function(itemId) {

			return this._availableColors[this._colorsUsage[itemId]];
		},

		_releaseColor: function(itemId) {

			delete this._colorsUsage[itemId];
		},

		_removeAllColorUsage: function() {

			Object.keys(this._colorsUsage).forEach(itemId => {
				this._releaseColor(itemId);
				this._updateBrowserItem?.(itemId, {
					color: null
				});
			});
		}
	});
});
