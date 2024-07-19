module.exports = function(grunt) {

	var preBuildCmds = ['yarn install'];

	grunt.config('redmicConfig.buildModules', {
		'client-app/javascript/pruneCluster': [
			'npm install',
			'grunt build:dist --force'
		],
		'client-app/javascript/wicket': [
			'npm run build'
		],
		'client-app/javascript/templates': preBuildCmds.concat([
			'grunt'
		]),
		'client-app/stylesheets': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
