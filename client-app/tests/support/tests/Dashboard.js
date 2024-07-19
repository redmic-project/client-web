define([
	'dojo/_base/declare'
	, 'tests/support/pages/_Page'
	, './_Commons'
], function (
	declare
	, _Page
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new _Page(this);
				delete this.externalContext.config.urlValue;
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_LoadCorrectly_When_EnterInView: function() {

					return this.remote;
				}
			}
		}
	});
});
