define([
	'app/designs/embeddedContent/Controller'
	, 'app/designs/embeddedContent/Layout'
	, 'dojo/_base/declare'
], function(
	EmbeddedContentController
	, EmbeddedContentLayout
	, declare
) {

	return declare([EmbeddedContentLayout, EmbeddedContentController], {
		//	summary:
		//		Vista de catálogo de recursos ráster.
		//	description:
		//		Permite integrar la herramienta externa STAC Browser como contenido incrustado.

		postMixInProperties: function() {

			const defaultConfig = {
				embeddedContentUrl: null,
				embeddedContentUrlPropertyName: 'rasterCatalogViewEmbeddedContentUrl'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('GOT_EXTERNAL_CONFIG', evt => this._onGotExternalConfig(evt));
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
