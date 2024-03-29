module.exports = function(args) {

	var path = require('path'),
		dojoConfig = require('./_dojoConfig')(args),
		browserDojoConfig = JSON.parse(JSON.stringify(dojoConfig)),
		environments = require('./_environments')(args),

		testsPath = args.testsPath,
		coverage = args.coverage,
		reporters = args.reporters,

		seleniumVersion = args.seleniumVersion,
		chromeVersion = args.chromeVersion,
		firefoxVersion = args.firefoxVersion,

		ownServerPort = args.ownServerPort,
		ownSocketPort = args.ownSocketPort,
		ownTunnelPort = args.ownTunnelPort,

		socketPort = ownSocketPort || ownServerPort + 1,
		tunnelPort = ownTunnelPort || ownServerPort + 2;

	delete dojoConfig.deps;

	var drivers = [];

	var chromeDriver = {
		name: 'chrome'
	};

	if (chromeVersion) {
		chromeDriver.version = chromeVersion;
	}

	drivers.push(chromeDriver);

	var firefoxDriver = {
		name: 'firefox'
	};

	if (firefoxVersion) {
		firefoxDriver.version = firefoxVersion;
	}

	drivers.push(firefoxDriver);

	var tunnelOptions = {
		port: tunnelPort,
		drivers: drivers
	};

	if (seleniumVersion) {
		tunnelOptions.version = seleniumVersion;
	}

	var config = {
		capabilities: {
			'idle-timeout': 30
		},

		environments: environments,

		serverPort: ownServerPort,
		socketPort: socketPort,

		tunnelOptions: tunnelOptions,

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
