define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/Deferred'
	, 'put-selector'
	, 'src/component/base/_ExternalConfig'
	, 'src/component/map/layer/_LayerProtocols'
], function(
	declare
	, lang
	, aspect
	, Deferred
	, put
	, _ExternalConfig
	, _LayerProtocols
) {

	return declare([_LayerProtocols, _ExternalConfig], {
		//	summary:
		//		Permite trabajar con definiciones estáticas de capas para módulo Map.
		//	description:
		//		Centraliza la obtención de instancias de capas estáticas (base y superpuestas).
		//		Obtiene la configuración con la definición de las diferentes capas base y superpuestas, en formato
		// 		compatible con Leaflet.
		//		Para declarar una capa como base, se debe indicar con la propiedad 'basemap: true'. Soporta ordenación
		//		mediante la propiedad 'order' (valores enteros >= 1).
		//		Para declarar una capa como opcional (superpuesta pero cargada automáticamente, permitiendo su
		//		desactivación), se debe indicar con la propiedad 'optional: true'.

		constructor: function(args) {

			this.config = {
				mapLayersPropertyName: 'mapLayers'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setStaticLayersManagementOwnCallbacksForEvents));
		},

		_setStaticLayersManagementOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onStaticLayersManagementGotExternalConfig));
		},

		_onStaticLayersManagementGotExternalConfig: function(evt) {

			this._staticLayersDefinition = evt[this.mapLayersPropertyName];

			if (this._staticLayersDefinitionDfd && !this._staticLayersDefinitionDfd.isFulfilled()) {
				this._staticLayersDefinitionDfd.resolve(this._staticLayersDefinition);
			}
		},

		_getStaticLayersDefinition: function() {

			if (this._staticLayersDefinition) {
				return this._staticLayersDefinition;	// return Object
			}

			if (!this._staticLayersDefinitionDfd || this._staticLayersDefinitionDfd.isFulfilled()) {
				this._staticLayersDefinitionDfd = new Deferred();
			}

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.mapLayersPropertyName
			});

			return this._staticLayersDefinitionDfd;	// return Deferred
		},

		_getStaticLayerDefinition: function(/*String*/ layerId) {

			var staticLayersDefinition = this._getStaticLayersDefinition();

			if (staticLayersDefinition && !staticLayersDefinition.then) {
				return staticLayersDefinition[layerId];	// return Object
			}

			var dfd = new Deferred();

			staticLayersDefinition.then(lang.hitch(this, function(requestedLayerId, definitionDfd) {

				var staticLayersDefinition = this._getStaticLayersDefinition(),
					layerDefinition = staticLayersDefinition[requestedLayerId];

				definitionDfd.resolve(layerDefinition);
			}, layerId, dfd));

			return dfd;	// return Deferred
		},

		_getStaticLayerInstance: function(/*String*/ layerId) {
			//	summary:
			//		Busca una definición de capa y la instancia.
			//	layerId:
			//		Identificador de la capa deseada.
			//	returns:
			//		Instancia creada de la capa deseada.

			var layerDefinition = this._getStaticLayerDefinition(layerId);

			if (layerDefinition && layerDefinition.then) {
				var dfd = new Deferred();

				layerDefinition.then(lang.hitch(this, function(instanceDfd) {

					instanceDfd.resolve(this._getStaticLayerInstance(layerId));
				}, dfd));

				return dfd;	// return Deferred
			}

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
				thumbPath = this._getStaticLayerThumbnailPath(layerId),
				thumbAttr = 'style=background-image:url(' + thumbPath + ')',
				outerContainer = put('div.sharpContainer.layerThumbnailContainer.relativeContainer[' + thumbAttr + ']'),
				innerContainerClass = '.wrapContainer.hardTranslucentContainer.absoluteContainer.thumbCaption';

			put(outerContainer, 'div' + innerContainerClass + '[value=$]', title, title);

			return outerContainer.outerHTML;	// return String
		},

		_getStaticLayerThumbnailPath: function(/*String*/ layerId) {

			var layerDefinition = this._getStaticLayerDefinition(layerId),
				layerThumbnail = layerDefinition && layerDefinition.thumbnail;

			return layerThumbnail || '/res/images/map/layer-' + layerId + '.png';
		},

		_getBaseLayers: function() {
			//	summary:
			//		Busca y devuelve las claves de todas las capas base disponibles, ordenadas.
			//	returns:
			//		Colección de cadenas con el valor de clave de capas base.

			var staticLayersDefinition = this._getStaticLayersDefinition();

			if (staticLayersDefinition && staticLayersDefinition.then) {
				var dfd = new Deferred();

				staticLayersDefinition.then(lang.hitch(this, function(layersDefinitionDfd) {

					layersDefinitionDfd.resolve(this._getBaseLayers());
				}, dfd));

				return dfd;	// return Deferred
			}

			var layersArray = Object.entries(staticLayersDefinition);

			var baseLayersArray = layersArray.filter(function(layerArray) {

				return layerArray[1].basemap;
			});

			return baseLayersArray.sort(function(layerArrayA, layerArrayB) {

				var layerA = layerArrayA[1],
					layerB = layerArrayB[1],
					orderA = layerA.order || 0,
					orderB = layerB.order || 0;

				if (orderA === orderB) {
					return 0;
				}

				if (!orderA || orderA > orderB) {
					return 1;
				}

				if (!orderB || orderA < orderB) {
					return -1;
				}
			}).map(function(item) { return item[0]; });	// return Array
		},

		_getOptionalLayers: function() {
			//	summary:
			//		Busca y devuelve las claves de todas las capas opcionales disponibles.
			//	returns:
			//		Colección de cadenas con el valor de clave de capas opcionales.

			var staticLayersDefinition = this._getStaticLayersDefinition();

			if (staticLayersDefinition && staticLayersDefinition.then) {
				var dfd = new Deferred();

				staticLayersDefinition.then(lang.hitch(this, function(layersDefinitionDfd) {

					layersDefinitionDfd.resolve(this._getOptionalLayers());
				}, dfd));

				return dfd;	// return Deferred
			}

			var layersArray = Object.entries(staticLayersDefinition);

			return layersArray.filter(function(layerArray) {

				return layerArray[1].optional;
			}).map(function(item) { return item[0]; });	// return Array
		}
	});
});
