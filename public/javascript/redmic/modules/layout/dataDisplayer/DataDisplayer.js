define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
){
	return declare([_Module, _Show], {
		//	summary:
		//		Visualizador de datos y nodos.
		//	description:
		//		Recibe datos o nodos y los representa.

		constructor: function(args) {

			this.config = {
				ownChannel: "dataDisplayer"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.container = put("div");
		},

		_beforeShow: function(req) {

			var data = req.data || this.data;

			if (!data) {
				return;
			}

			if (typeof data === "object") {
				put(this.container, data);
			} else {
				this.container.innerHTML = data;
			}
		},

		_getNodeToShow: function() {

			return this.container;
		}
	});
});
