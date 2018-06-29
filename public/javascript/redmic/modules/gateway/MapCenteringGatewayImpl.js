define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, './Gateway'
], function(
	declare
	, lang
	, Gateway
){
	return declare([Gateway], {
		//	summary:
		//		Implementación de gateway entre browser y map/mapLayer para centrar el mapa en un punto y destacar un
		//		marcador de la capa.

		constructor: function(args) {

			this.config = {
				ownChannel: 'mapCenteringGateway',
				btnToListen: 'mapCentering',
				centeringDuration: 1,
				idProperty: 'uuid'
			};

			lang.mixin(this, this.config, args);
		},

		_subAnimateMarker: function(/*Object*/ objReceived) {

			var btnId = objReceived.btnId;

			if (btnId !== this.btnToListen) {
				return;
			}

			var item = objReceived.item,
				itemId = item[this.idProperty];

			this._emitEvt('ANIMATE_MARKER', {
				markerId: itemId
			});
		},

		_subSetCenter: function(/*Object*/ objReceived) {

			var btnId = objReceived.btnId;

			if (btnId !== this.btnToListen) {
				return;
			}

			var item = objReceived.item,
				itemCoords = item.coordinates,
				coordinates;

			if (!itemCoords) {
				return;
			}

			coordinates = [this._getLatitude(itemCoords), this._getLongitude(itemCoords)];

			this._emitEvt('SET_CENTER', {
				center: coordinates,
				options: {
					animate: true,
					duration: this.centeringDuration
				}
			});
		},

		_getLatitude: function(item) {

			return item[1];
		},

		_getLongitude: function(item) {

			return item[0];
		}
	});
});
