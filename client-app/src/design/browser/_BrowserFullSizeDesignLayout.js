define([
	'dojo/_base/declare'
	, 'put-selector'
	, 'src/design/_DesignLayout'
	, 'src/design/browser/_BrowserDesignController'
], function(
	declare
	, put
	, _DesignLayout
	, _BrowserDesignController
) {

	const defaultConfig = {
		layoutClasses: 'designLayoutContainer.layoutListDesign',
		centerNodeClasses: 'centerZone',
		browserNodeClasses: 'listZone.noBorderList'
	};

	return declare([_BrowserDesignController, _DesignLayout], {
		// summary:
		//   Estructura de diseño para mostrar un listado a tamaño completo.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const center = put(this.domNode, `div.${this.centerNodeClasses}`),
				browser = put(center, `div.${this.browserNodeClasses}`);

			return {center, browser};
		},

		populateDesignLayoutNodes: function() {

			const browserPropName = 'browser',
				browserInstance = this.getComponentInstance(browserPropName),
				browserNode = this.getLayoutNode(browserPropName);

			this._publish(browserInstance?.getChannel('SHOW'), {
				node: browserNode
			});
		}
	});
});
