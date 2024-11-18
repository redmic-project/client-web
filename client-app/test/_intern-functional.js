module.exports = function(args) {

	var path = require('path'),
		deepmerge = require('deepmerge'),
		_intern = require('./_intern')(args),
		_functions = require('./_functions'),

		testPath = args.testPath,
		role = args.role,
		user = args.user,
		pass = args.pass,
		suitesGroups = args.suitesGroups,
		functionalSuites = args.functionalSuites,

		suitesPrefix = path.join(testPath, 'functional'),
		config = {};

	if (functionalSuites) {
		config.functionalSuites = _functions.getParameterValueAsArray(functionalSuites);
	} else if (suitesGroups) {
		config.functionalSuites = _functions.getSuites(suitesPrefix, suitesGroups);
	} else {
		var suitesLimitedByRole;

		if (role === 'guest') {
			suitesLimitedByRole = ['common', 'catalog', 'catalogDetails', 'viewers', 'products'];
		}

		var defaultFunctionalSuites = _functions.getSuites(suitesPrefix, suitesLimitedByRole),
			excludePattern = '!' + path.join(suitesPrefix, 'component', '**');

		defaultFunctionalSuites.push(excludePattern);
		config.functionalSuites = defaultFunctionalSuites;
	}

	globalThis.credentials = {
		userRole: role,
		userName: user,
		userPassword: pass
	};

	globalThis.reportersOutputPath = args.reportersOutputPath;

	return deepmerge.all([_intern, config], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
