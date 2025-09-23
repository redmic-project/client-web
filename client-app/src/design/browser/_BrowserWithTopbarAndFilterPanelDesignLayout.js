define([
	'dojo/_base/declare'
	, 'put-selector'
	, 'src/design/_DesignLayout'
	, 'src/design/browser/_BrowserWithTopbarDesignLayout'
], function(
	declare
	, put
	, _DesignLayout
	, _BrowserWithTopbarDesignLayout
) {

	return declare(_BrowserWithTopbarDesignLayout, {
		// summary:
		//   Estructura de diseño para mostrar un listado con barra superior y panel lateral de filtrado.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const defaultConfig = {
				layoutClasses: 'designLayoutContainer.layoutTextSearchFacetsListDesign',
				facetNodeClasses: 'facetsZone'
			};

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const inheritedNodes = this.inherited(arguments) || {},
				centerNode = inheritedNodes.center,
				browserNode = inheritedNodes.browser;

			const facet = put(centerNode, `div.${this.facetNodeClasses}`);

			put(browserNode, '-', facet);

			return this._merge([inheritedNodes, {facet}]);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const facetPropName = 'facet',
				facetInstance = this.getComponentInstance(facetPropName),
				facetNode = this.getLayoutNode(facetPropName);

			this._publish(facetInstance?.getChannel('SHOW'), {
				node: facetNode
			});
		}
	});
});
