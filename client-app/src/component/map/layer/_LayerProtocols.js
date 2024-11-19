define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'leaflet'

	, 'leaflet-nontiledlayer'
], function(
	declare
	, lang
	, L
) {

	return declare(null, {
		//	summary:
		//		Define la correspondencia entre protocolos e implementaciones de capas de mapa.
		//	description:
		//		Centraliza la obtención de instancias de capas para mapas Leaflet, en función del protocolo solicitado.

		constructor: function(args) {

			this.config = {
				_protocolImplementationMapping: {
					'WMS-C': L.tileLayer.wms,
					'WMS': L.NonTiledLayer.WMS,
					'WMTS': L.tileLayer,
					'TMS': L.tileLayer
				}
			};

			lang.mixin(this, this.config, args);
		},

		_getLayerInstance: function(/*Object*/ layerDefinition) {
			//	summary:
			//		Genera una instancia de capa para el protocolo solicitado.
			//	layerDefinition:
			//		Definición para instanciar la capa.
			//	returns:
			//		Instancia de la capa creada.

			var layerProtocol = layerDefinition.protocol,
				LayerImplementation = this._protocolImplementationMapping[layerProtocol];

			if (!LayerImplementation) {
				console.error('Implementation not found for layer protocol "%s"', layerProtocol);
				return;	// return undefined
			}

			var layerUrl = layerDefinition.url,
				layerProps = layerDefinition.props || {};

			if (!layerUrl) {
				console.error('Received invalid layer definition, URL is mandatory');
				return;	// return undefined
			}

			if (layerProtocol === 'WMS') {
				layerProps.pane = 'tilePane';
				layerProps.version = '1.3.0';
			}

			return new LayerImplementation(layerUrl, layerProps);	// return Object
		}
	});
});
