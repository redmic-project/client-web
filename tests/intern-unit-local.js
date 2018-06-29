module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internUnit = require('./_intern-unit')(args),

		serverHost = 'http://localhost',
		serverPort = args.ownServerPort,
		serverUrl = serverHost + ':' + serverPort,

		config = {
			serverUrl: serverUrl
		};

	return deepmerge(_internUnit, config, {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
