define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/tests/_CatalogBase'
	, 'test/support/tests/Dashboard'
	, 'test/support/tests/FormEdition'
], function(
	declare
	, lang
	, _CatalogBase
	, DashboardTests
	, FormEditionTests
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this.config = {
				sidebarPrimaryValue: 'admin',
				sidebarSecondaryValue: '/admin/taxonomy',
				newOrderingValue: 'scientificName'
			};

			lang.mixin(this, this.config, args);

			this._registerDashboardTests(this.namePrefix + ' dashboard ' + this.nameSuffix);

			this._registerListSelectionTests(this.namePrefix + ' selection ' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list ' + this.nameSuffix);

			this._registerListWithOrderTests(this.namePrefix + ' order list ' + this.nameSuffix);

			this._registerCatalogFacetsTests(this.namePrefix + ' facets ' + this.nameSuffix);

			this._registerCatalogFacetsTotalTests(this.namePrefix + ' facets total ' + this.nameSuffix);

			this._registerCatalogPopupEditionTests(this.namePrefix + ' edition ' + this.nameSuffix);
		},

		_registerCatalogPopupEditionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: FormEditionTests
			});
		},

		_registerDashboardTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DashboardTests,
				properties: {
					dashboardValue: this.urlValue
				}
			});
		}
	});
});
