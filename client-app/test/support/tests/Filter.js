define([
	'dojo/_base/declare'
	, 'test/support/pages/Filter'
	, './_Commons'
], function (
	declare
	, FilterPage
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

				Should_NoUpdateData_When_ClickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_NoUpdateData_When_ClickResetAndCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.checkApplyFilter(false))
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_AllowApply_When_ModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.checkApplyFilter(true));
				},

				Should_NoUpdateData_When_CodifyAndClickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.checkChanges());
				},

				Should_BlockApply_When_ModifyAndClickCancelFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.checkApplyFilter(false));
				},

				Should_BlockApply_When_ModifyFilterAndClickReset: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.checkApplyFilter(false));
				},

				Should_UpdateData_When_ModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_CancelAndModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_ResetAndModifyFilter: function() {

					return this.remote
						.then(indexPage.openFilter())
						.then(indexPage.clickResetFilter())
						.then(indexPage.clickCancelFilter())
						.then(indexPage.openFilter())
						.then(indexPage.modifyFilter())
						.then(indexPage.clickApplyFilter())
						.then(indexPage.checkChanges(true));
				},

				Should_UpdateData_When_ModifyFilterAndDisableInputs: function() {

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
