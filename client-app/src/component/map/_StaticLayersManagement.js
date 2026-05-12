define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'put-selector'
	, 'src/component/map/layer/_LayerProtocols'
], function(
	declare
	, Deferred
	, put
	, _LayerProtocols
) {

	return declare(_LayerProtocols, {
		// summary:
		//   Permite trabajar con definiciones estáticas de capas.
		// description:
		//   Centraliza la obtención de instancias de capas estáticas (base y superpuestas).
		//   Obtiene la configuración con la definición de las diferentes capas base y superpuestas, en formato
		//   compatible con Leaflet.
		//   Para declarar una capa como base, se debe indicar con la propiedad 'basemap: true'. Soporta ordenación
		//   mediante la propiedad 'order' (valores enteros >= 1).
		//   Para declarar una capa como opcional (superpuesta pero cargada automáticamente, permitiendo su
		//   desactivación), se debe indicar con la propiedad 'optional: true'.

		postMixInProperties: function() {

			const defaultConfig = {
				mapLayersPropertyName: 'mapLayers'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('GOT_EXTERNAL_CONFIG', evt => this._onStaticLayersManagementGotExternalConfig(evt));
		},

		_onStaticLayersManagementGotExternalConfig: function(evt) {

			this._staticLayersDefinition = evt[this.mapLayersPropertyName];

			if (!this._staticLayersDefinitionDfd?.isFulfilled()) {
				this._staticLayersDefinitionDfd?.resolve(this._staticLayersDefinition);
			}
		},

		_getStaticLayersDefinition: function() {

			if (this._staticLayersDefinition) {
				return this._staticLayersDefinition; // return Object
			}

			if (!this._staticLayersDefinitionDfd) {
				this._staticLayersDefinitionDfd = new Deferred();
			}

			if (!this._staticLayersDefinitionDfd.isFulfilled()) {
				this._emitEvt('GET_EXTERNAL_CONFIG', {
					propertyName: this.mapLayersPropertyName
				});
			}

			return this._staticLayersDefinitionDfd; // return Deferred
		},

		_getStaticLayerDefinition: function(/*String*/ layerId) {

			const staticLayersDefinition = this._getStaticLayersDefinition();

			if (!staticLayersDefinition?.then) {
				return staticLayersDefinition?.[layerId]; // return Object
			}

			const dfd = new Deferred();

			staticLayersDefinition.then(() => {

				const staticLayersDefinition = this._getStaticLayersDefinition(),
					layerDefinition = staticLayersDefinition[layerId];

				dfd.resolve(layerDefinition);
			});

			return dfd; // return Deferred
		},

		_getStaticLayerInstance: function(/*String*/ layerId) {
			// summary:
			//   Busca una definición de capa y la instancia.
			// layerId:
			//   Identificador de la capa deseada.
			// returns:
			//   Instancia creada de la capa deseada.

			const layerDefinition = this._getStaticLayerDefinition(layerId);

			if (layerDefinition?.then) {
				const instanceDfd = new Deferred();

				layerDefinition.then(() => {

					instanceDfd.resolve(this._getStaticLayerInstance(layerId));
				});

				return instanceDfd; // return Deferred
			}

			if (!layerDefinition) {
				console.error('Layer definition not found for ID: "%s"', layerId);
				return; // return undefined
			}

			if (!layerDefinition.props) {
				layerDefinition.props = {};
			}

			if (!layerDefinition.props.id) {
				layerDefinition.props.id = layerId;
			}

			return this._getLayerInstance(layerDefinition); // return Object
		},

		_getStaticLayerLabel: function(/*String*/ layerId) {
			// summary:
			//   Genera el código HTML correspondiente a la etiqueta de la capa base, para representarla en el
			//   selector del mapa.
			// layerId:
			//   Identificador de la capa.
			// returns:
			//   Código HTML de la etiqueta de la capa.

			const outerContainerClass = 'sharpContainer.layerThumbnailContainer.relativeContainer',
				thumbPath = this._getStaticLayerThumbnailPath(layerId),
				thumbAttr = `style=background-image:url(${thumbPath})`;

			const outerContainer = put(`div.${outerContainerClass}[${thumbAttr}]`);

			const innerContainerClass = 'wrapContainer.hardTranslucentContainer.absoluteContainer.thumbCaption',
				title = this.i18n[layerId] ?? layerId;

			put(outerContainer, `div.${innerContainerClass}[value=$]`, title, title);

			return outerContainer.outerHTML; // return String
		},

		_getStaticLayerThumbnailPath: function(/*String*/ layerId) {

			const layerDefinition = this._getStaticLayerDefinition(layerId),
				layerThumbnail = layerDefinition?.thumbnail;

			return layerThumbnail ?? `/res/images/map/layer-${layerId}.png`;
		},

		_getBaseLayers: function() {
			// summary:
			//   Busca y devuelve las claves de todas las capas base disponibles, ordenadas.
			// returns:
			//   Colección de cadenas con el valor de clave de capas base.

			const staticLayersDefinition = this._getStaticLayersDefinition();

			if (!staticLayersDefinition) {
				return; // return undefined
			}

			if (!staticLayersDefinition.then) {
				return this._getBaseLayersArray(staticLayersDefinition); // return Array
			}

			if (this._baseLayersDfd) {
				return this._baseLayersDfd; // return Deferred
			}

			this._baseLayersDfd = new Deferred();

			staticLayersDefinition.then(() => this._baseLayersDfd.resolve(this._getBaseLayers()));

			return this._baseLayersDfd; // return Deferred
		},

		_getBaseLayersArray: function(/*Object*/ staticLayersDefinition) {

			const layersArray = Object.entries(staticLayersDefinition);

			const baseLayersArray = layersArray.filter(layerArray => layerArray[1].basemap);

			const orderedBaseLayersArray = baseLayersArray.sort((layerArrayA, layerArrayB) => {

				const layerA = layerArrayA[1],
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
			});

			return orderedBaseLayersArray.map(item => item[0]); // return Array
		},

		_getOptionalLayers: function() {
			// summary:
			//   Busca y devuelve las claves de todas las capas opcionales disponibles.
			// returns:
			//   Colección de cadenas con el valor de clave de capas opcionales.

			const staticLayersDefinition = this._getStaticLayersDefinition();

			if (!staticLayersDefinition) {
				return; // return undefined
			}

			if (!staticLayersDefinition.then) {
				return this._getOptionalLayersArray(staticLayersDefinition); // return Array
			}

			if (this._optionalLayersDfd) {
				return this._optionalLayersDfd; // return Deferred
			}

			this._optionalLayersDfd = new Deferred();

			staticLayersDefinition.then(() => this._optionalLayersDfd.resolve(this._getOptionalLayers()));

			return this._optionalLayersDfd; // return Deferred
		},

		_getOptionalLayersArray: function(/*Object*/ staticLayersDefinition) {

			const layersArray = Object.entries(staticLayersDefinition),
				optionalLayersArray = layersArray.filter(layerArray => layerArray[1].optional);

			return optionalLayersArray.map(item => item[0]); // return Array
		}
	});
});
