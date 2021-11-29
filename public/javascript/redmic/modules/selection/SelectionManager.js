define([
	'alertify/alertify.min'
	, 'app/designs/textSearchList/main/Selection'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'put-selector/put'
	, 'redmic/base/Credentials'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Selection'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInPopup'
], function(
	alertify
	, Selection
	, declare
	, lang
	, Deferred
	, put
	, Credentials
	, _Module
	, _Selection
	, _Show
	, _ShowInPopup
) {

	return declare([_Module, _Show, _Selection], {
		//	summary:
		//		Gestor de selecciones persistentes.
		//	description:
		//		Permite al usuario almacenar su selección en privado, compartirla y también restaurarla posteriormente.

		constructor: function(args) {

			this.config = {
				ownChannel: 'selectionManager',
				events: {
					STORE_SELECTION: 'storeSelection',
					RETRIEVE_SELECTIONS_TARGET: 'retrieveSelectionsTarget',
					CLONE_SELECTION: 'cloneSelection'
				},
				actions: {
					SAVE_SELECTION: 'saveSelection',
					RESTORE_SELECTION: 'restoreSelection',
					STORE_SELECTION: 'storeSelection',
					SELECTION_STORED: 'selectionStored',
					RETRIEVE_SELECTIONS_TARGET: 'retrieveSelectionsTarget',
					SELECTIONS_TARGET_RETRIEVED: 'selectionsTargetRetrieved',
					CLONE_SELECTION: 'cloneSelection'
				},

				idProperty: 'id',
				nameProperty: 'name',
				sharedProperty: 'shared'
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._onSelectionManagerAncestorHidden));
		},

		_setConfigurations: function() {

			this.loadSelectionConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.restoreSelection
			}, this.loadSelectionConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel('SAVE_SELECTION'),
				callback: '_subSaveSelection'
			},{
				channel: this.getChannel('RESTORE_SELECTION'),
				callback: '_subRestoreSelection'
			},{
				channel: this._buildChannel(this.selectorChannel, this.actions.SELECTION_STORED),
				callback: '_subSelectionStored'
			},{
				channel: this._buildChannel(this.selectorChannel, this.actions.SELECTIONS_TARGET_RETRIEVED),
				callback: '_subSelectionsTargetRetrieved'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'STORE_SELECTION',
				channel: this._buildChannel(this.selectorChannel, this.actions.STORE_SELECTION)
			},{
				event: 'RETRIEVE_SELECTIONS_TARGET',
				channel: this._buildChannel(this.selectorChannel, this.actions.RETRIEVE_SELECTIONS_TARGET)
			},{
				event: 'CLONE_SELECTION',
				channel: this._buildChannel(this.selectorChannel, this.actions.CLONE_SELECTION)
			});
		},

		_subSaveSelection: function(req) {

			if (this._saveSelectionDfd && !this._saveSelectionDfd.isFulfilled()) {
				this._saveSelectionDfd.cancel();
			}
			this._saveSelectionDfd = new Deferred();

			this._saveSelectionDfd.then(
				lang.hitch(this, this._saveSelection),
				lang.hitch(this, this._emitEvt, 'COMMUNICATION', {
					description: this.i18n.noItem
				}));

			this._emitEvt('TOTAL');
		},

		_totalAvailable: function(res) {

			if (!this._saveSelectionDfd) {
				return;
			}

			var selectionId = this._getCurrentSelectionId();

			if (res.total && selectionId) {
				this._saveSelectionDfd.resolve(selectionId);
			} else {
				this._saveSelectionDfd.reject();
			}
		},

		_getCurrentSelectionId: function() {

			return Credentials.get('selectIds')[this.selectionTarget];
		},

		_saveSelection: function(selectionId) {

			var saveCbk = lang.hitch(this, this._saveNewSelection, selectionId);

			if (!this._lastPersistentSelection) {
				saveCbk();
				return;
			}

			alertify.confirm(
				this.i18n.saveSelection,
				this.i18n.saveSelectionConfirmationMessage,
				lang.hitch(this, this._updateExistingSelection),
				saveCbk
			).set('labels', {
				ok: this.i18n.overwrite,
				cancel: this.i18n.save
			});
		},

		_updateExistingSelection: function() {

			var selectionId = this._getCurrentSelectionId(),
				objToSave = {
					selectionId: selectionId
				};

			objToSave[this.idProperty] = this._lastPersistentSelection[this.idProperty];
			objToSave[this.nameProperty] = this._lastPersistentSelection[this.nameProperty];
			objToSave[this.sharedProperty] = this._lastPersistentSelection[this.sharedProperty];

			this._storeSelection(objToSave);
		},

		_saveNewSelection: function(selectionId) {

			var promptCbk = lang.hitch(this, this._getSaveParametersAndStore, selectionId),
				prompt = alertify.prompt(this.i18n.newNameMessage, '', promptCbk, function() {

					this.destroy();
				});

			prompt.setHeader(this.i18n.saveSelection);
			this._addSharedCheckbox(prompt);
		},

		_getSaveParametersAndStore: function(selectionId, evt, value) {

			var obj = {
				selectionId: selectionId,
				name: value,
				shared: this._sharedCheckbox.checked
			};

			delete this._lastPersistentSelection;
			this._storeSelection(obj);
		},

		_addSharedCheckbox: function(prompt) {

			var promptContent = prompt.elements.content,
				sharedCheckboxId = this.getOwnChannel() + '-sharedCheckbox';

			this._sharedCheckbox = put(promptContent, 'input[type=checkbox]#' + sharedCheckboxId);
			put(promptContent, 'label[for=' + sharedCheckboxId + ']', this.i18n.shareSelection);
		},

		_storeSelection: function(data) {

			this._emitEvt('STORE_SELECTION', this._getDataToStore(data));
		},

		_getDataToStore: function(data) {

			return {
				target: this.selectionTarget,
				data: data
			};
		},

		_subSelectionStored: function(res) {

			if (!res.data) {
				return;
			}

			this._lastPersistentSelection = res.data;

			if (!res.data[this.sharedProperty]) {
				return;
			}

			var shareUrl = window.location + '?settings-id=' + res.data[this.idProperty];

			alertify.message('<i class="fa fa-share-alt"></i> ' + this.i18n.copyToClipboard, 0, lang.hitch(this, function(url) {

				// TODO este mecanismo se debe abstraer para reutilizarlo
				if (!navigator.clipboard) {
					console.error('Copy to clipboard failed!');
					return;
				}
				navigator.clipboard.writeText(url);
			}, shareUrl));
		},

		_subRestoreSelection: function() {

			var overwriteCbk = lang.hitch(this, function() {

				this._emitEvt('RETRIEVE_SELECTIONS_TARGET', {
					target: this.selectionTarget
				});
			});

			alertify.confirm(
				this.i18n.saveSelection,
				this.i18n.loseSelectionConfirmationMessage,
				overwriteCbk,
				null
			).set('labels', {
				ok: this.i18n.ok,
				cancel: this.i18n.cancel
			});
		},

		_subSelectionsTargetRetrieved: function(res) {

			var selectionTarget = res.target,
				selectionEditionTarget = res.editionTarget;

			if (!this._loadSelection) {
				this.loadSelectionConfig.target = selectionTarget;
				this.loadSelectionConfig.editionTarget = selectionEditionTarget;

				var SelectionDefinition = declare(Selection).extend(_ShowInPopup);
				this._loadSelection = new SelectionDefinition(this.loadSelectionConfig);

				this._subscribe(this._loadSelection.getChannel('UPDATE_DATA'), lang.hitch(this,
					this._subSelectionLoad));
			} else {
				this._publish(this._loadSelection.getChannel('UPDATE_TARGET'), {
					target: selectionTarget,
					editionTarget: selectionEditionTarget
				});
			}

			this._publish(this._loadSelection.getChannel('SHOW'));
		},

		_subSelectionLoad: function(res) {

			this._publish(this._loadSelection.getChannel('HIDE'));

			if (this._loadSelectionDfd && !this._loadSelectionDfd.isFulfilled()) {
				this._loadSelectionDfd.cancel();
			}
			this._loadSelectionDfd = new Deferred();

			this._loadSelectionDfd.then(lang.hitch(this, this._continueSelectionLoadAfterClear, res));

			var isOldFormat = res.data && res.data.ids;
			this._emitEvt('CLEAR_SELECTION', {
				omitPersistence: !isOldFormat
			});
		},

		_clearSelection: function() {

			this._loadSelectionDfd && this._loadSelectionDfd.resolve();
		},

		_continueSelectionLoadAfterClear: function(res) {

			var data = res.data,
				settingsId = data.id,
				selection = data && data.ids;

			this._lastPersistentSelection = data;

			if (selection) {
				this._emitEvt('SELECT', selection);
			} else {
				this._emitEvt('CLONE_SELECTION', {
					target: this.selectionTarget,
					id: settingsId
				});
			}
		},

		_onSelectionManagerAncestorHidden: function() {

			this._loadSelection && this._publish(this._loadSelection.getChannel('HIDE'));
		}
	});
});
