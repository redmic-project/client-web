define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector/put'
	, "redmic/layout/DialogComplex"
	, "redmic/modules/form/_CreateKeypad"
], function(
	ContentPane
	, declare
	, lang
	, aspect
	, put
	, DialogComplex
	, _CreateKeypad
) {

	return declare(_CreateKeypad, {
		//	summary:
		//		Extensión del módulo Form para que se muestre en un Dialog.

		constructor: function(args) {

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setShowInDialogConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeShowInDialog));
		},

		_setShowInDialogConfigurations: function() {

			this.dialogConfig = this._merge([{
				width: this.width || 6,
				height: this.height || "lg",
				title: this.title,
				onCancel: lang.hitch(this, this._cancel),
				notDestroyRecursive: true
			}, this.dialogConfig || {}]);
		},

		_initializeShowInDialog: function() {

			this.dialog = new DialogComplex(this.dialogConfig);
		},

		_getNodeToShowCreateKeypadAfter: function() {

			this.dialog.show().then(lang.hitch(this, function() {

				var formNode = new ContentPane();

				put(formNode.domNode, this.domNode);

				this.dialog.set("centerContent", formNode);

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
