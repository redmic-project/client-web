define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Lógica de recepción de respuestas a peticiones del componente RestManager.

		postMixInProperties: function() {

			const defaultConfig = {
				_errorDescriptionMaxLength: 70,
				_errorNotifyTimeout: 10
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_handleSuccess: function(handleConfig, req, originalRes) {

			const res = this._parseResponse(originalRes),
				evtName = handleConfig.evtName,
				notify = handleConfig.notifySuccess;

			notify && this._notifySuccess(res);

			this._emitResponse({ req, res, evtName });
		},

		_parseResponse: function(res) {

			// TODO usar res.data directamente cuando no se envuelva la respuesta con body
			const data = res.data?.body ?? res.data,
				status = res.status,
				text = res.text,
				url = res.url,
				getHeader = res.getHeader,
				options = res.options;

			return { data, status, text, url, getHeader, options };
		},

		_notifySuccess: function(res) {

			const description = this.i18n.success;

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'success',
				description
			});
		},

		_handleError: function(handleConfig, req, originalRes) {

			this._emitEvt('ABORT_ALL_LOADING');

			const res = this._parseError(originalRes),
				evtName = handleConfig.evtName,
				notify = handleConfig.notifyError;

			notify && this._notifyError(res);

			this._emitResponse({ req, res, evtName });
		},

		_parseError: function(err) {

			const res = err.response,
				resError = err.message;

			let data = res.data,
				error = resError ?? this.defaultErrorDescription;

			if (data) {
				// TODO usar res.data directamente cuando no se envuelva la respuesta con error
				if (data.error && data.error instanceof Object) {
					data = data.error;
				}

				if (data.code) {
					error += ` - ${data.code}`;
				}
				if (data.description) {
					const description = data.description.length > this._errorDescriptionMaxLength ?
						`${data.description.substring(0, this._errorDescriptionMaxLength)}...` :
						data.description;

					error += ` - ${description}`;
				}
			}

			const status = res.status,
				text = res.text,
				url = res.url,
				getHeader = res.getHeader,
				options = res.options;

			return { data, error, status, text, url, getHeader, options };
		},

		_notifyError: function(res) {

			if (this._responseHasErrorForAuthComponent(res)) {
				this._publish(this._buildChannel(this.authChannel, 'AUTH_PERMISSION_ERROR'), { ...res });
				return;
			}

			let description = res.error;

			const status = res.status;
			if (status) {
				const feedbackLink = `<a href="/feedback/${status}" target="_blank">${this.i18n.contact}</a>`;
				description += ` - ${feedbackLink}`;
			}

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description,
				timeout: this._errorNotifyTimeout
			});

			this._emitEvt('TRACK', {
				event: 'request_error',
				url: res.url
			});
		},

		_emitResponse: function(params) {

			const req = params.req,
				res = params.res,
				target = req.target,
				requesterId = req.requesterId;

			this._emitLoaded(req);

			this._emitEvt(params.evtName, {
				target,
				requesterId,
				req,
				res
			});
		},

		_emitLoaded: function(req) {

			this._emitEvt('TARGET_LOADED', {
				target: req.target,
				requesterId: req.requesterId
			});
		}
	});
});
