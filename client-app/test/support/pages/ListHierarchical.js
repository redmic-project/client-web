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

	var assert = intern.getPlugin('chai').assert;

	return declare(ListPage, {

		constructor: function() {

			globalThis.expandCollapseSelector = 'div.expandCollapse';
			globalThis.expandSelector = expandCollapseSelector + ' span.fa-caret-right';
			globalThis.collapseSelector = expandCollapseSelector + ' span.fa-caret-down';
			globalThis.childrenInParentSelector = 'div.containerBottomRow div.rowsContainer > *';
		},

		getCountChildrenInParent: function(indexParent) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + indexParent + ')';

			return function() {

				return this.parent
					.findDisplayedByCssSelector(parentSelector)
						.findAllByCssSelector(childrenInParentSelector)
						.then(function(children) {

							return children.length;
						});
			};
		},

		getCountItemWithExpand: function() {

			var expandButtonSelector = listSelector + ' ' + listRowSelector + ' ' + expandSelector + ':not(.hidden)';

			return function() {

				return this.parent
					.findAllByCssSelector(expandButtonSelector)
					.then(function(items) {

						return items.length;
					});
			};
		},

		getFirstIndexItemWithChildren: function() {

			var childrenCount = function(index, values, count) {

					if (!values.index && count > 1) {
						values.index = index;
					}
				};

			return lang.partial(function(self) {

				return this.parent
					.then(self.getCountItemWithExpand())
					.then(function(value) {

						/*var parent = this.parent,
							values = {};

						for (var i = 1; i <= value; i++) {
							parent = parent
								.then(self.clickRowInExpandButton(i))
								.then(self.getCountChildrenInParent(i))
								.then(lang.partial(childrenCount, i, values))
								.then(self.clickRowInCollapseButton(i));
						}

						return parent.then(lang.partial(function(values) {

							return values.index;
						}, values));*/

						return value ? 1 : null;
					});

			}, this);
		},

		clickRowInExpandButton: function(pos) {

			var expandButtonSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + pos + ') ' +
				expandSelector;

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickDisplayedElement(expandButtonSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		clickRowInCollapseButton: function(pos) {

			var collapseButtonSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + pos + ') ' +
				collapseSelector;

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(collapseButtonSelector));
			};
		},

		clickFirstChild: function(numParentList) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + numParentList + ') ',
				checkboxSelector = listRowSelector + ':first-child ' + listRowCheckboxSelector;

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(parentSelector + checkboxSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		clickSelectChild: function(numParentList) {

			return lang.hitch(this, this.clickSelectChildren)(numParentList, true);
		},

		clickSelectChildren: function(numParentList, onlyChild) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + numParentList +
				') div.rowsContainer';

			return function() {

				return this.parent
					.findAllByCssSelector(parentSelector + ' > * ' + listRowCheckboxSelector)
					.then(lang.hitch(this.parent, function(items) {

						var parent = this,
							i = 0;

						if (onlyChild) {
							i = items.length - 1;
						}

						for (i; i < items.length; i++) {
							var item = items[i];

							parent = parent
								.then(lang.partial(function(itemElement) {
									itemElement.click();
								}, item))
								.then(Utils.checkLoadingIsGone());
						}

						return parent;
					}));
			};
		},

		checkChildrenSelectWithParentSelected: function(numParentList) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + numParentList + ')',
				valuesObj = {};

			return function() {

				return this.parent
					.findDisplayedByCssSelector(parentSelector)
						.findAllByCssSelector(childrenInParentSelector)
							.then(lang.partial(function(values, children) {

								values.children = children.length;
							}, valuesObj))
							.end()
						.findAllByCssSelector(childrenInParentSelector + '.selectContainerRow')
							.then(lang.partial(function(values, children) {

								assert.strictEqual(children.length, values.children, 'No se ha deseleccionado la capa');
							}, valuesObj));
			};
		},

		checkParentMixedWithChildSelected: function(numParentList) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + numParentList +
				').category.mixedSelectContainerRow';

			return function() {

				return this.parent
					.findByCssSelector(parentSelector);
			};
		},

		checkParentSelectWithChildrenSelected: function(numParentList) {

			var parentSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + numParentList +
				').category.selectContainerRow';

			return function() {

				return this.parent
					.findByCssSelector(parentSelector);
			};
		}
	});
});
