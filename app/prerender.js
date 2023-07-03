const prerenderNode = require('prerender-node'),
	prerenderUrl = process.env.PRERENDER_URL;

let logger;

prerenderNode.set('prerenderServiceUrl', prerenderUrl)
	.set('afterRender', afterRender);

function afterRender(err, req, _prerender_res) {

	if (err || !prerenderUrl) {
		const agent = req.get('User-Agent');

		if (!prerenderUrl) {
			logger.warn('"PRERENDER_URL" is undefined, serving non-static content to bot "%s"', agent);
		} else {
			logger.warn('Prerender error found, serving non-static content to bot "%s". %O', agent, err);
		}

		return { cancelRender: true };
	}
}

function registerPrerender(app) {

	app.use(prerenderNode);
}

module.exports = function(loggerParameter) {

	logger = loggerParameter;

	return {
		registerAppPrerender: registerPrerender
	};
};
