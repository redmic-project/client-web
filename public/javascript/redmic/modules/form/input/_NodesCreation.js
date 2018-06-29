define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, domClass
	, put
){
	return declare(null, {
		//	summary:
		//		Base que define la creación y colocación de nodos para el módulo Input.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_afterShow", lang.hitch(this, this._afterShowNodesCreation));
		},

		_afterShowNodesCreation: function() {

			put(this.node, '[required=' + this._inputProps.required + ']');
		},

		_createInputNodes: function() {

			if (!this._inputProps.required) {
				this._isValid = true;
			}

			var createLabel = false;
			if (!this._inputProps.notLabel && (this.label || this._inputProps.label)) {
				createLabel = true;
			}

			if (this._disableInputActive || createLabel) {
				this.containerLeft = put(this.domNode, 'div.leftContainer');
			}

			if (createLabel) {
				this._createLabel(this.label);
			}

			if (!this.notFullWidth && !this._inputProps.notFullWidth) {
				put(this.domNode, ".fWidth");
			}

			this.containerInput = put(this.domNode, 'div.rightContainer');
		},

		_afterShow: function() {

			this._chkEmbeddedInput();
		},

		_chkEmbeddedInput: function() {

			var children = this.domNode.children,
				child;

			if (children.length < 3) {
				return;
			}

			for (var i = 0; i < children.length; i++) {
				child = children[i];

				if (domClass.contains(child, 'embedded')) {
					put(this.containerInput, child);
				}
			}
		},

		_createLabel: function(/*String*/ label) {
			//	summary:
			//		Crea el label asociado al input definido por los parámetros.
			//	tags:
			//		private

			var finalLabel = "";

			if (this._inputProps.label) {
				label = this._inputProps.label;
			}

			if (label) {
				finalLabel = this.i18n[label] ? this.i18n[label] : label;
			}

			if (this._inputProps.required && !this.noRequiredActive) {
				finalLabel += "*";
			}

			this._labelContainer = put(this.containerLeft, 'label', finalLabel);
		},

		showLabel: function() {

			this._labelContainer && put(this._labelContainer, "!hidden");
		},

		hideLabel: function() {

			this._labelContainer && put(this._labelContainer, ".hidden");
		},

		enableLabel: function() {

			this._labelContainer && put(this._labelContainer, {
				style: "opacity: 1;"
			});
		},

		disableLabel: function() {

			this._labelContainer &&	put(this._labelContainer, {
				style: "opacity: 0.5;"
			});
		},

		_linkLabelToInput: function() {

			if (this._labelContainer && this._inputInstance) {
				this._labelContainer.setAttribute('for', this._inputInstance.get("id"));
			}
		},

		_embedElement: function(req) {

			put(this.domNode, req.node);
		}
	});
});