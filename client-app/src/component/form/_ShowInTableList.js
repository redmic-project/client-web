define([
	"dojo/_base/lang"
	, "dojo/_base/declare"
	, "dojo/aspect"
	, "dojo/dom-class"
	, "dojo/query"
	, "src/component/form/_BaseCreateKeypad"
	, 'put-selector'
], function(
	lang
	, declare
	, aspect
	, domClass
	, query
	, _BaseCreateKeypad
	, put
){
	return declare(_BaseCreateKeypad, {
		//	summary:
		//		Extensión de módulo Form para mostrarlo en una fila de un listado de tipo tabla.

		constructor: function(args) {

			this.config = {
				buttons: {
					submit: {
						zone: "right",
						props: {
							"class": "fa-check-circle.success",
							label: this.i18n.submit,
							callback: "_submit"
						}
					},
					cancel: {
						zone: "right",
						props: {
							"class": "fa-close.danger",
							label: this.i18n.cancel,
							callback: "_cancel"
						}
					}
				}
			};

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setShowInTableRowListOwnCallbacksForEvents));

			lang.mixin(this, this.config, args);
		},

		_setShowInTableRowListOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._showInTableListOnShown));
			this._onEvt('ENABLE_BUTTON', lang.hitch(this, this._enableButton));
			this._onEvt('DISABLE_BUTTON', lang.hitch(this, this._disableButton));
		},

		_showInTableListOnShown: function(evt) {

			this._showInputs(this._moduleOwnNode);

			domClass.add(this.form.containerNode, 'hidden');
		},

		_showInputs: function(node) {

			if (!node) {
				return;
			}

			var checkboxNode = query('.check', node)[0];
			checkboxNode && checkboxNode.removeChild(checkboxNode.firstChild);

			for (var key in this._inputsInfo) {
				var inputInfo = this._inputsInfo[key],
					fieldNode = query('[data-redmic-property="' + key + '"]', node)[0];

				fieldNode && this._updateFieldNode(inputInfo, fieldNode);
			}

			this._updateButtonsContainer(node);
		},

		_updateFieldNode: function(inputInfo, node) {

			node.innerHTML = "";

			this._publish(this._buildChannel(inputInfo.channel, this.actions.SHOW), {
				node: node
			});
		},

		_updateButtonsContainer: function(node) {

			var buttonsContainer = query('.containerButtons', node.parentNode)[0],
				width = buttonsContainer.clientWidth - 20;

			buttonsContainer.removeChild(buttonsContainer.firstChild);
			buttonsContainer.style.width = width + "px";
			put(buttonsContainer, ".containerButtonsForm");

			for (var key in this.buttons) {
				var nodeButton = put(buttonsContainer, "span.iconList.fa." + this.buttons[key].props["class"]);
				nodeButton.onclick = lang.hitch(this, this[this.buttons[key].props.callback]);

				this.buttons[key].props.node = nodeButton;
			}
		},

		_enableButton: function(res) {

			if (res && this.buttons && this.buttons[res]) {
				if (this.buttons[res].props.node) {
					put(this.buttons[res].props.node, "!disableButton");

					this.buttons[res].props.node.onclick =
						lang.hitch(this, this[this.buttons[res].props.callback]);
				}
			}
		},

		_disableButton: function(res) {

			if (res && this.buttons && this.buttons[res]) {
				if (this.buttons[res].props.node) {
					put(this.buttons[res].props.node, ".disableButton");
					this.buttons[res].props.node.onclick = null;
				}
			}
		}
	});
});
