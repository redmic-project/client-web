define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, ListPage
	, Utils
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert,
		detailsReport,
		reportButtonSelector;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListPage(this);
				this.externalContext.setIndexPage(indexPage);

				detailsReport = Utils.getProperties(this, 'detailsReport') || false;

				reportButtonSelector =
					Utils.getProperties(this, 'reportButtonSelector') || Config.selector.topbarReportButton;
			},

			tests: {

				Should_GenerateItemReport_When_ClickOnReportButtonAndSelectionIsSimple: function() {

					var values = {},
						parent = this.remote
							.then(this.parent.externalContext.rememberNotificationCount(values));

					if (!detailsReport)  {
						parent = parent
							.then(indexPage.selectItem(1));
					}

					return parent
						.then(Utils.clickElement(reportButtonSelector))

						.then(this.parent.externalContext.verifyNotificationCount(values))
						.then(this.parent.externalContext.rememberLatestNotificationId(values))
						.then(this.parent.externalContext.verifyLatestNotificationUpdate(values));
				},

				Should_GenerateItemListReport_When_ClickOnReportButtonAndSelectionIsMultiple: function() {

					var alertSelector = Config.selector.alert,
						alertTextInputSelector = alertSelector + ' div.ajs-body input.ajs-input',
						alertSubmitButtonSelector = alertSelector + ' div.ajs-footer button.ajs-ok',
						values = {};

					if (detailsReport)  {
						return this.remote;
					}

					return this.remote
						.then(this.parent.externalContext.rememberNotificationCount(values))

						.then(indexPage.selectItem(1))
						.then(indexPage.selectItem(2))

						.then(Utils.clickElement(reportButtonSelector))
						.sleep(Config.timeout.veryShortSleep)
						.then(Utils.setInputValue(alertTextInputSelector, 'test'))
						.then(Utils.clickElement(alertSubmitButtonSelector))

						.then(this.parent.externalContext.verifyNotificationCount(values))
						.then(this.parent.externalContext.rememberLatestNotificationId(values))
						.then(this.parent.externalContext.verifyLatestNotificationUpdate(values));
				}
			}
		},

		rememberNotificationCount: function(values) {

			return lang.partial(function(values) {

				return this.parent
					.then(Utils.getNotificationCount())
					.then(lang.partial(function(values, count) {

						values.previousNotificationCount = count;
					}, values));
			}, values);
		},

		verifyNotificationCount: function(values) {

			return lang.partial(function(values) {

				var checkNotification = function(values) {

					return this
						.sleep(Config.timeout.longSleep)
						.then(Utils.getNotificationCount())
						.then(lang.partial(function(values, count) {

							if (values.count) {
								values.count ++;
							} else {
								values.count = 1;
							}

							if (values.count < 5 && count <= values.previousNotificationCount) {
								return this.parent
									.then(lang.hitch(this.parent, checkNotification, values));
							}

							assert.isAbove(count, values.previousNotificationCount,
								'No hay más notificaciones que antes de pedir el informe');

							return this.parent;
						}, values));
				};

				return this.parent
					.then(lang.hitch(this.parent, checkNotification, values));
			}, values);
		},

		rememberLatestNotificationId: function(values) {

			return lang.partial(function(values) {

				return this.parent
					.sleep(Config.timeout.veryShortSleep)
					.then(Utils.getLatestNotificationId())
					.then(lang.partial(function(values, id) {

						values.latestNotificationId = id;

						return this.parent;
					}, values));
			}, values);
		},

		verifyLatestNotificationUpdate: function(values) {

			return lang.partial(function(values) {

				var latestNotificationId = values.latestNotificationId;

				return this.parent
					.sleep(Config.timeout.veryShortSleep)
					.then(Utils.findUpdatedNotificationById(latestNotificationId));
			}, values);
		}
	});
});
