define([
	'dojo/_base/declare'
	, 'tests/support/pages/Wizard'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, WizardPage
	, Config
	, Utils
	, _Commons
) {

	var assert = intern.getPlugin('chai').assert,

		indexPage,
		configSteps,
		completeWizard = function() {

			return function() {

				return this.parent
					.then(indexPage.completeWizard(configSteps))
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isOk(submittable, 'El botón de confirmación está deshabilitado');
					});
			};
		},
		completeWizardWithRequired = function() {

			return function() {

				return this.parent
					.then(indexPage.completeWizardWithRequired(configSteps))
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isOk(submittable, 'El botón de confirmación está deshabilitado');
					});
			};
		},
		goFirstStepAndAction = function(cssSelector) {

			return function() {

				var countSteps = configSteps.length,
					parent = this.parent;

				if (countSteps > 1) {

					for (var i = 1; i < countSteps; i++) {

						parent = parent
							.then(Utils.clickDisplayedElement(cssSelector))
							.then(indexPage.goPrevStep())
							.then(Utils.checkLoadingIsGone());
					}
				}

				return parent
					.then(Utils.clickDisplayedElement(cssSelector));
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new WizardPage(this);
				this.externalContext.setIndexPage(indexPage);

				configSteps = Utils.getProperties(this, 'configSteps');
			},

			tests: {

				Should_BlockSubmit_When_Enter: function() {

					return this.remote
						.then(indexPage.getSubmittability())
						.then(function(submittable) {

							assert.isNotOk(submittable, 'El botón de confirmación está habilitado');
						});
				},

				Should_BlockNextStep_When_Enter: function() {

					return this.remote
						.sleep(Config.timeout.longSleep)
						.then(indexPage.getNextStep())
						.then(function(nextStep) {

							assert.isNotOk(nextStep, 'El botón de siguiente step está habilitado');
						});
				},

				Should_BlockPrevStep_When_Enter: function() {

					return this.remote
						.sleep(Config.timeout.longSleep)
						.then(indexPage.getPrevStep())
						.then(function(prevStep) {

							assert.isNotOk(prevStep, 'El botón de anterior step está habilitado');
						});
				},

				Should_AllowDataSubmit_When_CompleteWizard: function() {

					return this.remote
						.then(completeWizard());
				},

				Should_AllowDataSubmit_When_RequiredFieldsAreFilled: function() {

					return this.remote
						.then(completeWizardWithRequired());
				},

				Should_BlockSubmit_When_CompleteAndClear: function() {

					return this.remote
						.then(completeWizard())
						.then(goFirstStepAndAction(Config.selector.clearButton))
						.then(indexPage.getSubmittability())
						.then(function(submittable) {

							assert.isNotOk(submittable, 'El botón de confirmación está habilitado');
						});
				},

				Should_AllowDataSubmit_When_CompleteAndClearAndComplete: function() {

					return this.remote
						.then(completeWizard())
						.then(goFirstStepAndAction(Config.selector.clearButton))
						.then(completeWizard());
				},

				Should_BlockSubmit_When_CompleteAndReset: function() {

					return this.remote
						.then(completeWizard())
						.then(goFirstStepAndAction(Config.selector.resetButton))
						.then(indexPage.getSubmittability())
						.then(function(submittable) {

							assert.isNotOk(submittable, 'El botón de confirmación está habilitado');
						});
				},

				Should_AllowDataSubmit_When_CompleteAndResetAndComplete: function() {

					return this.remote
						.then(completeWizard())
						.then(goFirstStepAndAction(Config.selector.resetButton))
						.then(completeWizard());
				}
			}
		}
	});
});
