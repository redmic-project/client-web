module.exports = function(grunt) {

	var preBuildCmds = ['yarn install'];

	grunt.config('redmicConfig.buildModules', {
		'client-app/deps/pruneCluster': [
			'npm install',
			'grunt build:dist --force'
		],
		'client-app/deps/wicket': [
			'npm run build'
		],
		'client-app/deps/templates': preBuildCmds.concat([
			'grunt'
		]),
		'client-app/style': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
