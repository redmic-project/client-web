define([
	'dojo/_base/declare'
	, 'src/component/base/_SelectionManagerItfc'
], function(
	declare
	, _SelectionManagerItfc
) {

	return declare(_SelectionManagerItfc, {
		// summary:
		//   Base común para todos los componentes que trabajan con selección local de elementos.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					SELECT_ITEM: 'selectItem',
					DESELECT_ITEM: 'deselectItem',
					GET_SELECTION: 'getSelection',
					CLEAR_SELECTION: 'clearSelection',
					SELECT_SINGLE_ITEM: 'selectSingleItem'
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
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const options = {
				predicate: req => this._chkTargetIsValid(req)
			};

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.selectionManagerChannel, 'ITEM_SELECTED'),
				callback: '_subItemSelected',
				options
			},{
				channel: this._buildChannel(this.selectionManagerChannel, 'ITEM_DESELECTED'),
				callback: '_subItemDeselected',
				options
			},{
				channel: this._buildChannel(this.selectionManagerChannel, 'SELECTION_GOT'),
				callback: '_subSelectionGot',
				options
			},{
				channel: this._buildChannel(this.selectionManagerChannel, 'SELECTION_CLEARED'),
				callback: '_subSelectionCleared',
				options
			});
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'SELECT_ITEM',
				channel: this._buildChannel(this.selectionManagerChannel, 'SELECT_ITEM')
			},{
				event: 'DESELECT_ITEM',
				channel: this._buildChannel(this.selectionManagerChannel, 'DESELECT_ITEM')
			},{
				event: 'GET_SELECTION',
				channel: this._buildChannel(this.selectionManagerChannel, 'GET_SELECTION')
			},{
				event: 'CLEAR_SELECTION',
				channel: this._buildChannel(this.selectionManagerChannel, 'CLEAR_SELECTION')
			},{
				event: 'SELECT_SINGLE_ITEM',
				channel: this._buildChannel(this.selectionManagerChannel, 'SELECT_SINGLE_ITEM')
			});
		},

		_subItemSelected: function(res) {

			this._onItemSelected(res);
		},

		_subItemDeselected: function(res) {

			this._onItemDeselected(res);
		},

		_subSelectionGot: function(res) {

			const itemIds = res?.itemIds,
				target = res?.target;

			itemIds?.forEach(itemId => this._onItemSelected({itemId, target}));
		},

		_subSelectionCleared: function(res) {

			this._onSelectionCleared(res);
		},

		_getSelectionTarget: function() {

			return this.selectionTarget ?? this._getTarget?.() ?? this.target;
		}
	});
});
