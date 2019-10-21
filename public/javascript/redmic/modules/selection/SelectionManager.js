define([
	'alertify/alertify.min'
	, 'app/designs/textSearchList/main/Selection'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Selection'
	, 'redmic/modules/base/_ShowInPopup'
], function(
	alertify
	, Selection
	, declare
	, lang
	, Deferred
	, put
	, _Module
	, _Selection
	, _ShowInPopup
) {

	return declare([_Module, _Selection], {
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

				idProperty: 'id'
			};

			lang.mixin(this, this.config, args);
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

			var selectionId = req.selectionId,
				saveCbk = lang.hitch(this, this._saveSelection, selectionId),
				updateCbk = lang.hitch(this, this._updateSelection, selectionId);

			if (!this.idSelectionLoaded) {
				saveCbk();
				return;
			}

			alertify.confirm(
				this.i18n.saveSelection,
				this.i18n.saveSelectionConfirmationMessage,
				updateCbk,
				saveCbk
			).set('labels', {
				ok: this.i18n.overwrite,
				cancel: this.i18n.save
			});
		},

		_updateSelection: function(selectionId) {

			var obj = {
				selectionId: selectionId,
				name: this.idSelectionLoaded.name
			};

			obj[this.idProperty] = this.idSelectionLoaded[this.idProperty];

			this._storeSelection(obj);
		},

		_saveSelection: function(selectionId) {

			var promptCbk = lang.hitch(this, this._getSaveParametersAndStore, selectionId),
				prompt = alertify.prompt(this.i18n.newNameMessage, '', promptCbk);

			prompt.setHeader(this.i18n.saveSelection);
			this._addSharedCheckbox(prompt);
		},

		_getSaveParametersAndStore: function(selectionId, evt, value) {

			var obj = {
				selectionId: selectionId,
				name: value,
				shared: this._sharedCheckbox.checked
			};

			delete this.idSelectionLoaded;
			this._storeSelection(obj);
		},

		_addSharedCheckbox: function(prompt) {

			if (this._sharedCheckbox) {
				return;
			}

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

			if (res.data) {
				this.idSelectionLoaded = res.data;
			}
		},

		_subRestoreSelection: function() {

			if (!this.idSelectionLoaded) {
				this._showSelectionList();
				return;
			}

			var overwriteCbk = lang.hitch(this, function() {

				delete this.idSelectionLoaded;
				this._showSelectionList();
			});

			alertify.confirm(
				this.i18n.saveSelection,
				this.i18n.loseSelectionConfirmationMessage,
				overwriteCbk,
				function() {}
			).set('labels', {
				ok: this.i18n.ok,
				cancel: this.i18n.cancel
			});
		},

		_showSelectionList: function() {

			this._emitEvt('RETRIEVE_SELECTIONS_TARGET', {
				target: this.selectionTarget
			});

			this._publish(this.loadSelection.getChannel("SHOW"));
		},

		_subSelectionsTargetRetrieved: function(res) {

			var selectionTarget = res.target;

			if (!this.loadSelection) {
				this.loadSelectionConfig.target = selectionTarget;
				this.loadSelection = new declare(Selection).extend(_ShowInPopup)(this.loadSelectionConfig);

				this._subscribe(this.loadSelection.getChannel("UPDATE_DATA"), lang.hitch(this, this._subSelectionLoad));
			} else {
				this._publish(this.loadSelection.getChannel("UPDATE_TARGET"), {
					target: selectionTarget
				});
			}
		},

		_subSelectionLoad: function(res) {

			this._publish(this.loadSelection.getChannel("HIDE"));

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

			if (this._loadSelectionDfd) {
				this._loadSelectionDfd.resolve();
			}
		},

		_continueSelectionLoadAfterClear: function(res) {

			var data = res.data,
				settingsId = data.id,
				selection = data && data.ids;

			if (selection) {
				this._emitEvt('SELECT', selection);
				this.idSelectionLoaded = data;
			} else {
				this._emitEvt('CLONE_SELECTION', {
					target: this.selectionTarget,
					id: settingsId
				});
			}
		}
	});
});
