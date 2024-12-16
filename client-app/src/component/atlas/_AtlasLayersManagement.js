define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/map/layer/_PublishInfo'
	, 'src/component/map/layer/WmsLayerImpl'
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
				themeSeparator: '-',
				_layerInstances: {}, // capas de las que hemos creado instancia (no se borran, se reciclan)
				defaultLayerItemState: true
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
				updateInterval: 200,
				keepBuffer: 2,
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

		_getMapLayerComponentDefinition: function() {

			return declare([WmsLayerImpl, _PublishInfo]);
		},

		_getMapLayerComponentConfiguration: function(atlasItem) {

			var layerId = this._createLayerId(atlasItem),
				layerLabel = this._createLayerLabel(atlasItem),
				innerLayerDefinition = this._getLayerDefinitionByProtocol(atlasItem);

			return {
				parentChannel: this.getChannel(),
				mapChannel: this.getMapChannel ? this.getMapChannel() : null,
				innerLayerDefinition: innerLayerDefinition,
				layerId: layerId,
				layerLabel: layerLabel,
				queryable: atlasItem.queryable,
				refresh: atlasItem.refresh,
				dimensions: this._getAtlasLayerDimensions(atlasItem)
			};
		},

		_getAtlasLayerItemToInject: function(atlasItem) {

			var itemId = this._getAtlasItemId(atlasItem),
				mapLayerDefinition = this._getMapLayerComponentDefinition(),
				mapLayerConfig = this._getMapLayerComponentConfiguration(atlasItem);

			return {
				id: itemId,
				label: mapLayerConfig.layerLabel,
				state: this.defaultLayerItemState,
				mapLayerId: mapLayerConfig.layerId,
				mapLayerDefinition: mapLayerDefinition,
				mapLayerConfig: mapLayerConfig,
				atlasItem: atlasItem
			};
		},

		_getAtlasItemId: function(atlasItem) {

			return atlasItem && atlasItem.id;
		},

		_createLayerId: function(layerItem) {

			var themeInspire = layerItem.themeInspire ? layerItem.themeInspire.code : 'default';

			return themeInspire + this.themeSeparator + layerItem.name + this.layerIdSeparator + layerItem.id;
		},

		_createLayerLabel: function(layerItem) {

			return layerItem.alias || layerItem.title;
		},

		_removeLayerInstance: function(layerId) {

			this._emitEvt('REMOVE_LAYER', {
				layer: layerId
			});

			this._removeSubsAndPubsForLayer(this._layerInstances[layerId]);

			delete this._layerInstances[layerId];
		},

		_createSubsAndPubsForLayer: function(layerInstance) {

			this._createLegendSubsAndPubsForLayer(layerInstance);
		},

		_removeSubsAndPubsForLayer: function(layerInstance) {

			this._removeLegendSubsAndPubsForLayer(layerInstance);

			this._publish(layerInstance.getChannel('DISCONNECT'));
		},

		_getAtlasMapLayerInstance: function(atlasLayerItem) {

			var mapLayerId = atlasLayerItem.mapLayerId,
				layerInstance = this._layerInstances[mapLayerId];

			if (layerInstance) {
				return layerInstance;
			}

			return this._createAtlasMapLayerInstance(atlasLayerItem);
		},

		_createAtlasMapLayerInstance: function(atlasLayerItem) {

			var MapLayerDefinition = atlasLayerItem.mapLayerDefinition,
				mapLayerConfig = atlasLayerItem.mapLayerConfig,
				mapLayerId = atlasLayerItem.mapLayerId;

			var mapLayerInstance = new MapLayerDefinition(mapLayerConfig);

			this._layerInstances[mapLayerId] = mapLayerInstance;

			this._createSubsAndPubsForLayer(mapLayerInstance);

			return mapLayerInstance;
		},

		_activateLayer: function(/*Object*/ atlasLayerItem, order) {

			if (!atlasLayerItem) {
				return;
			}

			var mapLayerId = atlasLayerItem.mapLayerId,
				layer = this._getAtlasMapLayerInstance(atlasLayerItem);

			this._emitEvt('ADD_LAYER', {
				layer: layer,
				layerId: mapLayerId,
				layerLabel: atlasLayerItem.label,
				atlasItem: atlasLayerItem.atlasItem,
				order: order
			});

			this._publish(this._themesBrowser.getChildChannel('browser', 'UPDATE_DRAGGABLE_ITEM_ORDER'), {
				id: atlasLayerItem.id,
				index: 0
			});

			this._publish(this._themesBrowser.getChildChannel('browser', 'ENABLE_DRAG_AND_DROP'), {
				id: atlasLayerItem.id
			});
		},

		_deactivateLayer: function(/*Object*/ atlasLayerItem, order) {

			if (!atlasLayerItem) {
				return;
			}

			var mapLayerId = atlasLayerItem.mapLayerId,
				layer = this._layerInstances[mapLayerId];

			if (layer) {
				this._emitEvt('REMOVE_LAYER', {
					layer: layer,
					order: order,
					keepInstance: true
				});
			}

			this._publish(this._themesBrowser.getChildChannel('browser', 'DISABLE_DRAG_AND_DROP'), {
				id: atlasLayerItem.id
			});
		}
	});
});
