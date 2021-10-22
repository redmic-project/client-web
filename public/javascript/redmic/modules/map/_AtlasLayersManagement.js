define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
) {

	return declare(null, {
		//	summary:
		//		Permite interpretar las configuraciones de capas procedentes del servicio atlas, para generar
		//		configuraciones de capa que puedan mostrarse en el mapa.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);
		},

		_getLayerDefinitionByProtocol: function(atlasLayer) {
			//	summary:
			//		Busca y prioriza protocolos para consumir la capa procedente del servicio atlas. Intenta utilizar
			//		antes protocolos basados en teselas.
			//	atlasLayer:
			//		Definición de la capa proporcionada por el servicio atlas.
			//	returns:
			//		Configuración de la capa procesada, lista para instanciar.

			var protocols = atlasLayer.protocols,
				definitionsByProtocol = {};

			var layerDefinitions = [];
			for (var i = 0; i < protocols.length; i++) {
				var protocol = protocols[i],
					protocolType = protocol.type,
					definition;

				if (protocolType === 'WMTS' && !definitionsByProtocol.wmts) {
					definition = this._getTiledLayerDefinition(atlasLayer, protocol);
					definitionsByProtocol.wmts = definition;
				} else if (protocolType === 'TMS' && !definitionsByProtocol.tms) {
					definition = this._getTiledLayerDefinition(atlasLayer, protocol, true)
					definitionsByProtocol.tms = definition;
				} else if (protocolType === 'WMS-C' && !definitionsByProtocol.wmsc) {
					definition = this._getWmscLayerDefinition(atlasLayer, protocol);
					definitionsByProtocol.wmsc = definition;
				} else if (protocolType === 'WMS' && !definitionsByProtocol.wms) {
					definition = this._getWmsLayerDefinition(atlasLayer, protocol);
					definitionsByProtocol.wms = definition;
				}

				layerDefinitions.push(definition);
			}

			var layerDefinition;
			if (definitionsByProtocol.wmts) {
				layerDefinition = definitionsByProtocol.wmts;
			} else if (definitionsByProtocol.tms) {
				layerDefinition = definitionsByProtocol.tms;
			} else if (definitionsByProtocol.wmsc) {
				layerDefinition = definitionsByProtocol.wmsc;
			} else if (definitionsByProtocol.wms) {
				layerDefinition = definitionsByProtocol.wms;
			} else {
				console.error('No valid map layer protocol found at:', atlasLayer);
				return;
			}

			layerDefinitions.splice(layerDefinitions.indexOf(layerDefinition), 1);
			layerDefinition.alternativeDefinitions = layerDefinitions;

			return layerDefinition;
		},

		_getTiledLayerDefinition: function(atlasLayer, protocol, /*Boolean?*/ useTms) {

			var layerProps = {
				updateInterval: 100,
				keepBuffer: 4,
				tileSize: 256,
				opacity: 1,
				tms: !!useTms
			};
			lang.mixin(layerProps, this._getCommonLayerProps(atlasLayer, protocol));

			return {
				protocol: !useTms ? 'WMTS' : 'TMS',
				url: this._getLayerUrlValue(protocol),
				props: layerProps
			};
		},

		_getWmscLayerDefinition: function(atlasLayer, protocol) {

			var layerProps = {
				layers: this._getLayersParamValue(atlasLayer, protocol),
				tiled: true
			};
			lang.mixin(layerProps, this._getCommonLayerProps(atlasLayer, protocol));

			return {
				protocol: 'WMS-C',
				url: this._getLayerUrlValue(protocol),
				props: layerProps
			};
		},

		_getWmsLayerDefinition: function(atlasLayer, protocol) {

			var layerProps = {
				layers: this._getLayersParamValue(atlasLayer, protocol)
			};
			lang.mixin(layerProps, this._getCommonLayerProps(atlasLayer, protocol));

			return {
				protocol: 'WMS',
				url: this._getLayerUrlValue(protocol),
				props: layerProps
			};
		},

		_getLayerUrlValue: function(protocol) {

			var url = protocol.url,
				params = protocol.params;

			if (!url) {
				return '';
			}

			if (params) {
				var urlSeparator = this._getUrlSeparator(url);
				return url + urlSeparator + params;
			}

			return url;
		},

		_getUrlSeparator: function(url) {

			if (url.indexOf('?') === -1) {
				return '?';
			}

			var lastChar = url[url.length - 1];
			if (lastChar === '?' || lastChar === '&') {
				return '';
			}

			return '&';
		},

		_getCommonLayerProps: function(atlasLayer, protocol) {

			return {
				format: this._getFormatParamValue(atlasLayer, protocol),
				transparent: true,
				attribution: atlasLayer.attribution
			};
		},

		_getLayersParamValue: function(atlasLayer, protocol) {

			var params = protocol.params;

			if (params) {
				var regex = /layers=([^&]+)&?/ig,
					regexExecResults = regex.exec(params),
					layerInParams = regexExecResults && regexExecResults[1];

				if (layerInParams && layerInParams.length) {
					return layerInParams;
				}
			}

			return atlasLayer.name;
		},

		_getFormatParamValue: function(atlasLayer, protocol) {

			var params = protocol.params,
				availableFormats = atlasLayer.formats,
				format;

			if (params) {
				var regex = /format=([^&]+)&?/ig,
					regexExecResults = regex.exec(params),
					formatInParams = regexExecResults && regexExecResults[1];

				if (formatInParams && formatInParams.length) {
					format = formatInParams;
				}
			}

			if (!format) {
				format = 'image/png';
			}

			if (availableFormats.indexOf(format) !== -1) {
				return format;
			}

			return 'image/jpeg';
		}
	});
});
