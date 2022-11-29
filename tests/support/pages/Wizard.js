define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/_Page'
	, 'tests/support/pages/steps/DoubleListFiltered'
	, 'tests/support/pages/steps/DoubleList'
	, 'tests/support/pages/steps/Form'
	, 'tests/support/pages/steps/FormList'
	, 'tests/support/pages/steps/LayerImage'
	, 'tests/support/pages/steps/LineGeometry'
	, 'tests/support/pages/steps/List'
	, 'tests/support/pages/steps/RelationData'
	, 'tests/support/pages/steps/ReorderLayerList'
	, 'tests/support/pages/steps/PointGeometry'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, _Page
	, DoubleListFilteredStepPage
	, DoubleListStepPage
	, FormStepPage
	, FormListStepPage
	, LayerImageStepPage
	, LineGeometryStepPage
	, ListStepPage
	, RelationDataStepPage
	, ReorderLayerListStepPage
	, PointGeometryStepPage
	, Utils
) {

	var wizardKeypadSelector = 'div.wizardNavigation > div.keypad',
		wizardNavigationButtonsGroupSelector = wizardKeypadSelector + ' div.right > div.btnGroup';

	return declare(_Page, {

		constructor: function(args) {

			this._stepPages = {
				args: args,
				definitions: {
					form: FormStepPage,
					formList: FormListStepPage,
					list: ListStepPage,
					doubleList: DoubleListStepPage,
					doubleListFiltered: DoubleListFilteredStepPage,
					layerImage: LayerImageStepPage,
					reorderLayerList: ReorderLayerListStepPage,
					pointGeometry: PointGeometryStepPage,
					lineGeometry: LineGeometryStepPage,
					relationData: RelationDataStepPage
				},
				instances: {}
			};
		},

		goNextStep: function() {

			var nextStepButtonSelector = wizardNavigationButtonsGroupSelector + ' > span:nth-child(2)';

			return function() {

				return this.parent
					.then(Utils.clickElementTakingIntoAccountAlertify(nextStepButtonSelector));
			};
		},

		goPrevStep: function() {

			var prevStepButtonSelector = wizardNavigationButtonsGroupSelector + ' > span:nth-child(1)';

			return function() {

				return this.parent
					.then(Utils.clickElementTakingIntoAccountAlertify(prevStepButtonSelector));
			};
		},

		getNextStep: function() {

			var nextButtonSelector = wizardNavigationButtonsGroupSelector + ' > span:nth-child(1)',
				disabledClass = 'dijitDisabled';

			return function() {

				return this.parent
					.findByCssSelector(nextButtonSelector)
						.getAttribute('class')
						.then(function(classname) {

							return classname.indexOf(disabledClass) === -1;
						});
			};
		},

		getPrevStep: function() {

			var prevButtonSelector = wizardNavigationButtonsGroupSelector + ' > span:nth-child(2)',
				disabledClass = 'dijitDisabled';

			return function() {

				return this.parent
					.findByCssSelector(prevButtonSelector)
						.getAttribute('class')
						.then(function(classname) {

							return classname.indexOf(disabledClass) === -1;
						});
			};
		},

		getSubmittability: function() {

			var submitButtonSelector = wizardNavigationButtonsGroupSelector + ' > span:nth-child(3)',
				disabledClass = 'dijitDisabled';

			return function() {

				return this.parent
					.findByCssSelector(submitButtonSelector)
						.getAttribute('class')
						.then(function(classname) {

							return classname.indexOf(disabledClass) === -1;
						});
			};
		},

		modifyStep: function(step) {

			return lang.partial(function(args) {

				var self = args.self,
					stepPage = self._getStepPage(args.step);

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.then(stepPage.modify());

			}, {
				self: this,
				step
			});
		},

		completeWizard: function(configSteps, onlyRequired) {

			return lang.partial(function (args) {

				var self = args.self,
					parent = this.parent,
					step;

				for (var i = 0; i < args.configSteps.length; i++) {
					step = args.configSteps[i];

						var stepPage = self._getStepPage(step);

						parent = parent
							.then(Utils.checkLoadingIsGone());

						if (!args.onlyRequired || step.required) {
							parent = parent
								.then(stepPage.complete(args.onlyRequired))
								.then(Utils.checkLoadingIsGone());
						}

						parent = parent
							.then(self.goNextStep());
				}

				return parent;

			}, {
				self: this,
				configSteps,
				onlyRequired
			});
		},

		completeWizardWithRequired: function(configSteps) {

			return this.completeWizard(configSteps, true);
		},

		_getStepPage: function(step) {

			var type = step.type,
				pageInstance /*= this._stepPages.instances[type]*/;

			if (!pageInstance) {
				var pageDefinition = this._stepPages.definitions[type],
					pageArgs = lang.mixin(this._stepPages.args, step.props || {});

				pageInstance = this._stepPages.instances[type] = new pageDefinition(pageArgs);
			}

			return pageInstance;
		}
	});
});
