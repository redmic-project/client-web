var path = require('path');

function getParameterValueAsArray(parameterValue) {

	return typeof parameterValue === 'string' ? parameterValue.split(',') : parameterValue;
}

function getSuitesGlobs(pathPrefix, suitesGroupsArray) {

	var suitesGroupsGlobs = [];

	for (var i = 0; i < suitesGroupsArray.length; i++) {
		var suitesGroup = suitesGroupsArray[i],
			globPrefix = '';

		if (suitesGroup[0] === '!') {
			suitesGroup = suitesGroup.slice(1);
			globPrefix = '!';
		}

		var suitesGroupGlob = globPrefix + path.join(pathPrefix, suitesGroup, '**', '*.js');

		suitesGroupsGlobs.push(suitesGroupGlob);
	}
	return suitesGroupsGlobs;
}

function getSuites(pathPrefix, suitesGroups) {

	if (!suitesGroups || !suitesGroups.length) {
		return [path.join(pathPrefix, '**', '!(*Script).js')];
	}

	return getSuitesGlobs(pathPrefix, getParameterValueAsArray(suitesGroups));
}

module.exports = {
	getParameterValueAsArray: getParameterValueAsArray,
	getSuitesGlobs: getSuitesGlobs,
	getSuites: getSuites
};
