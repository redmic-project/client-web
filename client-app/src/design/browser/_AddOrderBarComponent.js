define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/Order'
], function (
	declare
	, lang
	, OrderBar
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de barra Order a Browser, para ampliar su funcionalidad.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this.target;

			this.mergeComponentAttribute('orderBarConfig', {
				parentChannel, target
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const orderBar = this._createDesignOrderBarComponent(inheritedComponents.browser);

			return lang.mixin(inheritedComponents, {orderBar});
		},

		_createDesignOrderBarComponent: function(browserInstance) {

			const browserChannel = browserInstance.getChannel();

			this.mergeComponentAttribute('orderBarConfig', {
				browserChannel
			});

			return new OrderBar(this.orderBarConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addOrderBarToBrowser();
		},

		_addOrderBarToBrowser: function() {

			const browserInstance = this.getComponentInstance('browser'),
				instance = this.getComponentInstance('orderBar');

			this._publish(browserInstance.getChannel('ADD_TOOLBAR_IN_FRAMEWORK'), {instance});
		},

		_onTargetPropSet: function(changeObj) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('orderBar'),
				target = changeObj.newValue;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
