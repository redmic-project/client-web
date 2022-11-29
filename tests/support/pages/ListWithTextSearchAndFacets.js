define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/ListWithTextSearch'
], function (
	declare
	, lang
	, ListWithTextSearchPage
) {

	var facetsSelector = 'div.facetsZone div.containerFacets',
		firstFacetsGroupSelector = facetsSelector + ' > div:first-child div.bucket',
		countLengthUpperLimit = 3;

	return declare(ListWithTextSearchPage, {

		getFacetElementFirstNoZero: function() {

			return function() {

				var labelSelector = '//label[starts-with(., "(") and string(.) != "(0)"]';

				return this.parent
					.findDisplayedByCssSelector(firstFacetsGroupSelector)
						.findByXpath(labelSelector);
			};
		},

		selectFacetFirstNoZero: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self.getFacetElementFirstNoZero())
					.then(function(element) {

						return element.click();
					});
			}, this);
		},

		getFacetFirstNoZeroOptionCounter: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self.getFacetElementFirstNoZero())
					.then(function(element) {

						return element
							.getVisibleText()
							.then(function(text) {

								return text.replace(/\((\d+)\)/g, '$1');
							});
					});
			}, this);
		},

		getFacetsElementLimitedByCountDigits: function(digitCount) {

			return function() {

				var maxLength = digitCount + 2,
					countLabelSelector = '//label[starts-with(., "(") and string-length(.) < ' + maxLength + ']';

				return this.parent
					.findDisplayedByCssSelector(firstFacetsGroupSelector)
						.findByXpath(countLabelSelector);
			};
		},

		selectFacetsFirstSmallCountOption: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self.getFacetsElementLimitedByCountDigits(countLengthUpperLimit))
					.then(function(element) {

						return element.click();
					});
			}, this);
		},

		getFacetsFirstSmallCountOptionCounter: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self.getFacetsElementLimitedByCountDigits(countLengthUpperLimit))
					.then(function(element) {

						return element
							.getVisibleText()
							.then(function(text) {

								return text.replace(/\((\d+)\)/g, '$1');
							});
					});
			}, this);
		}
	});
});
