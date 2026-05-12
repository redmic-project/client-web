define([
	'dojo/_base/declare'
	, 'src/component/gateway/Gateway'
], function(
	declare
	, Gateway
) {

	return declare(Gateway, {
		//	summary:
		//		Implementación de gateway entre browser y map/mapLayer para centrar el mapa en un punto y destacar un
		//		marcador de la capa.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'mapCenteringGateway',
				btnToListen: 'mapCentering',
				centeringDuration: 1,
				idProperty: 'uuid'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
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
				itemId = item[this.idProperty];

			this._emitEvt('SET_CENTER', {
				markerId: itemId,
				item: item,
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
