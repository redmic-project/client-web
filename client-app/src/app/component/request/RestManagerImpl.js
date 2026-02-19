define([
	'dojo/_base/declare'
	, 'dojo/request/xhr'
	, 'dojo/request/notify'
	, 'src/app/component/request/_Auth'
	, 'src/app/component/request/_Params'
	, 'src/app/component/request/_Receive'
	, 'src/app/component/request/_Send'
	, 'src/app/component/request/RestManager'
], function(
	declare
	, requestXhr
	, requestNotify
	, _Auth
	, _Params
	, _Receive
	, _Send
	, RestManager
) {

	return declare([RestManager, _Send, _Receive, _Auth, _Params], {
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

			const opts = this._getOptionsWithAuthIfNeeded(url, options);

			return requestXhr(url, opts).response;
		}
	});
});
