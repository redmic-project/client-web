define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/layout/dataDisplayer/DataDisplayer'
	, 'put-selector/put'
], function(
	declare
	, lang
	, aspect
	, domClass
	, _ShowInTooltip
	, _ShowOnEvt
	, DataDisplayer
	, put
) {

	return declare(null, {
		//	summary:
		//		Base que define la creación y colocación de nodos para el módulo Input.

		constructor: function(args) {

			this.config = {
				infoClass: 'inputInfoButton',
				infoTooltipClass: 'inputInfoTooltipContent'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_afterShow", lang.hitch(this, this._afterShowNodesCreation));
		},

		_afterShowNodesCreation: function() {

			put(this._moduleOwnNode, '[required=' + this._inputProps.required + ']');
		},

		_createInputNodes: function() {

			if (!this._inputProps.required) {
				this._isValid = true;
			}

			if (!this._inputProps.notLabel && (this.label || this._inputProps.label) ||
				this._disableInputActive || this._inputProps.info) {

				this.containerLeft = put(this.domNode, 'div.leftContainer');
				this._createInfo(this._inputProps.info);
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

		_createInfo: function(info) {

			if (!info || !info.length) {
				return;
			}

			var infoValue = this.i18n[info] || info,
				infoNodeParams = 'i.' + this.infoClass + '[title=' + this.i18n.infoButtonTitle + ']',
				infoNode = put(this.containerLeft, infoNodeParams);

			var infoDefinition = declare([DataDisplayer, _ShowOnEvt]).extend(_ShowInTooltip);
			this._infoInstance = new infoDefinition({
				parentChannel: this.getChannel(),
				data: infoValue,
				'class': this.infoTooltipClass
			});

			this._publish(this._infoInstance.getChannel('ADD_EVT'), {
				sourceNode: infoNode
			});
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
