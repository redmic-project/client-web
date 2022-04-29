var packageJson = require('../package.json'),
	version = packageJson.version,

	params = require('./params')(version),

	logging = require('./logging'),
	logger = logging.logger,
	cluster;

if (params.cluster) {
	cluster = require('cluster');
}

if (cluster && cluster.isMaster) {
	var numCpus = require('os').cpus().length;

	for (var i = 0; i < numCpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, _code, signal) {

		logger.error('worker %i died (%s)', worker.process.pid, signal);
	});
} else {
	var express = require('express'),
		http = require('http'),

		metrics = require('./metrics')(logger, '/metrics'),
		exposure = require('./exposure')(logger, params, version),

		port = params.port,
		debug = params.debug,
		pid = process.pid;

	var app = express();

	logging.registerAppLogger(params, app);
	metrics.registerAppMetrics(app);
	exposure.exposeApp(app);

	http.createServer(app).listen(port, function() {

		logger.verbose('REDMIC v%s (PID %i)', version, pid);
		logger.verbose('Listening on port %d (PID %i)', port, pid);
		debug && logger.verbose('Debug mode enabled (PID %i)', pid);
	});
}
