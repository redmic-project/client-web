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
		//	summary:
		//		Implementación del módulo RestManager, que provee métodos de comunicación mediante dojo/request/xhr.
		//	description:
		//		También maneja errores de permisos en peticiones y les añade cabeceras de autenticación.
		//		Importante: el campo 'options' recibido en las peticiones desde otros módulos, sobreescribe directamente
		//		las opciones que se usarán a su vez para realizar la petición HTTP.

		//	apiUrl: String
		//		Prefijo de rutas hacia el servidor.

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
