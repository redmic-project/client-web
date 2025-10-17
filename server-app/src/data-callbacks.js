const http = require('http'),
	https = require('https'),

	configUrl = process.env.CONFIG_URL,
	configExpirationMs = 3600000,

	sitemapUrl = process.env.SITEMAP_URL,
	sitemapExpirationMs = 36000000;

let logger, externalRequest, configContent, configLastUpdated, sitemapContent, sitemapLastUpdated;

function onConfigRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!configContent || !configContent.length || req.query.forceRefresh ||
		configLastUpdated < Date.now() - configExpirationMs) {

		const afterResponseCallback = (successful, content) => {

			if (!successful) {
				configContent = '';
				return;
			}

			configContent = content;
			configLastUpdated = Date.now();
		};

		if (!configUrl || !configUrl.length) {
			logger.error('Missing config URL, set it using CONFIG_URL environment variable');
			res.send('{}');
			return;
		}

		const reqLibrary = configUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(configUrl, externalRequest.onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', externalRequest.onOwnRequestError.bind(this, res));

		internalReq.end();
	} else {
		res.send(configContent);
	}
}

function onSitemapRequest(_req, res) {

	res.set('Content-Type', 'text/xml');

	if (!sitemapContent || !sitemapContent.length || sitemapLastUpdated < Date.now() - sitemapExpirationMs) {
		const afterResponseCallback = (successful, content) => {

			if (!successful) {
				sitemapContent = '';
				return;
			}

			sitemapContent = content;
			sitemapLastUpdated = Date.now();
		};

		if (!sitemapUrl || !sitemapUrl.length) {
			logger.error('Missing sitemap URL, set it using SITEMAP_URL environment variable');

			const emptySitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset ' +
				'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"/>';

			res.send(emptySitemap);
			return;
		}

		const reqLibrary = sitemapUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(sitemapUrl, externalRequest.onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', externalRequest.onOwnRequestError.bind(this, res));

		internalReq.end();
	} else {
		res.send(sitemapContent);
	}
}

module.exports = function(loggerParameter, externalRequestParameter) {

	logger = loggerParameter;
	externalRequest = externalRequestParameter;

	return {
		onConfigRequest,
		onSitemapRequest
	};
};
