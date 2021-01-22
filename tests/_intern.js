module.exports = function(args) {

	var path = require('path'),
		dojoConfig = require('./_dojoConfig')(args),
		browserDojoConfig = JSON.parse(JSON.stringify(dojoConfig)),

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

		environments: [{
			browserName: 'chrome'
		},{
			browserName: 'firefox'
		/*},{
			browserName: 'internet explorer'*/
		}],

		serverPort: ownServerPort,
		socketPort: socketPort,

		tunnelOptions: {
			version: '3.141.59',
			port: tunnelPort,
			drivers: [{
				name: 'chrome',
				version: '87.0.4280.88'
			},{
				name: 'firefox',
				version: '0.29.0'
			}]
		},

		maxConcurrency: 3,
		defaultTimeout: 250000,
		leaveRemoteOpen: false,

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
