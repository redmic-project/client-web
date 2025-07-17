define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/design/_DesignLayout'
], function(
	declare
	, lang
	, put
	, _DesignLayout
) {

	return declare(_DesignLayout, {
		// summary:
		//   Estructura de diseño para mostrar un componente adicional junto a un mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		constructor: function(args) {

			const defaultConfig = {
				layoutClasses: 'designLayoutContainer.mapAndContentLayoutMapWithSideContentDesign',
				mapNodeClasses: 'mediumSolidContainer.mapContainer.borderRadius',
				additionalContentNodeClasses: 'mediumSolidContainer.mapSideContainer.borderRadius'
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
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
