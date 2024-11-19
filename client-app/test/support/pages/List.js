define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/Config'
	, 'test/support/Utils'
	, './_Page'
], function (
	declare
	, lang
	, Config
	, Utils
	, _Page
) {

	return declare(_Page, {

		constructor: function() {

			globalThis.listContainerWithoutLoadingSelector = this._getParentList() +
				'div.containerList' + Config.selector.notLoading;

			globalThis.listSelector = listContainerWithoutLoadingSelector + ' div.contentList';
			globalThis.listRowCheckboxSelector = 'div.check span';
			globalThis.listRowTitleTextSelector = 'span.title';
			globalThis.listRowSelector = 'div.containerRow';

			globalThis.listBottomAreaSelector = listContainerWithoutLoadingSelector + ' div.bottomList';
			globalThis.listSelectionBoxSelector = listBottomAreaSelector + ' > div.containerSelectionBox';

			globalThis.listSelectionBoxInputSelector = listSelectionBoxSelector + ' > div.selectionBox';
			globalThis.listSelectionCountSelector = listSelectionBoxInputSelector + ' > span:nth-child(2)';

			globalThis.listModeInputSelector = listSelectionBoxSelector + ' > div.seeSelection';
			globalThis.listModeInputSelectSelector = listModeInputSelector + ' > select';

			globalThis.listOrderSelector = listBottomAreaSelector + ' > div.orderZone > div.containerOrder';
		},

		_getParentList: function() {

			var config = this.externalContext.config;

			if (config.listIntabs) {
				return 'div.dijitTabContainerTopChildWrapper:not(.dijitHidden) ';
			} else if (config.listParentSelector) {
				return config.listParentSelector;
			}

			return '';
		},

		getElementByTextInRow: function(text) {

			var rowsSelector = listSelector + ' div.rowsContainer',
				path = "//div[contains(@class, 'containerRow') and contains(., '" + text + "')]";

			return function() {

				return this.parent
					.findDisplayedByCssSelector(rowsSelector)
						.findByXpath(path)
						.then(function(elementRow) {

							return elementRow;
						});
			};
		},

		selectRowListByText: function(text) {

			var rowsSelector = listSelector + ' div.rowsContainer',
				path = "//div[contains(@class, 'containerRow') and contains(., '" + text +
					"')]/div/div[@class='check']/span";

			return function() {

				return this.parent
					.findDisplayedByCssSelector(rowsSelector)
						.findByXpath(path)
						.then(function(elementRow) {

							return elementRow.click();
						})
					.then(Utils.checkLoadingIsGone());
			};
		},

		getElementIdRowsContainer: function() {

			return function() {

				return this.parent
					.findByCssSelector(listSelector + ' > div.rowsContainer')
						.then(function(element) {

							return element._elementId;
						}, function() {

							return -1;
						});
			};
		},

		getListRowHighlightedText: function(itemIndex) {

			var itemRowSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + itemIndex + ')',
				coincidentTextSelector = itemRowSelector + ' span.title em';

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.findAllByCssSelector(coincidentTextSelector)
						.getVisibleText();
			};
		},

		getListRowTitleText: function(itemIndex) {

			var itemRowSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + itemIndex + ')',
				rowTitleTextSelector = itemRowSelector + ' ' + listRowTitleTextSelector;

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.findDisplayedByCssSelector(rowTitleTextSelector)
						.getVisibleText();
			};
		},

		getLoadedListRowsTitleText: function() {

			var listRowsTitleTextSelector = listSelector + ' ' + listRowSelector + ' ' + listRowTitleTextSelector;

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.findAllByCssSelector(listRowsTitleTextSelector)
						.getVisibleText();
			};
		},

		getLoadedListRowsTitleId: function() {

			var listRowsTitleIdSelector = listSelector + ' ' + listRowSelector + ' ' + listRowTitleTextSelector;

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.findAllByCssSelector(listRowsTitleIdSelector)
						.then(function(elements) {

							var arrayResults = [];

							for (var i = 0; i < elements.length; i++) {
								var element = elements[i];

								arrayResults.push(element._elementId);
							}

							return arrayResults;
						});
			};
		},

		getEmptyListMessage: function() {

			var emptyListMessageSelector = listSelector + '.contentListNoData div.templatePlaceholderContainer';

			return function() {

				return this.parent
					.findDisplayedByCssSelector(emptyListMessageSelector);
			};
		},

		clickRowInfoButton: function(itemIndex) {

			return lang.hitch(this, this.clickRowButton)(itemIndex, 'fa-info-circle');
		},

		selectItem: function(itemIndex) {

			var itemRowSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + itemIndex + ')',
				checkboxSelector = itemRowSelector + ' ' + listRowCheckboxSelector;

			return lang.partial(function(self) {

				return lang.hitch(this, self._selectItem)(checkboxSelector);
			}, this);
		},

		_selectItem: function(checkboxSelector) {

			return this.parent
				.then(Utils.checkLoadingIsGone())
				.then(Utils.clickDisplayedElement(checkboxSelector))
				.then(Utils.checkLoadingIsGone());
		},

		getTotalItemsCount: function() {

			var listItemsCountSelector = listBottomAreaSelector + ' > div.totalResult > span:last-child';

			return function() {

				return this.parent
					.findDisplayedByCssSelector(listItemsCountSelector)
						.getVisibleText()
						.then(function(text) {

							return parseInt(text, 10);
						});
			};
		},

		getSelectedItemsCount: function() {

			return function() {

				return this.parent
					.findDisplayedByCssSelector(listSelectionCountSelector)
						.getVisibleText()
						.then(function(text) {

							return parseInt(text, 10);
						});
			};
		},

		selectAllItems: function() {

			var selectAllButtonSelector = 'div.itemMenu > i.fa.fa-check';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(listSelectionBoxInputSelector))
					.then(Utils.clickDisplayedElement(selectAllButtonSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		clearSelection: function() {

			var clearSelectionButtonSelector = 'div.itemMenu > i.fa-eraser';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(listSelectionBoxInputSelector))
					.then(Utils.clickDisplayedElement(clearSelectionButtonSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		invertSelection: function() {

			var invertSelectionButtonSelector = 'div.itemMenu > i.fa-exchange';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(listSelectionBoxInputSelector))
					.then(Utils.clickDisplayedElement(invertSelectionButtonSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		setModeToShowSelectedOnly: function() {

			var selectedOnlyOptionSelector = listModeInputSelectSelector + ' > option[value="selected"]';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(listModeInputSelectSelector))
					.then(Utils.clickDisplayedElement(selectedOnlyOptionSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		setModeToShowAll: function() {

			var allOptionSelector = listModeInputSelectSelector + ' > option[value="all"]';

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(listModeInputSelectSelector))
					.then(Utils.clickDisplayedElement(allOptionSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		setOrderingOption: function(orderOptionValue) {

			var newOrderOptionSelector = listOrderSelector + ' select option[value="' + orderOptionValue + '"]';

			return function() {

				return this.parent
					.then(Utils.clickElementTakingIntoAccountAlertify(newOrderOptionSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		toggleOrderingDirection: function() {

			var orderingDirectionButtonSelector = listOrderSelector + ' span.fa-sort-amount-asc';

			return function() {

				return this.parent
					.then(Utils.clickElementTakingIntoAccountAlertify(orderingDirectionButtonSelector))
					.then(Utils.checkLoadingIsGone());
			};
		},

		addItem: function(buttonSelector) {

			var addItemButtonSelector = buttonSelector || 'div.success i.fa-plus';

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickDisplayedElement(addItemButtonSelector));
			};
		},

		editItem: function(itemIndex) {

			return lang.hitch(this, this.clickRowButton)(itemIndex, 'fa-edit');
		},

		clickRowButton: function(itemIndex, iconSelector) {

			var itemRowSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + itemIndex + ')',
				buttonSelector = itemRowSelector + ' div.containerButtons i.' + iconSelector;

			return function() {

				return this.parent
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickDisplayedElement(buttonSelector));
			};
		},

		clickRowComboButton: function(itemIndex, iconSelector) {

			var itemRowSelector = listSelector + ' ' + listRowSelector + ':nth-child(' + itemIndex + ')',
				extendComboSelector = itemRowSelector + ' div.containerButtons div.comboButton div.fa-caret-down',
				buttonSelector = 'div.dijitPopup div.menuPopUpIconEdition a.' + iconSelector;

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(extendComboSelector))
					.then(Utils.clickDisplayedElement(buttonSelector));
			};
		}
	});
});
