define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	redmicConfig
	, declare
	, lang
) {

	return declare(null, {
		//	summary:
		//		Widget encargado de cargar el script de Google reCaptcha y exponer sus métodos.

		constructor: function(args) {

			this.config = {
				callback: null,
				node: null,

				_siteKey: redmicConfig.siteKeyReCaptcha,
				_siteKeyForDebug: redmicConfig.siteKeyForDebugReCaptcha,
				_theme: 'dark',
				_instanceId: null
			};

			lang.mixin(this, this.config, args);

			this._loadReCaptcha();
		},

		_loadReCaptcha: function() {

			_onLoadReCaptcha = lang.hitch(this, this._renderReCaptcha);
			require(['https://www.google.com/recaptcha/api.js?render=explicit&onload=_onLoadReCaptcha']);
		},

		_renderReCaptcha: function() {

			if (!this.callback || !this.node) {
				throw new Error('Node and verification callback must be defined for reCaptcha');
			}

			_onLoadReCaptcha = null;

			var isUsingBuilt = (/true/i).test(redmicConfig.getEnvVariableValue('envUseBuilt')),
				siteKey = isUsingBuilt ? this._siteKey : this._siteKeyForDebug;

			this._instanceId = grecaptcha.render(this.node, {
				'sitekey': siteKey,
				'theme': this._theme,
				'callback': this.callback
			});
		},

		_instanceWasCreated: function() {

			return this._instanceId !== null;
		},

		getResponse: function() {

			return this._instanceWasCreated() && grecaptcha.getResponse(this._instanceId);
		},

		reset: function() {

			this._instanceWasCreated() && grecaptcha.reset(this._instanceId);
		}
	});
});
