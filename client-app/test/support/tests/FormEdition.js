define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/List'
	, 'test/support/pages/steps/Form'
	, 'test/support/Config'
	, 'test/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListPage
	, FormStepPage
	, Config
	, Utils
	, _Commons
) {

	var indexPage,

		enabledSaveInputSelector = Config.selector.saveButton + ' span[aria-disabled=false]',
		disabledSaveInputSelector = Config.selector.saveButton + ' span[aria-disabled=true]';

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new declare([ListPage, FormStepPage])(this);

				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_DisableSubmitButton_When_EditingItemWithoutChanges: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.findByCssSelector(disabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_ClickClearButton: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(Utils.clickDisplayedElement(Config.selector.clearButton))
						.findByCssSelector(disabledSaveInputSelector);
				},

				Should_EnableSubmitButton_When_EditingItemWithChanges: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.modify())
						.findByCssSelector(enabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_EditingItemWithChangesWithTwoShown: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.editItem(1))
						.findByCssSelector(disabledSaveInputSelector);
				},

				Should_EnableSubmitButton_When_EditingItemWithChangesWithTwoShown: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.editItem(1))
						.then(indexPage.modify())
						.findByCssSelector(enabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_EditingItemWithChangesWithTwoShownAndClickClear: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(Utils.clickDisplayedElement(Config.selector.clearButton))
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.findByCssSelector(disabledSaveInputSelector);
				},

				Should_EnableSubmitButton_When_EditingItemWithChangesWithTwoShownAndClickClear: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.sleep(Config.timeout.shortSleep)
						.then(Utils.clickDisplayedElement(Config.selector.clearButton))
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.editItem(1))
						.then(indexPage.modify())
						.findByCssSelector(enabledSaveInputSelector);
				}
			}
		}
	});
});
