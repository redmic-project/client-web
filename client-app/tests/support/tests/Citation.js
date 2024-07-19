define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/pages/steps/PointGeometry'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListPage
	, PointGeometryStepPage
	, Config
	, Utils
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert,

		isGeometryCorrect = function() {

			return function() {

				var inputIn = function(input, values) {

						return input
							.getProperty('value')
							.then(lang.partial(function(values, value) {
								if (!value) {
									values.valid = false;
								}
							}, values));
					},
					selector = 'div[data-redmic-type="point"] > div.inputContainer > div:nth-child(2) input.dijitInputInner',
					values = {
						valid: true
					};

				return this.parent
					.findAllByCssSelector(selector)
						.then(lang.hitch(this.parent, function(values, inputs) {

							var parent = this;

							for (var i = 0; i < inputs.length; i++) {
								parent = parent.then(lang.partial(inputIn, inputs[i], values));
							}

							return parent;
						}, values))
						.end()
					.then(lang.partial(function(values) {
						return values.valid;
					}, values));
			};
		},
		addGeometryInFormAndCheck = function(x, y) {

			return function() {

				return this.parent
					.then(indexPage.addItem())
					.sleep(Config.timeout.shortSleep)
					.then(indexPage.complete(x, y))
					.then(isGeometryCorrect())
					.then(function(value) {

						assert.isTrue(value, 'La geometría esta incompleta');
					});
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new declare([ListPage, PointGeometryStepPage])(this);

				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_OpenFormAndCopyData_When_ClickInCopy: function() {

					return this.remote
						.then(indexPage.clickRowComboButton(1, 'fa-copy'))
						.then(isGeometryCorrect())
						.then(function(value) {

							assert.isFalse(value, 'La geometría esta completa, cuando debería estar vacía');
						});
				},

				Should_OpenFormAndCopyData_When_ClickInCopyWithGeometry: function() {

					return this.remote
						.then(indexPage.clickRowComboButton(1, 'fa-clone'))
						.then(isGeometryCorrect())
						.then(function(value) {

							assert.isTrue(value, 'La geometría esta incompleta');
						});
				},

				Should_AddGeometryInForm_When_ClickInMap: function() {

					return this.remote
						.then(addGeometryInFormAndCheck());
				},

				Should_AddGeometryInForm_When_ThereIsDrawnArea: function() {

					return this.remote
						.then(indexPage.dragArea())
						.then(addGeometryInFormAndCheck(250, 250));
				}
			}
		}
	});
});
