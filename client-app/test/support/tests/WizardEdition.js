define([
	'dojo/_base/declare'
	, 'test/support/pages/Wizard'
	, 'test/support/Config'
	, 'test/support/Utils'
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
		startEditingFromStep,
		modifyAnyFieldInEditionStep = function() {

			return function() {

				var step, i,
					parent = this.parent;

				// TODO revisar este funcionamiento cuando se modifique el wizard de citas erroneas
				// Se ha realizado un parche
				if (startEditingFromStep) {
					step = configSteps[startEditingFromStep];

					for (i = 0; i < startEditingFromStep; i++) {
						parent = parent
							.then(indexPage.goNextStep())
							.then(Utils.checkLoadingIsGone());
					}
				} else {
					for (i = 0; i < configSteps.length; i++) {
						step = configSteps[i];

						if (!step.noEditable)
							break;
					}
				}

				return parent
					.then(indexPage.modifyStep(step))
					.then(Utils.checkLoadingIsGone())
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isOk(submittable, 'El botón de confirmación está deshabilitado');
					});
			};
		},
		modifyFieldInEditionStep = function() {

			return function() {

				var countSteps = configSteps.length,
					step,
					parent = this.parent;

				for (var i = 0; i < countSteps; i++) {

					if (!configSteps[i].noEditable) {

						step = configSteps[i];

						parent = parent
							.then(indexPage.modifyStep(step))
							.then(Utils.checkLoadingIsGone());

						if (i + 1 !== countSteps) {
							parent = parent
								.then(indexPage.goNextStep())
								.then(Utils.checkLoadingIsGone());
						}
					}
				}

				return parent
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isOk(submittable, 'El botón de confirmación está deshabilitado');
					});
			};
		},
		goActionStepAndClickCssSelector = function(action, cssSelector) {

			return function() {

				var countSteps = configSteps.length,
					parent = this.parent;

				if (countSteps > 1) {

					for (var i = 1; i < countSteps; i++) {

						if (!configSteps[i].noEditable) {

							if (cssSelector) {
								parent = parent.then(Utils.clickDisplayedElement(cssSelector));
							}

							parent = parent.then(indexPage[action]())
								.then(Utils.checkLoadingIsGone());
						}
					}
				}

				if (cssSelector) {
					parent = parent.then(Utils.clickDisplayedElement(cssSelector));
				}

				return parent;
			};
		},
		checkNotSubmitting = function() {

			return function() {

				return this.parent
					.then(indexPage.getSubmittability())
					.then(function(submittable) {

						assert.isNotOk(submittable, 'El botón de confirmación está habilitado');
					});
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new WizardPage(this);
				this.externalContext.setIndexPage(indexPage);

				configSteps = Utils.getProperties(this, 'configSteps');
				startEditingFromStep = Utils.getProperties(this, 'startEditingFromStep');
			},

			tests: {

				Should_ForbidDataSubmitting_When_EnterEditingPage: function() {

					return this.remote
						.then(checkNotSubmitting());
				},

				Should_ForbidDataSubmitting_When_ClickClearButton: function() {

					return this.remote
						.then(goActionStepAndClickCssSelector('goNextStep'))
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.clearButton))
						.then(checkNotSubmitting());
				},

				Should_ForbidDataSubmitting_When_ClickResetButton: function() {

					return this.remote
						.then(goActionStepAndClickCssSelector('goNextStep'))
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.resetButton))
						.then(checkNotSubmitting());
				},

				Should_GoToNextEditionStep_When_ClickInGoToNextButton: function() {

					if (configSteps.length > 1) {

						return this.remote
							.then(indexPage.goNextStep());
					} else {
						assert.lengthOf(configSteps, 1, 'La edición no contiene ningún paso');
					}
				},

				Should_GoToLastEditionStep_When_ClickSuccessivelyInGoToNextButton: function() {

					var countSteps = configSteps.length;

					if (countSteps > 1) {

						var parent = this.remote;

						for (var i = 0; i < countSteps; i++) {

							if (!configSteps[i].noEditable) {
								parent = parent
									.then(indexPage.goNextStep())
									.then(Utils.checkLoadingIsGone());
							}
						}

						return parent;
					} else {
						assert.lengthOf(configSteps, 1, 'La edición no contiene ningún paso');
					}
				},

				Should_GoToInitEditionStep_When_ClickSuccessivelyInGoToPrevButton: function() {

					var countSteps = configSteps.length;

					if (countSteps > 1) {

						var parent = this.remote;

						for (var i = 0; i < countSteps; i++) {

							if (!configSteps[i].noEditable) {
								parent = parent
									.then(indexPage.goNextStep())
									.then(Utils.checkLoadingIsGone());
							}
						}

						for (i = 0; i < countSteps; i++) {

							if (!configSteps[i].noEditable) {
								parent = parent
									.then(indexPage.goPrevStep())
									.then(Utils.checkLoadingIsGone());
							}
						}

						return parent;
					} else {
						assert.lengthOf(configSteps, 1, 'La edición no contiene ningún paso');
					}
				},

				Should_AllowDataSubmitting_When_ModifyAnyFieldInEditionStep: function() {

					return this.remote
						.then(modifyAnyFieldInEditionStep());
				},

				Should_AllowDataSubmitting_When_ModifyFieldInEditionStep: function() {

					return this.remote
						.then(modifyFieldInEditionStep());
				},

				Should_AllowDataSubmitting_When_ModifyFieldAndClear: function() {

					return this.remote
						.then(modifyFieldInEditionStep())
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.clearButton))
						.then(checkNotSubmitting());
				},

				Should_AllowDataSubmitting_When_ModifyFieldAndReset: function() {

					return this.remote
						.then(modifyFieldInEditionStep())
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.resetButton))
						.then(checkNotSubmitting());
				},

				Should_AllowDataSubmitting_When_ModifyFieldAndResetAndModifyField: function() {

					return this.remote
						.then(modifyFieldInEditionStep())
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.resetButton))
						.then(modifyFieldInEditionStep());
				},

				Should_AllowDataSubmitting_When_ModifyFieldAndClearAndReset: function() {

					return this.remote
						.then(modifyFieldInEditionStep())
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.clearButton))
						.then(goActionStepAndClickCssSelector('goNextStep', Config.selector.resetButton))
						.then(checkNotSubmitting());
				},

				Should_AllowDataSubmitting_When_ModifyFieldAndClearAndResetAndModifyField: function() {

					return this.remote
						.then(modifyFieldInEditionStep())
						.then(goActionStepAndClickCssSelector('goPrevStep', Config.selector.clearButton))
						.then(goActionStepAndClickCssSelector('goNextStep', Config.selector.resetButton))
						.then(goActionStepAndClickCssSelector('goPrevStep'))
						.then(modifyFieldInEditionStep());
				}
			}
		}
	});
});
