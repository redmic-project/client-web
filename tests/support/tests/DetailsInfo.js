define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/_Page'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, _Page
	, Utils
	, _Commons
) {

	var indexPage,
		tabContainerSelector = 'div[role="tablist"]';

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new _Page(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {
				Should_LoadContentInfo_When_EnterInView: function() {
					return this.remote
						.findByCssSelector('div.windowContent div.containerDetails div.content');
				},

				Should_LoadContentAdditional_When_EnterInView: function() {

					var context = this.remote,
						values = {};

					return this.remote
						.findAllByCssSelector(tabContainerSelector + ' > div')
							.then(lang.partial(function(values, tabs) {

								values.count = tabs.length;

								return this.parent;
							}, values))
							.end()
						.then(lang.partial(function(values) {

							var count = values.count,
								parent = this.parent;

							for (var i = count; i > 0; i--) {

								parent = parent
									.then(Utils.clickInToTab(i))
									.then(Utils.checkLoadingIsGone());
							}

							return parent;
						}, values));
				},

				Should_LoadTitle_When_EnterInView: function() {

					return this.remote
						.findByCssSelector('div.infoTitle div.center > div');
				}
			}
		}
	});
});
