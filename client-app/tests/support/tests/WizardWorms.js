define([
	'dojo/_base/declare'
	, 'tests/support/pages/Wizard'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, WizardPage
	, Config
	, Utils
	, _Commons
) {

	var assert = intern.getPlugin('chai').assert,

		indexPage,
		loadDataByWormsPopup = function(modelName, value) {

			return function() {

				var wormsSelector = 'div[data-redmic-model="' + modelName + '"] div.embeddedButton span.primary',
					textSearchSelector = 'div.dialogSimple div.containerTextSearch ',
					textSearchInputSelector = textSearchSelector + 'div.textSearch input.inputSearch',
					buttonTextSearchSelector = textSearchSelector + 'div.buttonSearch',
					updateSelector = 'div.dialogSimple div.containerButtons i.fa-download';

				return this.parent
					.then(Utils.clickDisplayedElement(wormsSelector))
					.sleep(Config.timeout.shortSleep)
					.then(Utils.setInputValue(textSearchInputSelector, value))
					.then(Utils.clickDisplayedElement(buttonTextSearchSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickDisplayedElement(updateSelector))
					.then(Utils.checkLoadingIsGone());

			};
		},
		checkSubmitting = function() {

			return function() {

				return this.parent
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isOk(submittable, 'El botón de confirmación está deshabilitado');
					});
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new WizardPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_AllowDataSubmit_When_LoadDataByScientificName: function() {

					return this.remote
						.then(loadDataByWormsPopup('scientificName', 'Vibrio phage K139'))
						.then(checkSubmitting());
				},

				Should_AllowDataSubmit_When_LoadDataByAphia: function() {

					return this.remote
						.then(loadDataByWormsPopup('aphia', '816266'))
						.then(checkSubmitting());
				}
			}
		}
	});
});
