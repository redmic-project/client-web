module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internUnit = require('./_intern-unit')(args),
		_remote = require('./_remote')(args),

		ownServerHost = args.ownServerHost,
		ownServerPort = args.ownServerPort,
		ownResolvableHost;

	if (ownServerHost.length) {
		ownResolvableHost = ownServerHost;
	} else {
		var IpGetter = require('./IpGetter')();

		ownResolvableHost = IpGetter.getIp();
	}

	var ownServerUrl = 'http://' + ownResolvableHost + ':' + ownServerPort,
		config = {
			serverUrl: ownServerUrl
		};

	return deepmerge.all([_internUnit, _remote, config], {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
