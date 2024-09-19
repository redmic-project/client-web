module.exports = function(args) {

	var path = require('path'),
		dojoConfig = require('./_dojoConfig')(args),
		browserDojoConfig = JSON.parse(JSON.stringify(dojoConfig)),
		environments = require('./_environments')(args),

		testPath = args.testPath,
		coverage = args.coverage,
		reporters = args.reporters,
		grep = args.grep,

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
		name: 'chrome',
		baseUrl: 'https://storage.googleapis.com/chrome-for-testing-public',
		platform: 'linux64'
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
			'idle-timeout': 30,
			'fixSessionCapabilities': true
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
			script: path.join(testPath, 'support', 'CustomReporter.js')
		}]
	};

	if (coverage) {
		config.coverage = coverage;
	}

	if (reporters) {
		config.reporters = reporters;
	}

	if (grep) {
		config.grep = grep;
	}

	return config;
};
