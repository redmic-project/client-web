define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_addItem", lang.hitch(this, this._addGeoJsonParserItem));
		},

		_dataAvailable: function(response) {

			if (!this._initData && this.initialDataSave) {
				this._initData = lang.clone(response);
			}

			var data = lang.clone(response);

			if (response.data.features) {

				data.data.data = data.data.features;
				delete data.data.features;
			}

			this._addData(data);
		},

		_addGeoJsonParserItem: function(item) {

			for (var key in item.properties) {

				item[key] = item.properties[key];
			}

			delete item.properties;

			var geometry = item.geometry;

			if (geometry) {

				geometry = this._getCoordinates(geometry);

				if (geometry) {
					item.coordinates = geometry;
				}

				delete item.geometry;
			}
		},

		_getCoordinates: function(geometry) {

			if (geometry) {
				var coordinates = geometry.coordinates;
				if (geometry.type === "Point") {
					return this._getFirstPointCoordinates(geometry.coordinates);
				}
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
