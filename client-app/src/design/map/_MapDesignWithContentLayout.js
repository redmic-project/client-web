define([
	'dojo/_base/declare'
	, 'put-selector'
	, 'src/design/_DesignLayout'
	, 'src/design/map/_MapDesignController'
], function(
	declare
	, put
	, _DesignLayout
	, _MapDesignController
) {

	return declare([_MapDesignController, _DesignLayout], {
		// summary:
		//   Estructura de diseño para mostrar un componente adicional junto a un mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const defaultConfig = {
				layoutClasses: 'designLayoutContainer.mapAndContentLayoutMapWithSideContentDesign',
				mapNodeClasses: 'mediumSolidContainer.mapContainer.borderRadius',
				additionalContentNodeClasses: 'mediumSolidContainer.mapSideContainer.borderRadius'
			};

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const map = put(this.domNode, `div.${this.mapNodeClasses}`),
				additionalContent = put(this.domNode, `div.${this.additionalContentNodeClasses}`);

			return {map, additionalContent};
		},

		populateDesignLayoutNodes: function() {

			const mapPropName = 'map',
				mapInstance = this.getComponentInstance(mapPropName),
				mapNode = this.getLayoutNode(mapPropName);

			this._publish(mapInstance?.getChannel('SHOW'), {
				node: mapNode
			});
		}
	});
});
