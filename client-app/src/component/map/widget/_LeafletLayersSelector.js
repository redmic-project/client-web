define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-class'
	, 'dojo/aspect'
	, 'leaflet'
], function(
	declare
	, lang
	, domClass
	, aspect
	, L
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widget selector de capas para Leaflet y prepara callbacks relacionados con la
		//		gestión de capas.

		constructor: function(args) {

			this.config = {
				layersSelector: true
			};

			lang.mixin(this, this.config, args);

			if (this.layersSelector) {
				this._layersSelectorInstance = L.control.layers();
			}

			aspect.before(this, '_addMapWidgets', lang.hitch(this, this._addLayersSelectorMapWidgets));
		},

		_addLayersSelectorMapWidgets: function() {

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

			var addMethod = !optional ? 'addBaseLayer' : 'addOverlay',
				layerLabel = this.i18n[label] || label;

			this._layersSelectorInstance[addMethod](layer, layerLabel);
		},

		_removeLayerFromSelector: function(layer) {

			if (!this._layersSelectorInstance) {
				return;
			}

			this._layersSelectorInstance.removeLayer(layer);
		},

		_onBaseLayerChange: function(evt) {

			var layerInstance = evt.layer;

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
