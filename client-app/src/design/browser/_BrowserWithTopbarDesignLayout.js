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
		topNodeClasses: 'topZone',
		titleNodeClasses: 'titleZone',
		titleSpanNodeClasses: 'designLayoutTitle',
		keypadNodeClasses: 'keypadZone',
		centerNodeClasses: 'centerZone',
		browserNodeClasses: 'listZone.noBorderList',
		browserDesignTitle: 'list'
	};

	return declare([_BrowserDesignController, _DesignLayout], {
		// summary:
		//   Estructura de diseño para mostrar un listado junto con una barra superior, para título y otros.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		createDesignLayoutNodes: function() {

			const top = put(this.domNode, `div.${this.topNodeClasses}`),
				center = put(this.domNode, `div.${this.centerNodeClasses}`);

			const title = put(top, `div.${this.titleNodeClasses}`),
				titleSpan = put(title, `span.${this.titleSpanNodeClasses}`),
				keypad = put(top, `div.${this.keypadNodeClasses}`),
				browser = put(center, `div.${this.browserNodeClasses}`);

			return {top, center, title, titleSpan, keypad, browser};
		},

		_setBrowserDesignTitle: function(titleValue) {

			const titleSpanNode = this.getLayoutNode('titleSpan'),
				innerHTML = titleValue;

			titleSpanNode && put(titleSpanNode, '[title=$]', titleValue, {innerHTML});
		},

		populateDesignLayoutNodes: function() {

			const browserPropName = 'browser',
				browserInstance = this.getComponentInstance(browserPropName),
				browserNode = this.getLayoutNode(browserPropName);

			this._setBrowserDesignTitle(this.title);

			this._publish(browserInstance?.getChannel('SHOW'), {
				node: browserNode
			});
		}
	});
});
