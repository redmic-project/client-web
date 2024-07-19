module.exports = function(args) {

	var path = require('path'),
		deepmerge = require('deepmerge'),
		_intern = require('./_intern')(args),
		_functions = require('./_functions'),

		testsPath = args.testsPath,
		role = args.role,
		user = args.user,
		pass = args.pass,
		suitesGroups = args.suitesGroups,
		functionalSuites = args.functionalSuites,

		pathPrefix = path.join(testsPath, 'functional'),
		config = {};

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

	return deepmerge.all([_intern, config], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
