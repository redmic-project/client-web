module.exports = function(args) {

	var deepmerge = require('deepmerge'),
		_internFunctional = require('./_intern-functional')(args),
		_local = require('./_local')(args),

		ownServerPort = args.ownServerPort,
		serverUrl = args.serverUrl || 'http://localhost:' + ownServerPort,

		config = {
			serverUrl: serverUrl
		};

	return deepmerge.all([_internFunctional, _local, config], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
