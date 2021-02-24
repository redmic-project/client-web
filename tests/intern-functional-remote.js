module.exports = function(args) {

	var deepmerge = require('deepmerge'),
		_internFunctional = require('./_intern-functional')(args),
		_remote = require('./_remote')(args);

	return deepmerge.all([_internFunctional, _remote], {
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
