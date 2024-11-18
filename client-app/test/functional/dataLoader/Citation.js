define([
	'test/support/tests/Citation'
	, 'test/support/tests/FormAddition'
	, 'test/support/tests/FormEdition'
	, 'test/support/tests/_DataLoader'
	, 'test/support/Utils'
], function(
	CitationTests
	, FormAdditionTests
	, FormEditionTests
	, DataLoader
	, Utils
) {

	var urlValue = '/data-loader/activity/120/citation',
		namePrefix = 'Citation data loader page';

	new DataLoader({
		urlValue,
		textSearchValue: 'Polydora langerhansi',
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
