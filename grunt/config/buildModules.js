module.exports = function(grunt) {

	var preBuildCmds = ['yarn install'];

	grunt.config('redmicConfig.buildModules', {
		'public/javascript/pruneCluster': [
			'npm install',
			'grunt build:dist --force'
		],
		'public/javascript/wicket': [
			'npm run build'
		],
		'public/javascript/templates': preBuildCmds.concat([
			'grunt'
		]),
		'public/stylesheets': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
