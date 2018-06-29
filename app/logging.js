var morgan = require('morgan'),
	winston = require('winston');

var logConsoleTransport = new (winston.transports.Console)({
	level: 'silly',
	colorize: true,
	timestamp: true,
	prettyPrint: true,
	humanReadableUnhandledException: true
});

var logger = new (winston.Logger)({
	transports: [
		logConsoleTransport
	],
	exceptionHandlers: [
		logConsoleTransport
	],
	exitOnError: false
});

function registerLogger(params, app) {

	app.use(morgan('dev', {
		skip: function(req, res) {

			return params.useBuilt ? res.statusCode < 400 : false;
		},
		stream: {
			write: function(msg) {

				logger.info(msg.slice(0, -1));
			}
		}
	}));
}

module.exports = {
	registerAppLogger: registerLogger,
	logger: logger
};
