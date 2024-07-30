module.exports = function(grunt) {

	var preBuildCmds = ['yarn install'];

	grunt.config('redmicConfig.buildModules', {
		'client-app/dep/pruneCluster': [
			'npm install',
			'grunt build:dist --force'
		],
		'client-app/dep/wicket': [
			'npm run build'
		],
		'client-app/dep/templates': preBuildCmds.concat([
			'grunt'
		]),
		'client-app/style': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
