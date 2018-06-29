var promClient = require('prom-client'),
	responseTime = require('response-time');

var register = promClient.register,
	counter = promClient.Counter,
	histogram = promClient.Histogram,
	summary = promClient.Summary,
	promPath;

var numOfRequests = new counter({
	name: 'numOfRequests',
	help: 'Number of requests made',
	labelNames: ['method']
});

var pathsTaken = new counter({
	name: 'pathsTaken',
	help: 'Paths taken in the app',
	labelNames: ['path']
});

var responses = new summary({
	name: 'responses',
	help: 'Response time in millis',
	labelNames: ['method', 'path', 'status']
});


function requestCounters(req, res, next) {

	if (req.path !== promPath) {
		numOfRequests.inc({ method: req.method });
		pathsTaken.inc({ path: req.path });
	}
	next();
}

function responseCounters(req, res, time) {

	if (req.url !== promPath) {
		responses.labels(req.method, req.url, res.statusCode)
			.observe(time);
	}
}

function injectMetricsRoute(app) {

	app.get(promPath, function(req, res) {

		res.set('Content-Type', register.contentType)
			.end(register.metrics());
	});
}

function registerMetrics(app) {

	app.use(requestCounters)
		.use(responseTime(responseCounters));

	injectMetricsRoute(app);

	promClient.collectDefaultMetrics();
}

module.exports = function(metricsPath) {

	promPath = metricsPath;

	return {
		registerAppMetrics: registerMetrics
	};
};
