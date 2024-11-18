define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/tests/_CatalogBase'
	, 'test/support/tests/CatalogWizardEdition'
	, 'test/support/tests/Dashboard'
	, 'test/support/tests/WizardEdition'
	, 'test/support/tests/WizardAddition'
], function(
	declare
	, lang
	, _CatalogBase
	, CatalogWizardEditionTests
	, DashboardTests
	, WizardEditionTests
	, WizardAdditionTests
) {

	new declare(_CatalogBase, {

		constructor: function(args) {

			this.config = {
				valuesByInputModel: {}
			};

			lang.mixin(this, this.config, args);

			this._registerDashboardTests(this.namePrefix + ' dashboard ' + this.nameSuffix);

			this._registerListSelectionTests(this.namePrefix + ' selection ' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list ' + this.nameSuffix);

			this._registerCatalogWizardEditionTests(this.namePrefix + ' access to edition ' + this.nameSuffix);

			this._registerWizardEditionTests(this.namePrefix + ' edition ' + this.nameSuffix);

			this._registerWizardAdditionTests(this.namePrefix + ' addition ' + this.nameSuffix);
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
					valuesByInputModel: this.valuesByInputModel,
					startEditingFromStep: 2
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
		},

		_registerDashboardTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DashboardTests,
				properties: {
					sidebarPrimaryValue: this.sidebarPrimaryValue,
					sidebarSecondaryValue: this.sidebarSecondaryValue,
					dashboardValue: this.urlValue
				}
			});
		}
	})({
		namePrefix: 'Misidentification metadata page',
		sidebarPrimaryValue: 'admin',
		sidebarSecondaryValue: '/admin/taxonomy',
		urlValue: '/taxon/misidentification',
		wizardEditionUrlValue: '/admin/misidentification-edit/1',
		wizardAdditionUrlValue: '/admin/misidentification-add/new',
		textSearchValue: 'Diadema antillarum',
		configSteps: [{
			type: 'doubleListFiltered',
			required: true
		},{
			type: 'list',
			required: true
		},{
			type: 'list',
			required: true
		},{
			type: 'list',
			required: true
		},{
			type: 'form'
		}],

		valuesByInputModel: {
			'taxon': 'Photis longicaudata'
		}
	});
});
