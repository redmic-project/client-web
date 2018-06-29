define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, ListPage
	, Utils
) {

	return declare(ListPage, {

		constructor: function(args) {

			this.itemToSelect = args.itemToSelect;
		},

		modify: function() {

			return lang.partial(function(self) {

				return this.parent.then(self.selectItem(1));
			}, this);
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				if (self.itemToSelect) {
					return this.parent.then(self.selectRowListByText(self.itemToSelect));
				}

				return this.parent.then(self.selectItem(1));
			}, this);
		}
	});
});
