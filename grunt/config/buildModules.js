module.exports = function(grunt) {

	var preBuildCmds = ['yarn install'];

	grunt.config('redmicConfig.buildModules', {
		'public/javascript/pdfjs': [
			'npm install',
			'gulp generic'
		],
		'public/javascript/pruneCluster': [
			'npm install',
			'grunt build:dist --force'
		],
		'public/javascript/redmic-widgets': preBuildCmds.concat([
			'grunt addModules buildModules'
		]),
		'public/javascript/templates': preBuildCmds.concat([
			'grunt'
		]),
		'public/stylesheets': preBuildCmds.concat([
			'grunt addModules buildModules'
		])
	});
};
