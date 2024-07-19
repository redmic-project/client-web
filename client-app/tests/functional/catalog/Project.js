define([
	'./_CatalogWithReport'
	, './_CatalogFilter'
], function (
	_CatalogWithReport
	, _CatalogFilter
) {

	var namePrefix = 'Project catalog page',
		urlValue = '/catalog/project-catalog';

	new _CatalogWithReport({
		namePrefix,
		urlValue,
		textSearchValue: 'Red Natura 2000'
	});

	new _CatalogFilter({
		namePrefix,
		urlValue,
		onlyAdministrator: true
	});
});
