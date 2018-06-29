define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListPage
	, Utils
	, _Commons
) {

	var indexPage,
		newOrderingValue,
		defaultOrderingValue = 'default',

		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListPage(this);
				this.externalContext.setIndexPage(indexPage);

				newOrderingValue = Utils.getProperties(this, 'newOrderingValue') || 'updated';
			},

			tests: {

				Should_UpdateListContent_When_ChangeOrderingValue: function() {

					var values = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, values))
						.then(indexPage.setOrderingOption(newOrderingValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							values.newTitles = textArr;
							Utils.notSameOrderedMembers(values.oldTitles, textArr,
								'Los elementos son los mismos tras reordenar el listado');
						}, values))
						.then(indexPage.setOrderingOption(defaultOrderingValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							Utils.notSameOrderedMembers(values.newTitles, textArr,
								'Los elementos son los mismos tras reordenar de vuelta');

							assert.sameMembers(values.oldTitles, textArr,
								'Los elementos no son los mismos que originalmente tras reordenar de vuelta');
						}, values));
				},

				Should_UpdateListContent_When_ChangeOrderingDirection: function() {

					var values = {};

					return this.remote
						.then(indexPage.setOrderingOption(newOrderingValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, values))
						.then(indexPage.toggleOrderingDirection())
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							Utils.notSameOrderedMembers(values.oldTitles, textArr,
								'Los elementos son los mismos tras reordenar el listado en la dirección opuesta');
						}, values));
				}
			}
		}
	});
});
