define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'RWidgets/Utilities'
	, 'test/support/pages/steps/Form'
	, 'test/support/pages/ListHierarchical'
	, 'test/support/Utils'
	, 'test/support/Config'
], function (
	declare
	, lang
	, Utilities
	, FormStepPage
	, ListHierarchicalPage
	, Utils
	, Config
) {

	return declare([ListHierarchicalPage, FormStepPage], {

		constructor: function(args) {

			this._fields = args.fieldsByRelationData;
		},

		modify: function() {
			return this.complete();
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(lang.partial(function(self) {

						var parent = this.parent;

						for (var i = 0; i < self._fields.length; i++) {
							var fieldProps = self._fields[i],
								addField = true,
								skip = fieldProps instanceof Object ? fieldProps.skip : true;

							parent = parent.sleep(Config.timeout.shortSleep);

							if (!skip) {
								if (fieldProps.field) {
									parent = parent.then(lang.hitch(self, self._changedField)(parent, fieldProps));
									parent = parent.sleep(Config.timeout.shortSleep);
								}

								if (!fieldProps.auto) {
									parent = self._completeField(parent, fieldProps);
								}
							}

							if (addField) {
								parent = parent
									.findByCssSelector('div.containerFormAndKeypad div.keypad' +
										' div.right > div.btnGroup > span:nth-child(2)')
										.click()
										.end();
							}
						}

						return parent;
					}, self));
			}, this);
		},

		_completeField: function(parent, fieldProps) {

			if (fieldProps.columns) {
				parent = parent.then(lang.hitch(this, this._fillColumns)(parent, fieldProps));
			}

			if (fieldProps.type) {

				var fieldType = Utilities.capitalize(fieldProps.type),
					callbackName = '_fill' + fieldType + 'Type',
					callback = this[callbackName] || this._fillGenericInput;

				parent = parent.then(lang.hitch(this, callback)(parent, fieldProps));
			}

			return parent;
		},

		_fillColumns: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var value = fieldProps.columns,
					selector = 'div[data-redmic-model="columns/0"]';

				if (value === 'auto') {
					return parent
						.then(Utils.clickFirstOptionInSelect(selector));
				}

				return parent
					.then(Utils.clickOptionInSelect(selector, value));
			}, this);
		},

		_fillClassificationsType: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var selector = 'div[data-redmic-model="classifications/0"] div.rightContainer.selectOnPopup';

				return parent
					.then(Utils.clickElement(selector))
					.findByCssSelector('div.dialogSimple div.containerHierarchicalList')
						.then(self.clickRowInExpandButton(1))
						.then(self.clickSelectChild(1));
			}, this);
		},

		_fillGeometryType: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var selectorLon = 'div[data-redmic-model="columns/0"]',
					selectorLat = 'div[data-redmic-model="columns/1"]';

				return parent
					.then(Utils.clickOptionInSelect(selectorLon, fieldProps.columLongitud || 'longitud'))
					.then(Utils.clickOptionInSelect(selectorLat, fieldProps.columnLatitud || 'latitud'));
			}, this);
		},

		_changedField: function(parent, fieldProps) {

			return lang.partial(function(self) {

				var value = fieldProps.field,
					selector = 'div.titleContainer div.rightContainer';

				return parent
					.then(Utils.clickOptionInSelect(selector, value));
			}, this);
		}
	});
});
