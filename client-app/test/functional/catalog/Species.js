define([
	'./_CatalogWithReport'
	, 'test/support/tests/ListFilterByTree'
	, 'test/support/Utils'
], function (
	_CatalogWithReport
	, ListFilterByTree
	, Utils
) {

	var namePrefix = 'Species catalog page',
		urlValue = '/catalog/species-catalog';

	new _CatalogWithReport({
		namePrefix,
		urlValue,
		textSearchValue: 'Acartia (Acartia) negligens'
	});

	Utils.registerTests({
		suiteName: namePrefix + ' tree tests',
		definition: ListFilterByTree,
		properties: {
			urlValue
		}
	});
});
