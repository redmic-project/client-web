define([
	'dojo/_base/declare'
	, 'dojo/request/xhr'
	, 'src/app/component/request/RestManager'
], function(
	declare
	, requestXhr
	, RestManager
) {

	return declare(RestManager, {
		// summary:
		//   Implementación del componente RestManager, que provee comunicación mediante dojo/request/xhr.

		_launchRequest: function(url, options) {

			return requestXhr(url, options).response;
		}
	});
});
