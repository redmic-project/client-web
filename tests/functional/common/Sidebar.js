define([
	'dojo/_base/lang'
	, 'tests/support/pages/Login'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function (
	lang
	, LoginPage
	, Config
	, Utils
) {

	var indexPage,

		allowedModulesKey = 'REDMIC_allowedModules',
		credentials = Config.credentials,
		userRole = credentials.userRole,
		name = 'Sidebar component as ' + userRole + ' tests';


	function testPrimaryEntry(url) {

		return function() {

			var entrySelector = 'a[href="/' + url + '"]';

			return this.parent
				.then(Utils.clickElementAndCheckUrl(entrySelector, url));
		};
	}

	function testSecondaryEntries(name, innerModules) {

		return function() {

			var context = this.parent;

			for (var i = 0; i < innerModules.length; i++) {
				var innerModule = innerModules[i],
					innerModuleName = innerModule.name,
					hiddenInnerModule = innerModule.hidden;

				if (!hiddenInnerModule) {
					context = context
						.then(testSecondaryEntry(name, innerModuleName))
						.then(Utils.checkLoadingIsGone());
				}
			}

			return context;
		};
	}

	function testSecondaryEntry(parentClass, innerModuleName) {

		return function() {

			var childUrl = '/' + parentClass + '/' + innerModuleName;

			return this.parent
				.then(Utils.clickSidebarSecondaryCategoryAndCheckUrl(parentClass, childUrl));
		};
	}

	function testSidebarEntries() {

		return function(allowedModules) {

			var sidebarModules = JSON.parse(allowedModules).filter(function(val, i, arr) {

				return !val.hidden;
			});

			var context = this.parent;

			for (var i = 0; i < sidebarModules.length; i++) {
				var module = sidebarModules[i],
					name = module.name,
					path = module.internPath,
					innerModules = module.modules;

				if (path) {
					context = context
						.then(testPrimaryEntry(name));
				} else if (innerModules) {
					context = context
						.then(testSecondaryEntries(name, innerModules));
				}

				context = context
					.then(Utils.checkLoadingIsGone());
			}

			return context;
		};
	}

	var registerSuite = intern.getInterface('object').registerSuite;

	registerSuite(name, {
		Should_BeAbleToNavigateToAllModules_When_ReceiveAllowedModules: function() {

			indexPage = new LoginPage(this);

			return indexPage
				.login()
				.then(lang.partial(function(allowedModulesKey) {

					return this.session.getLocalStorageItem(allowedModulesKey);
				}, allowedModulesKey))
				.then(testSidebarEntries())
				.then(function() {

					return this.session.clearLocalStorage();
				});
		}
	});
});
