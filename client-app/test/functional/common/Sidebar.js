define([
	'test/support/pages/Login'
	, 'test/support/Config'
	, 'test/support/Utils'
], function(
	LoginPage
	, Config
	, Utils
) {

	var indexPage,

		timeout = 300000,
		allowedModulesKey = 'REDMIC_allowedModules',
		credentials = Config.credentials,
		userRole = credentials.userRole,
		suiteName = 'Sidebar component as ' + userRole + ' tests';


	function testPrimaryEntries(name, path) {

		return function() {

			var context = this.parent;

			if (!path) {
				return context;
			}

			context = context
				.then(testPrimaryEntry(name))
				.then(Utils.checkLoadingIsGone())
				.then(function() {

					return this.parent
						.get('home')
						.then(Utils.checkLoadingIsGone());
				});

			return context;
		};
	}

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

			if (!innerModules) {
				return context;
			}

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

	function testSidebarEntries(/*Boolean*/ secondaryEntriesFlag, dfd) {

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
					context = context
						.then(testPrimaryEntries(name, path));
				} else {
					context = context
						.then(testSecondaryEntries(name, innerModules));
				}
			}

			context = context.then(dfd.callback(function() {}));

			return context;
		};
	}

	function readLocalStorage() {

		return this.session.getLocalStorageItem(allowedModulesKey);
	}

	function clearLocalStorage() {

		return this.session.clearLocalStorage();
	}

	var registerSuite = intern.getInterface('object').registerSuite;

	registerSuite(suiteName, {
		Should_BeAbleToNavigateToSidebarPrimaryModules_When_ReceiveAllowedModules: function() {

			var dfd = this.async(timeout);

			indexPage = new LoginPage(this);

			return indexPage
				.login()
				.then(readLocalStorage)
				.then(testSidebarEntries(false, dfd))
				.then(clearLocalStorage);
		},

		Should_BeAbleToNavigateToSidebarSecondaryModules_When_ReceiveAllowedModules: function() {

			var dfd = this.async(timeout);

			indexPage = new LoginPage(this);

			return indexPage
				.login()
				.then(readLocalStorage)
				.then(testSidebarEntries(true, dfd))
				.then(clearLocalStorage);
		}
	});
});
