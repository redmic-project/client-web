module.exports = function(grunt) {

	var preBuildCmds = ['npm install'];

	grunt.config('redmicConfig.buildModules', {
		'client-app/dep/pruneCluster': preBuildCmds.concat([
			'grunt build:dist --force'
		]),
		'client-app/dep/wicket': preBuildCmds.concat([
			'npm run build'
		]),
		'client-app/dep/templates': preBuildCmds,
		'client-app/style': preBuildCmds
	});
};
