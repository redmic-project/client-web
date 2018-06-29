define([
	'./_CatalogWithReport'
	, './_CatalogFilter'
], function (
	_CatalogWithReport
	, _CatalogFilter
) {

	var namePrefix = 'Program catalog page',
		urlValue = '/catalog/program-catalog';

	new _CatalogWithReport({
		namePrefix,
		urlValue,
		textSearchValue: 'Red europea NATURA 2000'
	});

	new _CatalogFilter({
		namePrefix,
		urlValue,
		onlyAdministrator: true
	});
});
