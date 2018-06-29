define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/layout/DialogComplex"
	, "redmic/modules/components/Keypad/TrizoneKeypadImpl"
	, "redmic/modules/form/_CreateKeypad"
], function(
	ContentPane
	, declare
	, lang
	, DialogComplex
	, TrizoneKeypadImpl
	, _CreateKeypad
){
	return declare([_CreateKeypad], {
		//	summary:
		//		Extensión del módulo Form para que se muestre en un Dialog.

		constructor: function(args) {

		},

		_initializeCreateKeypad: function() {

			this.dialog = new DialogComplex({
				width: this.width || 6,
				height: this.height || "lg",
				title: this.title,
				onCancel: lang.hitch(this, this._cancel),
				notDestroyRecursive: true
			});

			this.keypad = new TrizoneKeypadImpl({
				parentChannel: this.getChannel(),
				items: this.buttons
			});
		},

		_getNodeToShowCreateKeypadBefore: function() {

		},

		_getNodeToShowCreateKeypadAfter: function() {

			this.dialog.show().then(lang.hitch(this, function() {
				this.dialog.set("centerContent", this.form);

				var keypadNode = new ContentPane();

				this._publish(this.keypad.getChannel("SHOW"), {
					node: keypadNode.domNode
				});

				this.dialog.set("bottomContent", keypadNode);
			}));

			this.node = this.dialog.domNode;
		},

		_hide: function() {

			// TODO revisar, no accede a hide del _Show

			this._emitEvt('HIDE');
			//this.inherited(arguments);

			this.dialog.hide();
		}
	});
});
