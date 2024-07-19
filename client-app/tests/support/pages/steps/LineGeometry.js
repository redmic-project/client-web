define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/steps/Form'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, FormStepPage
	, Utils
) {

	return declare(FormStepPage, {

		modify: function() {

			return this.complete();
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(lang.partial(function(self) {

						return self._modifyField(this.parent, {
								type: 'textarea',
								name: 'geometry/coordinates'
							})
							.findByCssSelector('div.map.leaflet-container')
								.click();
					}, self));
			}, this);
		}
	});
});
