define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/_Page'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, _Page
	, Config
	, Utils
) {

	return declare(_Page, {

		modify: function() {

			return lang.partial(function(self) {

				return this.parent
					.findByCssSelector('div.containerImageLayerEdit')
						.click()
						.end()
					.then(self._moveImageMap());
			}, this);
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(self._moveImageMap());
			}, this);
		},

		_moveImageMap: function() {

			return function() {

				return this.parent
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector('div.mapSearch.leaflet-container div.leaflet-pane.leaflet-map-pane')
						.moveMouseTo(10, 10)
					.sleep(Config.timeout.shortSleep);
			};
		}
	});
});
