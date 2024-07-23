module.exports = function(args) {

	var deepmerge = require('deepmerge'),
		_internUnit = require('./_intern-unit')(args),
		_remote = require('./_remote')(args);

	return deepmerge.all([_internUnit, _remote], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
