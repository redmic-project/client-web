define([
	'app/designs/embeddedContent/Controller'
	, 'app/designs/embeddedContent/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_ExternalConfig'
], function(
	Controller
	, Layout
	, declare
	, lang
	, _ExternalConfig
) {

	return declare([Layout, Controller, _ExternalConfig], {
		//	summary:
		//		Vista de STAC Browser incrustado.
		//	description:
		//		Permite integrar la herramienta externa.

		constructor: function (args) {

			this.config = {
				embeddedContentUrl: null,
				embeddedContentUrlPropertyName: 'stacBrowserViewEmbeddedContentUrl'
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.embeddedContentUrlPropertyName
			});
		},

		_onGotExternalConfig: function(evt) {

			var configValue = evt[this.embeddedContentUrlPropertyName];

			this._publish(this.getChannel('SET_PROPS'), {
				embeddedContentUrl: configValue
			});
		}
	});
});
