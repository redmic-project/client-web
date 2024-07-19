define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/tests/_CatalogBase'
], function(
	declare
	, lang
	, _CatalogBase
) {

	new declare(_CatalogBase, {

		constructor: function(args) {

			this.config = {
				namePrefix: 'Activity data loader page',
				urlValue: '/data-loader',
				textSearchValue: 'Corales de las islas Canarias. Antozoos con esqueleto de los fondos litorales'
			};

			lang.mixin(this, this.config, args);

			this._registerListSelectionTests(this.namePrefix + ' selection ' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list ' + this.nameSuffix);

			this._registerListWithOrderTests(this.namePrefix + ' order list ' + this.nameSuffix);

			this._registerCatalogFacetsTests(this.namePrefix + ' facets ' + this.nameSuffix);

			this._registerCatalogFacetsTotalTests(this.namePrefix + ' facets total ' + this.nameSuffix);

			this._registerCatalogLinksTests(this.namePrefix + ' links ' + this.nameSuffix);
		}
	})();
});
