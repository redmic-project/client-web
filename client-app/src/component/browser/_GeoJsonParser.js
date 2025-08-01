define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
) {

	return declare(null, {
		// summary:
		//   Amplía proceso de entrada de datos para el manejo de GeoJSON, aplanando su estructura para facilitar su
		//   uso.

		_addData: function(response) {

			if (!response?.data?.features) {
				this.inherited(arguments);
			}

			const clonedResponse = lang.clone(response);

			clonedResponse.data.data = clonedResponse.data.features;
			delete clonedResponse.data.features;

			arguments[0] = clonedResponse;

			this.inherited(arguments);
		},

		_addItem: function(item) {

			const coordinates = this._getCoordinates(item.geometry);

			const itemData = this._merge([item, item.properties, {coordinates}]);

			delete itemData.geometry;
			delete itemData.properties;

			arguments[0] = itemData;

			this.inherited(arguments);
		},

		_getCoordinates: function(geometry) {

			const geometryType = geometry?.type,
				coordinates = geometry?.coordinates;

			if (!coordinates?.length) {
				return;
			}

			if (geometryType === 'Point') {
				return this._getFirstPointCoordinates(coordinates);
			}
		},

		_getFirstPointCoordinates: function(coordinates) {

			return [
				this._getCoordinateWithLimitedDecimals(coordinates[0]),
				this._getCoordinateWithLimitedDecimals(coordinates[1])
			];
		},

		_getCoordinateWithLimitedDecimals: function(coordinate) {

			return Math.floor(coordinate * 100000) / 100000;
		}
	});
});
