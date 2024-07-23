define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'src/component/map/layer/_LayerProtocols'
	, './StaticLayersDefinition'
], function(
	declare
	, lang
	, put
	, _LayerProtocols
	, StaticLayersDefinition
) {

	return declare(_LayerProtocols, {
		//	summary:
		//		Permite trabajar con definiciones estáticas de capas para módulo Map.
		//	description:
		//		Centraliza la obtención de instancias de capas estáticas (base y superpuestas).

		_getStaticLayerInstance: function(/*String*/ layerId) {
			//	summary:
			//		Busca una definición de capa y la instancia.
			//	layerId:
			//		Identificador de la capa deseada.
			//	returns:
			//		Instancia creada de la capa deseada.

			var layerDefinition = StaticLayersDefinition[layerId];

			if (!layerDefinition) {
				console.error('Layer definition not found for ID: "%s"', layerId);
				return;	// return undefined
			}

			if (!layerDefinition.props) {
				layerDefinition.props = {};
			}

			if (!layerDefinition.props.id) {
				layerDefinition.props.id = layerId;
			}

			return this._getLayerInstance(layerDefinition);	// return Object
		},

		_getStaticLayerLabel: function(/*String*/ layerId) {
			//	summary:
			//		Genera el código HTML correspondiente a la etiqueta de la capa base, para representarla en el
			//		selector del mapa.
			//	layerId:
			//		Identificador de la capa.
			//	returns:
			//		Código HTML de la etiqueta de la capa.

			var title = this.i18n[layerId] || layerId,
				thumbPath = '/resources/images/map/layer-' + layerId + '.png',
				thumbAttr = 'style=background-image:url(' + thumbPath + ')',
				outerContainer = put('div.sharpContainer.layerThumbnailContainer.relativeContainer[' + thumbAttr + ']'),
				innerContainerClass = '.wrapContainer.hardTranslucentContainer.absoluteContainer.thumbCaption';

			put(outerContainer, 'div' + innerContainerClass + '[value=$]', title, title);

			return outerContainer.outerHTML;	// return String
		},

		_getBaseLayers: function() {
			//	summary:
			//		Busca y devuelve las claves de todas las capas base disponibles, ordenadas.
			//	returns:
			//		Colección de cadenas con el valor de clave de capas base.

			var availableLayerKeys = Object.keys(StaticLayersDefinition);

			var availableBaseLayerKeys = availableLayerKeys.filter(lang.hitch(this, function(baseLayers, layerKey) {

				return baseLayers[layerKey].basemap;
			}, StaticLayersDefinition));

			return availableBaseLayerKeys.sort(lang.hitch(this, function(baseLayers, a, b) {

				var layerA = baseLayers[a],
					layerB = baseLayers[b];

				if (!layerA.order && !layerB.order) {
					return 0;
				}

				if (!layerA.order || layerA.order > layerB.order) {
					return 1;
				}

				if (!layerB.order || layerA.order <= layerB.order) {
					return -1;
				}
			}, StaticLayersDefinition));	// return Array
		},

		_getOptionalLayers: function() {
			//	summary:
			//		Busca y devuelve las claves de todas las capas opcionales disponibles.
			//	returns:
			//		Colección de cadenas con el valor de clave de capas opcionales.

			var availableLayerKeys = Object.keys(StaticLayersDefinition);

			return availableLayerKeys.filter(lang.hitch(this, function(optionalLayers, layerKey) {

				return optionalLayers[layerKey].optional;
			}, StaticLayersDefinition));	// return Array
		}
	});
});
