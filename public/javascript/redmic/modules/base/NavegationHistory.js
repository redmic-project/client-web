define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	//, "dstore/Memory"
	, "redmic/modules/base/_Module"
], function(
	declare
	, lang
	//, Memory
	, _Module
){
	return declare(_Module, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				// own actions
				actions: {
					ADD: "add"
				},
				// mediator params
				ownChannel: "navegationHistory"
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			//this.collection = new Memory({data: [], idProperty: this.idProperty})
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD"),
				callback: "_subAdd"
			});
		},

		_subAdd: function(url) {

			//console.log(url);
		}
	});
});