define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/search/FacetsImpl'
], function (
	declare
	, lang
	, FacetsImpl
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir el componente de búsqueda Facets.
		// description:
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con alguna maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('facetConfig', {parentChannel});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const facet = new FacetsImpl(this.facetConfig);

			return lang.mixin(inheritedComponents, {facet});
		},

		_onTargetPropSet: function(evt) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('facet'),
				target = evt.value;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
