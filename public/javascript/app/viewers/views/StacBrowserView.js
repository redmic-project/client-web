define([
	'app/designs/embeddedContent/Controller'
	, 'app/designs/embeddedContent/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	Controller
	, Layout
	, declare
	, lang
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista de STAC Browser incrustado.
		//	description:
		//		Permite integrar la herramienta externa.

		constructor: function (args) {

			this.config = {
				embeddedContentUrl: 'https://stac-browser.pre-devops.grafcan.es'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

		}
	});
});
