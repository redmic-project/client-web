define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Show"
	, "./_TreeItfc"
], function(
	declare
	, lang
	, _Module
	, _Selection
	, _Show
	, _TreeItfc
) {

	return declare([_Module, _TreeItfc, _Selection, _Show], {
		//	summary:
		//		Módulo de Tree.
		//	description:
		//		Permite trabajar con un árbol para representar datos anidados.
		//		Escucha y publica a través de Mediator.

		//	config: Object
		//		Opciones y asignaciones por defecto.

		constructor: function(args) {

			this.config = {
				childrenProperty: "leaves",
				pathSeparator: ".",
				itemLabel: "label",
				_selection: {},
				i18n: this.i18n,
				_refreshedPublicationTimeout: 50,

				events: {
					DATAADD: "dataAdd",
					DATAUPDATE: "dataUpdate",
					DATADELETE: "dataDelete",
					CHECKBOXCLICK: "checkBoxClick",
					CHILDRENCHANGE: "childrenChange"
				},

				actions: {
					REFRESHED: "refreshed"
				},

				ownChannel: "tree"
			};

			lang.mixin(this, this.config, args);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'DATAADD',
				channel: this.getChannel("REFRESHED"),
				callback: "_pubRefreshed"
			},{
				event: 'DATAUPDATE',
				channel: this.getChannel("REFRESHED"),
				callback: "_pubRefreshed"
			},{
				event: 'DATADELETE',
				channel: this.getChannel("REFRESHED"),
				callback: "_pubRefreshed"
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CHECKBOXCLICK', lang.hitch(this, this._checkSelectedOrDeselected));
		},

		_insertDataIntoStore: function(data) {

			if (!data) {
				return;
			}

			var items;
			if (!(data instanceof Array)) {
				data = [data];
			}
			items = data.map(lang.hitch(this, this._mapResults));

			for (var i = 0; i < items.length; i++) {
				this._insertItemIntoStore(items[i]);
			}
		},

		_mapResults: function(item) {

			if(!item)
				return;

			var retItem = item._source || item;

			retItem[this.parentProperty] = this._getParentValue(retItem);
			retItem[this.labelAttr] = this._getLabelValue(retItem);
			retItem[this.checkedAttr] = this._getCheckedValue(retItem);

			return retItem;
		},

		_getParentValue: function(item) {

			if (!item[this.idProperty]) {
				return item[this.parentProperty];
			}

			var pathSplitted = item[this.idProperty].split(this.pathSeparator),
				parent;

			pathSplitted.pop();
			parent = pathSplitted.join(this.pathSeparator);
			return parent.indexOf(this.pathSeparator) < 0 ? null : parent;
		},

		_getLabelValue: function(item) {

			if (typeof this.itemLabel === "function") {
				return this.itemLabel(item);
			}

			if (typeof this.itemLabel === "string") {
				if (this.itemLabel.indexOf("{") < 0) {
					return item[this.itemLabel] || item[this.idProperty];
				}
				return lang.replace(this.itemLabel, item);
			}

			return item[this.idProperty];
		},

		_getCheckedValue: function(item) {

			var itemId = item[this.idProperty];

			return this._selection[itemId] || this._isParentItemSelected(item);
		},

		_isParentItemSelected: function(item) {

			var parentId = item[this.parentProperty],
				parentItem = this.getItem(parentId);

			return parentItem && this.getChecked(parentItem) === true;
		},

		_insertItemIntoStore: function(item) {

			if (!item) {
				return;
			}

			if (!this.getItem(item[this.idProperty])) {
				this.putItem(item);
			}
		},

		_select: function(itemId) {

			var item = this._obtainItem(itemId);
			itemId = this._obtainItemId(itemId);

			if (this._selection[itemId]) {
				return;
			}

			this._selection[itemId] = true;

			if (item && this.isItem(item)) {
				this.getChecked(item) !== true && this.setChecked(item, true);
			}
		},

		_obtainItem: function(itemId) {

			if (typeof itemId === "object") {
				return itemId;
			}

			return this.getItem(itemId);
		},

		_obtainItemId: function(itemId) {

			if (typeof itemId === "object") {
				return itemId[this.idProperty];
			}

			return itemId;
		},

		_deselect: function(itemId) {

			var item = this._obtainItem(itemId);
			itemId = this._obtainItemId(itemId);

			delete this._selection[itemId];

			item && this.getChecked(item) && this.setChecked(item, false);
		},

		_pubRefreshed: function(channel) {

			clearTimeout(this._refreshedPublicationTimeoutHandler);
			this._refreshedPublicationTimeoutHandler = setTimeout(lang.hitch(this, function() {

				this._publish(channel, {
					success: true,
					target: this.target
				});
			}), this._refreshedPublicationTimeout);
		},

		_checkSelectedOrDeselected: function(evt) {

			var item = evt[0],
				event = evt[2],
				itemId = item[this.idProperty],
				target = event.target || event.currentTarget,
				evtToEmit = target.checked ? 'SELECT' : 'DESELECT';

			this._emitEvt(evtToEmit, itemId);
		},

		clear: function() {

			this._clearSelection();
			this.close();
			this._storeInitialize();
			this._doStoreEvtFacade();
		},

		_clearSelection: function() {

			for (var selectedItemId in this._selection) {
				this._deselect(selectedItemId);
			}
		}
	});
});
