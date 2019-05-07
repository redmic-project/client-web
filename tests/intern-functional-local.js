module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internFunctional = require('./_intern-functional')(args),

		serverUrl = args.serverUrl || 'http://localhost:3050',

		config = {
			serverUrl: serverUrl
		};

	return deepmerge(_internFunctional, config, {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
