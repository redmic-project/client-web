define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_SelectionManager"
	, 'src/component/browser/row/_BrowserRowSelect'
], function(
	declare
	, lang
	, aspect
	, _SelectionManager
	, _BrowserRowSelect
) {

	return declare(_SelectionManager, {
		// summary:
		//   Base de selección para componente Browser, adaptando la base común de selección a este componente.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					CLEAR_SELECTION_ROWS: "clearSelectionRows",
					SELECT_ALL_ROWS: "SelectAllRows",
					SELECTED_ROW: "selectedRow",
					DESELECTED_ROW: "deselectedRow"
				},
				actions: {
					SELECTED_ROW: "selectedRow",
					DESELECTED_ROW: "deselectedRow",
					SELECT_ROW: "selectRow",
					DESELECT_ROW: "deselectRow",
					CLEAR_SELECTION_ROWS: "clearSelectionRows",
					SELECT_ALL_ROWS: "SelectAllRows"
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setSelectConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectEventsAndActions));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionSelectRow));
		},

		_setSelectConfigurations: function() {

			this.rowConfig = this._merge([{
				simpleSelection: this.simpleSelection
			}, this.rowConfig || {}]);
		},

		_mixSelectEventsAndActions: function () {

			lang.mixin(this.events, this.selectEvents);
			lang.mixin(this.actions, this.selectActions);

			delete this.selectEvents;
			delete this.selectActions;
		},

		_defineSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.getChannel("SELECT_ROW"),
				callback: "_subSelectRow"
			},{
				channel : this.getChannel("DESELECT_ROW"),
				callback: "_subDeselectRow"
			});
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'SELECTED_ROW',
				channel: this.getChannel("SELECTED_ROW")
			},{
				event: 'DESELECTED_ROW',
				channel: this.getChannel("DESELECTED_ROW")
			},{
				event: 'SELECT_ALL_ROWS',
				channel: this.getChannel("SELECT_ALL_ROWS")
			},{
				event: 'CLEAR_SELECTION_ROWS',
				channel: this.getChannel("CLEAR_SELECTION_ROWS")
			});
		},

		_subSelectRow: function(req) {

			const itemId = req.idProperty,
				item = req.item,
				target = this._getSelectionTarget(),
				selectEvent = this.simpleSelection ? 'SELECT_SINGLE_ITEM' : 'SELECT_ITEM';

			console.log('sele', selectEvent, {itemId, item, target})
			this._emitEvt(selectEvent, {itemId, item, target});
		},

		_subDeselectRow: function(req) {

			const itemId = req.idProperty,
				item = req.item,
				target = this._getSelectionTarget();

			console.log('desele', {itemId, item, target})
			this._emitEvt('DESELECT_ITEM', {itemId, item, target});
		},

		_onItemSelected: function(res) {

			const itemId = res?.itemId;
			this._selectRow(itemId);
		},

		_selectRow: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			// TODO tiene sentido? hacerlo antes que el SELECT de row? replantear
			this._emitEvt('SELECTED_ROW', {
				idProperty
			});

			const rowInstance = this._getRowInstance(idProperty);

			if (!rowInstance) {
				return;
			}

			this._publish(rowInstance.getChannel('SELECT'));
		},

		_deselectRow: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			// TODO tiene sentido? hacerlo antes que el DESELECT de row? replantear
			this._emitEvt('DESELECTED_ROW', {
				idProperty
			});

			const rowInstance = this._getRowInstance(idProperty);

			if (!rowInstance) {
				return;
			}

			this._publish(rowInstance.getChannel('DESELECT'));
		},

		_onItemDeselected: function(res) {

			const itemId = res?.itemId;
			this._deselectRow(itemId);
		},

		_onSelectionCleared: function() {

			this._emitEvt('CLEAR_SELECTION_ROWS');
		},

		_definitionSelectRow: function() {

			this._defRow.push(_BrowserRowSelect);
		},

		_addRow: function(itemId) {

			this.inherited(arguments);

			const target = this._getSelectionTarget();
			//this._emitEvt('GET_SELECTION', {target, itemId});
		}
	});
});
