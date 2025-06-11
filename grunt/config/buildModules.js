module.exports = function(grunt) {

	let preBuildCmds = ['npm install'];

	const pdfjsAllowedOrigins = [
		'http://localhost',
		'https://ecomarcan.org',
		'https://en.ecomarcan.org',
		'https://ecomarcan.grafcan.es',
		'https://en.ecomarcan.grafcan.es'
	];

	const pdfjsAllowedOriginsConcat = '"' + pdfjsAllowedOrigins.join('", "') + '",',
		pdfjsAppFilepath = 'web/app.js';

	grunt.config('redmicConfig.buildModules', {
		'client-app/dep/pruneCluster': preBuildCmds.concat([
			'grunt build:dist --force > /dev/null'
		]),
		'client-app/dep/wicket': preBuildCmds.concat([
			'npm run build'
		]),
		'client-app/dep/pdfjs': preBuildCmds.concat([
			'! grep -q \'' + pdfjsAllowedOriginsConcat + '\' ' + pdfjsAppFilepath + ' && ' +
			'sed -Ei \'s/(const HOSTED_VIEWER_ORIGINS = new Set\\(\\[)/\\1\\n    ' +
				pdfjsAllowedOriginsConcat.replaceAll('/', '\\/') + '/g\' ' + pdfjsAppFilepath,
			'npx gulp minified',
			'npx gulp generic',
			'cp build/minified/build/pdf.worker.min.mjs build/generic/build/pdf.worker.mjs',
			'cp build/minified/build/pdf.min.mjs build/generic/build/pdf.mjs'
		]),
		'client-app/dep/templates': preBuildCmds,
		'client-app/style': preBuildCmds
	});
};
