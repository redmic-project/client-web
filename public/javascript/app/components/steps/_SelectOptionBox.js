define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "put-selector/put"
], function (
	ContentPane
	, declare
	, lang
	, _Module
	, _Show
	, put
){
	return declare([_Module, _Show, ContentPane], {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {
				label: this.i18n.origin,

				boxes: {},

				actions: {
					CHANGED: "changed"
				},

				events: {
					CHANGE: "change"
				},

				classBox: ".boxContainer.borderRadius.mediumSolidContainer",

				_activeBoxKey: null,
				oneBoxClickAutomatic: true,

				boxDescription: false,

				ownChannel: "selectOption"
			};

			lang.mixin(this, this.config, args);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'CHANGE',
				channel: this.getChannel("CHANGED")
			});
		},

		_initialize: function() {

			this._createContent();
		},

		_clearContent: function() {

			this._clearSelectOptionBox();

			while(this.containerNode.firstChild) {
				put(this.containerNode.firstChild, "!");
			}
		},

		_createContent: function() {

			this._createTitleContent();

			put(this.containerNode, this.classBox);
			this._containerItemsNode = put(this.containerNode, 'div.boxItems');

			for (var key in this.boxes) {
				this._createBox(key);
			}
		},

		_createTitleContent: function() {

			if (this.title) {
				this.classBox += ".selectOptionBox";
				this._containerTitleNode = put(this.containerNode, 'div.boxTitle');
				this._spanTitleNode = put(this._containerTitleNode, 'span', this.title);
			} else {
				this.classBox += ".fHeight";
			}
		},

		_createBox: function(key) {

			var config = this.boxes[key];

			var boxNode = put(this._containerItemsNode, 'div.module'),
				contentBoxNode = put(boxNode, 'div.button.box.softSolidContainer.colorWhite');

			if (config.icon) {
				put(contentBoxNode, 'i.iconModule.' + config.icon.split('-')[0] + '.' + config.icon);
			}

			put(contentBoxNode, 'div.name', this.i18n[config.value || key]);

			if (this.boxDescription) {
				put(contentBoxNode, 'div.description' , config.description ? this.i18n[config.description] : '');
			}

			contentBoxNode.onclick = lang.hitch(this, this._onClickBox, key);

			config.node = contentBoxNode;
		},

		_onClickBox: function(key) {

			this._activeBoxKey && this._deactivateBox(this._activeBoxKey);
			this._activateBox(key);

			this._emitEvt("CHANGE", {
				value: key
			});
		},

		_deactivateBox: function(key) {

			var node = this.boxes[key].node;

			put(node, "!activeBox");

			this._activeBoxKey = null;
		},

		_activateBox: function(key) {

			var node = this.boxes[key].node;

			put(node, ".activeBox");

			this._activeBoxKey = key;
		},

		_disabledOptionBox: function(key) {

			var node = this.boxes[key].node;

			put(node, ".disabled");

			node.onclick = null;
		},

		_enabledOptionBox: function(key) {

			var node = this.boxes[key].node;

			put(node, "!disabled");

			node.onclick = lang.hitch(this, this._onClickBox, key);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		},

		_clearSelectOptionBox: function() {

			this._activeBoxKey && this._deactivateBox(this._activeBoxKey);
		},

		_clearStep: function() {

			this._clearSelectOptionBox();
		}
	});
});
