define([
	'dojo/_base/lang'
	, 'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	lang
	, module
	, Config
	, Utils
){
	var indexPageUrl,
		timeout = Config.timeout.findElement;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('MapSearchImpl tests', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.id);
		},

		beforeEach: function(test) {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.getBrowserLogs(test, this.remote);
		},

		tests: {

			/*Should_ChangeStatus_When_ClickInInput: function() {

				return this.remote
					.findByCssSelector('div.primaryContainerRight')
						.end()
					.then(Utils.clickElement('div.leftContainerSwitch'))
					.findByCssSelector('div.primaryContainerLeft')
						.end()
					.then(Utils.clickElement('div.rightContainerSwitch'))
					.findByCssSelector('div.primaryContainerRight')
						.end();
			},

			Should_OpenMap_When_ClickInActive: function() {

				return this.remote
					.then(Utils.clickElement('div.leftContainerSwitch'))
					.findByCssSelector('div.containerContent div.mapSearch')
						.end()
					.findByCssSelector('div.leaflet-areaselect-handle')
						.end();
			}*/
		}
	});
});
