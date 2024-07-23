define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/tests/_CatalogBase'
	, 'test/support/tests/CatalogWizardEdition'
	, 'test/support/tests/WizardEdition'
	, 'test/support/tests/WizardAddition'
], function(
	declare
	, lang
	, _CatalogBase
	, CatalogWizardEditionTests
	, WizardEditionTests
	, WizardAdditionTests
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this.config = {
				valuesByInputModel: {}
			};

			lang.mixin(this, this.config, args);

			this._registerListSelectionTests(this.namePrefix + ' selection' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list' + this.nameSuffix);

			this._registerListWithOrderTests(this.namePrefix + ' order list' + this.nameSuffix);

			this._registerCatalogWizardEditionTests(this.namePrefix + ' access to edition' + this.nameSuffix);

			this._registerWizardEditionTests(this.namePrefix + ' edition' + this.nameSuffix);

			this._registerWizardAdditionTests(this.namePrefix + ' addition' + this.nameSuffix);
		},

		_registerCatalogWizardEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogWizardEditionTests
			});
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
		},

		_registerWizardAdditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: WizardAdditionTests,
				properties: {
					urlValue: this.wizardAdditionUrlValue,
					configSteps: this.configSteps,
					valuesByInputModel: this.valuesByInputModel
				}
			});
		}
	});
});
