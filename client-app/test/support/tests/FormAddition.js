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
		addButtonSelector,

		enabledSaveInputSelector = Config.selector.saveButton + ' span[aria-disabled=false]',
		disabledSaveInputSelector = Config.selector.saveButton + ' span[aria-disabled=true]';

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new declare([ListPage, FormStepPage])(this);
				addButtonSelector = Utils.getProperties(this, 'addButtonSelector');

				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_DisableSubmitButton_When_WithoutChanges: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.findDisplayedByCssSelector(disabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_ClickAddItemButtonAfterPreviousEdition: function() {

					return this.remote
						.then(indexPage.editItem(1))
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.addItem(addButtonSelector))
						.findDisplayedByCssSelector(disabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_ClickAddItemButtonAfterAddRequiredItem: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete(true))
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.addItem(addButtonSelector))
						.findDisplayedByCssSelector(disabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_ClickAddItemButtonAfterAddItem: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete())
						.then(Utils.clickDisplayedElement(Config.selector.cancelButton))
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.addItem(addButtonSelector))
						.findDisplayedByCssSelector(disabledSaveInputSelector);
				},

				Should_AllowDataSubmit_When_RequiredFieldsAreFilled: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete(true))
						.findDisplayedByCssSelector(enabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_RequiredFieldsAreFilledAndClickClearButton: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete(true))
						.then(Utils.clickDisplayedElement(Config.selector.clearButton))
						.findByCssSelector(disabledSaveInputSelector);
				},

				Should_AllowDataSubmit_When_FieldsAreFilled: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete())
						.findDisplayedByCssSelector(enabledSaveInputSelector);
				},

				Should_DisableSubmitButton_When_FieldsAreFilledAndClickClearButton: function() {

					return this.remote
						.then(indexPage.addItem(addButtonSelector))
						.then(indexPage.complete())
						.then(Utils.clickDisplayedElement(Config.selector.clearButton))
						.findByCssSelector(disabledSaveInputSelector);
				}
			}
		}
	});
});
