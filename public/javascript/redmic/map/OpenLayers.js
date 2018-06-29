define([
	"dojo/_base/declare"
	, "dojo/i18n!./nls/OpenLayers"
	, 'leaflet/leaflet'
	, 'leaflet-wms/leaflet.wms'
	, "put-selector/put"
	, "redmic/map/OpenBaseLayers"
	, "redmic/map/SingleTile"
], function(
	declare
	, i18n
	, L
	, leafletWms
	, put
	, OpenBaseLayers
	, SingleTile
){

	var mapping = {
		"wmts": L.tileLayer.wms
		, "wms": leafletWms.overlay
		, "tileLayer": L.tileLayer
		, "singleTile": SingleTile
	};

	var obj = declare(null, {
		//	summary:
		//		Generador de capas para los mapas de Leaflet.
		//	description:
		//		Proporciona métodos para obtener las capas y poderlas añadir al mapa.


		get: function(/*String*/ layerId) {
			//	summary:
			//		Crea la instancia una capa concreta.
			//	layerId:
			//		ID de la capa que deseamos.
			//	returns:
			//		Devuelve la instancia de la capa deseada.

			var layerDefinition,
				retObj = {};

			if (this._isBaseLayer(layerId)) {
				layerDefinition = OpenBaseLayers[layerId];
				retObj.label = this._createLabel(layerId);
			} else {
				return;
			}

			var newType = mapping[layerDefinition.type];

			retObj.instance = new newType(layerDefinition.url, layerDefinition.props);

			return retObj;	// return Object
		},

		build: function(/*Object*/ defObj) {
			//	summary:
			//		Construye un tipo de capa a petición.
			//	defObj:
			//		JSON con los datos necesarios para construir la capa.
			//	returns:
			//		Devuelve la instancia de la capa creada.

			var newType = mapping[defObj.type];

			if (!newType)
				return;

			return new newType(defObj.url, defObj.props);	// return Object
		},

		getAllBaseLayers: function() {
			//	summary:
			//		Instancia todas las capas base existentes.
			//	returns:
			//		Devuelve un objeto con todas las instancias creadas.

			var obj = {};

			for (var key in OpenBaseLayers) {
				obj[key] = this.get(key);
			}

			return obj;	// return Object
		},

		_isBaseLayer: function(/*String*/ layerId) {
			//	summary:
			//		Comprueba si el identificador de la capa corresponde con el de alguna capa base.
			//	tags:
			//		private
			//	layerId:
			//		Identificador de la capa.
			//	returns:
			//		Devuelve si existe dicha capa base o no.

			if (layerId && layerId.length && OpenBaseLayers.hasOwnProperty(layerId))
				return true;	// return Boolean

			return false;	// return Boolean
		},

		_createLabel: function(/*String*/ layerId) {
			//	summary:
			//		Genera el HTML necesario para representar a la capa en el selector.
			//	tags:
			//		private
			//	layerId:
			//		Identificador de la capa.
			//	returns:
			//		Devuelve el HTML que representa a la etiqueta de la capa.

			var title = i18n[layerId] || layerId,
				thumbPath = "/resources/images/map/layer-" + layerId + ".png",
				thumbAttr = "style=background-image:url(" + thumbPath + ")",
				container = put("div.sharpContainer.layerThumbnailContainer.relativeContainer[" + thumbAttr + "]"),
				classContainer = ".wrapContainer.hardTranslucentContainer.absoluteContainer.thumbCaption";

			put(container, "div" + classContainer + "[value=$]", title, title);

			return container.outerHTML;	// return String
		}
	});

	return new obj();
});
