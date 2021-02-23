module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internFunctional = require('./_intern-functional')(args),
		_remote = require('./_remote')(args),

		serverUrl = args.serverUrl;

	if (!serverUrl) {
		var IpGetter = require('./IpGetter')();
		serverUrl = 'http://' + IpGetter.getIp();
	}

	var config = {
		serverUrl: serverUrl
	};

	return deepmerge.all([_internFunctional, _remote, config], {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
