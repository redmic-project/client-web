define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/Filter'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, FilterPage
	, Utils
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new FilterPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_BlockApply_When_Enter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.checkApplyFilter(false));
				},

				Should_NoUpdateData_When_clickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_NoUpdateData_When_clickResetAndCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.checkApplyFilter(false))
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_AllowApply_When_modifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.checkApplyFilter(true));
				},

				Should_NoUpdateData_When_modifyAndClickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_BlockApply_When_modifyAndClickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.checkApplyFilter(false));
				},

				Should_BlockApply_When_modifyFilterAndClickReset: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.checkApplyFilter(false));
				},

				Should_UpdateData_When_modifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_cancelAndModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_resetAndModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_modifyFilterAndDisableInputs: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.openFilter())
						.then(indexPage.disableInputs())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				}
			}
		}
	});
});
