define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/Map'
	, 'tests/support/pages/steps/Form'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, MapStepPage
	, FormStepPage
	, Utils
) {

	return declare([FormStepPage, MapStepPage], {

		modify: function() {

			return this.complete();
		},

		complete: function(x, y) {

			return lang.partial(function(self) {

				if (typeof x !== 'number') {
					x = undefined;
				}

				return this.parent
					.findByCssSelector('div.embeddedButton span.danger')
						.click()
						.end()
					.then(self.clickMapOnPoint(x, y));
			}, this);
		}
	});
});
