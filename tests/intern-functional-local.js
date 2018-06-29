module.exports = function(args) {

	var deepmerge = require('deepmerge'),

		_internFunctional = require('./_intern-functional')(args),

		config = {
			serverUrl: 'http://redmic.local'
		};

	return deepmerge(_internFunctional, config, {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
