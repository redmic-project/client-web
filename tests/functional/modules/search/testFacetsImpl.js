define([
	'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	module
	, Config
	, Utils
) {

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	var indexPageUrl,
		timeout = Config.timeout.findElement;

	registerSuite('FacetsImpl (Search module)', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.uri);
		},

		beforeEach: function(test) {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: {
			Should_FindFacetsGroup_When_AddedByStartupConfig: function() {

				return this.remote
					.findByCssSelector('div[data-redmic-id="Tema INSPIRE"]')
					.isDisplayed()
					.then(function(displayed) {

						assert.isTrue(displayed, 'El grupo de facets no se ha encontrado');
					}).end();
			},

			Should_CheckFacetCheckbox_When_FacetLabelIsPressed: function() {

				return this.remote
					.findByCssSelector('div[data-redmic-id="Tema INSPIRE"] > div label').click().end()
					.findByCssSelector('div input[data-redmic-id="Species distribution"]').getProperty('checked')
					.then(function(checked) {

						assert.strictEqual(checked, true, 'El checkbox no se ha marcado tras pulsar el label');
					}).end();
			}
		}
	});
});
