define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/ListWithTextSearch'
	, 'test/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListWithTextSearchPage
	, Utils
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListWithTextSearchPage(this);

				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_UpdateListContent_When_FilteredByTextSearch: function() {

					var partialTextSearchValue = this.parent.externalContext.config.textSearchValue.slice(-3),
						valuesObj = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, valuesObj))
						.then(indexPage.setTextSearchInput(partialTextSearchValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							var oldTitles = values.oldTitles;

							if (oldTitles.length > 1) {
								Utils.notSameOrderedMembers(oldTitles, textArr,
									'No se ha actualizado el listado tras filtrar');
							}
						}, valuesObj));
				},

				Should_NotUpdateListContent_When_FilteredByTextSearchWithRepeatedText: function() {

					var partialTextSearchValue = this.parent.externalContext.config.textSearchValue.slice(-3),
						valuesObj = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(indexPage.setTextSearchInput(partialTextSearchValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, valuesObj))
						.then(indexPage.setTextSearchInput(partialTextSearchValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							var oldTitles = values.oldTitles;
							Utils.sameOrderedMembers(oldTitles, textArr, 'Se ha actualizado el listado tras filtrar');
						}, valuesObj));
				},

				Should_FindMatchingResult_When_FilteredByTextSearchSuggestion: function() {

					var partialTextSearchValue = this.parent.externalContext.config.textSearchValue.slice(0, 3),
						valuesObj = {};

					return this.remote
						.then(indexPage.typeInTextSearchInput(partialTextSearchValue))
						.then(indexPage.clickOnTextSearchFirstSuggestion())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTextSearchInputValue())
						.then(lang.partial(function(values, value) {

							values.suggestion = value;
						}, valuesObj))
						.then(indexPage.getListRowHighlightedText(1))
						.then(lang.partial(function(values, textArr) {

							var suggestion = values.suggestion;
							for (var i = 0; i < textArr.length; i++) {
								assert.include(suggestion, textArr[i], 'Se ha encontrado una coincidencia errónea');
							}
						}, valuesObj));
				},

				Should_CleanDataFilter_When_RemoveTextSearchValue: function() {

					var textSearchValue = this.parent.externalContext.config.textSearchValue,
						valuesObj = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, valuesObj))
						.then(indexPage.setTextSearchInput(textSearchValue))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.clearTextSearchInput())
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							var oldTitles = values.oldTitles;

							if (oldTitles.length > 1) {
								Utils.sameOrderedMembers(oldTitles, textArr,
									'Se ha mantenido el filtro tras limpiarlo');
							}
						}, valuesObj));
				},

				Should_ShowEmptyMessage_When_FilteredByWrongTextSearchValue: function() {

					var wrongTextSearchValue = 'jxvnbn xokzgod fjsogn';

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(indexPage.setTextSearchInput(wrongTextSearchValue))
						.then(indexPage.getEmptyListMessage());
				},

				Should_NotUpdateListContent_When_TypeInTextSearchWithoutPressingEnterKey: function() {

					var partialTextSearchValue = 'texto sin aplicar',
						valuesObj = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.partial(function(values, textArr) {

							values.oldTitles = textArr;
						}, valuesObj))
						.then(indexPage.typeInTextSearchInput(partialTextSearchValue))
						.then(indexPage.getLoadedListRowsTitleText())
						.then(lang.hitch(this, function(values, textArr) {

							Utils.sameOrderedMembers(values.oldTitles, textArr,
								'Los elementos son los mismos en el listado');
						}, valuesObj));
				}
			}
		}
	});
});
