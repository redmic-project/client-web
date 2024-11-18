define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/List'
	, 'test/support/Config'
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
