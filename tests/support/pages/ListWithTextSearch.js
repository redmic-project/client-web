define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, Config
	, ListPage
	, Utils
) {

	var baseTextSearchSelector = 'div.containerTextSearch ',
		textSearchSelector = baseTextSearchSelector + 'div.textSearch',
		textSearchInputSelector = textSearchSelector + ' input.inputSearch',
		buttonSearchSelector = baseTextSearchSelector + 'div.buttonSearch';

	var assert = intern.getPlugin('chai').assert;

	return declare(ListPage, {

		typeInTextSearchInput: function(value) {

			return function() {

				return this.parent
					.then(Utils.setInputValue(textSearchInputSelector, value));
			};
		},

		setTextSearchInput: function(value) {

			return lang.partial(function(self) {

				return this.parent
					.then(self.typeInTextSearchInput(value))
					.then(Utils.clickDisplayedElement(buttonSearchSelector));
			}, this);
		},

		clickOnTextSearchFirstSuggestion: function() {

			var textSearchFirstSuggestionSelector = 'div.suggestions > :first-child';

			return function() {

				return this.parent
					//.sleep(Config.timeout.shortSleep)
					.then(Utils.clickDisplayedElement(textSearchFirstSuggestionSelector));
			};
		},

		_getTextSearchInputValue: function() {

			return function() {

				return this.parent
					.findDisplayedByCssSelector(textSearchInputSelector)
						.getAttribute('value');
			};
		},

		getTextSearchInputValue: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self._getTextSearchInputValue())
					.then(function(value) {

						assert.isString(value, 'El valor de sugerencia seleccionada no es válido');
						assert.isAbove(value.length, 0, 'No se ha encontrado un valor de sugerencia seleccionada');

						return value;
					});
			}, this);
		},

		clearTextSearchInput: function() {

			var textSearchCleanIconSelector = textSearchSelector + ' > i:last-child';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(textSearchCleanIconSelector));
			};
		}
	});
});
