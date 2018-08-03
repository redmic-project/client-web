define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/tests/Atlas'
	, 'tests/support/tests/CatalogWizardEdition'
	, 'tests/support/tests/ListWithOrder'
	, 'tests/support/tests/ListWithTextSearch'
	, 'tests/support/tests/Map'
	, 'tests/support/tests/WizardEdition'
	, 'tests/support/tests/WizardAddition'
	, 'tests/support/Utils'
	, './_BaseCommons'
], function (
	declare
	, lang
	, AtlasTests
	, CatalogWizardEditionTests
	, ListWithOrderTests
	, ListWithTextSearchTests
	, MapTests
	, WizardEditionTests
	, WizardAdditionTests
	, Utils
	, _BaseCommons
) {

	return declare(_BaseCommons, {

		constructor: function(args) {

			this.propsConfig = {

			};

			lang.mixin(this.propsConfig, args);

			var suiteName = ' tests in ' + (this.propsConfig.namePrefix + this.nameSuffix),
				obj;

			if (!this.propsConfig.noAtlas) {
				obj = lang.clone(this.propsConfig);

				obj.afterGoToIndexPage = function() {

					return function() {

						return this.parent
							.sleep(Config.timeout.shortSleep)
							.then(Utils.checkLoadingIsGone())
							.then(Utils.clickInToTab(2));
					};
				};

				obj.suiteName = 'Atlas' + suiteName;
				obj.notClickLayerMap = true;
				obj.listIntabs = true;

				Utils.registerTests({
					suiteName: 'Atlas' + suiteName,
					definition: AtlasTests,
					properties: obj
				});
			} else {

				Utils.registerTests({
					suiteName: 'Map' + suiteName,
					definition: MapTests,
					properties: this.propsConfig
				});
			}

			if (this.propsConfig.textSearchValue) {
				obj = lang.clone(this.propsConfig);
				obj.listIntabs = true;

				Utils.registerTests({
					suiteName: 'List text search' + suiteName,
					definition: ListWithTextSearchTests,
					properties: obj
				});
			}

			if (this.propsConfig.configSteps) {

				if (!this.propsConfig.noAccessToEdition) {
					Utils.registerTests({
						suiteName: 'Access to edition' + suiteName,
						definition: CatalogWizardEditionTests,
						properties: this.propsConfig
					});
				}

				if (this.propsConfig.wizardEditionUrlValue) {

					obj = lang.clone(this.propsConfig);

					obj.urlValue = obj.wizardEditionUrlValue;

					Utils.registerTests({
						suiteName: 'Edition' + suiteName,
						definition: WizardEditionTests,
						properties: obj
					});
				}

				if (this.propsConfig.wizardAdditionUrlValue) {

					obj = lang.clone(this.propsConfig);

					obj.urlValue = obj.wizardAdditionUrlValue;

					Utils.registerTests({
						suiteName: 'Addition' + suiteName,
						definition: WizardAdditionTests,
						properties: obj
					});
				}

				if (this.propsConfig.wizardLoadUrlValue) {

					obj = lang.clone(this.propsConfig);

					obj.urlValue = obj.wizardLoadUrlValue;

					if (this.propsConfig.configStepsByLoad) {
						obj.urlValue = obj.wizardLoadUrlValue;
						obj.configSteps = obj.configStepsByLoad;
					}

					Utils.registerTests({
						suiteName: 'Load data' + suiteName,
						definition: WizardAdditionTests,
						properties: obj
					});
				}
			}
		}
	});
});
