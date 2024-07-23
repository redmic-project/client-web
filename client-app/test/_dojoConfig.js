module.exports = function(args) {

	function _stringToJson(stringToConvert) {

		var stringWithKeysInDoubleQuotes = stringToConvert.replace(/(\w+):[ |\t\n]*('[^']*')?/g, '"$1": $2'),
			stringWithStringValuesInDoubleQuotes = stringWithKeysInDoubleQuotes.replace(/\'/g, '"'),
			stringifiedJson = '{' + stringWithStringValuesInDoubleQuotes + '}';

		return JSON.parse(stringifiedJson);
	}

	var fs = require('fs'),
		path = require('path'),

		srcPath = args.srcPath,
		dojoBaseUrl = args.dojoBaseUrl,

		dojoConfigFileName = 'dojoConfig.js',
		dojoConfigFileContent = fs.readFileSync(path.join(srcPath, dojoConfigFileName), 'utf8'),
		dojoConfigContentRegex = /^.*\n([^$]+)};[^$]$/g,
		dojoConfigStringValue = dojoConfigContentRegex.exec(dojoConfigFileContent)[1],
		dojoConfig = _stringToJson(dojoConfigStringValue);

	dojoConfig.baseUrl = dojoBaseUrl;

	dojoConfig.packages.push({
		name: 'test',
		location: '../../../test'
	});

	return dojoConfig;
};
