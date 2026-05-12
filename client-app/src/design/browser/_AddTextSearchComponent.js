define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/textSearch/TextSearchSuggestionsRequestImpl'
], function (
	declare
	, lang
	, TextSearchSuggestionsRequestImpl
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de búsqueda por texto a Browser, para ampliar su funcionalidad.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this.target;

			this.mergeComponentAttribute('textSearchConfig', {
				parentChannel, target
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const textSearch = this._createDesignTextSearchComponent(inheritedComponents.browser);

			return lang.mixin(inheritedComponents, {textSearch});
		},

		_createDesignTextSearchComponent: function(browserInstance) {

			return new TextSearchSuggestionsRequestImpl(this.textSearchConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addTextSearchToBrowser();
		},

		_addTextSearchToBrowser: function() {

			const instance = this.getComponentInstance('textSearch'),
				node = this.getLayoutNode('keypad');

			this._publish(instance.getChannel('SHOW'), {node});
		},

		_onTargetPropSet: function(changeObj) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('textSearch'),
				target = changeObj.newValue;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
