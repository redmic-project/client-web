const commander = require('commander');

module.exports = function(version) {

	commander
		.version(version)
		.option('-b, --use-built', 'Run using built resources, instead of requiring each one separately', false)
		.option('-c, --cluster', 'Run multiple processes in cluster mode, one per CPU core found', false)
		.option('-d, --debug', 'Run in debug mode, useful to show additional log output', false)
		.option('-l, --default-lang <value>', 'Set language used by default when none is specified at requests', 'es')
		.option('-p, --port <n>', 'Set network port used to expose app', 3050)
		.showSuggestionAfterError()
		.parse(process.argv);

	const commanderOpts = commander.opts();

	return {
		useBuilt: commanderOpts.useBuilt,
		cluster: commanderOpts.cluster,
		debug: commanderOpts.debug,
		lang: commanderOpts.defaultLang,
		port: commanderOpts.port
	};
};
