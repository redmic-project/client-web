module.exports = function(grunt) {

	var preBuildCmds = ['npm install'];

	grunt.config('redmicConfig.buildModules', {
		'client-app/dep/pruneCluster': preBuildCmds.concat([
			'grunt build:dist --force'
		]),
		'client-app/dep/wicket': [
			'npm run build'
		],
		'client-app/dep/templates': preBuildCmds.concat([
			'grunt build'
		]),
		'client-app/style': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
