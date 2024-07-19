define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/ListHierarchical'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, ListHierarchicalPage
	, Utils
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListHierarchicalPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			beforeEach: function(test) {

				return this.externalContext
					.goToIndexPage()
					.then(indexPage.clearSelection())
					.then(Utils.checkLoadingIsGone());
			},

			tests: {

				Should_ParentAndChildrenSelect_When_SelectedParentExpand: function() {

					return this.remote
						.then(indexPage.clickRowInExpandButton(1))
						.then(indexPage.selectItem(1))
						.then(indexPage.checkChildrenSelectWithParentSelected(1));
				},

				Should_ParentAndChildrenSelect_When_SelectedParentCollapse: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(indexPage.clickRowInExpandButton(1))
						.then(indexPage.checkChildrenSelectWithParentSelected(1));
				},

				Should_ParentMixed_When_SelectedChild: function() {

					return this.remote
						.then(indexPage.getFirstIndexItemWithChildren())
						.then(function(parentIndex) {

							return this.parent.then(indexPage.clickRowInExpandButton(parentIndex))
								.then(indexPage.clickFirstChild(parentIndex))
								.sleep(Config.timeout.shortSleep)
								.then(indexPage.checkParentMixedWithChildSelected(parentIndex));
						});
				},

				Should_ParentSelect_When_SelectedChildren: function() {

					return this.remote
						.then(indexPage.clickRowInExpandButton(1))
						.then(indexPage.clickSelectChildren(1))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.checkParentSelectWithChildrenSelected(1));
				}
			}
		}
	});
});
