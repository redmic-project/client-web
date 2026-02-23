define([
	'dojo/_base/declare'
	, 'dojo/request/xhr'
	, 'dojo/request/notify'
	, 'src/app/component/request/RestManager'
], function(
	declare
	, requestXhr
	, requestNotify
	, RestManager
) {

	return declare(RestManager, {
		// summary:
		//   Implementación del componente RestManager, que provee comunicación mediante dojo/request/xhr.

		postCreate: function() {

			this.inherited(arguments);

			this._prepareRequestHandlers();
		},

		_prepareRequestHandlers: function() {

			requestNotify('error', err => this._requestErrorHandler(err));
		},

		_launchRequest: function(url, options) {

			return requestXhr(url, options).response;
		}
	});
});
