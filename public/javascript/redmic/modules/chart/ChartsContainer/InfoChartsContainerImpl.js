define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/promise/all"
	, "./ChartsContainer"
], function(
	declare
	, lang
	, all
	, ChartsContainer
){
	return declare(ChartsContainer, {
		//	summary:
		//		Implementación de contenedor de capas con consulta de información disponible para terceros.
		//	description:
		//		Otros módulos pueden preguntar a este sobre las capas que tiene cargadas (por ejemplo, para mostrar
		//		una leyenda).

		constructor: function(args) {

			this.config = {
				ownChannel: "infoChartsContainer",
				paddingContainer: 5
			};

			lang.mixin(this, this.config, args);
		},

		_doSubscriptionsForLayer: function(layerId) {

			this.inherited(arguments);

			var layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			this._subscriptionsForLayers[layerId].push(this._setSubscription({
				channel: layerInstance.getChannel("GOT_INFO"),
				callback: "_subGotInfoLayer"
			}), this._setSubscription({
				channel: layerInstance.getChannel("INFO_UPDATED"),
				callback: "_subLayerInfoUpdated"
			}));
		},

		_subGotInfoLayer: function(res) {

			this._emitEvt("GOT_LAYER_INFO", res);
		},

		_subLayerInfoUpdated: function(res) {

			this._emitEvt('LAYER_INFO_UPDATED', res);
		},

		_getLayerInfo: function(req) {

			var layerId = req ? req.layerId : null;

			if (layerId) {

				this._requestInfo(layerId);
			} else {

				for (layerId in this._layers) {

					this._requestInfo(layerId);
				}
			}
		},

		_requestInfo: function(layerId) {

			var layerInstance = this._layers[layerId];
			layerInstance && this._publish(layerInstance.getChannel("GET_INFO"));
		},

		_prepareUpdateLayersPromises: function() {

			this._emitEvt("LOADING");

			if (this._prepareUpdateLayersDfdList) {
				delete this._prepareUpdateLayersDfdList;
			}

			this._prepareUpdateLayersDfdList = {};
		},

		_prepareUpdateLayers: function() {

			if (this._prepareUpdateLayersDfdPromise) {
				this._prepareUpdateLayersDfdPromise.cancel();
				delete this._prepareUpdateLayersDfdPromise;
			}

			this._prepareUpdateLayersDfdPromise = all(this._prepareUpdateLayersDfdList)
				.then(lang.hitch(this, this.inherited, arguments));
		},

		_finishUpdateLayersPromises: function() {

			delete this._prepareUpdateLayersDfdList;

			this._emitEvt("LOADED");
		}
	});
});
