define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_SelectionBase"
	, "redmic/modules/base/_SelectorItfc"
	, "redmic/modules/base/_SelectorPersistence"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, Deferred
	, all
	, _Module
	, _SelectionBase
	, _SelectorItfc
	, _SelectorPersistence
	, Utilities
){
	return declare([_Module, _SelectionBase, _SelectorItfc, _SelectorPersistence], {
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
				channel : this.getChannel("SELECT_ALL"),
				callback: "_subSelectAll"
			},{
				channel : this.getChannel("REVERSE"),
				callback: "_subReverse"
			},{
				channel : this.getChannel("TOTAL"),
				callback: "_subTotal"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SELECT',
				channel: this.getChannel("SELECTED"),
				callback: "_pubSelected"
			},{
				event: 'DESELECT',
				channel: this.getChannel("DESELECTED"),
				callback: "_pubDeselected"
			},{
				event: 'GROUP_SELECTED',
				channel: this.getChannel("SELECTED_GROUP"),
				callback: "_pubSelectedGroup"
			},{
				event: 'CLEAR_SELECTION',
				channel: this.getChannel("SELECTION_CLEARED"),
				callback: "_pubSelectionCleared"
			},{
				event: 'SELECT_ALL',
				channel: this.getChannel("SELECTED_ALL"),
				callback: "_pubSelectedAll"
			},{
				event: 'REVERSED',
				channel: this.getChannel("REVERSED"),
				callback: "_pubReversed"
			},{
				event: 'TOTAL',
				channel: this.getChannel("TOTAL_AVAILABLE"),
				callback: "_pubTotal"
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
				target = request.selectionTarget;

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
					selectionTarget: target
				});
			} else {
				this._emitSelectionTargetLoaded(target);
			}
		},

		_pubSelected: function(channel, item) {

			this._publish(channel, {
				success: true,
				body: item
			});
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
				selectionTarget: target
			});
		},

		_subDeselect: function(request) {

			var items = request.items,
				target = request.selectionTarget;

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
					selectionTarget: target
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

		_pubDeselected: function(channel, item) {

			this._publish(channel, {
				success: true,
				body: item
			});
		},

		_subGroupSelected: function(request) {

			this._emitSelectionTargetLoading(request.selectionTarget);
			this._groupSelected(request);
		},

		_pubSelectedGroup: function(channel, evt) {

			var items = evt[0],
				target = evt[1],
				requesterId = evt[2],
				objToPublish = {
					success: true,
					body: {
						selection: items,
						selectionTarget: target
					}
				};

			if (requesterId) {
				objToPublish.body.requesterId = requesterId;
			}

			this._publish(channel, objToPublish);
		},

		_subClearSelection: function(request) {

			this._clearSelectionSave(request);
		},

		_clearSelectionSave: function(request) {

			this._emitSelectionTargetLoading(request.selectionTarget);
			this._emitSave(this._getDataToSave(this.actions.CLEAR_SELECTION, null, request.selectionTarget));
		},

		_clearSelection: function(target) {

			this._resetSelection(target);
			this._emitEvt('CLEAR_SELECTION', target);
		},

		_initializeSelection: function(target) {

			if (!this.selections[target]) {
				this._resetSelection(target);
			}
		},

		_resetSelection: function(target) {

			this.selections[target] = {items: {}, total: 0};
		},

		_pubSelectionCleared: function(channel, target) {

			this._publish(channel, {
				success: true,
				body: {
					selectionTarget: target
				}
			});
		},

		_isSelected: function(itemPath, target) {

			if (!this._getItems(target)[itemPath]) {
				return false;
			}

			return true;
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

		_subSelectAll: function(request) {

			this._emitSelectionTargetLoading(request.selectionTarget);
			this._selectAll(request);
		},

		_pubSelectedAll: function(channel, item) {

			this._publish(channel, {
				success: true,
				body: item
			});
		},

		_subReverse: function(request) {

			this._emitSelectionTargetLoading(request.selectionTarget);
			this._reverse(request);
		},

		_pubReversed: function(channel, item) {

			this._publish(channel, {
				success: true,
				body: item
			});
		},

		_subTotal: function(request) {

			if (!request || !request.selectionTarget) {
				return;
			}

			var target = request.selectionTarget;
			this._emitEvt('TOTAL', {
				selectionTarget: target,
				total: this.selections[target] ?
					this.selections[target].total : 0,
				requesterId: request.requesterId
			});
		},

		_pubTotal: function(channel, item) {

			this._publish(channel, {
				success: true,
				body: item
			});
		},

		_emitSelectionTargetLoading: function(selectionTarget) {

			this._emitEvt('SELECTION_TARGET_LOADING', {
				selectionTarget: selectionTarget
			});
		},

		_emitSelectionTargetLoaded: function(selectionTarget) {

			this._emitEvt('SELECTION_TARGET_LOADED', {
				selectionTarget: selectionTarget
			});
		}
	});
});
