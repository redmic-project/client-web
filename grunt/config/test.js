module.exports = function(grunt) {

	grunt.registerTask('defineTestConfig',
		'Define las configuraciones de testeo del proyecto',
		function() {

		var path = require('path'),
			deepmerge = require('deepmerge'),

			gruntTaskName = grunt.cli.tasks[0],

			rootPath = grunt.config('redmicConfig.rootPath'),
			srcPath = grunt.config('redmicConfig.srcPath'),
			testsPath = 'tests',
			outputPath = 'test_reports',

			ownServerHost = grunt.option('ownServerHost') || '',
			ownServerPort = parseInt(grunt.option('ownServerPort'), 10) || 9000,
			ownSocketPort = parseInt(grunt.option('ownSocketPort'), 10),
			ownTunnelPort = parseInt(grunt.option('ownTunnelPort'), 10),
			headless = grunt.option('headless') || false,
			serverUrl = grunt.option('server-url'),
			role = grunt.option('role'),
			user = grunt.option('user'),
			pass = grunt.option('pass'),
			suitesGroups = grunt.option('suitesGroups'),
			suites = grunt.option('suites'),
			functionalSuites = grunt.option('functionalSuites'),
			coverage = grunt.option('coverage'),

			currOutputDirName = gruntTaskName + '_on-port_' + ownServerPort,
			configDirName = '.config-' + ownServerPort,

			configPath = path.join(rootPath, outputPath, configDirName),
			reportersOutputPath = path.join(rootPath, outputPath, currOutputDirName),
			absoluteTestsPath = path.join(rootPath, testsPath),
			userDataDir = outputPath + '/' + configDirName;

		grunt.file['delete'](configPath);
		grunt.file['delete'](reportersOutputPath);
		grunt.file.mkdir(reportersOutputPath);

		if (!coverage && coverage === undefined) {
			coverage = [
				path.join(srcPath, 'app', '**', '*.js'),
				path.join(srcPath, 'redmic', '**', '*.js')
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

			testUnitLocalPath = path.join(absoluteTestsPath, 'intern-unit-local'),
			testUnitRemotePath = path.join(absoluteTestsPath, 'intern-unit-remote'),
			testFunctionalLocalPath = path.join(absoluteTestsPath, 'intern-functional-local'),
			testFunctionalRemotePath = path.join(absoluteTestsPath, 'intern-functional-remote'),
			dojoCommonBaseUrl = path.join(' ', srcPath, '*').trim(),

			testParams = {
				srcPath: srcPath,
				testsPath: testsPath,
				ownServerPort: ownServerPort,
				ownSocketPort: ownSocketPort,
				ownTunnelPort: ownTunnelPort,
				suitesGroups: suitesGroups
			},
			testUnitParams = deepmerge(testParams, {
				reporters: unitReporters,
				suites: suites,
				coverage: coverage,
				dojoBaseUrl: dojoCommonBaseUrl,
				userDataDir: userDataDir
			}),
			testFunctionalParams = deepmerge(testParams, {
				serverUrl: serverUrl,
				role: role,
				user: user,
				pass: pass,
				headless: headless,
				reporters: functionalReporters,
				functionalSuites: functionalSuites,
				reportersOutputPath: reportersOutputPath,
				dojoBaseUrl: '.' + dojoCommonBaseUrl,
				userDataDir: userDataDir
			}),

			testUnitLocalOptions = require(testUnitLocalPath)(testUnitParams),
			testUnitRemoteOptions = require(testUnitRemotePath)(deepmerge(testUnitParams, {
				ownServerHost: ownServerHost
			})),
			testFunctionalLocalOptions = require(testFunctionalLocalPath)(testFunctionalParams),
			testFunctionalRemoteOptions = require(testFunctionalRemotePath)(testFunctionalParams);

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
