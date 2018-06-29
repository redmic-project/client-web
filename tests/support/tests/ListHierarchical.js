define([
	'dojo/_base/declare'
	, 'tests/support/pages/ListHierarchical'
	, './_Commons'
], function (
	declare
	, ListHierarchicalPage
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListHierarchicalPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_ExpandItem_When_ClickedOnExpandButton: function() {

					return this.remote
						.then(indexPage.getFirstIndexItemWithChildren())
						.then(function(parentIndex) {

							if (parentIndex !== undefined) {
								return this.parent.then(indexPage.clickRowInExpandButton(parentIndex));
							}
						});
				},

				Should_CollapseItem_When_ClickedOnCollapseButton: function() {

					return this.remote
						.then(indexPage.getFirstIndexItemWithChildren())
						.then(function(parentIndex) {

							if (parentIndex !== undefined) {
								return this.parent.then(indexPage.clickRowInExpandButton(parentIndex))
									.then(indexPage.clickRowInCollapseButton(parentIndex));
							}
						});
				}
			}
		}
	});
});
