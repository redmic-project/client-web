define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
], function(
	declare
	, _Module
	, _Show
	, _AddAtlasComponent
	, _AddQueryOnMapComponent
	, _MapDesignWithContentLayout
	, redmicConfig
) {

	return declare([_Module, _Show, _MapDesignWithContentLayout, _AddAtlasComponent, _AddQueryOnMapComponent], {
		// summary:
		//   Vista de visor atlas. Proporciona un mapa principal y un contenido secundario (componente Atlas) para
		//   trabajar sobre el mapa.
		// description:
		//   Permite cargar diferentes capas temáticas al mapa, manipularlas y trabajar con los datos que proveen.

		postMixInProperties: function() {

			const defaultConfig = {
				title: this.i18n.atlasViewerView,
				ownChannel: 'atlasViewer',
				selectionTarget: redmicConfig.services.atlasLayerSelection
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		}
	});
});
