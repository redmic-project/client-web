define([
	'dojo/_base/declare'
	, 'src/redmicConfig'
], function(
	declare
	, redmicConfig
) {

	return declare(null, {
		// summary:
		//   Lógica de recepción de respuestas a peticiones del componente RestManager.

		_parseResponse: function(res) {

			// TODO usar res.data directamente cuando no se envuelva la respuesta con body
			var data = res.data;
			if (data && data.body) {
				data = data.body;
			}

			return {
				status: res.status,
				data: data,
				text: res.text,
				url: res.url,
				getHeader: res.getHeader,
				options: res.options
			};
		},

		_parseError: function(res) {

			var response = res.response,
				status = response.status,
				data = response.data,
				error = res.message;

			if (data) {
				// TODO usar response.data directamente cuando no se envuelva la respuesta con error
				if (data.error && data.error instanceof Object) {
					data = data.error;
				}

				if (data.code) {
					error += ' - ' + data.code;
				}

				if (data.description) {
					error += ' - ' + data.description;
				}
			}

			return {
				status: status,
				data: data,
				text: response.text,
				url: response.url,
				getHeader: response.getHeader,
				options: response.options,
				error: error
			};
		},

		_requestErrorHandler: function(err) {
			//	summary:
			//		Se ejecuta cuando un request produce un error y permite manejarlo
			//	tags:
			//		private
			//	err:
			//		respuesta con el error del request

			var res = err.response,
				status = res.status;

			this._emitEvt('ABORT_ALL_LOADING');

			if (status === 401) {
				this._onRequestPermissionError(res);
			} else if (status === 502) {
				this._onRequestReachabilityError(res);
			}
		},

		_onRequestPermissionError: function(res) {

			const url = res.url;

			const isGetTokenTarget = url.includes(redmicConfig.services.getOauthToken) ||
				url.includes(redmicConfig.services.getOidToken);

			const isNotApiTarget = !url.includes(this.apiUrl);

			if (isGetTokenTarget || isNotApiTarget) {
				return;
			}

			// TODO notificar al usuario que intentó acceder a algo para lo que no tenía permiso (token caducado o con
			// privilegios insuficientes)
			//Credentials.remove('accessToken');
		},

		_onRequestReachabilityError: function(res) {

			// TODO notificar al usuario que hubo un error de conexión y ofrecerle recargar (para que pueda actuar
			// sobre la página actual antes de recargar)
		}
	});
});
