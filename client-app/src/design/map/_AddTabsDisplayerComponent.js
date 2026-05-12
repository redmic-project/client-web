define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/layout/TabsDisplayer'
], function(
	declare
	, lang
	, TabsDisplayer
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir un componente TabsContainer, para mostrar contenidos junto al mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('tabsDisplayerConfig', {
				parentChannel
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const tabsDisplayer = this._createDesignTabDisplayerComponent();

			return lang.mixin(inheritedComponents, {tabsDisplayer});
		},

		_createDesignTabDisplayerComponent: function() {

			return new TabsDisplayer(this.tabsDisplayerConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const tabsDisplayerInstance = this.getComponentInstance('tabsDisplayer'),
				additionalContentNode = this.getLayoutNode('additionalContent');

			this._publish(tabsDisplayerInstance.getChannel('SHOW'), {
				node: additionalContentNode
			});
		}
	});
});
