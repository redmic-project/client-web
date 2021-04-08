define([
	'dojo/_base/lang'
	, 'dojo/node!@theintern/leadfoot/helpers/pollUntil'
	, 'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	lang
	, pollUntil
	, module
	, Config
	, Utils
){

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	pollUntil = pollUntil['default'];

	var indexPageUrl,
		timeout = Config.timeout.findElement,
		firstButtonOfGroupSelector = ' div.btnGroup span span:first-child',

		pressButtonAndListen = function(buttonSelector, buttonKey) {

			return lang.partial(function(buttonSelector1, buttonKey1) {

				return this.remote
					.then(Utils.clickElement(buttonSelector1))
					.then(pollUntil(function() {

						return window.inputKey;
					}, timeout))
					.then(function(inputKey) {

						assert.strictEqual(inputKey, buttonKey1,
							'Se ha publicado una pulsación de botón diferente al pulsado');
					}, function(error) {

						assert(false, 'No se ha conseguido pulsar el botón deseado');
					});
			}, buttonSelector, buttonKey);
		};

	registerSuite('Keypad tests', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.id);
		},

		beforeEach: function(test) {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: {

			Should_ListenSpecificButtonPress_When_ButtonPressed: function() {

				var buttonSelector = 'div.left' + firstButtonOfGroupSelector,
					buttonKey = 'btn1';

				return this.remote
					.then(lang.hitch(this, pressButtonAndListen), buttonSelector, buttonKey);
			},

			Should_FindNotDisplayedButton_When_LookForHiddenButton: function() {

				var buttonSelector = 'div.center' + firstButtonOfGroupSelector;

				return this.remote
					.findByCssSelector(buttonSelector)
					.isDisplayed()
					.then(function(displayed) {

						assert.isFalse(displayed, 'El botón oculto estaba visible');
					}).end();
			},

			Should_ListenSpecificButtonPress_When_ReenabledButtonPressed: function() {

				var buttonSelector = 'div.right' + firstButtonOfGroupSelector,
					buttonKey = 'btn3';

				return this.remote
					.then(lang.hitch(this, pressButtonAndListen), buttonSelector, buttonKey);
			}
		}
	});
});
