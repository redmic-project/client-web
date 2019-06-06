define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "./Gateway"
], function(
	declare
	, lang
	, _Store
	, Gateway
){
	return declare([Gateway, _Store], {
		//	summary:
		//		Implementación de gateway entre un botón de un browser y otro browser.

		constructor: function(args) {

			this.config = {
				ownChannel: "addItemGateway",
				target: null,
				outputTarget: null,
				btnToListen: "addItem"
			};

			lang.mixin(this, this.config, args);
		},

		_subAddItem: function(/*Object*/ objReceived) {

			var btnId = objReceived.btnId,
				id = objReceived.id;

			if (btnId === this.btnToListen) {
				this._emitEvt('GET', this._getMGetObj(id));
			}
		},

		_getMGetObj: function(itemId) {

			return {
				target: this.target,
				method: "GET",
				id: itemId,
				requesterId: this.getOwnChannel()
			};
		},

		_itemAvailable: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.outputTarget
			});
		}
	});
});
