module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internFunctional = require('./_intern-functional')(args),

		ownServerPort = args.ownServerPort,
		serverUrl = args.serverUrl || 'http://localhost:' + ownServerPort,

		config = {
			serverUrl: serverUrl
		};

	return deepmerge(_internFunctional, config, {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
