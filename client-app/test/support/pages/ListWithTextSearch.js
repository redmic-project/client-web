define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/List'
	, 'test/support/Utils'
], function (
	declare
	, lang
	, ListPage
	, Utils
) {

	var baseTextSearchSelector = 'div.containerTextSearch',
		textSearchSelector = baseTextSearchSelector + ' > div.textSearch',
		textSearchInputSelector = textSearchSelector + ' > input',
		innerButtonsSelector = textSearchSelector + ' > div.innerButtons',
		clearButtonSelector = innerButtonsSelector + ' > i.clearTextButton',
		outerButtonsSelector = baseTextSearchSelector + ' > div.outerButtons',
		searchButtonSelector = outerButtonsSelector + ' > i.searchButton';

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
					.then(Utils.clickDisplayedElement(searchButtonSelector));
			}, this);
		},

		clickOnTextSearchFirstSuggestion: function() {

			var textSearchFirstSuggestionSelector = 'div.suggestions > :first-child';

			return function() {

				return this.parent
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

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(clearButtonSelector));
			};
		}
	});
});
