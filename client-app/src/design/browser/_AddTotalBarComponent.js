define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/Total'
], function (
	declare
	, lang
	, TotalBar
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de barra Total a Browser, para ampliar su funcionalidad.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget();

			this.mergeComponentAttribute('totalBarConfig', {
				parentChannel, target
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const totalBar = this._createDesignTotalBarComponent(inheritedComponents.browser);

			return lang.mixin(inheritedComponents, {totalBar});
		},

		_createDesignTotalBarComponent: function(browserInstance) {

			const browserChannel = browserInstance.getChannel();

			this.mergeComponentAttribute('totalBarConfig', {
				browserChannel
			});

			return new TotalBar(this.totalBarConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addTotalBarToBrowser();
		},

		_addTotalBarToBrowser: function() {

			const browserInstance = this.getComponentInstance('browser'),
				instance = this.getComponentInstance('totalBar');

			this._publish(browserInstance.getChannel('ADD_TOOLBAR_IN_FRAMEWORK'), {instance});
		},

		_onTargetPropSet: function(changeObj) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('totalBar'),
				target = changeObj.newValue;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
