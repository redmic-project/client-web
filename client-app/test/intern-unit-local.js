module.exports = function(args) {

	var deepmerge = require('deepmerge'),
		_internUnit = require('./_intern-unit')(args),
		_local = require('./_local')(args);

	return deepmerge.all([_internUnit, _local], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
