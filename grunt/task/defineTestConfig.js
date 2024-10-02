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

			ownServerPort = parseInt(grunt.option('ownServerPort'), 10) || 9000,
			ownSocketPort = parseInt(grunt.option('ownSocketPort'), 10),
			ownTunnelPort = parseInt(grunt.option('ownTunnelPort'), 10),
			browser = grunt.option('browser') || 'chrome',
			headless = grunt.option('headless') || false,
			grep = grunt.option('grep'),
			suitesGroups = grunt.option('suitesGroups'),
			seleniumVersion = grunt.option('seleniumVersion'),
			chromeBrowserVersion = grunt.option('chromeBrowserVersion'),
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
		}];

		var testPaths = {
			unit: {
				local: path.join(absoluteTestPath, 'intern-unit-local'),
				remote: path.join(absoluteTestPath, 'intern-unit-remote')
			},
			functional: {
				local: path.join(absoluteTestPath, 'intern-functional-local'),
				remote: path.join(absoluteTestPath, 'intern-functional-remote')
			}
		};

		var testParams = {
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
		};

		var testTargetName, testTargetConfig, testTypeName, testTypeConfig;

		var localTargetName = 'local';
		if (gruntTaskName.includes(localTargetName)) {
			var chromeDriverVersion = grunt.option('chromeDriverVersion'),
				firefoxDriverVersion = grunt.option('firefoxDriverVersion');

			testTargetName = localTargetName;
			testTargetConfig = {
				chromeDriverVersion: chromeDriverVersion,
				firefoxDriverVersion: firefoxDriverVersion
			};
		}

		var remoteTargetName = 'remote';
		if (gruntTaskName.includes(remoteTargetName)) {
			var ownServerHost = grunt.option('ownServerHost') || '',
				remoteHost = grunt.option('remoteHost'),
				remotePort = grunt.option('remotePort');

			var ipGetterPath = path.join(absoluteTestPath, 'IpGetter'),
				IpGetter = require(ipGetterPath)();

			testTargetName = remoteTargetName;
			testTargetConfig = {
				ownServerHost: ownServerHost,
				remoteHost: remoteHost,
				remotePort: remotePort,
				localIp: IpGetter.getIp()
			};
		}

		var unitTypeName = 'unit';
		if (gruntTaskName.includes(unitTypeName)) {
			var suites = grunt.option('suites'),
				coverage = grunt.option('coverage');

			var coveragePaths;
			if (!coverage && coverage === undefined) {
				coveragePaths = [
					path.join(srcPath, '**', '*.js')
				];
			}

			var unitReporters = [{
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
			}].concat(commonReporters);

			testTypeName = unitTypeName;
			testTypeConfig = deepmerge(testParams, {
				reporters: unitReporters,
				suites: suites,
				coverage: coveragePaths
			});
		}

		var functionalTypeName = 'functional';
		if (gruntTaskName.includes(functionalTypeName)) {
			var serverUrl = grunt.option('serverUrl'),
				role = grunt.option('role'),
				user = grunt.option('user'),
				pass = grunt.option('pass'),
				functionalSuites = grunt.option('functionalSuites');

			var functionalReporters = [].concat(commonReporters);

			testTypeName = functionalTypeName;
			testTypeConfig = deepmerge(testParams, {
				serverUrl: serverUrl,
				role: role,
				user: user,
				pass: pass,
				reporters: functionalReporters,
				functionalSuites: functionalSuites,
				reportersOutputPath: reportersOutputPath,
				dojoBaseUrlPrefix: '.'
			});
		}

		var testTaskName = ['test', testTypeName, testTargetName].join('-'),
			testDefinitionPath = testPaths[testTypeName][testTargetName],
			testTaskOptions = require(testDefinitionPath)(deepmerge.all([
				testParams, testTypeConfig, testTargetConfig
			])),
			internGruntConfig = {};

		internGruntConfig[testTaskName] = { options: testTaskOptions };

		grunt.config('intern', internGruntConfig);
	});
};
