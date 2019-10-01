define([
	'alertify/alertify.min'
	, "app/designs/textSearchList/main/Selection"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "redmic/base/Credentials"
], function(
	alertify
	, Selection
	, declare
	, lang
	, put
	, _Module
	, _Selection
	, _Show
	, _ShowInPopup
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, Credentials
) {

	return declare([_Module, _Show, _Selection], {
		//	summary:
		//		Indicador del número de seleccionados con botones asociados.
		//	description:
		//		Informa del número de elementos seleccionados para un determinado 'target'. Es decir, se encarga
		//		de mostrar los elementos seleccionados de un tipo de dato concreto.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: "selectionBox",
				events: {
					STORE_SELECTION: 'storeSelection',
					RETRIEVE_SELECTIONS_TARGET: 'retrieveSelectionsTarget'
				},
				actions: {
					REFRESH: "refresh",
					STORE_SELECTION: 'storeSelection',
					SELECTION_STORED: 'selectionStored',
					RETRIEVE_SELECTIONS_TARGET: 'retrieveSelectionsTarget',
					SELECTIONS_TARGET_RETRIEVED: 'selectionsTargetRetrieved'
				},

				idProperty: "id",

				menuInTooltip: true,
				omitLoading: true
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			if (this.menuInTooltip) {
				this.listMenuSelectionConfig = this._merge([{
					parentChannel: this.getChannel(),
					items: [{
						'label': this.i18n.clearSelection,
						'value': 'clearSelection',
						'icon': 'fa-eraser',
						'callback': '_clearSelectionButtonCallback'
					},{
						'label': this.i18n.restoreSelection,
						'value': 'restoreSelection',
						'icon': 'fa-cloud-download',
						'callback': '_loadSavedSelectionsButtonCallback',
						'condition': lang.hitch(this, this._isRegisteredUser)
					},{
						'label': this.i18n.saveSelection,
						'value': 'saveSelection',
						'icon': 'fa-cloud-upload',
						'callback': '_saveSelectionButtonCallback',
						'condition': lang.hitch(this, this._isRegisteredUser)
					}],
					indicatorLeft: true,
					notIndicator: true,
					classTooltip: "tooltipButtonMenu tooltipButtonChart"
				}, this.listMenuSelectionConfig || {}]);
			}

			this.loadSelectionConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.restoreSelection
			}, this.loadSelectionConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("REFRESH"),
				callback: "_subRefresh"
			},{
				channel: this._buildChannel(this.selectorChannel, this.actions.SELECTION_STORED),
				callback: '_subSelectionStored'
			},{
				channel: this._buildChannel(this.selectorChannel, this.actions.SELECTIONS_TARGET_RETRIEVED),
				callback: '_subSelectionsTargetRetrieved'
			});

			if (this.menuInTooltip) {
				this.subscriptionsConfig.push({
					channel: this.loadSelectionListMenu.getChannel("EVENT_ITEM"),
					callback: "_subLoadSelectionListEventItem"
				});
			}
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'STORE_SELECTION',
				channel: this._buildChannel(this.selectorChannel, this.actions.STORE_SELECTION)
			},{
				event: 'RETRIEVE_SELECTIONS_TARGET',
				channel: this._buildChannel(this.selectorChannel, this.actions.RETRIEVE_SELECTIONS_TARGET)
			});
		},

		_initialize: function() {

			if (this.menuInTooltip) {
				this.loadSelectionListMenu = new declare([ListMenu, _ShowOnEvt])
					.extend(_ShowInTooltip)(this.listMenuSelectionConfig);
			}
		},

		postCreate: function() {

			put(this.domNode, ".selectionBox.form-control");
			put(this.domNode, "span", "Sel:");
			this.selectionCount = put(this.domNode, "span", "0");
			this.buttonsContainer = put(this.domNode, "span.fa.fa-caret-down");

			if (this.menuInTooltip) {
				this._publish(this.loadSelectionListMenu.getChannel("ADD_EVT"), {
					sourceNode: this.domNode
				});
			}

			this.inherited(arguments);
		},

		_subLoadSelectionListEventItem: function(response) {

			var cbk = response.callback;

			if (cbk && this[cbk]) {
				this[cbk](response);
			}
		},

		_subRefresh: function(request) {
			//	summary:
			//		Se ejecuta cada vez que se cambia la vista principal para refescar
			//		el contador de selección y el target del servicio.
			//	tags:
			//		private

			this.selectionTarget = request.selectionTarget;

			this._clearSelection();
			this._emitEvt('GROUP_SELECTED');
		},

		_isRegisteredUser: function(item) {

			return Credentials.get('userRole') !== 'ROLE_GUEST';
		},

		_select: function(item, total) {

			this._updateSelectionBox(total);

			if (this._loadSelectionDfd) {
				this._loadSelectionDfd.resolve();
			}
		},

		_deselect: function(item, total) {

			this._updateSelectionBox(total);
		},

		_clearSelection: function() {

			this._updateSelectionBox(0);

			if (this._loadSelectionDfd) {
				this._loadSelectionDfd.resolve();
			}
		},

		_updateSelectionBox: function(total) {

			if (!isNaN(total)) {
				this.selectionCount.innerHTML = total;
			}
		},

		_saveSelectionButtonCallback: function() {

			this._emitEvt('TOTAL');

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "saveSelection"
				}
			});
		},

		_totalAvailable: function(response) {

			var selectionId = Credentials.get("selectIds")[this.selectionTarget],
				obj = {
					selectionId: selectionId
				};

			if (response.total > 0 && selectionId) {
				this._requestNameAndSave(obj);
			} else {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noItem
				});
			}
		},

		_requestNameAndSave: function(obj) {

			if (this.idSelectionLoaded) {
				alertify.confirm(this.i18n.saveSelection,
					this.i18n.saveSelectionConfirmationMessage,
					lang.hitch(this, this._updateSelection, obj),
					lang.hitch(this, this._saveSelection, obj))
				.set("labels", {
					ok: this.i18n.overwrite,
					cancel: this.i18n.save
				});
			} else {
				this._saveSelection(obj);
			}
		},

		_updateSelection: function(obj) {

			obj[this.idProperty] = this.idSelectionLoaded[this.idProperty];
			obj.name = this.idSelectionLoaded.name;

			this._storeSelection(obj);
		},

		_saveSelection: function(obj) {

			var prompt = alertify.prompt(this.i18n.newNameMessage, "", lang.hitch(this, function(obj, evt, value) {

				obj.name = value;
				obj.shared = this._sharedCheckbox.checked;

				delete this.idSelectionLoaded;
				this._storeSelection(obj);
			}, obj));

			prompt.setHeader(this.i18n.saveSelection);

			if (!this._sharedCheckbox) {
				var promptContent = prompt.elements.content,
					sharedCheckboxId = this.getOwnChannel() + '-sharedCheckbox';

				this._sharedCheckbox = put(promptContent, 'input[type=checkbox]#' + sharedCheckboxId);
				put(promptContent, 'label[for=' + sharedCheckboxId + ']', this.i18n.shareSelection);
			}
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

		_loadSavedSelectionsButtonCallback: function() {

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "loadSelection"
				}
			});

			if (this.idSelectionLoaded) {
				alertify.confirm(this.i18n.saveSelection,
					this.i18n.loseSelectionConfirmationMessage,
					lang.hitch(this, function() {

						delete this.idSelectionLoaded;
						this._showSelectionList();
					}),function(){})
				.set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});
			} else {
				this._showSelectionList();
			}
		},

		_showSelectionList: function() {

			this._emitEvt('RETRIEVE_SELECTIONS_TARGET', {
				target: this.selectionTarget
			});

			this._publish(this.loadSelection.getChannel("SHOW"));
		},

		_clearSelectionButtonCallback: function() {

			this._emitEvt('CLEAR_SELECTION');

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "clearSelection"
				}
			});
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

		_subSelectionLoad: function(req) {

			//TODO hay que hacer el clear, select y group escalonados, no todo a la vez
			this._publish(this.loadSelection.getChannel("HIDE"));

			if (this._loadSelectionDfd && !this._loadSelectionDfd.isFulfilled()) {
				this._loadSelectionDfd.cancel();
			}
			this._loadSelectionDfd = new Deferred();

			this._loadSelectionDfd.then(lang.hitch(this, this._continueSelectionLoadAfterClear, req));
			this._emitEvt('CLEAR_SELECTION');
		},

		_continueSelectionLoadAfterClear: function(req) {

			this._loadSelectionDfd = new Deferred();
			this._loadSelectionDfd.then(lang.hitch(this, this._continueSelectionLoadAfterSelect, req));

			var data = req.data,
				selection = data && (data.selection || data.ids);

			if (selection && selection.length) {
				this._emitEvt('SELECT', selection);
				this.idSelectionLoaded = data;
			} else {
				this._loadSelectionDfd.resolve();
			}
		},

		_continueSelectionLoadAfterSelect: function(req) {

			this._emitEvt('GROUP_SELECTED');
			//this._emitEvt('REFRESH');
		}
	});
});
