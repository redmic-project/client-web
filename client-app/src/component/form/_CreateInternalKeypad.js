define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "src/component/form/_CreateKeypad"
], function(
	declare
	, lang
	, aspect
	, put
	, _CreateKeypad
) {

	return declare(_CreateKeypad, {
		//	summary:
		//		Extensión del módulo Form para que cree un Keypad en el interior de su nodo.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setCreateInternalKeypadConfigurations));
		},

		_setCreateInternalKeypadConfigurations: function() {

			this.buttons = this._merge([this.buttons || {}, {
				cancel: {
					disable: true
				},
				clear: {
					zone: 'right'
				}
			}]);
		},

		_getNodeToShowCreateKeypadAfter: function() {

			var keypadNode = put(this.domNode, "div");

			this._publish(this.keypad.getChannel("SHOW"), {
				node: keypadNode
			});

			return this.domNode;
		}
	});
});
