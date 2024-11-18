define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/steps/Form'
	, 'test/support/Utils'
], function (
	declare
	, lang
	, FormStepPage
	, Utils
) {

	return declare(FormStepPage, {

		modify: function() {

			return this.complete();
		},

		complete: function(onlyRequired) {

			return lang.partial(function(self) {

				return this.parent
					.then(Utils.getFormFieldsProperties())
					.then(lang.partial(function(self, fieldsProperties) {

						var parent = this.parent;

						for (var i = 0; i < fieldsProperties.length; i++) {
							var fieldProps = fieldsProperties[i],
								fieldRequired = fieldProps.required;

							if (!onlyRequired || fieldRequired) {
								parent = self._modifyField(parent, fieldProps);
							}
						}

						return parent
							.findByCssSelector('div.twoColumnsLayout div.right > div.btnGroup > span:nth-child(2)')
								.click();
					}, self));
			}, this);
		}
	});
});
