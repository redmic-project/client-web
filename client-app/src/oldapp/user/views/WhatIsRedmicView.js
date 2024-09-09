define([
	"app/user/views/_ExternalUserBaseView"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/on"
	, "dojo/text!./templates/WhatIsRedmic.html"
], function(
	_ExternalUserBaseView
	, declare
	, lang
	, on
	, template
){
	return declare(_ExternalUserBaseView, {
		// summary:
		// 	Vista de whatIsRedmic
		//
		// description:
		// 	Permite ver información sobre REDMIC

		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n
				},
				ownChannel: "whatIsRedmic"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function () {

			this.inherited(arguments);

			on(this.domNode, "click", lang.hitch(this, this._onCloseWhatIsRedmic));
		},

		_onCloseWhatIsRedmic: function(/*event*/ evt) {
			// summary:
			//		Función que cierra la vista que muestra información de redmic.
			//	tags:
			//		callback private

			if (globalThis.location.pathname.includes(this.whatIsRedmicPath)) {
				globalThis.location.href = this.loginPath;
			}
		}
	});
});
