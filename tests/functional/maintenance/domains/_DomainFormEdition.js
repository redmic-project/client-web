define([
	'dojo/_base/declare'
	, 'tests/support/tests/FormAddition'
	, 'tests/support/tests/FormEdition'
	, './_DomainBase'
], function(
	declare
	, FormAdditionTests
	, FormEditionTests
	, _DomainBase
) {

	return declare(_DomainBase, {

		constructor: function(args) {

			this._registerCatalogPopupAdditionTests(this.namePrefix + ' addition' + this.nameSuffix);
			this._registerCatalogPopupEditionTests(this.namePrefix + ' edition' + this.nameSuffix);
		},

		_registerCatalogPopupAdditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: FormAdditionTests
			});
		},

		_registerCatalogPopupEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: FormEditionTests
			});
		}
	});
});
