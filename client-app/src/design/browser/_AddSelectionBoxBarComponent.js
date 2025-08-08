define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/SelectionBox'
], function (
	declare
	, lang
	, SelectionBoxBar
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de barra SelectionBox a Browser, para ampliar su funcionalidad.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget(),
				queryChannel = this.browserConfig.queryChannel,
				selectorChannel = this.selectorChannel,
				selectionTarget = this.selectionTarget;

			this.mergeComponentAttribute('selectionBoxBarConfig', {
				parentChannel, target, queryChannel, selectorChannel, selectionTarget
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const selectionBoxBar = this._createDesignSelectionBoxBarComponent(inheritedComponents.browser);

			return lang.mixin(inheritedComponents, {selectionBoxBar});
		},

		_createDesignSelectionBoxBarComponent: function(browserInstance) {

			const browserChannel = browserInstance.getChannel();

			this.mergeComponentAttribute('selectionBoxBarConfig', {
				browserChannel
			});

			return new SelectionBoxBar(this.selectionBoxBarConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addSelectionBoxBarToBrowser();
		},

		_addSelectionBoxBarToBrowser: function() {

			const browserInstance = this.getComponentInstance('browser'),
				instance = this.getComponentInstance('selectionBoxBar');

			this._publish(browserInstance.getChannel('ADD_TOOLBAR_IN_FRAMEWORK'), {instance});
		},

		_onTargetPropSet: function(evt) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('selectionBoxBar'),
				target = evt.value;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
