define([
	'./_CatalogWithReport'
	, './_CatalogFilter'
], function (
	_CatalogWithReport
	, _CatalogFilter
) {

	var namePrefix = 'Activity catalog page',
		urlValue = '/catalog/activity-catalog';

	new _CatalogWithReport({
		namePrefix,
		urlValue,
		textSearchValue: 'Datos meteorológicos registrados por la boya de Granadilla'
	});

	new _CatalogFilter({
		namePrefix,
		urlValue
	});
});
