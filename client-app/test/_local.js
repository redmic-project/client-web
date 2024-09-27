module.exports = function(args) {

	var chromeDriverVersion = args.chromeDriverVersion,
		firefoxDriverVersion = args.firefoxDriverVersion;

	var drivers = [];

	var chromeDriver = {
		name: 'chrome'
	};

	if (chromeDriverVersion) {
		chromeDriver.version = chromeDriverVersion;

		var majorVersion = parseInt(chromeDriverVersion.split('.')[0], 10);

		if (majorVersion > 114) {
			chromeDriver.baseUrl = 'https://storage.googleapis.com/chrome-for-testing-public';
			chromeDriver.platform = 'linux64';
		}
	} else {
		var versionsUrl = 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json',
			driverErrorText = 'Internjs automatic lookup for Chrome driver version fails after v114.\n' +
				'Please, set a valid version using parameter: --chromeDriverVersion="a.b.c.d".\n' +
				'You can check latest stable version number at "' + versionsUrl + '".';

		throw new Error(driverErrorText);
	}

	drivers.push(chromeDriver);

	var firefoxDriver = {
		name: 'firefox'
	};

	if (firefoxDriverVersion) {
		firefoxDriver.version = firefoxDriverVersion;
	}

	drivers.push(firefoxDriver);

	var tunnelOptions = {
		drivers: drivers
	};

	var config = {
		tunnelOptions: tunnelOptions
	};

	return config;
};
