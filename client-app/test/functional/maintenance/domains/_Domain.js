define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/tests/Dashboard'
	, 'test/support/tests/ListWithOrder'
	, 'test/support/tests/ListWithTextSearch'
	, './_DomainBase'
], function(
	declare
	, lang
	, DashboardTests
	, ListWithOrderTests
	, ListWithTextSearchTests
	, _DomainBase
) {

	return declare(_DomainBase, {

		constructor: function(args) {

			this.config = {
				newOrderingValue: 'name'
			};

			lang.mixin(this, this.config, args);

			this._registerDashboardTests(this.namePrefix + ' dashboard' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list' + this.nameSuffix);

			this._registerListWithOrderTests(this.namePrefix + ' order list' + this.nameSuffix);
		},

		_registerDashboardTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DashboardTests,
				properties: {
					dashboardValue: this.urlValue
				}
			});
		},

		_registerListWithTextSearchTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListWithTextSearchTests,
				properties: {
					textSearchValue: this.textSearchValue,
					newOrderingValue: this.newOrderingValue
				}
			});
		},

		_registerListWithOrderTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListWithOrderTests,
				properties: {
					newOrderingValue: this.newOrderingValue
				}
			});
		}
	});
});
