var commander = require('commander');

module.exports = function(version) {

	commander
		.version(version)
		.option('-b, --use-built', null)
		.option('-c, --cluster', null)
		.option('-d, --debug', null)
		.option('-l, --default-lang <value>', null, 'es')
		.option('-p, --port <n>', null, 3050)
		.parse(process.argv);

	return {
		useBuilt: commander.useBuilt || false,
		cluster: commander.cluster || false,
		debug: commander.debug || false,
		port: commander.port,
		lang: commander.defaultLang
	};
};
