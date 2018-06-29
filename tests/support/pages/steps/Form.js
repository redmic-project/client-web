define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'RWidgets/Utilities'
	, 'tests/support/pages/_Page'
	, 'tests/support/pages/ListHierarchical'
	, 'tests/support/Utils'
	, 'tests/support/Config'
], function (
	declare
	, lang
	, Utilities
	, _Page
	, ListHierarchicalPage
	, Utils
	, Config
) {

	return declare(_Page, {

		constructor: function(args) {

			this._valuesByInputModel = {
				mobile: "698745321",
				phone: "698745321",
				email: "redmic@redmic.es",
				url: "https://redmic.es",
				webpage: "https://redmic.es"
			};

			lang.mixin(this._valuesByInputModel, Utils.getProperties(this, 'valuesByInputModel') || {});

			this._valuesByInputType = {
				text: 'te',
				textarea: 'textarea',
				number: '2000',
				valueAndUnit: '10',
				colorPickerTextBox: '#531721',
				upload: Config.env.cwd + '/tests/support/resources/profile.png',
				range: '1'
			};
		},

		modify: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.getFormFieldsProperties())
					.then(function(fieldsProperties) {

						if (fieldsProperties.length) {
							return self._modifyField(this.parent, fieldsProperties[0]);
						}

						return;
					});
			}, this);
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.getFormFieldsProperties())
					.then(lang.hitch(this, self.manageFieldsProperties, self, onlyRequired));
			}, this);
		},

		manageFieldsProperties: function(self, onlyRequired, fieldsProperties) {

			var parent = this.parent;

			for (var i = 0; i < fieldsProperties.length; i++) {
				var fieldProps = fieldsProperties[i],
					fieldRequired = fieldProps.required;

				if (!onlyRequired || fieldRequired) {
					parent = self._modifyField(parent, fieldProps);
				}
			}

			return parent;
		},

		_getTypeForInput: function(fieldProps) {

			var types = {
					text: {
						method: 'setInputValue',
						selector: 'input.dijitInputInner'
					},
					number: {
						method: 'setInputValue',
						selector: 'input.dijitInputInner'
					},
					valueAndUnit: {
						method: 'setInputValue',
						selector: 'input.dijitInputInner'
					},
					textarea: {
						method: 'setInputValue',
						selector: 'textarea'
					},
					filter: {
						method: 'clickFirstOptionInFilteringSelect'
					},
					select: {
						method: 'clickFirstOptionInSelect',
						checkLoadingIsGone: true
					},
					date: {
						method: 'clickInDateTooltip'
					},
					dateTimeTextBox: {
						method: 'clickInDateTooltip'
					},
					range: {
						method: 'setInputValue',
						selector: 'input.dijitInputInner'
					},
					'boolean': {
						method: 'clickElement',
						selector: 'input.dijitCheckBoxInput'
					}
				};

			return types[fieldProps.type];
		},

		_getValueForInput: function(fieldProps) {

			var fieldType = fieldProps.type,
				fieldModel = fieldProps.name,
				valueByType = this._valuesByInputType[fieldType],
				valueByModel = this._valuesByInputModel[fieldModel];

			return valueByModel || valueByType;
		},

		_getDataRedmicModelSelector: function(fieldProps) {

			return 'div[data-redmic-model="' + fieldProps.name + '"] ';
		},

		_modifyField: function(parent, fieldProps) {

			var fieldType = Utilities.capitalize(fieldProps.type),
				callbackName = '_fill' + fieldType + 'Input',
				callback = this[callbackName] || this._fillGenericInput;

			return parent
				.then(lang.hitch(this, callback)(parent, fieldProps));
		},

		_fillGenericInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var type = self._getTypeForInput(fieldProps);

				if (!type) {
					return parent;
				}

				var value = self._getValueForInput(fieldProps),
					selector = self._getDataRedmicModelSelector(fieldProps) + (type.selector || '');

				if (type.checkLoadingIsGone) {
					parent = parent.then(Utils.checkLoadingIsGone());
				}

				return parent
					.then(Utils[type.method](selector, value));
			}, this);
		},

		_fillUploadInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var value = self._getValueForInput(fieldProps),
					selector = Config.selector.fileUploadInput;

				return parent
					.findByCssSelector(selector)
						.type(value)
						.sleep(Config.timeout.longSleep);

			}, this);
		},

		_fillDateRangeTextBoxInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var selectorButton = self._getDataRedmicModelSelector(fieldProps) + 'div.contentClick';

				return this.parent
					.then(Utils.clickElement(selectorButton))
					.then(Utils.clickElement('div.dateRangeComplex div.valueOptions span:last-child'))
					.then(Utils.clickElement('div.dateRangeComplex div.containerKeypad span.success'));
			}, this);
		},

		_fillPointInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.clickElement('div.embeddedButton span.danger'))
					.then(Utils.clickElement('div.map.leaflet-container'));

			}, this);
		},

		_fillMultiSelectInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var selectorButton = self._getDataRedmicModelSelector(fieldProps) + 'div.contentClick';

				return this.parent
					.then(Utils.clickElement(selectorButton))
					.sleep(Config.timeout.shortSleep)
					.findAllByCssSelector('div.dijitPopup div.containerContent > div.listMenu > div.itemMenu')
						.then(function(items) {

							var parent;

							for (var i = 0; i < items.length; i++) {
								parent = items[i].click();
							}

							return parent;
						})
						.end()
					.then(Utils.clickElement(selectorButton));
			}, this);
		},

		_fillSelectOnListPopupInput: function(parent, fieldProps) {

			var specificListSelector = 'div.dialogSimple div.containerHierarchicalList ';

			function expandItem(args, elements) {

				args.count++;

				return this
					.then(Utils.clickElement(specificListSelector + expandSelector + ':not(.hidden)'))
					.then(lang.hitch(this, proccesSelectItem, args));
			}

			function proccesSelectItem(args) {

				if (args.count >= Config.counter.findLoading) {

					this.setFindTimeout(Config.timeout.findElement);
					throw new Error('Limite de tiempo superado');
				}

				return this
					.sleep(Config.timeout.veryShortSleep)
					.then(Utils.clickDisplayedElementWithControlError(specificListSelector + listRowCheckboxSelector))
					.then(function(success) {

						if (success) {
							return this.parent;
						} else {
							return this.parent
								.then(lang.hitch(this, expandItem, args));
						}
					});
			}

			return lang.partial(function(self) {

				var selector = self._getDataRedmicModelSelector(fieldProps) + 'div.rightContainer.selectOnPopup',
					listHierarchicalPage = new ListHierarchicalPage(self);

				return parent
					.setFindTimeout(Config.timeout.shortFindElement)
					.then(Utils.clickElement(selector))
					.sleep(Config.timeout.shortSleep)
					.then(lang.hitch(this.parent, proccesSelectItem, {
						count: 0
					}))
					.setFindTimeout(Config.timeout.findElement)
					.sleep(Config.timeout.shortSleep);
			}, this);
		},

		_fillSwitchWithMapInput: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var selectorButton = self._getDataRedmicModelSelector(fieldProps) + 'div.leftContainerSwitch';

				return this.parent
					.then(Utils.clickElement(selectorButton))
					.findByCssSelector(self._getDataRedmicModelSelector(fieldProps) + 'div.containerDisableSwitch')
						.moveMouseTo()
						.end()
					.sleep(Config.timeout.longSleep);
			}, this);
		}
	});
});
