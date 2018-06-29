define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './List'
	, './steps/Form'
], function (
	declare
	, lang
	, Config
	, Utils
	, ListPage
	, FormPage
) {

	var filterContainerSelector = 'div.dijitPopup div.containerContent' +
			' div.compositeSearchInTooltip div.containerFormAndKeypad ',
		keypadFilterSelector = filterContainerSelector + 'div.keypad ',
		applyFilterSelector = 'div.right span.success',
		values = {};

	var assert = intern.getPlugin('chai').assert;

	return declare([ListPage, FormPage], {

		constructor: function(args) {

		},

		openFilter: function(buttonSelector) {

			if (!buttonSelector) {
				buttonSelector = 'div.keypadZone a.iconContainer i.fa-binoculars';
			}

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.checkLoadingIsGone())
						.then(lang.hitch(this, self.getLoadedListRowsTitleId)())
						.then(lang.partial(function(values, idArr) {

							values.oldIds = idArr;
						}, values))
					.then(Utils.clickDisplayedElement(buttonSelector));
			}, this);
		},

		clickCancelFilter: function() {

			return lang.hitch(this, this.clickButton)('div.left span.danger');
		},

		clickApplyFilter: function() {

			return lang.hitch(this, this.clickButton)(applyFilterSelector);
		},

		clickResetFilter: function() {

			return lang.hitch(this, this.clickButton)('div.right span.primary');
		},

		clickButton: function(buttonSelector) {

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(keypadFilterSelector + buttonSelector));
			};
		},

		getApplyFilter: function() {

			var disabledClass = 'dijitDisabled';

			return function() {

				return this.parent
					.findByCssSelector(keypadFilterSelector + applyFilterSelector)
						.getAttribute('class')
						.then(function(classname) {

							return classname.indexOf(disabledClass) === -1;
						});
			};
		},

		checkChanges: function(diff) {

			var message = 'Se aplico el filtro',
				method = 'sameOrderedMembers';

			if (diff) {
				message = 'No se aplico el filtro';
				method = 'notSameOrderedMembers';
			}

			return lang.partial(function(self) {

				return this.parent
					.then(lang.hitch(this, self.getLoadedListRowsTitleId)())
					.then(lang.partial(function(values, idArr) {

						var oldIds = values.oldIds;

						if (oldIds.length > 1) {
							Utils[method](oldIds, idArr, message);
						}
					}, values));
			}, this);
		},

		checkApplyFilter: function(active) {

			var message = 'El botón de aplicar está habilitado',
				method = 'isNotOk';

			if (active) {
				message = 'El botón de aplicar está deshabilitado';
				method = 'isOk';
			}

			return lang.partial(function(self) {

				return this.parent
					.then(lang.hitch(this, self.getApplyFilter)())
					.then(function(apply) {

						assert[method](apply, message);
					});
			}, this);
		},

		modifyFilter: function() {

			return lang.partial(function(self) {

				return this.parent
					.sleep(Config.timeout.shortSleep)
					.then(lang.hitch(self, self.complete)());
			}, this);
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.getFormFieldsProperties(true))
					.then(lang.hitch(this, self.manageFieldsProperties, self, onlyRequired));
			}, this);
		},

		disableInputs: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.getFormFieldsProperties(true))
					.then(lang.partial(function(self, fieldsProperties) {

						var parent = this.parent;

						for (var i = 0; i < fieldsProperties.length; i++) {
							var dataRemidSelector = self._getDataRedmicModelSelector(fieldsProperties[i]),
								selector = filterContainerSelector + dataRemidSelector + 'div.containerDisableSwitch';

							parent = parent
								.then(Utils.clickDisplayedElement(selector));
						}

						return parent;
					}, self));
			}, this);
		}
	});
});
