define([
	'alertify/alertify.min'
	, "app/designs/textSearchList/main/Selection"
	, "dijit/DropDownMenu"
	, "dijit/MenuItem"
	, "dijit/TooltipDialog"
	, "dijit/popup"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "redmic/modules/store/Persistence"
	, "redmic/layout/DialogSimple"
	, "redmic/base/Credentials"
], function(
	alertify
	, Selection
	, DropDownMenu
	, MenuItem
	, TooltipDialog
	, popup
	, ContentPane
	, declare
	, lang
	, put
	, _Module
	, _Selection
	, _Show
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, Persistence
	, DialogSimple
	, Credentials
){
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
				// own events
				events: {
					REFRESH: "refresh",
					SAVE: "save",
					TOTAL_SELECTED: "totalSelected",
					CHANGE_ITEMS: "changeItems"
				},
				menuInTooltip: true,
				// own actions
				actions: {
					REFRESH: "refresh",
					REFRESHED: "refreshed",
					TOTAL_SELECTED: "totalSelected"
				},

				itemsShow: null,

				omitLoading: true,
				// mediator params
				ownChannel: "selectionBox",
				idProperty: "id",
				selectionToolsName: "selectionTools",
				selectionTargetSuffix: "/_selections"
			};

			lang.mixin(this, this.config, args);

			if (this.itemsShow && Object.keys(this.itemsShow).length === 0) {
				this.menuInTooltip = false;
			}
		},

		_setConfigurations: function() {

			if (this.menuInTooltip) {
				this.listMenuSelectionConfig = this._merge([{
					parentChannel: this.getChannel(),
					items: [{
						'label': this.i18n.clearSelection,
						'value': 'clearSelection',
						'icon': 'fa-eraser',
						'callback': '_clearSelectionButtonCallback',
						'condition': lang.hitch(this, this._isShowItem)
					},{
						'label': this.i18n.selectAll,
						'value': 'selectAll',
						'icon': 'fa-check',
						'callback': '_selectAllButtonCallback',
						'condition': lang.hitch(this, this._isShowItem)
					},{
						'label': this.i18n.reverseSelection,
						'value': 'reverseSelection',
						'icon': 'fa-exchange',
						'callback': '_reverseSelectionButtonCallback',
						'condition': lang.hitch(this, this._isShowItem)
					},{
						'label': this.i18n.restoreSelection,
						'value': 'restoreSelection',
						'icon': 'fa-cloud-download',
						'callback': '_loadSavedSelectionsButtonCallback',
						'condition': lang.hitch(this, this._exitsPermsCorrect)
					},{
						'label': this.i18n.saveSelection,
						'value': 'saveSelection',
						'icon': 'fa-cloud-upload',
						'callback': '_saveSelectionButtonCallback',
						'condition': lang.hitch(this, this._exitsPermsCorrect)
					}],
					indicatorLeft: true,
					notIndicator: true,
					classTooltip: "tooltipButtonMenu tooltipButtonChart"
				}, this.listMenuSelectionConfig || {}]);
			}

			this.loadSelectionConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.loadSelectionConfig || {}]);

			if (this.selectionTarget) {
				this.loadSelectionConfig.target = this.selectionTarget + this.selectionTargetSuffix;
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("REFRESH"),
				callback: "_subRefresh"
			},{
				channel: this.persistence.getChannel("SAVED"),
				callback: "_subSaved",
				options: {
					predicate: lang.hitch(this, this._chkSuccessful)
				}
			});

			if (this.menuInTooltip) {
				this.subscriptionsConfig.push({
					channel : this.loadSelectionListMenu.getChannel("EVENT_ITEM"),
					callback: "_subLoadSelectionListEventItem"
				});
			}
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'REFRESH',
				channel: this.getChannel("REFRESHED"),
				callback: "_pubRefreshed"
			},{
				event: 'SAVE',
				channel: this.persistence.getChannel("SAVE"),
				callback: "_pubSave"
			},{
				event: 'TOTAL_SELECTED',
				channel: this.getChannel("TOTAL_SELECTED")
			});
		},

		_initialize: function() {

			this.persistence = new Persistence({
				parentChannel: this.getChannel()
			});

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

				this._createMenu();
			}

			this.inherited(arguments);
		},

		_createMenu: function() {

			this.loadSelectionNode = new ContentPane({
				region: "center"
			});

			this.loadSelectionDialog = new DialogSimple({
				preventDark: false,
				title: this.i18n.restoreSelection,
				centerContent: this.loadSelectionNode,
				width: 4,
				height: "sm",
				reposition: "e",
				onHide: lang.hitch(this, this._hideLoadSelection)
			});

			this.loadSelectionDialog.own(this.domNode);
		},

		_subLoadSelectionListEventItem: function(response) {

			if (response.callback) {
				this[response.callback](response);
			}
		},

		_hideLoadSelection: function() {
			//	summary:
			//		Emite hide al módulo y oculta el popup.
			//	tags:
			//		private

			this.loadSelectionDialog.hide();

			this._publish(this.loadSelection.getChannel("HIDE"));
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_subRefresh: function(request) {
			//	summary:
			//		Se ejecuta cada vez que se cambia la vista principal para refescar
			//		el contador de selección y el target del servicio.
			//	tags:
			//		private

			this.selectionTarget = request.selectionTarget;
			this.perms = request.perms;

			if (this.menuInTooltip) {
				this._emitEvt('CHANGE_ITEMS', {
					items: this.listMenuSelectionConfig.items
				});
			}

			this._clearSelection();
			this._emitEvt('GROUP_SELECTED');
			this._emitEvt('REFRESH');
		},

		_pubRefreshed: function(channel) {

			this._publish(channel, {
				success: true,
				selectionTarget: this.selectionTarget
			});
		},

		_isShowItem: function(item) {

			if (!this.itemsShow || (this.itemsShow && this.itemsShow[item.value])) {
				return true;
			}

			return false;
		},

		_exitsPermsCorrect: function(item) {

			if (this.perms > 1 && this._isShowItem(item)) {
				return true;
			}

			return false;
		},

		_select: function(item, total) {

			this._updateSelectionBox(total);

			this._emitTotalSelected(total);
		},

		_deselect: function(item, total) {

			this._updateSelectionBox(total);

			this._emitTotalSelected(total);
		},

		_clearSelection: function() {

			this._updateSelectionBox(0);

			this._emitTotalSelected(0);
		},

		_emitTotalSelected: function(total) {

			this._emitEvt("TOTAL_SELECTED", {
				total: total
			});
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

			var obj = {};
			if (response.total > 0 && Credentials.get("selectIds")[this.selectionTarget]) {
				obj.ids = [Credentials.get("selectIds")[this.selectionTarget]];
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
			this._emitEvt('SAVE', obj);
		},

		_saveSelection: function(obj) {

			alertify.prompt(this.i18n.newNameMessage, "",
				lang.hitch(this, function(evt, value ) {
					obj.name = value;
					delete this.idSelectionLoaded;
					this._emitEvt('SAVE', obj);
				})).setHeader(this.i18n.saveSelection);
		},

		_pubSave: function(channel, item) {

			this._publish(channel, {
				target: this.selectionTarget + this.selectionTargetSuffix,
				item: item,
				idProperty: this.idProperty
			});
		},

		_subSaved: function(response) {

			if (response.success && response.body.id) {
				this.idSelectionLoaded = response.body;
			}
		},

		_getIds: function(objectIds) {

			var ids = [];
			for (var id in objectIds) {
				ids.push(objectIds[id]);
			}

			return ids;
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

			var target = this.selectionTarget + this.selectionTargetSuffix;

			if (!this.loadSelection) {
				this.loadSelectionConfig.target = target;
				this.loadSelection = new Selection(this.loadSelectionConfig);

				this._subscribe(this.loadSelection.getChannel("UPDATE_DATA"), lang.hitch(this, this._subSelectionLoad));
			} else {
				this._publish(this.loadSelection.getChannel("UPDATE_TARGET"), {
					target: target
				});
			}

			var showInfo = {
				node: this.loadSelectionNode.domNode
			};

			this._publish(this.loadSelection.getChannel("SHOW"), showInfo);

			this.loadSelectionDialog.show();
		},

		_subSelectionLoad: function(request) {

			this._hideLoadSelection();
			this._emitEvt('CLEAR_SELECTION');

			if (request.data && request.data.ids && request.data.ids.length > 0) {
				this._emitEvt('SELECT', request.data.ids);
				this.idSelectionLoaded = request.data;
			}

			this._emitEvt('GROUP_SELECTED');
			this._emitEvt('REFRESH');
		},

		_getItemToSelect: function(ids) {

			return {
				items: ids
			};
		},

		_chkTargetAndRequester: function (response) {

			var result = this.inherited(arguments);
			return (result && response.body.requesterId) ? true : false;
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

		_selectAllButtonCallback: function() {

			this._emitEvt('SELECT_ALL');

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "selectAll"
				}
			});
		},

		_reverseSelectionButtonCallback: function() {

			this._emitEvt('REVERSE');

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "reverseSelection"
				}
			});
		}
	});
});
