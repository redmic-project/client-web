define([
	"app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_Browser
	, _Controller
	, declare
	, lang
) {

	return declare([_Controller, _Browser], {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto y un listado.

		constructor: function() {

			this.config = {
			};

			lang.mixin(this, this.config);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_TARGET"),
				callback: "_subUpdateTarget"
			});
		},

		postCreate: function() {

			this.inherited(arguments);
		},

		_subUpdateTarget: function(req) {

			this._emitEvt("UPDATE_TARGET", req);
		}
	});
});
