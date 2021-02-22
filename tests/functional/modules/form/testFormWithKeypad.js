define([
	'dojo/_base/lang'
	, 'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	lang
	, module
	, Config
	, Utils
){
	var indexPageUrl,
		timeout = Config.timeout.findElement,
		disabledClassName = '.dijitDisabled';

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('Form with Keypad tests', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.id);
		},

		beforeEach: function(test) {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.getBrowserLogs(test, this.remote);
		},

		tests: {

			Should_FindADisabledButton_When_FormIsUnfilled: function() {

				return this.remote
					.findAllByCssSelector(disabledClassName)
					.then(function(disabledArr) {

						assert.lengthOf(disabledArr, 1,
							'No se han encontrado los elementos deshabilitados esperados (solo el botón de submit)');
					});
			},

			Should_FindZeroDisabledButtons_When_FormIsFilled: function() {

				var inputElementSelector = 'div.dijitInputContainer input',
					nameInputSelector = 'div[data-redmic-model="name"] ' + inputElementSelector,
					nameEnInputSelector = 'div[data-redmic-model="name_en"] ' + inputElementSelector,
					exampleValue = 'valor';

				return this.remote
					.then(Utils.setInputValue(nameInputSelector, exampleValue))
					.then(Utils.setInputValue(nameEnInputSelector, exampleValue))

					.findAllByCssSelector(disabledClassName)
					.then(function(disabledArr) {

						assert.lengthOf(disabledArr, 0, 'Se han encontrado elementos deshabilitados');
					});
			}
		}
	});
});
