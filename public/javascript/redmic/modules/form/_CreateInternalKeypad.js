define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/form/_CreateKeypad"
], function(
	declare
	, lang
	, aspect
	, put
	, _CreateKeypad
){
	return declare(_CreateKeypad, {
		//	summary:
		//		Extensión del módulo Form para que cree un Keypad en el interior de su nodo.

		constructor: function(args) {

			this.config = {
				classContainer: ".hardTexturedContainer.rounded"
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setCreateInternalKeypadConfigurations));
		},

		_setCreateInternalKeypadConfigurations: function() {

			this.buttons = this._merge([this.buttons || {}, {
				cancel: {
					noActive: true
				},
				reset: {
					zone: "right"
				},
				clear: {
					zone: "right"
				}
			}]);
		},

		_postCreateCreateKeypad: function() {

		},

		_getNodeToShowCreateKeypadBefore: function() {

		},

		_getNodeToShowCreateKeypadAfter: function() {

			var keypadNode = put(this.form.domNode, "div"),
				classStyle = ".containerFormAndKeypad";

			if (this.classContainer) {
				classStyle += this.classContainer;
			}

			put(this.form.domNode, classStyle);

			this._publish(this.keypad.getChannel("SHOW"), {
				node: keypadNode
			});

			return this.form.domNode;
		}
	});
});
