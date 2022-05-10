define([
	"./Utilities"
], function(
	Utilities
){
	var methods = {

		getActivityRankByPath: function(/*String*/ path, /*String?*/ pathSeparator) {

			var pathSplittedLength = Utilities.getPathDepth(path, pathSeparator);

			if (!pathSplittedLength)
				return null;

			if (pathSplittedLength === 2)
				return "program";

			if (pathSplittedLength === 3)
				return "project";

			if (pathSplittedLength === 4)
				return "activity";

			return null;
		}

	};

	return methods;
});