let version;

try {
	const fs = require('fs');

	version = fs.readFileSync('/version', {
		encoding: 'utf8'
	}).trim();
} catch (e) {
	const packageJson = require('../package.json');

	version = packageJson.version;
}

const params = require('./src/params')(version),
	logging = require('./src/logging'),
	logger = logging.logger;

let cluster;

if (params.cluster) {
	cluster = require('cluster');
}

if (cluster && cluster.isMaster) {
	const numCpus = require('os').cpus().length;

	for (let i = 0; i < numCpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, _code, signal) {

		logger.error('worker %i died (%s)', worker.process.pid, signal);
	});
} else {
	const express = require('express'),
		http = require('http'),

		metrics = require('./src/metrics')(logger, '/metrics'),
		prerender = require('./src/prerender')(logger),
		exposure = require('./src/exposure')(logger, params, version),

		port = params.port,
		debug = params.debug,
		pid = process.pid,

		app = express();

	logging.registerAppLogger(params, app);
	metrics.registerAppMetrics(app);
	prerender.registerAppPrerender(app);
	exposure.exposeApp(app);

	http.createServer(app).listen(port, function() {

		logger.verbose('REDMIC %s (PID %i)', version, pid);
		logger.verbose('Listening on port %d (PID %i)', port, pid);
		debug && logger.verbose('Debug mode enabled (PID %i)', pid);
	});
}
