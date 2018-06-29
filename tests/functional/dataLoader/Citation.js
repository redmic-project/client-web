define([
	'tests/support/tests/Citation'
	, 'tests/support/tests/FormAddition'
	, 'tests/support/tests/FormEdition'
	, 'tests/support/tests/_DataLoader'
	, 'tests/support/Utils'
], function(
	CitationTests
	, FormAdditionTests
	, FormEditionTests
	, DataLoader
	, Utils
) {

	var urlValue = '/data-loader/activity/149/citation',
		namePrefix = 'Citation data loader page';

	new DataLoader({
		urlValue,
		textSearchValue: 'Brachytrichia quoyi',
		namePrefix
	});

	Utils.registerTests({
		suiteName: namePrefix + ' own tests',
		definition: CitationTests,
		properties: {
			urlValue
		}
	});

	Utils.registerTests({
		suiteName: namePrefix + ' addition tests',
		definition: FormAdditionTests,
		properties: {
			urlValue
		}
	});

	Utils.registerTests({
		suiteName: namePrefix + ' edition tests',
		definition: FormEditionTests,
		properties: {
			urlValue
		}
	});
});
