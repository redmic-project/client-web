define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/map/layer/_PublishInfo'
	, 'redmic/modules/map/layer/WmsLayerImpl'
], function(
	declare
	, lang
	, _PublishInfo
	, WmsLayerImpl
) {

	return declare(null, {
		//	summary:
		//		Permite interpretar las configuraciones de capas procedentes del servicio atlas, para generar
		//		configuraciones de capa que puedan mostrarse en el mapa.

		constructor: function(args) {

			this.config = {
				layerIdSeparator: '_',
				themeSeparator: '-'
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
					definition = this._getTiledLayerDefinition(atlasLayer, protocol, true);
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
				tiled: true
			};
			lang.mixin(layerProps, this._getWmsOrWmscLayerProps(atlasLayer, protocol));
			lang.mixin(layerProps, this._getCommonLayerProps(atlasLayer, protocol));

			return {
				protocol: 'WMS-C',
				url: this._getLayerUrlValue(protocol),
				props: layerProps
			};
		},

		_getWmsLayerDefinition: function(atlasLayer, protocol) {

			var layerProps = {};
			lang.mixin(layerProps, this._getWmsOrWmscLayerProps(atlasLayer, protocol));
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

		_getWmsOrWmscLayerProps: function(atlasLayer, protocol) {

			var layerProps = {
				layers: this._getLayersParamValue(atlasLayer, protocol)
			};

			var styles = this._getStylesParamValue(atlasLayer);
			if (styles) {
				layerProps.styles = styles;
			}

			return layerProps;
		},

		_getLayersParamValue: function(atlasLayer, protocol) {

			var params = protocol.params || protocol.url;

			if (params) {
				var regex = /layers?=([^&]+)&?/ig,
					regexExecResults = regex.exec(params),
					layerInParams = regexExecResults && regexExecResults[1];

				if (layerInParams && layerInParams.length) {
					return layerInParams;
				}
			}

			return atlasLayer.name;
		},

		_getStylesParamValue: function(atlasLayer) {

			return atlasLayer.styles;
		},

		_getCommonLayerProps: function(atlasLayer, protocol) {

			return {
				format: this._getFormatParamValue(atlasLayer, protocol),
				transparent: true,
				attribution: this._getLayerAttributionValue(atlasLayer)
			};
		},

		_getFormatParamValue: function(atlasLayer, protocol) {

			var params = protocol.params || protocol.url,
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
		},

		_getLayerAttributionValue: function(atlasLayer) {

			var attribution = atlasLayer.attribution;

			if (typeof attribution === 'string') {
				return attribution;
			} else if (attribution && typeof attribution === 'object') {
				var href = attribution.onlineResource,
					text = attribution.title;

				if (!text) {
					return;
				}

				if (!href) {
					return text;
				}

				return '<a href="' + href + '" target="_blank" title="' + href + '">' + text + '</a>';
			}
		},

		_getAtlasLayerDefinition: function() {

			return declare([WmsLayerImpl, _PublishInfo]);
		},

		_getAtlasLayerConfiguration: function(layerItem) {

			var layerId = this._createLayerId(layerItem),
				layerLabel = this._createLayerLabel(layerItem),
				layerDefinition = this._getLayerDefinitionByProtocol(layerItem);

			return {
				parentChannel: this.getChannel(),
				layerDefinition: layerDefinition,
				layerId: layerId,
				layerLabel: layerLabel,
				queryable: layerItem.queryable,
				refresh: layerItem.refresh
			};
		},

		_getAtlasLayerId: function(layerItem) {

			return layerItem && layerItem.id;
		},

		_createLayerId: function(layerItem) {

			var themeInspire = layerItem.themeInspire ? layerItem.themeInspire.code : 'default';

			return themeInspire + this.themeSeparator + layerItem.name + this.layerIdSeparator + layerItem.id;
		},

		_createLayerLabel: function(layerItem) {

			return layerItem.alias || layerItem.title;
		}
	});
});
