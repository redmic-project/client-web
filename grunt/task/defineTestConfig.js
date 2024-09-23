module.exports = function(grunt) {

	grunt.registerTask('defineTestConfig',
		'Define las configuraciones de testeo del proyecto',
		function() {

		var path = require('path'),
			deepmerge = require('deepmerge'),

			gruntTaskName = grunt.cli.tasks[0],

			rootPath = grunt.config('redmicConfig.rootPath'),
			srcPath = grunt.config('redmicConfig.srcPath'),
			testPath = grunt.config('redmicConfig.testPath'),
			outputPath = 'test_reports',

			ownServerHost = grunt.option('ownServerHost') || '',
			ownServerPort = parseInt(grunt.option('ownServerPort'), 10) || 9000,
			ownSocketPort = parseInt(grunt.option('ownSocketPort'), 10),
			ownTunnelPort = parseInt(grunt.option('ownTunnelPort'), 10),
			browser = grunt.option('browser') || 'chrome',
			headless = grunt.option('headless') || false,
			grep = grunt.option('grep'),
			serverUrl = grunt.option('serverUrl'),
			role = grunt.option('role'),
			user = grunt.option('user'),
			pass = grunt.option('pass'),
			remoteHost = grunt.option('remoteHost'),
			remotePort = grunt.option('remotePort'),
			suitesGroups = grunt.option('suitesGroups'),
			suites = grunt.option('suites'),
			functionalSuites = grunt.option('functionalSuites'),
			coverage = grunt.option('coverage'),
			seleniumVersion = grunt.option('seleniumVersion'),
			chromeDriverVersion = grunt.option('chromeDriverVersion'),
			chromeBrowserVersion = grunt.option('chromeBrowserVersion'),
			firefoxDriverVersion = grunt.option('firefoxDriverVersion'),
			firefoxBrowserVersion = grunt.option('firefoxBrowserVersion'),

			currOutputDirName = gruntTaskName + '_on-port_' + ownServerPort,
			configDirName = '.config-' + ownServerPort,

			configPath = path.join(rootPath, outputPath, configDirName),
			reportersOutputPath = path.join(rootPath, outputPath, currOutputDirName),
			absoluteTestPath = path.join(rootPath, testPath),
			userDataDir = outputPath + '/' + configDirName;

		grunt.file['delete'](configPath);
		grunt.file['delete'](reportersOutputPath);
		grunt.file.mkdir(reportersOutputPath);

		if (!coverage && coverage === undefined) {
			coverage = [
				path.join(srcPath, '**', '*.js')
			];
		}

		var commonReporters = [{
				name: 'runner'
			},{
				name: 'customreporter',
				options: {
					filename: path.join(reportersOutputPath, 'runner.out')
				}
			},{
				name: 'junit',
				options: {
					filename: path.join(reportersOutputPath, 'runner.xml')
				}
			}],

			unitReporters = [{
				name: 'lcov',
				options: {
					directory: reportersOutputPath,
					filename: 'lcov.info'
				}
			},{
				name: 'htmlcoverage',
				options: {
					directory: reportersOutputPath
				}
			}].concat(commonReporters),

			functionalReporters = [].concat(commonReporters),

			testUnitLocalPath = path.join(absoluteTestPath, 'intern-unit-local'),
			testUnitRemotePath = path.join(absoluteTestPath, 'intern-unit-remote'),
			testFunctionalLocalPath = path.join(absoluteTestPath, 'intern-functional-local'),
			testFunctionalRemotePath = path.join(absoluteTestPath, 'intern-functional-remote'),

			ipGetterPath = path.join(absoluteTestPath, 'IpGetter'),
			IpGetter = require(ipGetterPath)(),
			localIp = IpGetter.getIp(),

			testParams = {
				srcPath: srcPath,
				testPath: testPath,
				ownServerPort: ownServerPort,
				ownSocketPort: ownSocketPort,
				ownTunnelPort: ownTunnelPort,
				suitesGroups: suitesGroups,
				browser: browser,
				headless: headless,
				grep: grep,
				userDataDir: userDataDir,
				seleniumVersion: seleniumVersion,
				chromeBrowserVersion: chromeBrowserVersion,
				firefoxBrowserVersion: firefoxBrowserVersion
			},
			localTestParams = {
				chromeDriverVersion: chromeDriverVersion,
				firefoxDriverVersion: firefoxDriverVersion
			},
			remoteTestParams = {
				ownServerHost: ownServerHost,
				remoteHost: remoteHost,
				remotePort: remotePort,
				localIp: localIp
			},
			testUnitParams = deepmerge(testParams, {
				reporters: unitReporters,
				suites: suites,
				coverage: coverage
			}),
			testFunctionalParams = deepmerge(testParams, {
				serverUrl: serverUrl,
				role: role,
				user: user,
				pass: pass,
				reporters: functionalReporters,
				functionalSuites: functionalSuites,
				reportersOutputPath: reportersOutputPath,
				dojoBaseUrlPrefix: '.'
			}),

			testUnitLocalOptions = require(testUnitLocalPath)(
				deepmerge(testUnitParams, localTestParams)),

			testUnitRemoteOptions = require(testUnitRemotePath)(
				deepmerge(testUnitParams, remoteTestParams)),

			testFunctionalLocalOptions = require(testFunctionalLocalPath)(
				deepmerge(testFunctionalParams, localTestParams)),

			testFunctionalRemoteOptions = require(testFunctionalRemotePath)(
				deepmerge(testFunctionalParams, remoteTestParams));

		grunt.config('intern', {
			'test-unit-local': {
				options: testUnitLocalOptions
			},
			'test-functional-local': {
				options: testFunctionalLocalOptions
			},
			'test-unit-remote': {
				options: testUnitRemoteOptions
			},
			'test-functional-remote': {
				options: testFunctionalRemoteOptions
			}
		});
	});
};
