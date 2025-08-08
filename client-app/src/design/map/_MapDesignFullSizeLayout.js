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

	const defaultConfig = {
		layoutClasses: 'designLayoutContainer.mapDesignFullSizeLayout',
		mapNodeClasses: 'mediumSolidContainer.mapContainer.borderRadius'
	};

	return declare([_MapDesignController, _DesignLayout], {
		// summary:
		//   Estructura de diseño para mostrar un mapa a tamaño completo.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const map = put(this.domNode, `div.${this.mapNodeClasses}`);

			return {map};
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
