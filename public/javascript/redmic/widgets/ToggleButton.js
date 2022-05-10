define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
	, "dojo/query"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, put
	, query
) {

	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		constructor: function(args) {

			this.config = {
				labeldefault: "Button",
				multipleSelected: false,
				selected: [],
				listButton: [],
				i18n: null,
				events: {
					CHANGE: "change",
					RESET: "reset"
				}
			};

			lang.mixin(this, this.config, args);

			if (this.groups)
				this.groups['undefined'] = []
		},

		postCreate: function() {

			this._initialize();
		},

		_initialize: function() {

			this.containerNode = put(this.domNode, "div.toggleButton");
			//this.containerNode.setAttribute('data-toggle', 'buttons');
			for (n in this.listButton) {

				if ((Object.keys(this.listButton[n]).indexOf('id') == -1)
					&& (Object.keys(this.listButton[n]).indexOf('label') != -1)) {
					this.listButton[n].id = this.listButton[n].label;
				}

				if (Object.keys(this.listButton[n]).indexOf('id') != -1) {
					buttonNode = this._createStructureButton(this.listButton[n]);
					this._assignEventsButton(buttonNode, this.listButton[n].id);
				} else
					console.log("Not id, not label");
			}
		},

		/*_createStructureButton: function(button) {

			var buttonNode = put(this.containerNode, "label.btn.btn-primary");
			buttonNode.setAttribute('data-redmic-button-id', button.id);
			var inputButtonNode = put(buttonNode, "input[type='checkbox']");
			inputButtonNode .setAttribute('autocomplete', 'off');
			if ((Object.keys(button).indexOf('default') != -1) && (button.default))
				this._selectDefault(buttonNode, button.id)

			if ((Object.keys(button).indexOf('icon') != -1))
				put(inputButtonNode, "i.fa." + button.icon);

			if ((Object.keys(button).indexOf('label') != -1)) {
				var labelButton = null;
				if (this.i18n && this.i18n[button.label])
					labelButton = this.i18n[button.label];
				else
					labelButton = button.label;
				put(inputButtonNode, "span", labelButton);
			}

			if (buttonNode.children.length == 0)
				put(inputButtonNode, "span", this.labeldefault);

			return buttonNode;
		},*/

		_createStructureButton: function(button) {

			buttonNode = put(this.containerNode, "div.button");
			buttonNode.setAttribute('data-redmic-button-id', button.id);
			if ((Object.keys(button).indexOf('default') != -1) && (button['default']))
				this._selectDefault(buttonNode, button.id)

			if ((Object.keys(button).indexOf('icon') != -1))
				put(buttonNode, "i.fa." + button.icon);

			if ((Object.keys(button).indexOf('label') != -1)) {
				var labelButton = null;
				if (this.i18n && this.i18n[button.label])
					labelButton = this.i18n[button.label];
				else
					labelButton = button.label;
				put(buttonNode, "span", labelButton);
			}

			if (buttonNode.children.length == 0)
				put(buttonNode, "span", this.labeldefault);

			return buttonNode;
		},

		_assignEventsButton: function(/*Node*/ node, idButton) {

			node.onclick = lang.hitch(this, this._eventClickButton, {'node': node, 'id': idButton});
		},

		_eventClickButton: function(item) {

			if (!this.multipleSelected)
				this._eventSimpleSelected(item);
			else
				this._eventMultipleSelected(item);
		},

		_eventSimpleSelected: function(item) {

			if ((this.selected.length == 1) && (this.selected[0].id != item.id)) {
				var node = this._searchNodeWithID(this.selected[0].id);
				this._deselectClassNode(node);
				this._selectClassNode(item.node);
				this.selected = [ { 'id': item.id } ];
				this._emitEventChange();
			}
		},

		_eventMultipleSelected: function(item) {

			var select = false,
				emit = true;

			for (var i = 0; i < this.selected.length; i++) {
				if (item.id == this.selected[i].id) {
					select = true;
					if ((this.selected.length - 1) != 0) {
						var node = this._searchNodeWithID(item.id);
						this._deselectClassNode(node);
						this.selected.splice(i, 1);
					}
					else
						emit = false;

					break;
				}
			}

			if (!select) {
				this._groupMultipleSelector(item.id);
				this._selectClassNode(item.node);
				this.selected.push( { 'id': item.id } );
			}

			if (emit)
				this._emitEventChange();
		},

		_groupMultipleSelector: function(id) {

			var group = null;

			for(var i in this.groups) {
				for (var n in this.groups[i]) {
					if (this.groups[i][n] == id) {
						group = this.groups[i];
						break;
					}
				}
				if (group)
					break;
			}

			if (group)
				this._selectedExistInGroup(group);
			else if (this.groups) {
				this.groups['undefined'].push(id);
				this._selectedExistInGroup(this.groups['undefined']);
			}
		},

		_selectedExistInGroup: function(group) {

			var exist = false;
			var deleteSelected = [];
			for (var s in this.selected){
				for (var g in group){
					if (group[g] == this.selected[s].id)
						exist = true;
				}

				if (!exist){
					deleteSelected.push(s);
				}
			}

			this._deleteNotExistInGroup(deleteSelected);
		},

		_deleteNotExistInGroup: function(deleteSelected) {

			for (var d in deleteSelected) {
					var n = deleteSelected[d] - d;
					var node = this._searchNodeWithID(this.selected[n].id);
					this._deselectClassNode(node);
					this.selected.splice(n, 1);
			}
		},

		_selectClassNode: function(node) {

			put(node, '.active');
		},

		_deselectClassNode: function(node) {

			put(node, '!active');
		},

		_emitEventChange: function() {

			this.emit(this.events.CHANGE, this.selected);
		},

		_selectDefault: function(buttonNode, id) {

			if ((this.selected.length == 0) || (this.multipleSelected)) {
				if (this.multipleSelected)
					this._groupMultipleSelector(id);
				this.selected.push( { 'id': id } );
				this._selectClassNode(buttonNode);
			}
		},

		_searchNodeWithID: function(id) {

			var node = query("[data-redmic-button-id='" + id + "']", this.domNode);
			if (node.length != 0)
				node = node[0];
			else
				node = null;

			return node;
		}
	});
});