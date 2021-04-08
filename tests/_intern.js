module.exports = function(args) {

	var path = require('path'),
		dojoConfig = require('./_dojoConfig')(args),
		browserDojoConfig = JSON.parse(JSON.stringify(dojoConfig)),
		environments = require('./_environments')(args),

		testsPath = args.testsPath,
		coverage = args.coverage,
		reporters = args.reporters,
		ownServerPort = args.ownServerPort,
		ownSocketPort = args.ownSocketPort,
		ownTunnelPort = args.ownTunnelPort,

		socketPort = ownSocketPort || ownServerPort + 1,
		tunnelPort = ownTunnelPort || ownServerPort + 2;

	delete dojoConfig.deps;

	var config = {
		capabilities: {
			'idle-timeout': 30,
			fixSessionCapabilities: false
		},

		environments: environments,

		serverPort: ownServerPort,
		socketPort: socketPort,

		tunnelOptions: {
			version: '4.0.0-alpha-2',
			port: tunnelPort,
			drivers: [{
				name: 'chrome',
				version: '88.0.4324.96'
			},{
				name: 'firefox',
				version: '0.29.0'
			}]
		},

		maxConcurrency: 1,
		defaultTimeout: 250000,
		leaveRemoteOpen: false,
		showConfig: false,

		loader: {
			script: 'dojo',
			options: dojoConfig
		},

		browser: {
			loader: {
				script: 'dojo',
				options: browserDojoConfig
			}
		},

		reporters: ['pretty'],

		plugins: [{
			script: path.join(testsPath, 'support', 'CustomReporter.js')
		}]
	};

	if (coverage) {
		config.coverage = coverage;
	}

	if (reporters) {
		config.reporters = reporters;
	}

	return config;
};
