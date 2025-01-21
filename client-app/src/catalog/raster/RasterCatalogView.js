define([
	'app/designs/embeddedContent/Controller'
	, 'app/designs/embeddedContent/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_ExternalConfig'
], function(
	EmbeddedContentController
	, EmbeddedContentLayout
	, declare
	, lang
	, _ExternalConfig
) {

	return declare([EmbeddedContentLayout, EmbeddedContentController, _ExternalConfig], {
		//	summary:
		//		Vista de catálogo de recursos ráster.
		//	description:
		//		Permite integrar la herramienta externa STAC Browser como contenido incrustado.

		constructor: function(args) {

			this.config = {
				embeddedContentUrl: null,
				embeddedContentUrlPropertyName: 'rasterCatalogViewEmbeddedContentUrl'
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
