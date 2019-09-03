define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_SelectionBase"
	, "redmic/modules/base/_SelectionItfc"
], function(
	declare
	, lang
	, aspect
	, _SelectionBase
	, _SelectionItfc
) {

	return declare([_SelectionBase, _SelectionItfc], {
		//	summary:
		//		Base común para todos los módulos con selección.
		//	description:
		//		Aporta la funcionalidad de selección al módulo que extiende de él.

		constructor: function(args) {

			this.selectionConfig = {
				selectionEvents: {},

				selectionActions: {},

				simpleSelection: false
			};

			lang.mixin(this, this.selectionConfig);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectionEventsAndActions));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeSelection));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineSelectionSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineSelectionPublications));
			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setSelectionOwnCallbacksForEvents));
		},

		_mixSelectionEventsAndActions: function() {

			lang.mixin(this.events, this.selectionEvents);
			lang.mixin(this.actions, this.selectionActions);
			delete this.selectionEvents;
			delete this.selectionActions;
		},

		_initializeSelection: function() {

			this._setEmptySelection(true);
		},

		_defineSelectionSubscriptions: function() {

			var selectionSubscriptionsConfig = this._getSelectionSubscriptionsConfig(this.selectorChannel);

			for (var i = 0; i < selectionSubscriptionsConfig.length; i++) {
				this.subscriptionsConfig.push(selectionSubscriptionsConfig[i]);
			}

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineSelectionPublications: function() {

			var selectionPublicationsConfig = this._getSelectionPublicationsConfig(this.selectorChannel);

			for (var i = 0; i < selectionPublicationsConfig.length; i++) {
				this.publicationsConfig.push(selectionPublicationsConfig[i]);
			}

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_getSelectionSubscriptionsConfig: function(selectorChannel) {

			var options = {
				predicate: lang.hitch(this, this._chkSelectionTargetIsMine)
			};

			var subs = [{
				channel : this._buildChannel(selectorChannel, this.actions.SELECTED),
				callback: "_subSelected",
				options: options,
				alwaysOn: true
			},{
				channel : this._buildChannel(selectorChannel, this.actions.DESELECTED),
				callback: "_subDeselected",
				options: options,
				alwaysOn: true
			},{
				channel : this._buildChannel(selectorChannel, this.actions.SELECTION_CLEARED),
				callback: "_subSelectionCleared",
				options: options,
				alwaysOn: true
			},{
				channel : this._buildChannel(selectorChannel, this.actions.TOTAL_AVAILABLE),
				callback: "_subTotalAvailable",
				options: {
					predicate: lang.hitch(this, this._chkSelectionTargetAndRequester)
				},
				alwaysOn: true
			},{
				channel : this._buildChannel(selectorChannel, this.actions.SELECTED_GROUP),
				callback: "_subSelectedGroup",
				options: {
					predicate: lang.hitch(this, this._chkSelectionTargetAndRequester)
				}
			},{
				channel : this.getChannel('UPDATE_SELECTOR_CHANNEL'),
				callback: "_subUpdateSelectorChannel"
			},{
				channel : this.getChannel("CLEAR_SELECTION"),
				callback: "_subClearSelection"
			}];

			if (!this.omitLoading) {
				subs.push({
					channel : this._buildChannel(selectorChannel, this.actions.SELECTION_TARGET_LOADING),
					callback: "_subSelectionTargetLoading",
					options: {
						predicate: lang.hitch(this, this._chkSelectionTargetLoadingIsMine)
					}
				},{
					channel : this._buildChannel(selectorChannel, this.actions.SELECTION_TARGET_LOADED),
					callback: "_subSelectionTargetLoaded",
					options: {
						predicate: lang.hitch(this, this._chkSelectionTargetLoadingIsMine)
					}
				});
			}

			return subs;
		},

		_getSelectionPublicationsConfig: function(selectorChannel) {

			return [{
				event: 'SELECT',
				channel: this._buildChannel(selectorChannel, this.actions.SELECT),
				callback: "_pubSelect"
			},{
				event: 'DESELECT',
				channel: this._buildChannel(selectorChannel, this.actions.DESELECT),
				callback: "_pubDeselect"
			},{
				event: 'GROUP_SELECTED',
				channel: this._buildChannel(selectorChannel, this.actions.GROUP_SELECTED),
				callback: "_pubGroupSelected"
			},{
				event: 'CLEAR_SELECTION',
				channel: this._buildChannel(selectorChannel, this.actions.CLEAR_SELECTION),
				callback: "_pubClearSelection"
			},{
				event: 'TOTAL',
				channel: this._buildChannel(selectorChannel, this.actions.TOTAL),
				callback: "_pubGetTotal"
			}];
		},

		_setSelectionOwnCallbacksForEvents: function() {

			this.events.ME_OR_ANCESTOR_SHOWN && this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this,
				this._checkSelectionAfterShown));
		},

		_chkSelectionTargetIsMine: function(res) {

			var target = res.target;

			return !target || target === this._getSelectionTarget();
		},

		_chkSelectionTargetAndRequester: function(res) {

			return this._chkSelectionTargetIsMine(res) && this._chkRequesterIsMe(res);
		},

		_subSelected: function(res) {

			var ids = res.ids,
				total = res.total;

			this._setEmptySelection(!total);

			if (this.simpleSelection) {
				this._clearSelection();
			}

			if (ids instanceof Array) {
				for (var i = 0; i < ids.length; i++) {
					this._select(ids[i], total);
				}
			} else {
				this._select(ids, total);
			}

			this._tryToEmitEvt('LOADED');
		},

		_subDeselected: function(res) {

			var ids = res.ids,
				total = res.total;

			this._setEmptySelection(!total);

			if (ids instanceof Array) {
				for (var i = 0; i < ids.length; i++) {
					this._deselect(ids[i], total);
				}
			} else {
				this._deselect(ids, total);
			}

			this._tryToEmitEvt('LOADED');
		},

		_subSelectionCleared: function(res) {

			this._setEmptySelection(true);
			this._clearSelection();

			this._tryToEmitEvt('LOADED');
		},

		_subSelectedGroup: function(res) {

			var selection = res.selection;
			selection && this._selectedGroup(selection);

			this._tryToEmitEvt('LOADED');
		},

		_selectedGroup: function(selection) {

			var total = selection.total;

			this._setEmptySelection(!total);

			for (var id in selection.items) {
				this._select(id, total);
			}
		},

		_subUpdateSelectorChannel: function(req) {

			this._updateSubscriptions(req.selectorChannel);

			this._updatePublications(req.selectorChannel);

			this.selectorChannel = req.selectorChannel;
		},

		_updateSubscriptions: function(selectorChannel) {

			var oldSubscriptions = this._getSelectionSubscriptionsConfig(this.selectorChannel),
				newSubscriptions = this._getSelectionSubscriptionsConfig(selectorChannel);

			this._replaceSubscriptions(oldSubscriptions, newSubscriptions);
		},

		_updatePublications: function(selectorChannel) {

			var oldPublications = this._getSelectionPublicationsConfig(this.selectorChannel),
				newPublications = this._getSelectionPublicationsConfig(selectorChannel);

			this._replacePublications(oldPublications, newPublications);
		},

		_subClearSelection: function(req) {

			this._emitEvt("CLEAR_SELECTION");
		},

		_getSelectionTarget: function() {

			if (this.selectionTarget) {
				return this.selectionTarget;
			}

			return this._getTarget ? this._getTarget() : this.target;
		},

		_pubSelect: function(channel, ids) {

			var obj = {
				items: ids,
				target: this._getSelectionTarget()
			};

			this._publish(channel, obj);
		},

		_pubDeselect: function(channel, ids) {

			var obj = {
				items: ids,
				target: this._getSelectionTarget()
			};

			this._publish(channel, obj);
		},

		_pubGroupSelected: function(channel) {

			this._publish(channel, {
				target: this._getSelectionTarget()
			});
		},

		_pubClearSelection: function(channel) {

			this._publish(channel, {
				target: this._getSelectionTarget()
			});
		},

		_pubGetTotal: function(channel) {

			this._publish(channel, {
				target: this._getSelectionTarget(),
				requesterId: this.getOwnChannel()
			});
		},

		_subTotalAvailable: function(res) {

			this._totalAvailable(res);
		},

		_chkSelectionTargetLoadingIsMine: function(res) {

			var target = res.selectionTarget;

			if (target === this.selectionTarget) {
				return true;
			}

			if (target === this.target) {
				return true;
			}

			return false;
		},

		_subSelectionTargetLoading: function(res) {

			this._tryToEmitEvt('LOADING');
		},

		_subSelectionTargetLoaded: function(res) {

			this._tryToEmitEvt('LOADED');
		},

		_getEmptySelection: function() {

			return this.statusFlags.emptySelection;
		},

		_setEmptySelection: function(value) {

			this.statusFlags.emptySelection = value;
		}
	});
});
