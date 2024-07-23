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

	var treeSelector = 'div.dijitTree div.dijitTreeNodeContainer',
		treeItemSelector = treeSelector + ' > div.dijitTreeNode';

	return declare(ListPage, {

		showTreeFilter: function() {

			return function() {

				return this.parent
					.then(Utils.clickInToTab(2))
					.then(Utils.checkLoadingIsGone());
			};
		},

		toggleTreeFilterItemSelection: function(itemPosition) {

			return lang.partial(function(pos) {

				var itemSelector = treeItemSelector + ':nth-child(' + pos + ')',
					itemCheckboxSelector = itemSelector + ' div.cbtreeCheckBox input';

				return this.parent
					.then(Utils.clickElement(itemCheckboxSelector))
					.then(Utils.checkLoadingIsGone());
			}, itemPosition || 1);
		},

		getTreeFilterItemCounter: function(itemPosition) {

			return lang.partial(function(pos) {

				var itemSelector = treeItemSelector + ':nth-child(' + pos + ')',
					itemLabelSelector = itemSelector + ' span.dijitTreeContent span[role="treeitem"]';

				return this.parent
					.findDisplayedByCssSelector(itemLabelSelector)
						.getVisibleText()
						.then(function(text) {

							var itemCount = text.replace(/.*\((\d+)\)/g, '$1');
							return parseInt(itemCount, 10);
						});
			}, itemPosition || 1);
		}
	});
});
