define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/Config'
], function (
	declare
	, lang
	, ListPage
	, Config
) {

	return declare(ListPage, {

		modify: function() {

			return this.complete();
		},

		complete: function(onlyRequired) {

			return function() {

				return this.parent
					.findByCssSelector('div.leftZone div.contentList i.fa-arrow-right')
						.click();
			};
		}
	});
});
