define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
], function(
	declare
	, _Module
) {

	return declare(_Module, {
		// summary:
		//   Componente encargado de centralizar la selección de elementos.

		// _selection: Object
		//   Contiene los identificadores de los elementos seleccionados, indexados por target.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'selectionManager',
				events: {
					ITEM_SELECTED: 'itemSelected',
					ITEM_DESELECTED: 'itemDeselected',
					SELECTION_GOT: 'selectionGot',
					SELECTION_CLEARED: 'selectionCleared'
				},
				actions: {
					SELECT_ITEM: 'selectItem',
					ITEM_SELECTED: 'itemSelected',
					DESELECT_ITEM: 'deselectItem',
					ITEM_DESELECTED: 'itemDeselected',
					GET_SELECTION: 'getSelection',
					SELECTION_GOT: 'selectionGot',
					CLEAR_SELECTION: 'clearSelection',
					SELECTION_CLEARED: 'selectionCleared',
					SELECT_SINGLE_ITEM: 'selectSingleItem'
				},
				_selection: {}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			const options = {
				predicate: req => this._chkTargetIsValid(req)
			};

			this.subscriptionsConfig.push({
				channel: this.getChannel('SELECT_ITEM'),
				callback: '_subSelectItem',
				options
			},{
				channel: this.getChannel('DESELECT_ITEM'),
				callback: '_subDeselectItem',
				options
			},{
				channel: this.getChannel('GET_SELECTION'),
				callback: '_subGetSelection',
				options
			},{
				channel: this.getChannel('CLEAR_SELECTION'),
				callback: '_subClearSelection',
				options
			},{
				channel: this.getChannel('SELECT_SINGLE_ITEM'),
				callback: '_subSelectSingleItem',
				options
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ITEM_SELECTED',
				channel: this.getChannel('ITEM_SELECTED')
			},{
				event: 'ITEM_DESELECTED',
				channel: this.getChannel('ITEM_DESELECTED')
			},{
				event: 'SELECTION_GOT',
				channel: this.getChannel('SELECTION_GOT')
			},{
				event: 'SELECTION_CLEARED',
				channel: this.getChannel('SELECTION_CLEARED')
			});
		},

		_subSelectItem: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._performSelectItem(req, requesterChannel);
		},

		_subDeselectItem: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._performDeselectItem(req, requesterChannel);
		},

		_subGetSelection: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._performGetSelection(req, requesterChannel);
		},

		_subClearSelection: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._performClearSelection(req, requesterChannel);
		},

		_subSelectSingleItem: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._performSingleSelectItem(req, requesterChannel);
		},

		_getRequesterChannel: function(componentInfo) {

			return componentInfo?.publisherChannel ?? '';
		},

		_performSelectItem: function(req, requesterChannel) {

			const target = req.target,
				itemId = req.itemId,
				item = req.item;

			this._addItemIdToSelection(target, itemId);

			this._emitEvt('ITEM_SELECTED', {
				target,
				itemId,
				item
			});
		},

		_addItemIdToSelection: function(target, itemId) {

			this._selection[target] = this._selection[target] ?? {itemIds: {}};

			this._selection[target].itemIds[itemId] = true;
		},

		_performDeselectItem: function(req, requesterChannel) {

			const target = req.target,
				itemId = req.itemId,
				item = req.item;

			this._removeItemIdFromSelection(target, itemId);

			this._emitEvt('ITEM_DESELECTED', {
				target,
				itemId,
				item
			});
		},

		_removeItemIdFromSelection: function(target, itemId) {

			delete this._selection[target]?.itemIds?.[itemId];
		},

		_performGetSelection: function(req, requesterChannel) {

			const target = req.target,
				requestedItemId = req.itemId,
				itemIds = this._getItemIdsForGetSelection(target, requestedItemId);

			this._emitEvt('SELECTION_GOT', {
				target,
				itemIds
			});
		},

		_getItemIdsForGetSelection: function(target, itemId) {

			if (!itemId) {
				return this._getSelectedItemIds(target);
			}

			return this._isItemIdSelected(target, itemId) ? [itemId] : [];
		},

		_getSelectedItemIds: function(target) {

			return Object.keys(this._selection[target]?.itemIds ?? {});
		},

		_isItemIdSelected: function(target, itemId) {

			return this._selection[target]?.itemIds?.[itemId] ?? false;
		},

		_performClearSelection: function(req, requesterChannel) {

			const target = req.target;

			this._emptyTargetSelection(target);

			this._emitEvt('SELECTION_CLEARED', {
				target
			});
		},

		_emptyTargetSelection: function(target) {

			delete this._selection[target];
		},

		_performSingleSelectItem: function(req, requesterChannel) {

			const target = req.target,
				prevItemIds = this._getSelectedItemIds(target);

			prevItemIds?.forEach(itemId => this._performDeselectItem({target, itemId}, requesterChannel));

			this._performSelectItem(req, requesterChannel);
		}
	});
});
