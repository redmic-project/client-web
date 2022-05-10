define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "dojo/keys"
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, Keys
	, put
) {
	var cleanSpace = function(text) {
		return text.trim();
	};

	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		'class': 'KeywordsInput',

		constructor: function(args) {

			this.config = {
				value: null,
				required: false,
				separateString: ',',
				separatorMultipleTag: [",", "/"],
				keycodeTagConfirm: [Keys.TAB, Keys.ENTER, Keys.ESCAPE, 188/*coma*/, 111/*/*/],
				events: {
					RESET: "reset",
					CLEAR: "clearData",
					REMOVE_ITEM: "removeItem",
					SET_VALUE: "setValue"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.RESET, lang.hitch(this, this._reset));
			this.on(this.events.CLEAR, lang.hitch(this, this._clear));
			this.on(this.events.SET_VALUE, lang.hitch(this, this._setValue));
			this.on(this.events.REMOVE_ITEM, lang.hitch(this, this._removeItem));
		},

		postCreate: function() {

			this.inputNode = put(this.domNode, "input[type=text]");
			this.ulNode = put(this.domNode, "ul.list");
			this._createNewTag();

			this.ulNode.onclick = lang.hitch(this, this._focusNewTag);

			this._initialize();

			this.inherited(arguments);
		},

		_initialize: function() {

			if (this._getValue() && this._getValue().length != 0)
				this._createTagsValue();
		},

		_createTagsValue: function() {

			for (var i = 0; i < this._getValue().length; i++)
				this._createTag(this._getValue()[i]);
		},

		_activeInput: function(e) {

			put(this.ulNode, ".active");
			e.preventDefault();
		},

		_desactiveInput: function(e) {

			put(this.ulNode, "!active");
		},

		_createNewTag: function() {

			this.newTag = put(this.ulNode, "li.tagNew");
			put(this.newTag, "input[type=text]");

			this.newTag.firstChild.onfocus = lang.hitch(this, this._activeInput);
			this.newTag.firstChild.onblur = lang.hitch(this, this._desactiveInput);

			this.newTag.firstChild.onkeydown = lang.hitch(this, this._eventChangeText);
			this.newTag.firstChild.onkeyup = lang.hitch(this, this._eventOnKeyUp);
		},

		_focusNewTag: function() {

			this.newTag.firstChild.focus();
		},

		_eventChangeText: function(e) {

			var keyCode = e.keyCode || e.which;

			var keyCodeBoolean = this._keycodeIsCompleteTag(keyCode);

			if (keyCodeBoolean) {
				this._completeTag(keyCode);
				if (keyCode != Keys.TAB)
					e.preventDefault();
				else
					this._desactiveInput();
			} else if ((this._selectCharCorrect(keyCode) && this._correctTagNew())|| (this._valueInputNew().length == 0))
				put(this.ulNode, "!notValid");
			else
				put(this.ulNode, ".notValid");
		},

		_eventOnKeyUp: function(e) {

			if (this._correctTagNew() || (this._valueInputNew().length == 0))
				this.validate();
		},

		_selectCharCorrect: function(keyCode) {

			patron = /[a-zA-Z_áéíóúñ\s]/;
			charSeleccionado = String.fromCharCode(keyCode);

			return patron.test(charSeleccionado);
		},

		_valueInputNew: function() {

			return cleanSpace(this.newTag.firstChild.value);
		},

		_resetValueInputNew: function() {

			this.newTag.firstChild.value = '';

			this.validate();
		},

		_keycodeIsCompleteTag: function(keyCode) {

			if (keyCode)
				for (var i = 0; i < this.keycodeTagConfirm.length; i++)
					if (keyCode == this.keycodeTagConfirm[i])
						return true;
			return false;
		},

		_correctTagNew: function(value) {

			if (!value)
				value = this._valueInputNew();

			patron = /^[a-zA-Z_áéíóúñ\s]+$/;

			return patron.test(value);
		},

		_isMultipleTag: function() {

			var result = false;

			for (var i = 0; i < this.separatorMultipleTag.length; i++)
				if (this._valueInputNew().includes(this.separatorMultipleTag[i])) {
					this._caracterMultipleTag = this.separatorMultipleTag[i];
					result = true;
					break;
				}

			return result;
		},

		_generateMultipleTag: function() {

			var split = this._valueInputNew().split(this._caracterMultipleTag);
			for (var i = 0; i < split.length; i++) {
				var tag = split[i];
				if (this._correctTagNew(tag)){
					if (tag.slice(-1) == " ")
						tag = tag.substring(0, tag.length - 1);
					this._generateTag(tag);
				}
			}

			this._caracterMultipleTag = null;

			this._resetValueInputNew();

			this._focusNewTag();
		},

		_completeTag: function(keyCode) {

			if (this._correctTagNew()) {
				this._generateTag(this._valueInputNew());

				this._resetValueInputNew();

				if (!keyCode || keyCode != Keys.TAB)
					this._focusNewTag();
			} else if (this._isMultipleTag()) {
				this._generateMultipleTag();
			} else if (this._valueInputNew().length != 0)
				this.validate();
		},

		_generateTag: function(value) {

			value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

			if (this._addItemValue(value)) {
				this._createTag(value);
				this._emitOnChange();
			}
		},

		_createTag: function(item) {

			var newTagComplete = put(this.ulNode.lastChild, "-li.tagComplete");

			put(newTagComplete, "span", item);
			var removeNode = put(newTagComplete, "i.fa.fa-remove");

			removeNode.onclick = lang.hitch(this, this._eventRemoveTag, newTagComplete, item);
		},

		_eventRemoveTag: function(node, value) {

			this._removeTag(node, value);
		},

		_removeTags: function() {

			if (this._getValue()) {
				while (this.ulNode.children.length >= 2)
					this.ulNode.removeChild(this.ulNode.firstChild);
				this.set("value", '');
			}
		},

		_removeTag: function(node, value) {

			this.ulNode.removeChild(node);
			this._removeItemValue(value);
		},

		_removeItem: function(value) {

			var posItem = this._existItemInValue(value);

			if (posItem != -1)
				this._removeTag(this.ulNode.children[posItem], value);
		},

		reset: function() {

			this._removeTags();

			this.validate();

			this._emitOnChange();
		},

		validate: function() {

			if (!this._correctTagNew() && this._valueInputNew.length != 0) {
				this._notValid(); // emitir mensaje de valor erroneo
				console.log("Valor erroneo");
			} else if (this._getValue() && this._getValue().length == 0 && this.required){
				this._notValid(); // emitir mensaje de valor requerido
				console.log("Se requiere el valor");
			} else {
				this._valid();
				return true;
			}

			return false;
		},

		validator: function() {

			return this.validate();
		},

		isValid: function() {

			return this.validate();
		},

		_getValue: function() {

			if (this.value) {
				var split = String(this.value).split(this.separateString);
				return split;
			}

			return null;
		},

		_setValue: function(value) {

			if (value != this.value) {

				this._removeTags();

				this.value = value;

				if (value)
					this._createTagsValue();

				this._emitOnChange();
			}
		},

		_notValid: function() {

			put(this.ulNode, ".notValid");
		},

		_valid: function() {

			put(this.ulNode, "!notValid");
		},

		_clear: function() {

			this._removeTags();

			this.validate();

			this._emitOnChange();
		},

		_addItemValue: function(item) {

			var posItem = this._existItemInValue(item);

			if (posItem == -1) {
				var itemValue = '';
				if (this.value)
					itemValue = this.value + this.separateString;
				itemValue += item;
				this.set('value', itemValue);
				return true;
			}

			return false;
		},

		_emitOnChange: function() {

			this.onChange(this.value);
		},

		_existItemInValue: function(item) {

			if (this._getValue())
				for (var i = 0; i < this._getValue().length; i++)
					if (this._getValue()[i] === item)
						return i;
			return -1;
		},

		_removeItemValue: function(item) {

			var posItem = this._existItemInValue(item);

			if (posItem != -1){
				var content = '';

				for (var i = 0; i < this._getValue().length; i++) {
					if (posItem != i) {
						if (i != 0)
							content += this.separateString;
						content += this._getValue()[i];
					}
				}

				this.set('value', content);
				this._emitOnChange();
			}
		}
	});
});