define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, ListPage
	, Config
	, Utils
) {

	return declare(ListPage, {

		constructor: function(args) {

			this._valuesByInputModel = {};

			lang.mixin(this._valuesByInputModel, Utils.getProperties(this, 'valuesByInputModel') || {});
		},

		modify: function() {

			return this.complete();
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				var parent = this.parent,
					value = self._valuesByInputModel.taxon;

				if (value) {
					parent = parent
						.then(Utils.setInputValueInFilteringSelect('div.rightContainer', value));

				} else {
					parent = parent
						.then(Utils.clickFirstOptionInFilteringSelect('div.rightContainer'));
				}

				return parent
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector('div.leftZone div.contentList i.fa-arrow-right')
						.click();
			}, this);
		}
	});
});
