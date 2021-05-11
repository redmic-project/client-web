define([
	"dijit/form/Button"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "put-selector/put"
	, "./Keypad"
], function(
	DefaultButton
	, ContentPane
	, declare
	, lang
	, domClass
	, put
	, Keypad
){
	return declare(Keypad, {
		//	summary:
		//		Implementación de Keypad.
		//	description:
		//		Incluye tres zonas para colocar botones.

		//	config: Object
		//		Opciones por defecto.


		constructor: function() {

			this.config = {
				_zoneNodes: {},
				_itemInstances: {},
				items: {},
				hiddenClass: "hidden",
				className: 'mediumSolidContainer'
			};

			lang.mixin(this, this.config);
		},

		_initialize: function() {

			var classKeypad = 'defaultContainer keypad ' + this.className;

			this.keypadContainer = new ContentPane({
				region: "bottom",
				"class": classKeypad
			});

			this._createStructure(this.items);
		},

		_createStructure: function(items) {

			var leftContainer = put(this.keypadContainer.domNode, "div.left"),
				centerContainer = put(this.keypadContainer.domNode, "div.center"),
				rightContainer = put(this.keypadContainer.domNode, "div.right");

			this._zoneNodes.left = put(leftContainer, "div.btnGroup");
			this._zoneNodes.center = put(centerContainer, "div.btnGroup");
			this._zoneNodes.right = put(rightContainer, "div.btnGroup");

			for (var itemKey in items) {
				this._createButton(itemKey, items[itemKey]);
			}
		},

		_createButton: function(itemKey, item) {

			if (item.disable) {
				return;
			}

			var itemZone = item.zone ? this._zoneNodes[item.zone] : null,
				itemType = item.type || DefaultButton,
				itemProps = item.props || {},
				itemEvt = item.evt || "click",
				itemInstance = new itemType(itemProps);

			this._itemInstances[itemKey] = itemInstance;

			itemInstance.on(itemEvt, lang.hitch(this, this.emit, this.events.KEYPAD_INPUT, {
				inputKey: itemKey,
				inputInstance: itemInstance
			}));

			itemInstance.placeAt(itemZone);
		},

		_getNodeToShow: function() {

			return this.keypadContainer.domNode;
		},

		_getItemInstance: function(key) {

			if (!key || !this._itemInstances[key]) {

				console.error("Requested button with invalid key '%s' at keypad module '%s'", key,
					this.getChannel());
			}

			return this._itemInstances[key];
		},

		_enableButton: function(key) {

			this._getItemInstance(key).set("disabled", false);
		},

		_disableButton: function(key) {

			this._getItemInstance(key).set("disabled", true);
		},

		_showButton: function(key) {

			domClass.remove(this._getItemInstance(key).domNode, this.hiddenClass);
		},

		_hideButton: function(key) {

			domClass.add(this._getItemInstance(key).domNode, this.hiddenClass);
		}
	});
});
