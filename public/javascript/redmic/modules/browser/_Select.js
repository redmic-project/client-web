define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
	, "./row/_Select"
], function(
	declare
	, lang
	, aspect
	, _Selection
	, _SelectRow
){
	return declare(_Selection, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				selectEvents: {
					CLEAR_SELECTION_ROWS: "clearSelectionRows",
					SELECT_ALL_ROWS: "SelectAllRows",
					SELECTED_ROW: "selectedRow",
					DESELECTED_ROW: "deselectedRow"
				},
				selectActions: {
					SELECTED_ROW: "selectedRow",
					DESELECTED_ROW: "deselectedRow",
					SELECT_ROW: "selectRow",
					DESELECT_ROW: "deselectRow",
					CLEAR_SELECTION_ROWS: "clearSelectionRows",
					SELECT_ALL_ROWS: "SelectAllRows"
				},

				_selection: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setSelectConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineSelectSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineSelectPublications));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionSelectRow));

			aspect.after(this, "_addRow", lang.hitch(this, this._addSelectRow));
			aspect.before(this, "_dataAvailable", lang.hitch(this, this._getSelections));
			aspect.before(this, "_itemAvailable", lang.hitch(this, this._getSelections));
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

		_defineSelectSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SELECT_ROW"),
				callback: "_subSelectRow"
			},{
				channel : this.getChannel("DESELECT_ROW"),
				callback: "_subDeselectRow"
			});
		},

		_defineSelectPublications: function() {

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

			if (this.simpleSelection) {
				this._emitEvt('CLEAR_SELECTION');
			}

			this._emitEvt('SELECT', [req.idProperty]);
		},

		_subDeselectRow: function(req) {

			this._emitEvt('DESELECT', [req.idProperty]);
		},

		_select: function(ids, total) {

			if (ids instanceof Array) {
				for (var i = 0; i < ids.length; i++) {
					this._selectRow(ids[i]);
				}
			} else {
				this._selectRow(ids);
			}
		},

		_selectRow: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			this._selection[idProperty] = true;

			this._emitEvt('SELECTED_ROW', {
				idProperty: idProperty
			});

			var instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			this._publish(instance.getChannel('SELECT'));
		},

		_deselectRow: function(idProperty) {

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			delete this._selection[idProperty];

			this._emitEvt('DESELECTED_ROW', {
				idProperty: idProperty
			});

			var instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			this._publish(instance.getChannel('DESELECT'));
		},

		_deselect: function(ids, total) {

			if (ids instanceof Array) {
				for (var i = 0; i < ids.length; i++) {
					this._deselectRow(ids[i]);
				}
			} else {
				this._deselectRow(ids);
			}
		},

		_clearSelection: function() {

			this._emitEvt('CLEAR_SELECTION_ROWS');

			this._selection = {};
		},

		_getItemToSelect: function(ids) {

			return {
				items: ids
			};
		},

		_getItemToDeselect: function(ids) {

			return {
				items: ids
			};
		},

		_definitionSelectRow: function() {

			this._defRow.push(_SelectRow);
		},

		_getSelections: function() {

			this._once(this._buildChannel(this.selectorChannel, this.actions.GOT_PROPS),
				lang.hitch(this, this._subSelectionsGotProps));

			this._publish(this._buildChannel(this.selectorChannel, this.actions.GET_PROPS), {
				selections: true
			});
		},

		_subSelectionsGotProps: function(req) {

			var selections = req.selections,
				selection = selections && selections[this._getSelectionTarget()] || {};

			if (!selections) {
				return;
			}

			this._selection = selection.items || {};
		},

		_addSelectRow: function(objRet, args) {

			var idProperty = args[0];

			if (this._selection[idProperty]) {
				this._selectRow(idProperty);
			}
		}
	});
});
