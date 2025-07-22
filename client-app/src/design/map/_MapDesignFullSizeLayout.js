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
		//   Estructura de diseño para mostrar un mapa a tamaño completo.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		constructor: function(args) {

			const defaultConfig = {
				layoutClasses: 'designLayoutContainer.mapDesignFullSizeLayout',
				mapNodeClasses: 'mediumSolidContainer.mapContainer.borderRadius'
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
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
