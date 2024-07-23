define([
	'dojo/_base/declare'
	, 'test/support/tests/FormAddition'
	, 'test/support/tests/ListHierarchical'
	, './_DomainBase'
], function(
	declare
	, FormAdditionTests
	, ListHierarchicalTests
	, _DomainBase
) {

	return declare(_DomainBase, {

		constructor: function(args) {

			this._registerListHierarchicalTests(this.namePrefix + ' hierarchical' + this.nameSuffix);
			this._registerChildAdditionTests(this.namePrefix + ' child addition' + this.nameSuffix);
		},

		_registerListHierarchicalTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListHierarchicalTests
			});
		},

		_registerChildAdditionTests: function(suiteName) {

			var firstRowSelector = 'div.contentList div.containerRow:first-child ',
				addButtonSelector = firstRowSelector + 'div.containerTopRow div.containerButtons i.fa.iconList.fa-plus';

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: FormAdditionTests,
				properties: {
					addButtonSelector: addButtonSelector
				}
			});
		}
	});
});
