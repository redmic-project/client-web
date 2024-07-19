define([
	'tests/functional/catalog/_CatalogWithReport'
], function (
	_CatalogWithReport
) {

	new _CatalogWithReport({
		namePrefix: 'Bibliography catalog page',
		urlValue: '/bibliography',
		textSearchValue: 'Die Hornkorallen (Gorgonaria) der Kanarischen Region',
		newOrderingValue: 'year'
	});
});
