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
					i18n: this.i18n,
					_onClickGuest: this._onClickGuest,
					_onSignIn: this._onSignIn,
					_getAccessToken: this._getAccessToken
				},
				ownChannel: "whatIsRedmic"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function () {

			this.inherited(arguments);

			on(this.domNode, "click", lang.hitch(this, this._onCloseWhatIsRedmic));
		}
	});
});
