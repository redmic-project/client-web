const promClient = require('prom-client'),
	responseTime = require('response-time');

const register = promClient.register,
	counter = promClient.Counter,
	histogram = promClient.Histogram,
	summary = promClient.Summary;

let logger, promPath;

const numOfRequests = new counter({
	name: 'numOfRequests',
	help: 'Number of requests made',
	labelNames: ['method']
});

const pathsTaken = new counter({
	name: 'pathsTaken',
	help: 'Paths taken in the app',
	labelNames: ['path']
});

const responses = new summary({
	name: 'responses',
	help: 'Response time in millis',
	labelNames: ['method', 'path', 'status']
});


function requestCounters(req, _res, next) {

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

	app.get(promPath, function(_req, res) {

		res.set('Content-Type', register.contentType);

		const metricsPromise = register.metrics();

		metricsPromise.then(
			(function(response, value) {

				response.end(value);
			}).bind(null, res),
			(function(response, reason) {

				logger.error(reason);
				response.sendStatus(500);
			}).bind(null, res)
		);
	});
}

function registerMetrics(app) {

	app.use(requestCounters)
		.use(responseTime(responseCounters));

	injectMetricsRoute(app);

	promClient.collectDefaultMetrics();
}

module.exports = function(loggerParameter, metricsPath) {

	logger = loggerParameter;
	promPath = metricsPath;

	return {
		registerAppMetrics: registerMetrics
	};
};
