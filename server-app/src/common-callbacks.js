const production = !!parseInt(process.env.PRODUCTION, 10),
	apiUrl = process.env.API_URL;

let logger, params, version, robotsContent;

function onGeneralRequest(req, res) {

	res.render('index', {
		env: getEnv(req)
	});
}

function onActivateAccountRequest(req, res) {

	res.render('activateAccount', {
		env: getEnv(req),
		token: req.params.token
	});
}

function onNoSupportBrowserRequest(req, res) {

	res.render('noSupportBrowser', {
		env: getEnv(req)
	});
}

function on404Request(req, res) {

	res.status(404);
	res.render('404', {
		env: getEnv(req)
	});
}

function getEnv(req) {

	return {
		version: version,
		useBuilt: params.useBuilt,
		debug: params.debug,
		apiUrl: apiUrl,
		production: production,
		lang: getLang(req)
	};
}

function getLang(req) {

	return req && req.headers && req.headers['content-language'] || params.lang;
}

function onNullableJsRequest(_req, res) {

	res.set('Content-Type', 'text/javascript');
	res.send('');
}

function onUnknownRequest(_req, res, _next) {

	res.redirect('/404');
}

function onRobotsRequest(req, res) {

	res.set('Content-Type', 'text/plain');

	if (!robotsContent || !robotsContent.length) {
		const userAgentLine = 'User-agent: *\n';

		robotsContent = userAgentLine;

		if (production) {
			const apiPath = '/api',
				disallowApiLine = 'Disallow: ' + apiPath + '\n',
				allowAllLine = 'Allow: /\n',
				sitemapPath = 'https://' + req.hostname + '/sitemap.xml',
				sitemapLine = 'Sitemap: ' + sitemapPath;

			robotsContent += disallowApiLine + allowAllLine + '\n' + sitemapLine;
		} else {
			const disallowAllLine = 'Disallow: /';

			robotsContent += disallowAllLine;
		}
	}

	res.send(robotsContent);
}

module.exports = function(loggerParameter, paramsParameter, versionParameter) {

	logger = loggerParameter;
	params = paramsParameter;
	version = versionParameter;

	return {
		onGeneralRequest,
		onActivateAccountRequest,
		onNoSupportBrowserRequest,
		on404Request,
		onNullableJsRequest,
		onUnknownRequest,
		onRobotsRequest
	};
};
