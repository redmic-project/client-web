define([
	'dijit/_WidgetBase'
	, 'dojo/_base/declare'
	, 'dojo/i18n!app/nls/translation'
	, 'put-selector/put'
	, 'src/util/CookieLoader'
], function(
	_WidgetBase
	, declare
	, i18n
	, put
	, CookieLoader
) {

	return declare(_WidgetBase, {
		//	summary:
		//		Widget para cuando el navegador no soporta la aplicación.
		//
		// description:
		//		Contiene enlace a la actualización de los navegadores

		constructor: function() {

			new CookieLoader({
				omitWarning: true
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var containerNode = put(this.domNode, 'div.fHeight.fWidth.noSupport');
			put(containerNode, 'h2.textNoSupport.titleRedmic', i18n.noSupport);

			var firefoxNode = put(containerNode, 'a[href="https://www.mozilla.org/firefox/"][target="_blank"]');
			put(firefoxNode, 'img.iconMargin[src="/res/images/browsers/firefox.png"]');

			var chromeNode = put(containerNode, 'a[href="https://www.google.com/chrome/"][target="_blank"]');
			put(chromeNode, 'img.iconMargin[src="/res/images/browsers/chrome.png"]');

			var edgeNode = put(containerNode, 'a[href="https://www.microsoft.com/edge/download/"][target="_blank"]');
			put(edgeNode, 'img.iconMargin[src="/res/images/browsers/edge.png"]');

			var operaNode = put(containerNode, 'a[href="http://www.opera.com/"][target="_blank"]');
			put(operaNode, 'img.iconMargin[src="/res/images/browsers/opera.png"]');
		}
	});
});
