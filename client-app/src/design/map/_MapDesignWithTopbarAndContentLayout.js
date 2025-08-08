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
		layoutClasses: 'designLayoutContainer.mapAndContentAndTopbarLayoutMapWithSideContentDesign',
		topbarNodeClasses: 'mediumSolidContainer.rounded',
		centerNodeClasses: 'mapCenterContainer',
		mapNodeClasses: 'mediumSolidContainer.mapContainer.borderRadius',
		additionalContentNodeClasses: 'mediumSolidContainer.mapSideContainer.borderRadius'
	};

	return declare([_MapDesignController, _DesignLayout], {
		// summary:
		//   Estructura de diseño para mostrar una barra superior y un componente adicional junto a un mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const topbar = put(this.domNode, `div.${this.topbarNodeClasses}`),
				center = put(this.domNode, `div.${this.centerNodeClasses}`),
				map = put(center, `div.${this.mapNodeClasses}`),
				additionalContent = put(center, `div.${this.additionalContentNodeClasses}`);

			return {topbar, center, map, additionalContent};
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
