define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'tests/support/pages/Login'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function (
	declare
	, lang
	, aspect
	, LoginPage
	, Config
	, Utils
) {

	return declare(null, {

		constructor: function(args) {

			this.config = {};
			lang.mixin(this.config, args);

			this._pages = {};

			aspect.after(this, "goToIndexPage", lang.hitch(this, this._afterGoToIndexPage));
		},

		getSuiteDefinition: function() {

			var suiteDefinition = lang.clone(this.suiteDefinition);

			this._addCommonsBefore(suiteDefinition);
			this._addBeforeEach(suiteDefinition);
			this._addAfterEach(suiteDefinition);

			return suiteDefinition;
		},

		_addCommonsBefore: function(suiteDefinition) {

			commonsBefore = lang.partial(function(self) {

				this.externalContext = self;

				this.externalContext.setPage('login', new LoginPage(this));
			}, this);

			if (!suiteDefinition.before) {
				suiteDefinition.before = commonsBefore;
			} else {
				aspect.before(suiteDefinition, 'before', commonsBefore);
			}
		},

		_addBeforeEach: function(suiteDefinition) {

			if (suiteDefinition.beforeEach) {
				return;
			}

			suiteDefinition.beforeEach = lang.partial(function(test) {

				return this.externalContext.goToIndexPage();
			});
		},

		_addAfterEach: function(suiteDefinition) {

			if (suiteDefinition.afterEach) {
				return;
			}

			suiteDefinition.afterEach = lang.partial(function(test) {

				return Utils.inspectAfterTests(test, this.remote);
			});
		},

		goToIndexPage: function() {

			var sidebarPrimaryValue = this.config.sidebarPrimaryValue,
				sidebarSecondaryValue = this.config.sidebarSecondaryValue,
				urlValue = this.config.urlValue,
				loginContext = this.login();

			if (urlValue) {
				return this._goToIndexPageByUrl(loginContext, urlValue);
			}

			if (!sidebarSecondaryValue) {
				return this._goToPrimaryIndexPage(loginContext, sidebarPrimaryValue);
			}

			return this._goToDescendantIndexPage(loginContext);
		},

		_goToPrimaryIndexPage: function(loginContext, sidebarPrimaryValue) {

			return loginContext
				.then(Utils.clickSidebarPrimaryCategoryAndCheckUrl(sidebarPrimaryValue));
		},

		_goToDescendantIndexPage: function(loginContext) {

			var sidebarPrimaryValue = this.config.sidebarPrimaryValue,
				sidebarSecondaryValue = this.config.sidebarSecondaryValue,
				dashboardValue = this.config.dashboardValue,

				secondaryContext = loginContext
					.then(Utils.clickSidebarSecondaryCategoryAndCheckUrl(sidebarPrimaryValue, sidebarSecondaryValue));

			if (!dashboardValue) {
				return secondaryContext;
			}

			return secondaryContext
				.then(Utils.clickDashboardButtonAndCheckUrl(dashboardValue));
		},

		_goToIndexPageByUrl: function(loginContext, urlValue) {

			var currentUrl = loginContext.session.baseUrl,
				targetUrl = currentUrl.substring(0, currentUrl.length - 1) + urlValue;

			return loginContext
				.get(targetUrl)
				.then(Utils.checkUrl(urlValue));
		},

		_afterGoToIndexPage: function(context) {

			var parent = context
				.sleep(Config.timeout.shortSleep)
				.then(Utils.checkLoadingIsGone());

			var callback = this.config.afterGoToIndexPage;

			if (callback) {
				return parent
					.then(callback())
					.then(Utils.checkLoadingIsGone());
			}

			return parent;
		},

		login: function() {

			return this.getLoginPage().login();
		},

		getPage: function(key) {

			return this._pages[key];
		},

		setPage: function(key, page) {

			this._pages[key] = page;
		},

		getLoginPage: function() {

			return this.getPage('login');
		},

		getIndexPage: function() {

			return this.getPage('index');
		},

		setIndexPage: function(page) {

			this.setPage('index', page);
		}
	});
});
