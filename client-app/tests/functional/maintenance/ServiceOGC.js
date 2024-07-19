define([
	'dojo/_base/declare'
	, 'tests/support/tests/_CatalogBase'
	, 'tests/support/tests/WizardEdition'
], function(
	declare
	, _CatalogBaseTests
	, WizardEditionTests
) {

	new declare(_CatalogBaseTests, {

		constructor: function(args) {

			this._registerListWithTextSearchTests(this.namePrefix + ' list' + this.nameSuffix);

			this._registerCatalogLinksTests(this.namePrefix + ' links' + this.nameSuffix);

			this._registerCatalogFacetsTests(this.namePrefix + ' facets' + this.nameSuffix);

			this._registerWizardEditionTests(this.namePrefix + ' edition' + this.nameSuffix);
		},

		_registerWizardEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: WizardEditionTests,
				properties: {
					urlValue: this.wizardEditionUrlValue,
					configSteps: this.configSteps,
					valuesByInputModel: this.valuesByInputModel
				}
			});
		}
	})({
		urlValue: '/maintenance/service-ogc',
		textSearchValue: 'citation',
		namePrefix: 'Service OGC maintenance page',
		wizardEditionUrlValue: '/maintenance/service-ogc-edit/182',
		configSteps: [{
			type: 'form'
		},{
			type: 'layerImage'
		},{
			type: 'reorderLayerList'
		},{
			type: 'formList',
			required: true
		}]
	});
});
