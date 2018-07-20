module.exports = function(args) {

	var path = require('path'),
		deepmerge = require('deepmerge'),
		_intern = require('./_intern')(args),
		_functions = require('./_functions'),

		testsPath = args.testsPath,
		role = args.role,
		user = args.user,
		pass = args.pass,
		headless = args.headless,
		suitesGroups = args.suitesGroups,
		functionalSuites = args.functionalSuites,

		pathPrefix = path.join(testsPath, 'functional'),
		config = {},
		propsMix = [_intern];

	if (functionalSuites) {
		config.functionalSuites = _functions.getParameterValueAsArray(functionalSuites);
	} else if (suitesGroups) {
		config.functionalSuites = _functions.getSuites(pathPrefix, suitesGroups);
	} else {
		var suitesLimitedByRole;

		if (role === 'guest') {
			suitesLimitedByRole = ['common', 'catalog', 'catalogDetails', 'viewers', 'products'];
		}

		var defaultFunctionalSuites = _functions.getSuites(pathPrefix, suitesLimitedByRole),
			excludePattern = '!' + path.join(pathPrefix, 'modules', '**');

		defaultFunctionalSuites.push(excludePattern);
		config.functionalSuites = defaultFunctionalSuites;
	}

	global.credentials = {
		userRole: role,
		userName: user,
		userPassword: pass
	};

	global.reportersOutputPath = args.reportersOutputPath;

	propsMix.push(config);

	if (headless) {
		var _headlessConfig = require('./_headlessConfig')(args);
		propsMix.push(_headlessConfig);
	}

	return deepmerge.all(propsMix, {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
