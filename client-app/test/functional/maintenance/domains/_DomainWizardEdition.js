define([
	'dojo/_base/declare'
	, 'test/support/tests/CatalogWizardEdition'
	, 'test/support/tests/WizardAddition'
	, 'test/support/tests/WizardEdition'
	, './_DomainBase'
], function(
	declare
	, CatalogWizardEditionTests
	, WizardAdditionTests
	, WizardEditionTests
	, _DomainBase
) {

	return declare(_DomainBase, {

		constructor: function(args) {

			this._registerCatalogWizardEditionTests(this.namePrefix + ' edition access' + this.nameSuffix);
			this._registerWizardAdditionTests(this.namePrefix + ' addition' + this.nameSuffix);
			this._registerWizardEditionTests(this.namePrefix + ' edition' + this.nameSuffix);
		},

		_registerCatalogWizardEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogWizardEditionTests
			});
		},

		_registerWizardAdditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: WizardAdditionTests,
				properties: {
					urlValue: this.additionUrlValue,
					configSteps: this.configSteps
				}
			});
		},

		_registerWizardEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: WizardEditionTests,
				properties: {
					urlValue: this.editionUrlValue,
					configSteps: this.configSteps
				}
			});
		}
	});
});
