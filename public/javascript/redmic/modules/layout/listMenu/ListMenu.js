define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "put-selector/put"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function(
	declare
	, lang
	, domClass
	, put
	, Utilities
	, _Module
	, _Show
){
	return declare([_Module, _Show], {
		//	summary:
		//		Generador de lista de menu
		//	description:
		//		Genera una lista de menu por medio de un objeto items

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				omitLoading: true,
				// mediator params
				ownChannel: "listMenu",
				multipleSelected: false,
				forbidEmptySelection: false,
				hideOnClickItem: true,
				idProperty: "id",
				items: [],
				_itemsPending: {},
				events: {
					EVENT_ITEM: "eventItem"
				},
				actions: {
					EVENT_ITEM: "eventItem",
					CHANGE_ITEMS: "changeItems",
					SHOW_ITEM: "showItem",
					HIDE_ITEM: "hideItem",
					ADD_ITEM: "addItem",
					REMOVE_ITEM: "removeItem",
					SELECT_ITEM: "selectItem",
					SELECT_TOTAL_ITEMS: "selectTotalItems",
					DESELECT_ITEM: "deselectItem",
					DESELECT_TOTAL_ITEMS: "deselectTotalItems",
					CLEAR_ITEMS: "clearItems"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._createContent();
		},

		_createContent: function() {

			this._clearItems();

			this._initializeSelect();

			for (var i in this.items) {
				this._createItem(this.items[i], i);
			}
		},

		_initializeSelect: function() {

			if (this.select) {
				this.select.active = lang.clone(this.select['default']);
			}

			if (this.multipleSelected) {
				this.selectMultiple = [];
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("CHANGE_ITEMS"),
				callback: "_subChangeItems"
			},{
				channel : this.getChannel("SHOW_ITEM"),
				callback: "_subShowItem"
			},{
				channel : this.getChannel("HIDE_ITEM"),
				callback: "_subHideItem"
			},{
				channel : this.getChannel("ADD_ITEM"),
				callback: "_subAddItem"
			},{
				channel : this.getChannel("REMOVE_ITEM"),
				callback: "_subRemoveItem"
			},{
				channel : this.getChannel("SELECT_ITEM"),
				callback: "_subSelectItem"
			},{
				channel : this.getChannel("SELECT_TOTAL_ITEMS"),
				callback: "_subSelectTotalItems"
			},{
				channel : this.getChannel("DESELECT_ITEM"),
				callback: "_subDeselectItem"
			},{
				channel : this.getChannel("DESELECT_TOTAL_ITEMS"),
				callback: "_subDeselectTotalItems"
			},{
				channel : this.getChannel("CLEAR_ITEMS"),
				callback: "_subClearItems"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'EVENT_ITEM',
				channel: this.getChannel("EVENT_ITEM")
			},{
				event: 'HIDE',
				channel: this.getChannel("HIDE")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, ".listMenu");
		},

		_subChangeItems: function(request) {

			this.items = request.items;
			this._createContent();
		},

		_subShowItem: function(request) {

			var itemPos = this._getItemPosition(request.valueItem);

			if (itemPos !== undefined) {
				this._showItem(itemPos);
			}
		},

		_showItem: function(itemPos) {

			if (this.items[itemPos].node.getAttribute("class").indexOf('hidden') > -1) {
				put(this.items[itemPos].node, "!hidden");
			}
		},

		_subHideItem: function(request) {

			var itemPos = this._getItemPosition(request.valueItem);

			if (itemPos !== undefined) {
				this._hideItem(itemPos);
			}
		},

		_hideItem: function(itemPos) {

			if (this.items[itemPos].node.getAttribute("class").indexOf('hidden') === -1) {
				put(this.items[itemPos].node, ".hidden");
			}
		},

		_subAddItem: function(request) {

			this._addItem(request.item, request.select);
		},

		_addItem: function(newItem, isSelect) {

			var i = this.items.length;

			this.items.push(newItem);

			this._createItem(this.items[i], i);

			if (isSelect || this._itemsPending[newItem.value]) {
				delete this._itemsPending[newItem.value];
				this._selectItem(i, true);
			}
		},

		_subRemoveItem: function(request) {

			var itemPos = this._getItemPosition(request.valueItem);

			if (itemPos !== undefined) {
				this._removeItem(itemPos);
			}
		},

		_removeItem: function(itemPos) {

			this.domNode.removeChild(this.items[itemPos].node);

			this._removeItemInSelect(itemPos);

			this.items.splice(itemPos, 1);
		},

		_removeItemInSelect: function(itemPos) {

			if (this.select) {
				if (this.select.active[itemPos]) {
					delete this.select.active[itemPos];
				}

				if (this.select['default'][itemPos]) {
					delete this.select['default'][itemPos];
				}
			}

			if (this.multipleSelected) {
				for (var i = 0; i < this.selectMultiple.length; i++) {
					if (this._getValueOrLabel(this.items[itemPos]) === this.selectMultiple[i]) {
						this.selectMultiple.splice(i, 1);
						break;
					}
				}
			}
		},

		_subSelectItem: function(request) {

			var value = request.valueItem,
				i = this._getItemPosition(value);

			if (this.select && i !== undefined) {
				this._selectItem(i);
			} else {
				this._itemsPending[value] = true;
			}
		},

		_selectItem: function(i, isNew) {

			if (this.select) {
				if (!this.multipleSelected) {
					if (isNew) {
						this.select['default'] = i;
					}

					this._simpleSelect(i);
				} else {
					if (isNew) {
						this.select['default'][i] = true;
					}

					this._selectItemMultiple(i);
				}
			}
		},

		_subDeselectItem: function(request) {

			var i = this._getItemPosition(request.valueItem);

			if (this.select && i !== null) {
				this._deselectItem(i);
			}
		},

		_deselectItem: function(i) {

			if (this.select) {
				if (!this.multipleSelected) {
					if (!this.forbidEmptySelection) {
						this._simpleSelect(null);
					}
				} else {
					if (!this.forbidEmptySelection || Object.keys(this.select.active).length > 1) {
						this._deselectItemMultiple(i);
					}
				}
			}
		},

		_subSelectTotalItems: function() {

			for (var i in this.items) {
				this._selectItem(i);
			}
		},

		_subDeselectTotalItems: function() {

			for (var i in this.items) {
				this._deselectItem(i);
			}
		},

		_subClearItems: function() {

			this._clearItems();
		},

		_createItem: function(item, i) {

			if (!item.condition || item.condition(item)) {
				var node = item.template ? this._createItemTemplate(item, i) : this._createItemGeneric(item, i);

				this._isSelectedItemAndProcessSelect(node, i);

				if (!item.noDisabled) {
					node.onclick = lang.hitch(this, this._eventItem, item, i);
				}
			}
		},

		_createItemGeneric: function(item, i) {

			var node = put(this.domNode, (item.href ? "a" : "div") + ".itemMenu");

			item.node = node;

			this._addIcon(item, node);
			this._addLabel(item, node);
			this._addTitle(item.title, node);
			this._addHref(item.href, node);
			this._addNewPage(item.newPage, node);

			return node;
		},

		_createItemTemplate: function(item, i) {

			var node = put(this.domNode, "div.itemMenu");

			item.node = node;

			node.innerHTML = item.template(item.data);

			delete item.template;

			return node;
		},

		_addIcon: function(item, node) {

			var icon = item.icon;

			if (!icon) {
				return;
			}

			var baseIcon = icon.split('-')[0];

			put(node, "i." + baseIcon + '.' + icon);
		},

		_addLabel: function(item, node) {

			var label;

			if (item.labelKey) {
				label = item.labelKey;
			} else if (item.label) {
				label = item.label;
			}

			if (!label) {
				return;
			}

			label = this.i18n[label] || label;

			label = Utilities.capitalize(label);

			put(node, "span", label);
		},

		_addTitle: function(title, node) {

			if (!title) {
				return;
			}

			title = this.i18n[title] || title;

			put(node, "[title='$']", title);
		},

		_addHref: function(href, node) {

			if (!href) {
				return;
			}

			node.setAttribute('href', href);
			if (href[0] === '/') {
				node.setAttribute('d-state-url', true);
			}
		},

		_addNewPage: function(newPage, node) {

			if (!newPage) {
				return;
			}

			node.setAttribute('target', '_blank');
		},

		_isSelectedItemAndProcessSelect: function(node, i) {

			if (this.select) {
				if (!this.multipleSelected && this.select.active === i) {
					put(node, ".itemSelect");
				} else if (this.select.active && this.select.active[i]) {
					delete this.select.active[i];
					this._selectItemMultiple(i);
				}
			}
		},

		_eventItem: function(item, i) {

			this._processSelect(i);

			this._booleanState(item);

			this._emitEvtItem(item, i);

			if (this.hideOnClickItem) {
				this._emitEvt('HIDE');
			}
		},

		_booleanState: function(item) {

			if (item.state === undefined) {
				return;
			}

			var label = item.label,
				statusButtons = this.getStatusButtonInData();

			item.state = !item.state;
			statusButtons[label] = item.state;

			this._toggleIcon(item);
		},

		_toggleIcon: function(item) {

			var iconNode = item.node.firstChild,
				icon = item.icon,
				altIcon = item.altIcon;

			domClass.toggle(iconNode, altIcon);
			domClass.toggle(iconNode, icon);
		},

		_updateStateItemsByData: function() {

			if (!this.currentData) {
				return;
			}

			var statusButtons = this.getStatusButtonInData(),
				item,
				state;

			for (var i in this.items) {
				item = this.items[i];

				if (item.state !== undefined) {

					state = !!statusButtons[item.label];

					if (item.state !== state) {
						item.state = state;

						this._toggleIcon(item);
					}
				}
			}
		},

		getStatusButtonInData: function() {

			return this.currentData.statusButtons;
		},

		_emitEvtItem: function(item, i) {

			var returnObj = item;

			if (this.multipleSelected) {
				returnObj.actionSelect = this._isSelectedItemInMultipleSelected(i);
				returnObj.selection = this.selectMultiple;
			}

			this._emitEvt('EVENT_ITEM', returnObj);
		},

		_isSelectedItemInMultipleSelected: function(i) {

			var selectionActive = this.select.active;

			return !!(selectionActive && selectionActive[i]);
		},

		_processSelect: function(i) {

			if (this.select) {
				if (!this.multipleSelected) {
					this._simpleSelect(i);
				} else if (this.multipleSelected) {
					this._toggleMultipleSelect(i);
				}
			}
		},

		_toggleMultipleSelect: function(i) {

			if (!this._isSelectedItemInMultipleSelected(i)) {
				this._selectItemMultiple(i);
			} else if (this.select.active) {
				if (!this.forbidEmptySelection || Object.keys(this.select.active).length > 1) {
					this._deselectItemMultiple(i);
				}
			}
		},

		_simpleSelect: function(i) {

			if (this.select.active !== i) {
				if (this.select.active !== undefined && this.select.active !== null) {
					var node = this.domNode.children[this.select.active];
					node && put(this.domNode.children[this.select.active], "!itemSelect");
				}

				i && put(this.domNode.children[i], ".itemSelect");
				this.select.active = i;
			}
		},

		_selectItemMultiple: function(i) {

			if (this.groups) {
				this._processSelectInGroups(i);
			}

			if (!this.select.active[i]) {
				this.select.active[i] = true;
				put(this.items[i].node, ".itemSelect");
				this.selectMultiple.push(this._getValueOrLabel(this.items[i]));
			}
		},

		_processSelectInGroups: function(i) {

			var groupsSelect = this._selectedGroupsForItem(i),
				itemsActive = this.select.active;

			for (var key in itemsActive) {
				if (this._selectedGroupsForItem(key) != groupsSelect) {
					this._deselectItemMultiple(key);
				}
			}
		},

		_selectedGroupsForItem: function(i) {

			for (var key in this.groups) {
				if (this.groups[key][i]) {
					return key;
				}
			}

			return null;
		},

		_deselectItemMultiple: function(i) {

			delete this.select.active[i];

			put(this.items[i].node, "!itemSelect");

			var valueItem = this._getValueOrLabel(this.items[i]);

			for (var n = 0; n < this.selectMultiple.length; n++) {
				if (this.selectMultiple[n] == valueItem) {
					this.selectMultiple.splice(n, 1);
				}
			}
		},

		_clearItems: function() {

			if (this.domNode.firstChild) {
				while (this.domNode.firstChild) {
					put(this.domNode.firstChild, '!');
				}
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_getValueOrLabel: function(item) {

			return item.value || item.label;
		},

		_getItemPosition: function(value) {

			for (var i in this.items) {
				if (this._getValueOrLabel(this.items[i]) === value) {
					return i;
				}
			}
		},

		_afterShow: function() {

			this._updateStateItemsByData();
		}
	});
});
