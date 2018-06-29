intern.registerReporter('customreporter', function(options) {

	var fs = require('fs'),
		path = require('path'),
		moment = require('moment'),

		startMoment = moment(),
		skipCounter = 0,
		failCounter = 0,
		passCounter = 0,
		output;

	if (options && options.filename) {
		var filename = options.filename;
		if (path.dirname(filename) !== '.') {
			try {
				fs.mkdirSync(path.dirname(filename));
			} catch (error) {
				if (error.code !== 'EEXIST') {
					throw error;
				}
			}
		}
		output = fs.createWriteStream(filename);
	} else {
		console.error('Output filename not specified');
		return;
	}

	intern.on('runStart', function() {

		output.write('REDMIC custom tests reporter - started at: ');
		output.write(startMoment.format());
		output.write('\n');
	});

	intern.on('testEnd', function(test) {

		var secondsElapsed = test.timeElapsed / 1000,
			testStatus;

		if (test.skipped) {
			skipCounter++;
			testStatus = '[ SKIP ]';
		} else if (test.error) {
			failCounter++;
			testStatus = '[ FAIL ]';
		} else {
			passCounter++;
			testStatus = '[ PASS ]';
		}

		output.write('\t');
		output.write(testStatus);
		output.write(' ');
		output.write(test.name);
		output.write(' (');
		output.write(secondsElapsed.toString());
		output.write('s)\n');

		if (test.error) {
			output.write('\n');

			if (test.executor) {
				output.write(test.executor.formatError(test.error));
			} else {
				output.write(test.error.name);
				output.write(': ');
				output.write(test.error.stack);
			}

			output.write('\n\n');
		}
	});

	intern.on('suiteStart', function(suite) {

		var numTests = suite.numTests;

		output.write('\n');
		output.write(suite.name);
		output.write(' (');
		output.write(numTests.toString());
		output.write(' tests)\n');
	});

	intern.on('suiteEnd', function(suite) {

		if (!suite.parentId) {
			return;
		}

		if (suite.error) {
			output.write('\n');
			output.write(suite.executor.formatError(suite.error));
			output.write('\n\n');
		}

		var numTests = suite.numTests,
			numPassedTests = suite.numPassedTests,
			numFailedTests = suite.numFailedTests,
			numSkippedTests = suite.numSkippedTests;

		output.write('\n');
		output.write(suite.name);
		output.write(' summary: ');
		output.write(numTests.toString());
		output.write(' tests (');
		output.write('pass: ');
		output.write(numPassedTests.toString());
		output.write(', ');
		output.write('fail: ');

		if (suite.error) {
			var testsCount = (suite.tests && suite.tests.length) || 0,
				remainingTests = numTests - numPassedTests - numSkippedTests,
				missingTestsCount = testsCount - numPassedTests - numFailedTests - numSkippedTests;

			if (missingTestsCount) {
				failCounter += missingTestsCount;
			}
			output.write(remainingTests.toString());
		} else {
			output.write(numFailedTests.toString());
		}

		output.write(', ');
		output.write('skip: ');
		output.write(numSkippedTests.toString());
		output.write(')\n');
	});

	intern.on('runEnd', function() {

		var totalCount = passCounter + failCounter + skipCounter,
			endMoment = moment(),
			elapsedTime = endMoment.diff(startMoment),
			totalDuration = moment.duration(elapsedTime),
			totalHoursComponent = totalDuration.hours(),
			totalMinutesComponent = totalDuration.minutes(),
			totalSecondsComponent = totalDuration.seconds(),
			totalMilliseconds = totalDuration.asMilliseconds();

		output.write('\n\n********************************************************************************\n\n');
		output.write('\nSUMMARY:');

		output.write('\n\ttests: ');
		output.write(totalCount.toString());
		output.write('\n\t\tpass: ');
		output.write(passCounter.toString());
		output.write('\n\t\tfail: ');
		output.write(failCounter.toString());
		output.write('\n\t\tskip: ');
		output.write(skipCounter.toString());

		output.write('\n\ttime: ended at ');
		output.write(endMoment.format());
		output.write('\n\t\telapsed approximately ');
		output.write(totalDuration.humanize());
		output.write('\n\t\t');
		output.write(totalHoursComponent.toString());
		output.write('h ');
		output.write(totalMinutesComponent.toString());
		output.write('m ');
		output.write(totalSecondsComponent.toString());
		output.write('s (');
		output.write(totalMilliseconds.toString());
		output.write('ms)');

		output.end('\n', function() {

			output.destroy();
		});
	});
});
