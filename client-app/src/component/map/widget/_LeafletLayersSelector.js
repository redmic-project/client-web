define([
	'dojo/_base/declare'
	, 'dojo/dom-class'
	, 'leaflet'
], function(
	declare
	, domClass
	, L
) {

	return declare(null, {
		// summary:
		//   Incluye y configura widget selector de capas para Leaflet y prepara callbacks relacionados con la
		//   gestión de capas.

		postMixInProperties: function() {

			const defaultConfig = {
				layersSelector: true
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);

			if (this.layersSelector) {
				this._layersSelectorInstance = L.control.layers();
			}
		},

		_addMapWidgets: function() {

			this.inherited(arguments);

			if (!this.layersSelector || !this._layersSelectorInstance) {
				return;
			}

			this._addLayersSelector();
		},

		_addLayersSelector: function() {

			this._layersSelectorInstance.addTo(this.map);
			domClass.add(this._layersSelectorInstance._container.firstChild, 'fa-globe');
		},

		_addLayerToSelector: function(layer, label, optional) {

			if (!this._layersSelectorInstance) {
				return;
			}

			const addMethod = !optional ? 'addBaseLayer' : 'addOverlay',
				layerLabel = this.i18n[label] ?? label;

			this._layersSelectorInstance[addMethod](layer, layerLabel);
		},

		_removeLayerFromSelector: function(layer) {

			if (!this._layersSelectorInstance) {
				return;
			}

			this._layersSelectorInstance.removeLayer(layer);
		},

		_onBaseLayerChange: function(evt) {

			this.inherited(arguments);

			const layerInstance = evt.layer;

			this._setLayerZIndex(layerInstance, 0);

			if (!this._alreadyReceivedInitialBaseLayerChange) {
				this._alreadyReceivedInitialBaseLayerChange = true;
				return;
			}

			this._emitEvt('TRACK', {
				event: 'change_map_baselayer',
				layer_name: layerInstance.options.id
			});
		}
	});
});
