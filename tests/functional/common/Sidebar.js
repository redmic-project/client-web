define([
	'dojo/_base/lang'
	, 'tests/support/pages/Login'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	lang
	, LoginPage
	, Config
	, Utils
) {

	var indexPage,

		allowedModulesKey = 'REDMIC_allowedModules',
		credentials = Config.credentials,
		userRole = credentials.userRole,
		suiteName = 'Sidebar component as ' + userRole + ' tests';


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

	function testSidebarEntries(/*Boolean*/ secondaryEntriesFlag) {

		return function(allowedModules) {

			var sidebarModules = JSON.parse(allowedModules).filter(function(val) {

				return !val.hidden;
			});

			var context = this.parent;

			for (var i = 0; i < sidebarModules.length; i++) {
				var module = sidebarModules[i],
					name = module.name,
					path = module.internPath,
					innerModules = module.modules;

				context = context
					.then(Utils.checkLoadingIsGone());

				if (!secondaryEntriesFlag) {
					if (!path) {
						continue;
					}
					context = context
						.then(testPrimaryEntry(name));

					continue;
				}

				if (!innerModules) {
					continue;
				}

				context = context
					.then(testSecondaryEntries(name, innerModules));
			}

			return context;
		};
	}

	function readLocalStorage() {

		return this.session.getLocalStorageItem(allowedModulesKey);
	}

	function clearLocalStorage() {

		return this.session.clearLocalStorage();
	}

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite(suiteName, {
		Should_BeAbleToNavigateToSidebarPrimaryModules_When_ReceiveAllowedModules: function() {

			indexPage = new LoginPage(this);

			return indexPage
				.login()
				.then(readLocalStorage)
				.then(testSidebarEntries(false))
				.then(clearLocalStorage, function() {

					lang.hitch(this, clearLocalStorage)();
					assert.fail('No se pudo recorrer todos los módulos con entrada primaria');
				});
		},

		Should_BeAbleToNavigateToSidebarSecondaryModules_When_ReceiveAllowedModules: function() {

			indexPage = new LoginPage(this);

			return indexPage
				.login()
				.then(readLocalStorage)
				.then(testSidebarEntries(true))
				.then(clearLocalStorage, function() {

					lang.hitch(this, clearLocalStorage)();
					assert.fail('No se pudo recorrer todos los módulos con entrada secundaria');
				});
		}
	});
});
