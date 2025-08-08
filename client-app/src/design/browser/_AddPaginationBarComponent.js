define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/Pagination'
], function (
	declare
	, lang
	, PaginationBar
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de barra Pagination a Browser, para ampliar su funcionalidad.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget(),
				queryChannel = this.browserConfig.queryChannel;

			this.mergeComponentAttribute('paginationBarConfig', {
				parentChannel, target, queryChannel
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const paginationBar = this._createDesignPaginationBarComponent(inheritedComponents.browser);

			return lang.mixin(inheritedComponents, {paginationBar});
		},

		_createDesignPaginationBarComponent: function(browserInstance) {

			const browserChannel = browserInstance.getChannel();

			this.mergeComponentAttribute('paginationBarConfig', {
				browserChannel
			});

			return new PaginationBar(this.paginationBarConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addPaginationBarToBrowser();
		},

		_addPaginationBarToBrowser: function() {

			const browserInstance = this.getComponentInstance('browser'),
				instance = this.getComponentInstance('paginationBar');

			this._publish(browserInstance.getChannel('ADD_TOOLBAR_IN_FRAMEWORK'), {instance});
		},

		_onTargetPropSet: function(evt) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('paginationBar'),
				target = evt.value;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
