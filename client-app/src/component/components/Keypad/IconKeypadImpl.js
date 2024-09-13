define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "./Keypad"
], function(
	declare
	, lang
	, put
	, Keypad
){
	return declare(Keypad, {
		//	summary:
		//		Implementación de Keypad para botones simples, que no son más que un icono.

		constructor: function() {

			this.config = {
				items: {},
				_itemNodes: {},
				_groupNodes: {},

				containerClass: "iconKeypad",
				hiddenClass: "hidden",
				disabledClass: "disabled",
				selectedClass: "selected",
				iconContainerClass: "iconContainer",
				iconGroupClass: "iconGroup",
				classPrefixSeparator: "-"
			};

			lang.mixin(this, this.config);
		},

		_initialize: function() {

			this.keypadContainer = put(this.domNode, "div." + this.containerClass);

			this._createStructure(this.items);
		},

		_createStructure: function(items) {

			for (var key in items) {
				this._createButton(key, items[key]);
			}
		},

		_createButton: function(key, props) {

			var buttonGroup = props.group,
				node = put("a." + this.iconContainerClass);

			this._itemNodes[key] = node;

			if (!buttonGroup) {
				put(this.keypadContainer, node);
			}

			put(node, "i");

			this._setButtonProps(key, props);
			this._setButtonCallback(key);
		},

		_setButtonProps: function(key, props) {

			var buttonNode = this._itemNodes[key],
				iconNode = buttonNode ? buttonNode.firstChild : null;

			if (!buttonNode) {
				return;
			}

			var buttonGroup = props.group;

			if (buttonGroup) {
				this._setButtonGroup(buttonNode, buttonGroup);
			}

			this._setButtonNodeProps(buttonNode, props);

			iconNode && this._setIconNodeProps(iconNode, props);
		},

		_setButtonGroup: function(buttonNode, group) {

			var groupNode = this._groupNodes[group];
			if (!groupNode) {
				groupNode = this._groupNodes[group] = put(this.keypadContainer, "div." + this.iconGroupClass);
			}

			put(groupNode, buttonNode);
		},

		_setButtonNodeProps: function(node, props) {

			var href = props.href;

			if (href) {
				node.setAttribute('href', href);
				node.setAttribute('d-state-url', true);
			} else if (!node.getAttribute('href')) {
				node.removeAttribute('d-state-url');
			}
		},

		_setIconNodeProps: function(node, props) {

			var title = props.title,
				className = props.className,
				classPrefix = className ? className.split(this.classPrefixSeparator)[0] : null;

			if (title) {
				node.setAttribute('title', title);
			}

			if (className) {
				node.setAttribute('class', classPrefix + " " + className);
			}
		},

		_setButtonCallback: function(itemKey) {

			this._itemNodes[itemKey].onclick = lang.hitch(this, this._buttonCallback, itemKey);
		},

		_buttonCallback: function(itemKey) {

			var node = this._itemNodes[itemKey];

			this._emitEvt("KEYPAD_INPUT", {
				inputKey: itemKey,
				node: node
			});
		},

		_clearButtonCallback: function(itemKey) {

			this._itemNodes[itemKey].onclick = function() {};
		},

		getNodeToShow: function() {

			return this.keypadContainer;
		},

		_enableButton: function(key) {

			put(this._itemNodes[key], "!" + this.disabledClass);
			this._setButtonCallback(key);
		},

		_disableButton: function(key) {

			put(this._itemNodes[key], "." + this.disabledClass);
			this._clearButtonCallback(key);
		},

		_showButton: function(key) {

			put(this._itemNodes[key], "!" + this.hiddenClass);
			this._setButtonCallback(key);
		},

		_hideButton: function(key) {

			put(this._itemNodes[key], "." + this.hiddenClass);
			this._clearButtonCallback(key);
		},

		_selectButton: function(key) {

			for (var nodeKey in this._itemNodes) {
				if (nodeKey === key) {
					var node = this._itemNodes[key];
					put(node, "." + this.selectedClass);
				} else {
					this._deselectButton(nodeKey);
				}
			}
		},

		_deselectButton: function(key) {

			var node = this._itemNodes[key];
			put(node, "!" + this.selectedClass);
		}
	});
});
