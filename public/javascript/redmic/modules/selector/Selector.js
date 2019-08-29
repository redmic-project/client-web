define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_SelectionBase"
	, "RWidgets/Utilities"
	, "./_SelectorItfc"
	, "./_SelectorPersistence"
], function(
	declare
	, lang
	, Deferred
	, all
	, _Module
	, _SelectionBase
	, Utilities
	, _SelectorItfc
	, _SelectorPersistence
) {

	return declare([_Module, _SelectionBase, _SelectorPersistence, _SelectorItfc], {
		//	summary:
		//		Módulo de selección global y persistente.
		//	description:
		//		Proporciona métodos manejar seleccionar / deseleccionar los items de la base de datos

		constructor: function(args) {

			this.config = {
				// own events
				events: {},
				// own actions
				actions: {},

				// mediator params
				ownChannel: "selection",

				// Items selected structure
				selections: {}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SELECT"),
				callback: "_subSelect"
			},{
				channel : this.getChannel("DESELECT"),
				callback: "_subDeselect"
			},{
				channel : this.getChannel("GROUP_SELECTED"),
				callback: "_subGroupSelected"
			},{
				channel : this.getChannel("CLEAR_SELECTION"),
				callback: "_subClearSelection"
			},{
				channel : this.getChannel("TOTAL"),
				callback: "_subTotal"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SELECT',
				channel: this.getChannel("SELECTED")
			},{
				event: 'DESELECT',
				channel: this.getChannel("DESELECTED")
			},{
				event: 'GROUP_SELECTED',
				channel: this.getChannel("SELECTED_GROUP")
			},{
				event: 'CLEAR_SELECTION',
				channel: this.getChannel("SELECTION_CLEARED")
			},{
				event: 'TOTAL',
				channel: this.getChannel("TOTAL_AVAILABLE")
			},{
				event: 'SELECTION_TARGET_LOADING',
				channel: this.getChannel("SELECTION_TARGET_LOADING")
			},{
				event: 'SELECTION_TARGET_LOADED',
				channel: this.getChannel("SELECTION_TARGET_LOADED")
			});
		},

		_subSelect: function(request) {

			var items = request.items,
				target = request.target;

			this._emitSelectionTargetLoading(target);
			this._initializeSelection(target);

			if (typeof items !== "object") {
				items = [items];
			}

			if (target.indexOf('{apiUrl}') !== -1) {
				// Seleccionamos a la vuelta del server
				this._emitSave(this._getDataToSave(this.actions.SELECT, items, target));
			} else {
				//Selección local
				this._select(items, target);
			}
		},

		_select: function(items, target) {

			var selectionDfdList = [];

			for (var i = 0; i < items.length; i++) {
				var item = items[i].toString(),
					selectionDfd = new Deferred();

				selectionDfdList.push(selectionDfd);
				this._selectItem(item, target, selectionDfd);
			}

			all(selectionDfdList).then(lang.hitch(this, this._selected, target));
		},

		_selectItem: function(id, target, selectionDfd) {

			// Si seleccionamos un elemento ya englobado en la selección
			if (this._isSelected(id, target)) {
				selectionDfd.resolve();
				return;
			}

			this._selectById(id, target);
			selectionDfd.resolve(id);
		},

		_selected: function(target, results) {

			var selectedKeys = Object.keys(this._getItems(target)),
				actualResults = Utilities.intersection(selectedKeys, results);

			if (actualResults.length) {
				this._emitEvt('SELECT', {
					ids: actualResults,
					total: this._getTotal(target),
					target: target
				});
			} else {
				this._emitSelectionTargetLoaded(target);
			}
		},

		_selectedAll: function(ids, target) {

			var obj = ids.reduce(function(o, v, i) {

				o[v] = 't';
				return o;
			}, {});

			this._initializeSelection(target);
			this.selections[target].items = obj;
			this.selections[target].total = ids.length;

			this._emitEvt('SELECT', {
				ids: ids,
				total: ids.length,
				target: target
			});
		},

		_subDeselect: function(request) {

			var items = request.items,
				target = request.target;

			this._emitSelectionTargetLoading(target);
			this._initializeSelection(target);

			if (typeof items !== "object") {
				items = [items];
			}

			if (target.indexOf('{apiUrl}') !== -1) {
				// Deseleccionamos a la vuelta del server
				this._emitSave(this._getDataToSave(this.actions.DESELECT, items, target));
			} else {
				//Deselección local
				this._deselect(items, target);
			}
		},

		_deselect: function(items, target) {

			var deselectionDfdList = [];

			for (var i = 0; i < items.length; i++) {
				var item = items[i].toString(),
					dfd = new Deferred();

				deselectionDfdList.push(dfd);
				this._deselectItem(item, target, dfd);
			}

			all(deselectionDfdList).then(lang.hitch(this, this._deselected, target));
		},

		_deselectItem: function(id, target, deselectionDfd) {

			// Si deseleccionamos un elemento no seleccionado
			if (!this._isSelected(id, target)) {
				deselectionDfd.resolve();
				return;
			}

			this._deselectById(id, target);
			deselectionDfd.resolve(id);
		},

		_deselected: function(target, results) {

			var deselectedIds = Utilities.flatten(Utilities.compact(results));

			if (deselectedIds.length) {
				this._emitEvt('DESELECT', {
					ids: deselectedIds,
					total: this._getTotal(target),
					target: target
				});
			} else {
				this._emitSelectionTargetLoaded(target);
			}
		},

		_getTotal: function(target) {

			return this._getSelection(target).total || 0;
		},

		_getItems: function(target) {

			return this._getSelection(target).items || {};
		},

		_getSelection: function(target) {

			return this.selections && this.selections[target] ? this.selections[target] : {};
		},

		_subGroupSelected: function(request) {

			this._emitSelectionTargetLoading(request.target);
			this._groupSelected(request);
		},

		_subClearSelection: function(request) {

			this._clearSelectionSave(request);
		},

		_clearSelectionSave: function(request) {

			this._emitSelectionTargetLoading(request.target);
			this._emitSave(this._getDataToSave(this.actions.CLEAR_SELECTION, null, request.target));
		},

		_clearSelection: function(target) {

			this._resetSelection(target);

			this._emitEvt('CLEAR_SELECTION', {
				target: target
			});
		},

		_initializeSelection: function(target) {

			if (!this.selections[target]) {
				this._resetSelection(target);
			}
		},

		_resetSelection: function(target) {

			this.selections[target] = {
				items: {},
				total: 0
			};
		},

		_isSelected: function(itemPath, target) {

			return this._getItems(target)[itemPath];
		},

		_deselectById: function(itemPath, target) {

			if (!this._getItems(target)[itemPath]) {
				return;
			}

			delete this.selections[target].items[itemPath];
			this.selections[target].total--;
		},

		_selectById: function(itemPath, target) {

			this._initializeSelection(target);

			if (!this._getItems(target)[itemPath]) {
				this.selections[target].items[itemPath] = true;
				this.selections[target].total++;
			}
		},

		_subTotal: function(req) {

			if (!req || !req.target) {
				return;
			}

			var target = req.target,
				selection = this.selections[target],
				total = selection ? selection.total : null;

			this._emitEvt('TOTAL', {
				target: target,
				total: total || 0,
				requesterId: req.requesterId
			});
		},

		_emitSelectionTargetLoading: function(target) {

			this._emitEvt('SELECTION_TARGET_LOADING', {
				target: target
			});
		},

		_emitSelectionTargetLoaded: function(target) {

			this._emitEvt('SELECTION_TARGET_LOADED', {
				target: target
			});
		}
	});
});
