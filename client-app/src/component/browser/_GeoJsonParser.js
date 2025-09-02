define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Amplía proceso de entrada de datos para el manejo de GeoJSON, aplanando su estructura para facilitar su
		//   uso.

		_addData: function(response) {

			if (!response?.data?.features) {
				this.inherited(arguments);
			}

			// TODO evitar sobreescribir respuesta, en su lugar adaptar su lectura donde haga falta
			response.data.data = response.data.features;
			//delete response.data.features;

			this.inherited(arguments);
		},

		_addItem: function(item) {

			const coordinates = this._getCoordinates(item.geometry);

			item = this._merge([item, item.properties, {coordinates}]);

			delete item.geometry;
			delete item.properties;

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
